// src/components/AdminCoverManager.tsx
import React, { useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type Song = {
  id: number;
  title?: string;
  artist?: string;
  album?: string;
  poster_path?: string | null;
};

type StatusEntry = { state: "idle" | "pending" | "ok" | "error"; message?: string };
type StatusMap = Record<number, StatusEntry>;

export default function AdminCoverManager() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<StatusMap>({} as StatusMap); // <-- typed assertion

  useEffect(() => {
    loadSongs();
  }, []);

  async function loadSongs() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("media_items") // <-- remove generic here to avoid "Expected 2 type arguments" TS error
        .select("id,title,artist,album,poster_path")
        .order("id", { ascending: true })
        .limit(200);

      if (error) {
        console.error("Failed to load songs", error);
        return;
      }

      setSongs((data ?? []) as Song[]); // <-- cast returned data to Song[]
    } finally {
      setLoading(false);
    }
  }

  function setSongStatus(id: number, state: StatusEntry["state"], message?: string) {
    setStatus((s) => ({ ...s, [id]: { state, message } }));
  }

  async function triggerFetch(song: Song) {
    if (!song.id || !song.artist || !song.album) {
      setSongStatus(song.id, "error", "Missing artist or album");
      return;
    }
    setSongStatus(song.id, "pending");
    try {
      const res = await fetch("/api/fetch-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId: song.id, artist: song.artist, album: song.album }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSongStatus(song.id, "error", json?.error || json?.reason || "Server error");
        return;
      }
      setSongStatus(song.id, "ok", "Cover fetched");
      await refreshSong(song.id);
    } catch (err: any) {
      console.error(err);
      setSongStatus(song.id, "error", err?.message || "Network error");
    }
  }

  async function refreshSong(id: number) {
    const { data, error } = await supabase.from("media_items").select("id,poster_path").eq("id", id).single();
    if (!error && data) {
      setSongs((s) => s.map((x) => (x.id === id ? { ...x, poster_path: data.poster_path } : x)));
    }
  }

  async function fetchAllMissing() {
    const missing = songs.filter((s) => !s.poster_path);
    if (missing.length === 0) return;
    const concurrency = 4;
    let i = 0;
    async function worker() {
      while (i < missing.length) {
        const idx = i++;
        const song = missing[idx];
        await triggerFetch(song);
      }
    }
    const workers = Array.from({ length: concurrency }).map(() => worker());
    await Promise.all(workers);
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Admin Cover Manager</h2>

      <div className="mb-4 flex gap-2">
        <button onClick={loadSongs} className="px-3 py-2 bg-gray-200 rounded" disabled={loading}>
          Refresh list
        </button>
        <button onClick={fetchAllMissing} className="px-3 py-2 bg-purple-600 text-white rounded">
          Fetch All Missing Covers
        </button>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Artist</th>
              <th className="px-4 py-2">Album</th>
              <th className="px-4 py-2">Cover</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((s) => {
              const st = status[s.id] ?? { state: "idle" as const };
              return (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2 align-top">{s.id}</td>
                  <td className="px-4 py-2 align-top">{s.title ?? "—"}</td>
                  <td className="px-4 py-2 align-top">{s.artist ?? "—"}</td>
                  <td className="px-4 py-2 align-top">{s.album ?? "—"}</td>
                  <td className="px-4 py-2 align-top">
                    {s.poster_path ? (
                      <img src={s.poster_path} alt={s.title ?? "cover"} className="w-20 h-20 object-cover rounded" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-xs text-gray-500 rounded">No cover</div>
                    )}
                  </td>
                  <td className="px-4 py-2 align-top">
                    <button onClick={() => triggerFetch(s)} className="px-3 py-1 bg-blue-600 text-white rounded">
                      Fetch Cover
                    </button>
                  </td>
                  <td className="px-4 py-2 align-top">
                    <div>
                      <strong>{st.state}</strong>
                      {st.message ? <div className="text-xs text-gray-600">{st.message}</div> : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
