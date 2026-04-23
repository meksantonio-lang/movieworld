// src/components/AdminMusicEditor.tsx
import React, { useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type Song = {
  id?: number;
  title?: string;
  artist?: string;
  album?: string;
  poster_path?: string | null;
  poster_thumb?: string | null;
  download_url?: string | null;
  download_link?: string | null;
  mbid?: string | null;
  release_date?: string | null;
  category?: string | null;
};

const PAGE_SIZE = 50;

export default function AdminMusicEditor() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selected, setSelected] = useState<Song | null>(null);
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    loadSongs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function loadSongs() {
    setLoading(true);
    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from("media_items")
        .select("id,title,artist,album,poster_thumb,poster_path,download_link,download_url")
        .order("id", { ascending: true })
        .range(from, to);

      if (error) {
        console.error("Failed to load songs", error);
        setSongs([]);
      } else {
        setSongs((data ?? []) as Song[]);
      }
    } finally {
      setLoading(false);
    }
  }

  function openEditor(song?: Song) {
    setSelected(
      song
        ? { ...song }
        : { title: "", artist: "", album: "", poster_path: null, poster_thumb: null, download_url: "", download_link: "" }
    );
    setMessage(null);
  }

  async function autoFill() {
    if (!selected) return;
    if (!selected.artist || !selected.album) {
      setMessage("Artist and album required for Auto-Fill");
      return;
    }
    setLookupLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/lookup-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artist: selected.artist, album: selected.album }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage(json?.error ?? json?.reason ?? "No metadata found");
        setLookupLoading(false);
        return;
      }
      setSelected((s) =>
        s
          ? {
              ...s,
              artist: json.artist ?? s.artist,
              album: json.album ?? s.album,
              poster_path: json.coverUrl ?? s.poster_path,
            }
          : s
      );
      setMessage(`Auto-filled from ${json.source}`);
    } catch (err: any) {
      console.error(err);
      setMessage("Lookup failed");
    } finally {
      setLookupLoading(false);
    }
  }

  async function save() {
    if (!selected) return;
    setLoading(true);
    setMessage(null);

    try {
      const payload: Record<string, any> = {
        id: selected.id ?? undefined,
        title: selected.title ?? undefined,
        artist: selected.artist ?? undefined,
        album: selected.album ?? undefined,
        // If user pasted a remote cover URL into poster_path, send it as coverSourceUrl
        coverSourceUrl: selected.poster_path ?? undefined,
        // Map either client field name to the DB field expected by the server
        download_link: selected.download_link ?? selected.download_url ?? undefined,
        mbid: selected.mbid ?? undefined,
        release_date: selected.release_date ?? undefined,
        category: selected.category ?? undefined,
      };

      // Remove undefined keys so server receives a compact payload
      Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

      const res = await fetch("/api/save-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg = json?.error ?? json?.message ?? "Server error";
        setMessage("Save failed: " + errMsg);
        console.error("Save failed", json);
      } else {
        setMessage("Saved");
        setSelected(null);
        // reload current page
        await loadSongs();
      }
    } catch (err: any) {
      console.error("Save error", err);
      setMessage("Save error: " + (err?.message ?? String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Music Editor</h2>

      <div className="mb-4 flex gap-2 items-center">
        <button onClick={() => openEditor()} className="px-3 py-2 bg-green-600 text-white rounded">
          New Song
        </button>
        <button onClick={() => { setPage(0); loadSongs(); }} className="px-3 py-2 bg-gray-200 rounded" disabled={loading}>
          Refresh
        </button>

        <div className="ml-auto flex gap-2 items-center">
          <button
            onClick={() => {
              setPage((p) => Math.max(0, p - 1));
            }}
            disabled={page === 0}
            className="px-2 py-1 bg-gray-200 rounded"
          >
            Prev
          </button>
          <div className="text-sm">Page {page + 1}</div>
          <button
            onClick={() => {
              setPage((p) => p + 1);
            }}
            className="px-2 py-1 bg-gray-200 rounded"
          >
            Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium mb-2">Songs</h3>
          <div className="overflow-auto border rounded max-h-[60vh]">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Artist</th>
                  <th className="px-3 py-2">Album</th>
                  <th className="px-3 py-2">Cover</th>
                  <th className="px-3 py-2">Edit</th>
                </tr>
              </thead>
              <tbody>
                {songs.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="px-3 py-2">{s.id}</td>
                    <td className="px-3 py-2">{s.title ?? "—"}</td>
                    <td className="px-3 py-2">{s.artist ?? "—"}</td>
                    <td className="px-3 py-2">{s.album ?? "—"}</td>
                    <td className="px-3 py-2">
                      {s.poster_thumb ? (
                        <img src={s.poster_thumb} alt={s.title ?? "cover"} className="w-16 h-16 object-cover rounded" />
                      ) : s.poster_path ? (
                        <img src={s.poster_path} alt={s.title ?? "cover"} className="w-16 h-16 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded" />
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => openEditor(s)} className="px-2 py-1 bg-blue-600 text-white rounded">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Editor</h3>
          {selected ? (
            <div className="border rounded p-4">
              <label className="block mb-2">
                <div className="text-sm text-gray-600">Title</div>
                <input
                  value={selected.title ?? ""}
                  onChange={(e) => setSelected({ ...selected, title: e.target.value })}
                  className="w-full border px-2 py-1 rounded"
                />
              </label>

              <label className="block mb-2">
                <div className="text-sm text-gray-600">Artist</div>
                <input
                  value={selected.artist ?? ""}
                  onChange={(e) => setSelected({ ...selected, artist: e.target.value })}
                  className="w-full border px-2 py-1 rounded"
                />
              </label>

              <label className="block mb-2">
                <div className="text-sm text-gray-600">Album</div>
                <input
                  value={selected.album ?? ""}
                  onChange={(e) => setSelected({ ...selected, album: e.target.value })}
                  className="w-full border px-2 py-1 rounded"
                />
              </label>

              <div className="flex gap-2 mb-2">
                <button onClick={autoFill} className="px-3 py-2 bg-indigo-600 text-white rounded" disabled={lookupLoading}>
                  {lookupLoading ? "Auto-Filling..." : "Auto-Fill Metadata"}
                </button>
                <button onClick={() => setSelected({ ...selected, poster_path: null, poster_thumb: null })} className="px-3 py-2 bg-gray-200 rounded">
                  Clear Cover
                </button>
              </div>

              <label className="block mb-2">
                <div className="text-sm text-gray-600">Cover Preview</div>
                {selected.poster_path ? (
                  <img src={selected.poster_path} alt="cover" className="w-40 h-40 object-cover rounded" />
                ) : (
                  <div className="w-40 h-40 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">No cover</div>
                )}
              </label>

              <label className="block mb-2">
                <div className="text-sm text-gray-600">Download URL</div>
                <input
                  value={selected.download_url ?? selected.download_link ?? ""}
                  onChange={(e) => setSelected({ ...selected, download_url: e.target.value })}
                  className="w-full border px-2 py-1 rounded"
                />
              </label>

              <div className="flex gap-2 mt-3">
                <button onClick={save} className="px-3 py-2 bg-green-600 text-white rounded" disabled={loading}>
                  Save
                </button>
                <button onClick={() => setSelected(null)} className="px-3 py-2 bg-gray-200 rounded">
                  Cancel
                </button>
              </div>

              {message ? <div className="mt-3 text-sm text-gray-700">{message}</div> : null}
            </div>
          ) : (
            <div className="text-sm text-gray-500">Select a song to edit or create a new one.</div>
          )}
        </div>
      </div>
    </div>
  );
}
