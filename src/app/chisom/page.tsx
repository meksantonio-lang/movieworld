// src/app/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { createClient, Session } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { saveMovieDetails } from "@/lib/mediaService";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ADMIN_EMAIL = "meksantonio@gmail.com";

type Tab = "movies" | "anime" | "kdrama" | "music" | "books";

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("movies");
  const [bookMatches, setBookMatches] = useState<any[] | null>(null);

  const [movieId, setMovieId] = useState("");
  const [tmdbResponse, setTmdbResponse] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [cover, setCover] = useState("");
  const [releaseYear, setReleaseYear] = useState<number | "">("");
  const [downloadUrl, setDownloadUrl] = useState("");

  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [author, setAuthor] = useState("");

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [tmdbMatches, setTmdbMatches] = useState<any[] | null>(null);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbError, setTmdbError] = useState<string | null>(null);
  const [tmdbCategory, setTmdbCategory] = useState<"movie" | "tv" | null>(null);
  const [tmdbId, setTmdbId] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
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

  // TMDB search helper
  async function fetchFromTMDB(title: string, category: "movies" | "anime" | "kdrama") {
    const type = category === "movies" ? "movie" : "tv";
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

  // TMDB details helper
  async function fetchTmdbDetails(id: number | string, kind: "movie" | "tv") {
    try {
      const resp = await fetch(`/api/tmdb-details?id=${encodeURIComponent(String(id))}&kind=${kind}`);
      if (!resp.ok) {
        console.warn("tmdb details proxy non-ok:", resp.status, await resp.text());
        return null;
      }
      return await resp.json();
    } catch (err) {
      console.error("fetchTmdbDetails proxy error:", err);
      return null;
    }
  }

  function SpotifySearch({ onSelect }: { onSelect: (track: any) => void }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

  async function handleSearch() {
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const resp = await fetch("/api/autofill-spotify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await resp.json();

      if (!resp.ok || data.error) {
        setError(data.error || "Search failed");
      } else {
        setResults(data.tracks || []);
      }
    } catch (err) {
      console.error("Spotify search error:", err);
      setError("Internal error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Song title and artist"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />
        <button
          onClick={handleSearch}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {loading && <p>Searching Spotify…</p>}
      {error && <p className="text-red-600">{error}</p>}

      <ul className="space-y-2">
        {results.map((track) => (
          <li key={track.id} className="flex items-center gap-4 border p-2 rounded">
            <img
              src={track.cover_url}
              alt={track.title}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-semibold">{track.title}</p>
              <p className="text-sm text-gray-600">{track.artist}</p>
              <p className="text-xs text-gray-500">{track.album}</p>
            </div>
            <button
              onClick={() => onSelect(track)}
              className="bg-blue-600 text-white px-3 py-1 rounded"
            >
              Select
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

  // OpenLibrary helper
  async function fetchFromOpenLibrary(title: string, author?: string) {
    try {
      const resp = await fetch("/api/autofill-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, author }),
      });
      if (!resp.ok) return null;
      return await resp.json();
    } catch {
      return null;
    }
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const mediaPayload: any = {
      title: title || null,
      tmdb_id: tmdbId ?? null,
      category: activeTab,
      download_link: downloadUrl || null,
      cover_url: cover || null,
      genre: genre || null,
      release_year: typeof releaseYear === "number" && !Number.isNaN(releaseYear) ? releaseYear : null,
      metadata: null,
    };

    if (activeTab === "music") {
      const spotifyData = await fetchFromSpotify(title);
      if (spotifyData) {
        mediaPayload.metadata = {
          artist: spotifyData.artist,
          album: spotifyData.album,
          release_date: spotifyData.release_date,
          cover_url: spotifyData.cover_url,
          spotify_id: spotifyData.id,
        };
      } else {
        mediaPayload.metadata = { artist, album };
      }
    }

    if (activeTab === "books") {
      mediaPayload.metadata = {
        ...(mediaPayload.metadata || {}),
        author,
      };
    }

    try {
      const { data, error: insertErr } = await supabase
        .from("media_items")
        .insert([mediaPayload])
        .select()
        .single();

      if (insertErr) {
        console.error("Insert media_items error:", insertErr);
        setError(insertErr.message || "Insert failed");
        return;
      }

      alert(`${activeTab} added to media_items successfully`);
      setTitle(""); setGenre(""); setCover(""); setReleaseYear(""); setDownloadUrl("");
      setArtist(""); setAlbum(""); setAuthor("");
      setTmdbId(null); setTmdbMatches(null); setTmdbError(null); setTmdbCategory(null);

      const { data: refreshed } = await supabase
        .from("media_items")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setItems(refreshed ?? []);
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

  // Proper TMDB match application
  async function applyTmdbMatch(match: any) {
    const kind: "movie" | "tv" =
      tmdbCategory === "tv" ? "tv" :
      tmdbCategory === "movie" ? "movie" :
      (match.title ? "movie" : "tv");

    const matchedTitle = match.title ?? match.name ?? title;
    const posterPath = match.poster_path ? `https://image.tmdb.org/t/p/w500${match.poster_path}` : "";
    const yearStr = match.release_date ?? match.first_air_date ?? "";
    const yearNum = yearStr ? Number(String(yearStr).split("-")[0]) : "";

    try {
      const details = await fetchTmdbDetails(match.id, kind);
      let genreStr = "";
      if (details && Array.isArray(details.genres)) {
        genreStr = details.genres.map((g: any) => g.name).join(",");
      } else if (Array.isArray(match.genre_ids) && match.genre_ids.length > 0) {
        genreStr = match.genre_ids.join(",");
      }

      setTitle(matchedTitle);
      setCover(posterPath);
      setReleaseYear(yearNum || "");
      setGenre(genreStr);
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
      setTmdbMatches(null);
      setTmdbError(null);
      setTmdbCategory(null);
    }
  }

  async function handleSave(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (!movieId.trim()) {
      alert("Enter a TMDB ID to save");
      return;
    }

    if (!["movies", "anime", "kdrama"].includes(activeTab)) {
      alert("TMDB save is only available for movies, anime, or kdrama");
      return;
    }

    const kind = activeTab === "movies" ? "movie" : "tv";
    setTmdbError(null);
    setTmdbLoading(true);

    try {
      const details = await fetchTmdbDetails(Number(movieId), kind);
      if (!details) {
        alert("TMDB details not found for that ID");
        return;
      }

      const genreStr = Array.isArray(details.genres)
        ? details.genres.map((g: any) => g.name).join(",")
        : "";
      const coverUrl = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : "";
      const releaseDate = details.release_date ?? details.first_air_date ?? "";
      const releaseYearNum = releaseDate ? Number(String(releaseDate).split("-")[0]) : null;

      const mediaPayload: any = {
        title: details.title ?? details.name ?? null,
        tmdb_id: details.id ?? null,
        category: activeTab,
        download_link: null,
        cover_url: coverUrl || null,
        genre: genreStr || null,
        release_year: releaseYearNum,
        metadata: null,
      };

      const { error: insertErr } = await supabase
        .from("media_items")
        .insert([mediaPayload]);

      if (insertErr) {
        console.error("Save by TMDB ID error:", insertErr);
        alert("Save failed: " + insertErr.message);
        return;
      }

      alert("TMDB details saved successfully");
      setMovieId("");

      const { data: refreshed } = await supabase
        .from("media_items")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      setItems(refreshed ?? []);
    } catch (err: any) {
      console.error("Save by TMDB ID failed:", err);
      alert("Failed to save TMDB details");
    } finally {
      setTmdbLoading(false);
    }
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, <strong>{session?.user?.email}</strong></p>

      {/* Navigation Tabs */}
      <nav style={{ marginBottom: 20 }}>
        {(["movies","anime","kdrama","music","books"] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
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

      {/* Add Form */}
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
              <button
                type="button"
                onClick={async () => {
                  if (!title) {
                    alert("Enter a track title to autofill from Spotify");
                    return;
                  }
                  const data = await fetchFromSpotify(title);
                  if (!data) {
                    alert("No result from Spotify");
                    return;
                  }
                  setTitle(data.title || title);
                  setGenre(data.genre || "");
                  setCover(data.cover_url || "");
                  setReleaseYear(data.release_year || "");
                  setArtist(data.artist || "");
                  setAlbum(data.album || "");
                }}
                style={buttonStyle}
              >
                Autofill (Spotify)
              </button>
            </>
          )}
          {activeTab === "books" && (
            <>
              <input placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
              <button
                type="button"
                onClick={async () => {
                  if (!title) {
                    alert("Enter a book title");
                    return;
                  }
                  const data = await fetchFromOpenLibrary(title, author);
                  if (!data || !data.results) {
                    alert("No result from OpenLibrary");
                    return;
                  }
                  if (data.results.length === 1) {
                    const b = data.results[0];
                    setTitle(b.title);
                    setAuthor(b.author);
                    setReleaseYear(b.publishYear || "");
                    setCover(b.coverUrl || "");
                    setDownloadUrl(b.downloadUrl || "");
                  } else {
                    setBookMatches(data.results);
                  }
                }}
                style={buttonStyle}
              >
                Autofill (OpenLibrary)
              </button>
            </>
          )}
          <input placeholder="Download URL" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} required />
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" style={buttonStyle}>Save {activeTab}</button>
            {activeTab === "movies" || activeTab === "anime" || activeTab === "kdrama" ? (
              <button
                type="button"
                onClick={async () => {
                  if (!title) return alert("Enter a title to autofill from TMDB");
                  const cat = activeTab === "movies" ? "movie" : "tv";
                  setTmdbCategory(cat as "movie" | "tv");
                  setTmdbMatches(null);
                  setTmdbError(null);
                  setTmdbLoading(true);
                  try {
                    const results = await fetchFromTMDB(title, activeTab);
                    setTmdbLoading(false);
                    if (!results || results.length === 0) {
                      setTmdbMatches([]);
                      alert("No result from TMDB");
                      return;
                    }
                    if (results.length === 1) {
                      applyTmdbMatch(results[0]);
                      return;
                    }
                    setTmdbMatches(results);
                  } catch (err: any) {
                    setTmdbLoading(false);
                    console.error("Autofill error:", err);
                    setTmdbError("Failed to fetch from TMDB");
                    alert("No result from TMDB");
                  }
                }}
                style={{ padding: "8px 12px", borderRadius: 6, cursor: "pointer" }}
              >
                Autofill (TMDB)
              </button>
            ) : null}
          </div>
        </form>

        {/* Book Matches */}
        {bookMatches && (
          <div style={{ marginTop: 20 }}>
            <h3>OpenLibrary Matches</h3>
            <ul>
              {bookMatches.map((match, idx) => (
                <li key={idx} style={{ marginBottom: 10 }}>
                  <strong>{match.title}</strong> by {match.author} ({match.publishYear})
                  <br />
                  {match.coverUrl && (
                    <img src={match.coverUrl} alt={match.title} style={{ width: 100, marginTop: 5 }} />
                  )}
                  <br />
                  <button
                    onClick={() => {
                      setTitle(match.title);
                      setAuthor(match.author);
                      setReleaseYear(match.publishYear || "");
                      setCover(match.coverUrl || "");
                      setDownloadUrl(match.downloadUrl || "");
                      setBookMatches(null);
                    }}
                    style={buttonStyle}
                  >
                    Use this
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
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
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={mTitle}
                        style={{ width: 56, height: 84, objectFit: "cover", borderRadius: 4 }}
                      />
                    ) : (
                      <div style={{ width: 56, height: 84, background: "#f0f0f0", borderRadius: 4 }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>
                        {mTitle}{" "}
                        {mYear ? (
                          <span style={{ color: "#666", fontWeight: 400 }}>({mYear})</span>
                        ) : null}
                      </div>
                      <div style={{ fontSize: 13, color: "#666" }}>
                        {m.overview
                          ? m.overview.length > 140
                            ? m.overview.slice(0, 137) + "..."
                            : m.overview
                          : null}
                      </div>
                    </div>
                    <div style={{ marginLeft: 8 }}>
                      <button
                        style={{ padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          applyTmdbMatch(m);
                        }}
                      >
                        Use
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => {
                  setTmdbMatches(null);
                  setTmdbCategory(null);
                }}
                style={{ padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {Array.isArray(tmdbMatches) && tmdbMatches.length === 0 && (
          <p style={{ marginTop: 8 }}>No matches found on TMDB.</p>
        )}

        {error && <p style={{ color: "red" }}>Error: {error}</p>}
      </section>

      {/* Save by TMDB ID */}
      <section style={{ marginBottom: 24 }}>
        <h2>Save by TMDB ID</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 520 }}>
          <input
            type="text"
            placeholder="Movie ID"
            value={movieId}
            onChange={(e) => setMovieId(e.target.value)}
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: 4 }}
          />
          <button onClick={handleSave} style={buttonStyle}>
            Save TMDB Details
          </button>
        </div>
      </section>

      {/* Existing Items */}
      <section>
        <h2>Existing {activeTab}</h2>
        {loading ? <p>Loading...</p> : null}
        {!loading && items.length === 0 && <p>No items found.</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((it: any) => (
            <li
              key={it.id ?? JSON.stringify(it)}
              style={{ marginBottom: 12, borderBottom: "1px solid #eee", paddingBottom: 8 }}
            >
              <strong>{it.title ?? it.name}</strong>
              <div style={{ fontSize: 13, color: "#555" }}>
                {it.genre ? `Genre: ${it.genre}` : null}
                {it.artist ? ` • Artist: ${it.artist}` : null}
                {it.author ? ` • Author: ${it.author}` : null}
                {it.release_year ? ` • Year: ${it.release_year}` : null}
              </div>
              <div style={{ marginTop: 6 }}>
                <a
                  href={it.download_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginRight: 12 }}
                >
                  Download
                </a>
                <button
                  onClick={async () => {
                    if (!confirm("Delete this item?")) return;
                    try {
                      const { error: delErr } = await supabase
                        .from(activeTab)
                        .delete()
                        .eq("id", it.id);
                      if (delErr) {
                        alert("Delete error: " + delErr.message);
                      } else {
                        const { data } = await supabase
                          .from(activeTab)
                          .select("*")
                          .order("created_at", { ascending: false })
                          .limit(100);
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

      {/* Logout */}
      <div style={{ marginTop: 20 }}>
  <button
    onClick={() => supabase.auth.signOut()}
    style={{ padding: "8px 12px", borderRadius: 6 }}
  >
    Logout
  </button>
</div>
</main>
);
}

async function fetchFromSpotify(title: string) {
  try {
    const resp = await fetch("/api/autofill-spotify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: title }),
    });

    if (!resp.ok) {
      console.warn("Spotify autofill proxy non-ok:", resp.status, await resp.text());
      return null;
    }

    const data = await resp.json();
    if (data.error) {
      console.warn("Spotify autofill error:", data.error);
      return null;
    }

    const track = Array.isArray(data.tracks)
      ? data.tracks[0]
      : data.track || null;

    if (!track) {
      return null;
    }

    return {
      id: track.id,
      title: track.title ?? track.name ?? "",
      artist:
        track.artist ??
        (track.artists && Array.isArray(track.artists)
          ? track.artists.map((a: any) => (typeof a === "string" ? a : a.name)).join(", ")
          : "") ??
        "",
      album: track.album ?? track.album_name ?? "",
      release_date:
        track.release_date ?? track.album?.release_date ?? null,
      cover_url:
        track.cover_url ?? track.album?.images?.[0]?.url ?? null,
      genre: track.genre ?? null,
      release_year: track.release_year ?? null,
    };
  } catch (err) {
    console.error("fetchFromSpotify error:", err);
    return null;
  }
}
