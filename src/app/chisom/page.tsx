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

type Tab = "movies" | "music" | "books" | "adult";

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("movies");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [cover, setCover] = useState("");
  const [releaseYear, setReleaseYear] = useState<number | "">("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [author, setAuthor] = useState("");

  // TMDB state
  const [tmdbMatches, setTmdbMatches] = useState<any[] | null>(null);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbError, setTmdbError] = useState<string | null>(null);
  const [tmdbCategory, setTmdbCategory] = useState<"movie" | "tv" | null>(null);
  const [tmdbId, setTmdbId] = useState<number | null>(null);
  const [movieId, setMovieId] = useState("");

  // Book matches
  const [bookMatches, setBookMatches] = useState<any[] | null>(null);

  // Spotify & ThePornDB matches
  const [spotifyMatches, setSpotifyMatches] = useState<any[] | null>(null);
  const [pornMatches, setPornMatches] = useState<any[] | null>(null);

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
          setError(sbError.message);
          setItems([]);
        } else {
          setItems(data ?? []);
        }
      } catch (err: any) {
        setError(err.message || "Unknown error");
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, [activeTab]);

  // TMDB search helper
  async function fetchFromTMDB(title: string) {
    try {
      const resp = await fetch(`/api/tmdb-search?q=${encodeURIComponent(title)}&type=movie`);
      if (!resp.ok) return [];
      const data = await resp.json();
      return Array.isArray(data.results) ? data.results : [];
    } catch {
      return [];
    }
  }

  async function fetchTmdbDetails(id: number | string, kind: "movie" | "tv") {
    try {
      const resp = await fetch(`/api/tmdb-details?id=${encodeURIComponent(String(id))}&kind=${kind}`);
      if (!resp.ok) return null;
      return await resp.json();
    } catch {
      return null;
    }
  }

  // Spotify helper
  async function fetchFromSpotify(query: string) {
    try {
      const resp = await fetch("/api/autofill-spotify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await resp.json();
      if (!resp.ok || data.error) return null;
      return data.results || [];
    } catch {
      return null;
    }
  }

  // ThePornDB helper
  async function fetchFromThePornDB(query: string) {
    try {
      const resp = await fetch("/api/autofill-theporndb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await resp.json();
      if (!resp.ok || data.error) return null;
      return data.results || [];
    } catch {
      return null;
    }
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

  const buttonStyle: React.CSSProperties = {
    background: "#0070f3",
    color: "#fff",
    padding: "8px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  };

  // Apply selected match (Spotify or PornDB)
  function applyMatch(item: any) {
    setTitle(item.title || "");
    setGenre(item.genre || "");
    setCover(item.cover_url || "");
    setReleaseYear(item.release_year || "");
    setDownloadUrl(item.download_url || "");
    if (item.artist) setArtist(item.artist);
    if (item.album) setAlbum(item.album);
    setSpotifyMatches(null);
    setPornMatches(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload: any = {
      title,
      genre,
      cover,
      release_year: releaseYear === "" ? null : releaseYear,
      download_url: downloadUrl,
    };

    if (activeTab === "music") {
      payload.artist = artist;
      payload.album = album;
    }

    if (activeTab === "books") {
      payload.author = author;
    }

    try {
      const { data, error: sbError } = await supabase.from(activeTab).insert([payload]);
      if (sbError) {
        setError(sbError.message);
      } else {
        setTitle("");
        setGenre("");
        setCover("");
        setReleaseYear("");
        setDownloadUrl("");
        setArtist("");
        setAlbum("");
        setAuthor("");
        const { data: refreshedItems, error: fetchError } = await supabase
          .from(activeTab)
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100);
        if (!fetchError) {
          setItems(refreshedItems ?? []);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <main style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, <strong>{session?.user?.email}</strong></p>

      {/* Navigation Tabs */}
      <nav style={{ marginBottom: 20 }}>
        {(["movies","music","books","adult"] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setTmdbMatches(null);
              setTmdbError(null);
              setTmdbCategory(null);
              setTmdbId(null);
              setSpotifyMatches(null);
              setPornMatches(null);
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

 {activeTab === "movies" && (
    <button
      type="button"
      onClick={async () => {
        if (!title) return alert("Enter a title to autofill from TMDB");
        const cat = "movie";
        setTmdbCategory(cat as "movie");
        setTmdbMatches(null);
        setTmdbError(null);
        setTmdbLoading(true);
        try {
          const results = await fetchFromTMDB(title);
          setTmdbLoading(false);
          if (!results || results.length === 0) {
            setTmdbMatches([]);
            alert("No result from TMDB");
            return;
          }
          if (results.length === 1) {
            applyMatch({
              title: results[0].title ?? results[0].name,
              genre: "",
              cover_url: results[0].poster_path
                ? `https://image.tmdb.org/t/p/w500${results[0].poster_path}`
                : "",
              release_year: (results[0].release_date ?? results[0].first_air_date ?? "").split("-")[0],
              download_url: "",
            });
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
      style={buttonStyle}
    >
      Autofill (TMDB)
    </button>
  )}

          {activeTab === "music" && (
            <>
              <input placeholder="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
              <input placeholder="Album" value={album} onChange={(e) => setAlbum(e.target.value)} />
              <button
                type="button"
                onClick={async () => {
                  if (!title) return alert("Enter a track title to autofill from Spotify");
                  const results = await fetchFromSpotify(title);
                  if (!results || results.length === 0) {
                    alert("No result from Spotify");
                    return;
                  }
                  if (results.length === 1) {
                    applyMatch(results[0]);
                  } else {
                    setSpotifyMatches(results);
                  }
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
                  if (!title) return alert("Enter a book title");
                  const data = await fetchFromOpenLibrary(title, author);
                  if (!data || !data.results) {
                    alert("No result from OpenLibrary");
                    return;
                  }
                  if (data.results.length === 1) {
                    const b = data.results[0];
                    applyMatch({
                      title: b.title,
                      genre: "",
                      cover_url: b.coverUrl,
                      release_year: b.publishYear,
                      download_url: b.downloadUrl,
                      artist: "",
                      album: "",
                    });
                    setAuthor(b.author);
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

          {activeTab === "adult" && (
            <button
              type="button"
              onClick={async () => {
                if (!title) return alert("Enter a title to autofill from ThePornDB");
                const results = await fetchFromThePornDB(title);
                if (!results || results.length === 0) {
                  alert("No result from ThePornDB");
                  return;
                }
                if (results.length === 1) {
                  applyMatch(results[0]);
                } else {
                  setPornMatches(results);
                }
              }}
              style={buttonStyle}
            >
              Autofill (ThePornDB)
            </button>
          )}

          <input placeholder="Download URL" value={downloadUrl} onChange={(e) => setDownloadUrl(e.target.value)} required />
          <button type="submit" style={buttonStyle}>Save {activeTab}</button>
        </form>

        {/* Spotify Matches */}
        {spotifyMatches && (
          <div style={{ marginTop: 20 }}>
            <h3>Spotify Matches</h3>
            <ul>
              {spotifyMatches.map((track, idx) => (
                <li key={idx} style={{ marginBottom: 10 }}>
                  <img src={track.cover_url} alt={track.title} style={{ width: 50, height: 50, objectFit: "cover" }} />
                  <strong>{track.title}</strong> — {track.artist} ({track.album})
                  <button onClick={() => applyMatch(track)} style={buttonStyle}>Use this</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ThePornDB Matches */}
        {pornMatches && (
          <div style={{ marginTop: 20 }}>
            <h3>ThePornDB Matches</h3>
            <ul>
              {pornMatches.map((item, idx) => (
                <li key={idx} style={{ marginBottom: 10 }}>
                  {item.cover_url && (
                    <img src={item.cover_url} alt={item.title} style={{ width: 50, height: 50, objectFit: "cover" }} />
                  )}
                  <strong>{item.title}</strong> ({item.release_year}) — {item.genre}
                  <button onClick={() => applyMatch(item)} style={buttonStyle}>Use this</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Book Matches */}
        {bookMatches && (
          <div style={{ marginTop: 20 }}>
            <h3>OpenLibrary Matches</h3>
            <ul>
              {bookMatches.map((match, idx) => (
                <li key={idx} style={{ marginBottom: 10 }}>
                  <strong>{match.title}</strong> by {match.author} ({match.publishYear})
                  {match.coverUrl && <img src={match.coverUrl} alt={match.title} style={{ width: 100 }} />}
                  <button onClick={() => applyMatch({
                    title: match.title,
                    genre: "",
                    cover_url: match.coverUrl,
                    release_year: match.publishYear,
                    download_url: match.downloadUrl,
                  })} style={buttonStyle}>Use this</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* TMDB Matches */}
{tmdbLoading && <p>Searching TMDB...</p>}
{tmdbError && <p style={{ color: "red" }}>TMDB error: {tmdbError}</p>}
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
            onClick={() => applyMatch({
              title: mTitle,
              genre: "",
              cover_url: thumb,
              release_year: mYear,
              download_url: "",
            })}
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
                {mTitle} {mYear && <span style={{ color: "#666", fontWeight: 400 }}>({mYear})</span>}
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
                  applyMatch({
                    title: mTitle,
                    genre: "",
                    cover_url: thumb,
                    release_year: mYear,
                    download_url: "",
                  });
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


        {error && <p style={{ color: "red" }}>Error: {error}</p>}
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
          style={{ padding: "8px 16px", borderRadius: 6, cursor: "pointer" }}
        >
          Logout
        </button>
      </div>
    </main>
  );
}
  