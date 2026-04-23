// server/utils/saveMusicAndCover.ts
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import fetch from "node-fetch";
import { Readable } from "stream";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) throw new Error("Missing Supabase env vars");
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

function bufferToStream(buffer: Buffer) {
  const s = new Readable();
  s.push(buffer);
  s.push(null);
  return s;
}

export async function saveMusicAndCover(payload: {
  id?: number;
  title?: string;
  artist?: string;
  album?: string;
  coverSourceUrl?: string | null;
  download_link?: string | null;
  mbid?: string | null;
  release_date?: string | null;
  category?: string | null;
}) {
  try {
    const allowed = ["title", "artist", "album", "poster_path", "poster_thumb", "download_link", "mbid", "release_date", "category"];
    const safe: Record<string, any> = {};

    // Attempt to download and upload cover if provided
    if (payload.coverSourceUrl) {
      try {
        // robust fetch options: follow redirects, set a common User-Agent
        const res = await fetch(String(payload.coverSourceUrl), {
          redirect: "follow",
          headers: { "User-Agent": "Mozilla/5.0 (compatible; MovieworldBot/1.0)" },
          timeout: 15000,
        } as any);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const contentType = res.headers.get("content-type") || "";
        if (!contentType.startsWith("image/")) throw new Error(`Not an image: ${contentType}`);

        const buf = Buffer.from(await res.arrayBuffer());
        const ext = (contentType.split("/")[1] || "jpg").split(";")[0];
        const fileBase = `covers/music/${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        const origPath = `${fileBase}.${ext}`;
        const thumbPath = `${fileBase}-thumb.jpg`;

        // upload original
        const { error: upErr1 } = await supabase.storage.from("covers").upload(origPath, buf, {
          contentType,
          upsert: false,
        });
        if (upErr1) throw upErr1;

        // create and upload thumbnail
        const thumbBuf = await sharp(buf).resize(200, 200, { fit: "cover" }).jpeg({ quality: 80 }).toBuffer();
        const { error: upErr2 } = await supabase.storage.from("covers").upload(thumbPath, thumbBuf, {
          contentType: "image/jpeg",
          upsert: false,
        });
        if (upErr2) throw upErr2;

        const { data: d1 } = supabase.storage.from("covers").getPublicUrl(origPath);
        const { data: d2 } = supabase.storage.from("covers").getPublicUrl(thumbPath);
        safe.poster_path = d1.publicUrl;
        safe.poster_thumb = d2.publicUrl;
      } catch (downloadErr: any) {
        // Log the download error and fall back to storing the original URL
        console.warn("Cover download/upload failed, falling back to original URL:", downloadErr?.message ?? downloadErr);
        // Use the original URL as poster_path so the row can still be saved
        safe.poster_path = payload.coverSourceUrl;
        safe.poster_thumb = null;
      }
    }

    // copy allowed payload fields (except poster_path/poster_thumb handled above)
    for (const k of allowed) {
      if (k === "poster_path" || k === "poster_thumb") continue;
      const v = (payload as any)[k];
      if (v !== undefined) safe[k] = v;
    }

    // insert or update
    if (payload.id) {
      const { error } = await supabase.from("media_items").update(safe).eq("id", payload.id);
      if (error) return { ok: false, error };
      return { ok: true, id: payload.id, poster_path: safe.poster_path ?? null, poster_thumb: safe.poster_thumb ?? null };
    } else {
      const { data, error } = await supabase.from("media_items").insert([safe]).select("id").single();
      if (error) return { ok: false, error };
      return { ok: true, id: data.id, poster_path: safe.poster_path ?? null, poster_thumb: safe.poster_thumb ?? null };
    }
  } catch (err: any) {
    return { ok: false, error: err.message ?? err };
  }
}
