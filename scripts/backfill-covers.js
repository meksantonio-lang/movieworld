// scripts/backfill-covers.js (top of file)
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env.local") });

const fs = require("fs");
const fetch = require("node-fetch");
const pLimit = require("p-limit");
const { createClient } = require("@supabase/supabase-js");


const PROGRESS_FILE = path.resolve(__dirname, "backfill-progress.json");
const FAIL_LOG = path.resolve(__dirname, "backfill-failures.log");

const argv = process.argv.slice(2);
const APPLY = argv.includes("--apply");
const limitArg = argv.find((a) => a.startsWith("--limit="));
const batchArg = argv.find((a) => a.startsWith("--batch="));
const CONCURRENCY = limitArg ? parseInt(limitArg.split("=")[1], 10) : 4;
const BATCH_SIZE = batchArg ? parseInt(batchArg.split("=")[1], 10) : 200;

function log(...args) {
  console.log(new Date().toISOString(), ...args);
}

function appendFailLog(line) {
  fs.appendFileSync(FAIL_LOG, line + "\n");
}

async function loadProgress() {
  try {
    const raw = fs.readFileSync(PROGRESS_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return { processed: [], lastId: null };
  }
}

async function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function fetchRows(supabase, fromId, limit) {
  // fetch rows ordered by id ascending starting after fromId
  let query = supabase
    .from("media_items")
    .select("id,poster_path,poster_thumb,download_link,title")
    .order("id", { ascending: true })
    .limit(limit);

  if (fromId) {
    // use gt to resume after last id
    query = query.gt("id", fromId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function callSaveApi(origin, payload) {
  const url = `${origin.replace(/\/$/, "")}/api/save-music`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    // no cache; ensure server processes fresh
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, body: json };
}

async function main() {
  log("Backfill starting", { APPLY, CONCURRENCY, BATCH_SIZE });

  // Determine origin to call. Prefer local dev if running locally.
  const ORIGIN = process.env.BACKFILL_ORIGIN || process.env.BACKFILL_URL || "http://localhost:3000";
  log("Using origin:", ORIGIN);

  // Supabase client for reading rows (uses NEXT_PUBLIC keys or server keys if available)
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON;
  if (!SUPABASE_URL || !SUPABASE_ANON) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in env. Aborting.");
    process.exit(1);
  }
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

  const progress = await loadProgress();
  const processedSet = new Set(progress.processed || []);
  let lastId = progress.lastId || null;

  log("Resuming from lastId:", lastId, "processed count:", processedSet.size);

  let totalProcessed = 0;
  let totalSucceeded = 0;
  let totalFailed = 0;

  while (true) {
    const rows = await fetchRows(supabase, lastId, BATCH_SIZE);
    if (!rows || rows.length === 0) {
      log("No more rows to process. Exiting loop.");
      break;
    }
    log(`Fetched batch of ${rows.length} rows (starting after id ${lastId})`);

    // Filter rows that already have poster_thumb (optional: skip if already canonicalized)
    const toProcess = rows.filter((r) => {
      // skip if we've already processed this id
      if (processedSet.has(String(r.id))) return false;
      // skip if poster_thumb exists and poster_path is already a public URL (heuristic)
      if (r.poster_thumb && String(r.poster_thumb).trim() !== "") return false;
      // skip if no poster_path to process
      if (!r.poster_path || String(r.poster_path).trim() === "") return false;
      return true;
    });

    log(`Will process ${toProcess.length} rows in this batch (skipping ${rows.length - toProcess.length})`);

    const limit = pLimit(CONCURRENCY);
    const tasks = toProcess.map((row) =>
      limit(async () => {
        const id = row.id;
        const payload = {
          id,
          title: row.title,
          coverSourceUrl: row.poster_path,
        };

        totalProcessed++;

        if (!APPLY) {
          log(`[dry-run] would call save for id=${id} url=${row.poster_path}`);
          processedSet.add(String(id));
          lastId = id;
          return { id, ok: true, dry: true };
        }

        try {
          const { status, body } = await callSaveApi(ORIGIN, payload);
          if (status >= 200 && status < 300 && body?.ok) {
            log(`OK id=${id} -> saved (poster_thumb: ${body.poster_thumb ? "yes" : "no"})`);
            processedSet.add(String(id));
            lastId = id;
            totalSucceeded++;
            return { id, ok: true, body };
          } else {
            const errLine = `FAIL id=${id} status=${status} body=${JSON.stringify(body)}`;
            log(errLine);
            appendFailLog(errLine);
            processedSet.add(String(id)); // mark as processed to avoid infinite retry; remove if you want retries
            lastId = id;
            totalFailed++;
            return { id, ok: false, status, body };
          }
        } catch (err) {
          const errLine = `ERROR id=${id} err=${err?.message ?? String(err)}`;
          log(errLine);
          appendFailLog(errLine);
          // do not mark as processed so it can be retried next run
          totalFailed++;
          return { id, ok: false, error: err };
        }
      })
    );

    // wait for batch to finish
    await Promise.all(tasks);

    // persist progress after each batch
    const progressObj = { processed: Array.from(processedSet), lastId };
    await saveProgress(progressObj);
    log("Saved progress:", { processedCount: processedSet.size, lastId });

    // If fewer rows than batch size were returned, we've reached the end
    if (rows.length < BATCH_SIZE) break;
  }

  log("Backfill complete", { totalProcessed, totalSucceeded, totalFailed });
  log("Failures logged to:", FAIL_LOG);
  log("Progress file:", PROGRESS_FILE);
  process.exit(0);
}

main().catch((err) => {
  console.error("Backfill script error:", err);
  process.exit(1);
});
