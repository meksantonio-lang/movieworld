// src/app/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createClient, Session } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ADMIN_EMAIL = "meksantonio@gmail.com";

type Tab = "movies" | "anime" | "kdrama" | "music" | "books";

export default function AdminPage() {
  // -------------------------
  // ALL hooks declared first
  // -------------------------
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("movies");

  // shared form state
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [cover, setCover] = useState("");
  const [releaseYear, setReleaseYear] = useState<number | "">("");
  const [downloadUrl, setDownloadUrl] = useState("");

  // music/book extra fields
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [author, setAuthor] = useState("");

  // list + loading + error
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TMDB match UI state
  const [tmdbMatches, setTmdbMatches] = useState<any[] | null>(null);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbError, setTmdbError] = useState<string | null>(null);
  // remember whether the last search was for movie or tv so we can fetch details
  const [tmdbCategory, setTmdbCategory] = useState<"movie" | "tv" | null>(null);
  // persist selected TMDB id for saving
  const [tmdbId, setTmdbId] = useState<number | null>(null);

  // auth session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // fetch helper (unconditional hook usage)
  useEffect(() => {
    // fetch items when activeTab changes
    async function fetchItems() {
      setLoading(true);
      setError(null);
      try {
        const { data, error: sbError } = await supabase
          .from(activeTab)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        if (sbError) {
          console.error("Supabase fetch error:", sbError);
          setError(sbError.message);
          setItems([]);
        } else {
          setItems(data ?? []);
        }
      } catch (err: any) {
        console.error("Fetch items error:", err);
        setError(err.message || "Unknown error");
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, [activeTab]);

  // -------------------------
  // Now safe to conditionally render
  // -------------------------
  if (!session) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Admin Login</h1>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      </div>
    );
  }

  if (session.user.email !== ADMIN_EMAIL) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Access Denied</h1>
        <p>Signed in as {session.user.email}</p>
        <button onClick={() => supabase.auth.signOut()}>Logout</button>
      </div>
    );
  }

  // CLIENT: proxy-based TMDB search (calls server route /api/tmdb-search)
  async function fetchFromTMDB(title: string, category: "movie" | "anime" | "kdrama") {
    const type = category === "movie" ? "movie" : "tv";
    try {
      const resp = await fetch(`/api/tmdb-search?q=${encodeURIComponent(title)}&type=${type}`);
      if (!resp.ok) {
        console.warn("tmdb proxy non-ok:", resp.status, await resp.text());
        return [];
      }
      const data = await resp.json();
      return Array.isArray(data.results) ? data.results : [];
    } catch (err) {
      console.error("fetchFromTMDB proxy error:", err);
      return [];
    }
  }

  // CLIENT: fetch full details via server proxy (calls /api/tmdb-details)
  async function fetchTmdbDetails(id: number | string, kind: "movie" | "tv") {
    try {
      const resp = await fetch(`/api/tmdb-details?id=${encodeURIComponent(String(id))}&kind=${kind}`);
      if (!resp.ok) {
        console.warn("tmdb details proxy non-ok:", resp.status, await resp.text());
        return null;
      }
      const json = await resp.json();
      return json;
    } catch (err) {
      console.error("fetchTmdbDetails proxy error:", err);
      return null;
    }
  }

  // submit handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: any = {
      title,
      genre,
      cover,
      release_year: typeof releaseYear === "number" && !Number.isNaN(releaseYear) ? releaseYear : null,
      download_url: downloadUrl,
      tmdb_id: tmdbId ?? null,
    };
    if (activeTab === "music") {
      payload.artist = artist;
      payload.album = album;
    }
    if (activeTab === "books") {
      payload.author = author;
    }

    try {
      console.log("Posting to", `/api/${activeTab}`, "payload:", payload);
      const res = await fetch(`/api/${activeTab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      console.log("Response status:", res.status, "body:", text);
      if (!res.ok) {
        try {
          const json = JSON.parse(text);
          setError(json.message || JSON.stringify(json));
        } catch {
          setError(`Request failed: ${res.status} ${text}`);
        }
        return;
      }
      alert(`${activeTab} added successfully`);
      setTitle(""); setGenre(""); setCover(""); setReleaseYear(""); setDownloadUrl("");
      setArtist(""); setAlbum(""); setAuthor("");
      setTmdbId(null);
      setTmdbMatches(null);
      setTmdbError(null);
      setTmdbCategory(null);
      // refresh list
      const { data } = await supabase.from(activeTab).select("*").order("created_at", { ascending: false }).limit(100);
      setItems(data ?? []);
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(err.message || "Unknown error");
    }
  }

  const buttonStyle: React.CSSProperties = {
    background: "#0070f3",
    color: "#fff",
    padding: "8px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  };

  // Helper to apply a selected TMDB match into the form (UPDATED: fetch details via proxy to get genre names)
  async function applyTmdbMatch(match: any) {
    // Determine kind: prefer tmdbCategory if set, otherwise infer
    const kind: "movie" | "tv" = tmdbCategory === "tv" ? "tv" : tmdbCategory === "movie" ? "movie" : (match.title ? "movie" : "tv");
    const matchedTitle = match.title ?? match.name ?? title;
    const posterPath = match.poster_path ? `https://image.tmdb.org/t/p/w500${match.poster_path}` : "";
    const yearStr = match.release_date ?? match.first_air_date ?? "";
    const yearNum = yearStr ? Number(String(yearStr).split("-")[0]) : "";

    // Try to fetch full details via server proxy to get genre names
    try {
      const details = await fetchTmdbDetails(match.id, kind);
      let genreStr = "";
      if (details && Array.isArray(details.genres)) {
        // genres is an array of { id, name }
        genreStr = details.genres.map((g: any) => g.name).join(",");
      } else if (Array.isArray(match.genre_ids) && match.genre_ids.length > 0) {
        // fallback to IDs if names not available
        genreStr = match.genre_ids.join(",");
      } else {
        genreStr = "";
      }

      setTitle(matchedTitle);
      setCover(posterPath);
      setReleaseYear(yearNum || "");
      setGenre(genreStr);

      // persist selected TMDB id in state for saving
      setTmdbId(match.id ?? null);
    } catch (err) {
      console.error("applyTmdbMatch error:", err);
      const fallbackGenre = Array.isArray(match.genre_ids) ? match.genre_ids.join(",") : "";
      setTitle(matchedTitle);
      setCover(posterPath);
      setReleaseYear(yearNum || "");
      setGenre(fallbackGenre);
      setTmdbId(match.id ?? null);
    } finally {
      // clear matches and category after applying
      setTmdbMatches(null);
      setTmdbError(null);
      setTmdbCategory(null);
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, <strong>{session.user.email}</strong></p>

      <nav style={{ marginBottom: 20 }}>
        {(["movies","anime","kdrama","music","books"] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              // clear TMDB UI when switching tabs
              setTmdbMatches(null);
              setTmdbError(null);
              setTmdbCategory(null);
              setTmdbId(null);
            }}
            style={{
              marginRight: 8,
              padding: "8px 12px",
              background: activeTab === tab ? "#0070f3" : "#e6e6e6",
              color: activeTab === tab ? "#fff" : "#000",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </nav>

      <section style={{ marginBottom: 24 }}>
        <h2>Add {activeTab}</h2>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 520 }}>
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input placeholder="Genre (comma separated)" value={genre} onChange={(e) => setGenre(e.target.value)} />
          <input placeholder="Cover URL" value={cover} onChange={(e) => setCover(e.target.value)} />
          <input
            placeholder="Release Year"
            value={releaseYear === "" ? "" : String(releaseYear)}
            onChange={(e) => setReleaseYear(e.target.value === "" ? "" : Number(e.target.value))}
          />
          {activeTab === "music" && (
            <>
              <input placeholder="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
              <input placeholder="Album" value={album} onChange={(e) => setAlbum(e.target.value)} />
            </>
          )}
          {activeTab === "books" && (
            <input placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
          )}
          <input placeholder="Download URL" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} required />
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" style={buttonStyle}>Save {activeTab}</button>
            <button
              type="button"
              onClick={async () => {
                if (!title) return alert("Enter a title to autofill from TMDB");
                if (activeTab === "movies" || activeTab === "anime" || activeTab === "kdrama") {
                  const cat = activeTab === "movies" ? "movie" : activeTab === "anime" ? "anime" : "kdrama";
                  // set tmdbCategory so applyTmdbMatch knows which details endpoint to call
                  setTmdbCategory(cat === "movie" ? "movie" : "tv");
                  setTmdbMatches(null);
                  setTmdbError(null);
                  setTmdbLoading(true);
                  try {
                    const results = await fetchFromTMDB(title, cat as any);
                    setTmdbLoading(false);
                    if (!results || results.length === 0) {
                      setTmdbMatches([]);
                      alert("No result from TMDB");
                      return;
                    }
                    // If exactly one result, apply it immediately (applyTmdbMatch will fetch details via proxy)
                    if (results.length === 1) {
                      applyTmdbMatch(results[0]);
                      return;
                    }
                    // Multiple results: show a selectable list
                    setTmdbMatches(results);
                  } catch (err: any) {
                    setTmdbLoading(false);
                    console.error("Autofill error:", err);
                    setTmdbError("Failed to fetch from TMDB");
                    alert("No result from TMDB");
                  }
                } else {
                  alert("Autofill only available for movies/anime/kdrama");
                }
              }}
              style={{ padding: "8px 12px", borderRadius: 6, cursor: "pointer" }}
            >
              Autofill (TMDB)
            </button>
          </div>
        </form>

        {/* TMDB matches UI */}
        {tmdbLoading && <p style={{ marginTop: 8 }}>Searching TMDB...</p>}
        {tmdbError && <p style={{ color: "red", marginTop: 8 }}>TMDB error: {tmdbError}</p>}
        {Array.isArray(tmdbMatches) && tmdbMatches.length > 0 && (
          <div style={{ marginTop: 12, maxWidth: 520 }}>
            <p style={{ marginBottom: 8, fontWeight: 600 }}>Select a match to autofill</p>
            <div style={{ display: "grid", gap: 8 }}>
              {tmdbMatches.map((m, idx) => {
                const mTitle = m.title ?? m.name ?? "Untitled";
                const mYear = (m.release_date ?? m.first_air_date ?? "").split("-")[0] || "";
                const thumb = m.poster_path ? `https://image.tmdb.org/t/p/w154${m.poster_path}` : "";
                return (
                  <div
                    key={m.id ?? idx}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      padding: 8,
                      border: "1px solid #eee",
                      borderRadius: 6,
                      cursor: "pointer"
                    }}
                    onClick={() => applyTmdbMatch(m)}
                  >
                    {thumb ? <img src={thumb} alt={mTitle} style={{ width: 56, height: 84, objectFit: "cover", borderRadius: 4 }} /> : <div style={{ width: 56, height: 84, background: "#f0f0f0", borderRadius: 4 }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{mTitle} {mYear ? <span style={{ color: "#666", fontWeight: 400 }}>({mYear})</span> : null}</div>
                      <div style={{ fontSize: 13, color: "#666" }}>{m.overview ? (m.overview.length > 140 ? m.overview.slice(0, 137) + "..." : m.overview) : null}</div>
                    </div>
                    <div style={{ marginLeft: 8 }}>
                      <button style={{ padding: "6px 10px", borderRadius: 6, cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); applyTmdbMatch(m); }}>
                        Use
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => { setTmdbMatches(null); setTmdbCategory(null); }} style={{ padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        )}
        {Array.isArray(tmdbMatches) && tmdbMatches.length === 0 && (
          <p style={{ marginTop: 8 }}>No matches found on TMDB.</p>
        )}

        {error && <p style={{ color: "red" }}>Error: {error}</p>}
      </section>

      <section>
        <h2>Existing {activeTab}</h2>
        {loading ? <p>Loading...</p> : null}
        {!loading && items.length === 0 && <p>No items found.</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((it: any) => (
            <li key={it.id ?? JSON.stringify(it)} style={{ marginBottom: 12, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
              <strong>{it.title ?? it.name}</strong>
              <div style={{ fontSize: 13, color: "#555" }}>
                {it.genre ? `Genre: ${it.genre}` : null}
                {it.artist ? ` • Artist: ${it.artist}` : null}
                {it.author ? ` • Author: ${it.author}` : null}
                {it.release_year ? ` • Year: ${it.release_year}` : null}
              </div>
              <div style={{ marginTop: 6 }}>
                <a href={it.download_url} target="_blank" rel="noreferrer" style={{ marginRight: 12 }}>Download</a>
                <button
                  onClick={async () => {
                    if (!confirm("Delete this item?")) return;
                    try {
                      const { error: delErr } = await supabase.from(activeTab).delete().eq("id", it.id);
                      if (delErr) {
                        alert("Delete error: " + delErr.message);
                      } else {
                        // refresh
                        const { data } = await supabase.from(activeTab).select("*").order("created_at", { ascending: false }).limit(100);
                        setItems(data ?? []);
                      }
                    } catch (err) {
                      console.error("Delete error:", err);
                      alert("Delete failed");
                    }
                  }}
                  style={{ padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div style={{ marginTop: 20 }}>
        <button onClick={() => supabase.auth.signOut()} style={{ padding: "8px 12px", borderRadius: 6 }}>Logout</button>
      </div>
    </main>
  );
}
