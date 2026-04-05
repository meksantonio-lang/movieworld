"use client";

import React, { useEffect, useState } from "react";
import { createClient, Session } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ADMIN_EMAIL = "meksantonio@gmail.com";
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;

type Tab = "movies" | "anime" | "kdrama" | "music" | "books";

export default function AdminPage() {
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

  // auth session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

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

  // fetch helper: calls your API route to get rows (or directly query supabase if preferred)
  async function fetchItems(tab: Tab) {
    setLoading(true);
    setError(null);
    try {
      // Option A: call your API route (if you have GET implemented)
      // const res = await fetch(`/api/${tab}`);
      // const data = await res.json();

      // Option B: query Supabase directly from client (works if anon key has read access)
      const { data, error: sbError } = await supabase.from(tab).select("*").order("created_at", { ascending: false }).limit(100);
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

  // load items when tab changes
  useEffect(() => {
    fetchItems(activeTab);
  }, [activeTab]);

  // TMDB helper (used only for movies/anime/kdrama if you want auto-fill)
  async function fetchFromTMDB(title: string, category: "movie" | "anime" | "kdrama") {
    try {
      let endpoint = "search/movie";
      if (category === "anime" || category === "kdrama") endpoint = "search/tv";
      const res = await fetch(
        `https://api.themoviedb.org/3/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`
      );
      const json = await res.json();
      return json.results?.[0] ?? null;
    } catch (err) {
      console.error("TMDB fetch error:", err);
      return null;
    }
  }

  // submit handler: normalizes payload to what your API expects
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // build payload
    const payload: any = {
      title,
      genre,
      cover,
      release_year: typeof releaseYear === "number" && !Number.isNaN(releaseYear) ? releaseYear : null,
      download_url: downloadUrl,
    };

    // add extra fields for music/books
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

      // helpful debug: log status and body
      const text = await res.text();
      console.log("Response status:", res.status, "body:", text);

      if (!res.ok) {
        // try to parse JSON error if possible
        try {
          const json = JSON.parse(text);
          setError(json.message || JSON.stringify(json));
        } catch {
          setError(`Request failed: ${res.status} ${text}`);
        }
        return;
      }

      // success: clear form and refresh list
      alert(`${activeTab} added successfully`);
      setTitle(""); setGenre(""); setCover(""); setReleaseYear(""); setDownloadUrl("");
      setArtist(""); setAlbum(""); setAuthor("");
      fetchItems(activeTab);
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

  return (
    <main style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, <strong>{session.user.email}</strong></p>

      {/* Tabs */}
      <nav style={{ marginBottom: 20 }}>
        {(["movies","anime","kdrama","music","books"] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
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

      {/* Form */}
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
                // quick TMDB autofill for movies/anime/kdrama
                if (!title) return alert("Enter a title to autofill from TMDB");
                if (activeTab === "movies" || activeTab === "anime" || activeTab === "kdrama") {
                  const cat = activeTab === "movies" ? "movie" : activeTab === "anime" ? "anime" : "kdrama";
                  const result = await fetchFromTMDB(title, cat as any);
                  if (!result) return alert("No result from TMDB");
                  // map fields
                  setTitle(result.title ?? result.name ?? title);
                  setCover(result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : "");
                  const yearStr = result.release_date ?? result.first_air_date ?? "";
                  setReleaseYear(yearStr ? Number(yearStr.split("-")[0]) : "");
                  setGenre((result.genre_ids || []).join(","));
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
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
      </section>

      {/* List */}
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
                    // simple delete (confirm)
                    if (!confirm("Delete this item?")) return;
                    try {
                      const { error: delErr } = await supabase.from(activeTab).delete().eq("id", it.id);
                      if (delErr) {
                        alert("Delete error: " + delErr.message);
                      } else {
                        fetchItems(activeTab);
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
