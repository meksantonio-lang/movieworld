"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ADMIN_EMAIL = "meksantonio@gmail.com"; // your admin email

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);

  // Movie form state
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [releaseYear, setReleaseYear] = useState("");

  // Music form state
  const [songTitle, setSongTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");

  // Book form state
  const [bookTitle, setBookTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [yearPublished, setYearPublished] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!session) {
    return (
      <div>
        <h1>Admin Login</h1>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      </div>
    );
  }

  // Non-admin users → Access Denied + Logout
  if (session.user.email !== ADMIN_EMAIL) {
    return (
      <div>
        <h1>Access Denied</h1>
        <button onClick={() => supabase.auth.signOut()}>Logout</button>
      </div>
    );
  }

  // Admin user → Full dashboard
  async function addMovie() {
    const res = await fetch("/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        genre,
        cover: null,
        release_year: parseInt(releaseYear),
      }),
    });
    const data = await res.json();
    alert("Movie added: " + JSON.stringify(data));
    setTitle(""); setGenre(""); setReleaseYear("");
  }

  async function addMusic() {
    const res = await fetch("/api/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: songTitle,
        artist,
        album,
      }),
    });
    const data = await res.json();
    alert("Music added: " + JSON.stringify(data));
    setSongTitle(""); setArtist(""); setAlbum("");
  }

  async function addBook() {
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: bookTitle,
        author,
        year_published: parseInt(yearPublished),
      }),
    });
    const data = await res.json();
    alert("Book added: " + JSON.stringify(data));
    setBookTitle(""); setAuthor(""); setYearPublished("");
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session.user.email}</p>

      {/* Movies Form */}
      <h2>Add Movie</h2>
      <form onSubmit={(e) => { e.preventDefault(); addMovie(); }}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input placeholder="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
        <input placeholder="Release Year" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} />
        <button type="submit">Add Movie</button>
      </form>

      {/* Music Form */}
      <h2>Add Music</h2>
      <form onSubmit={(e) => { e.preventDefault(); addMusic(); }}>
        <input placeholder="Song Title" value={songTitle} onChange={(e) => setSongTitle(e.target.value)} />
        <input placeholder="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
        <input placeholder="Album" value={album} onChange={(e) => setAlbum(e.target.value)} />
        <button type="submit">Add Music</button>
      </form>

      {/* Books Form */}
      <h2>Add Book</h2>
      <form onSubmit={(e) => { e.preventDefault(); addBook(); }}>
        <input placeholder="Book Title" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} />
        <input placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <input placeholder="Year Published" value={yearPublished} onChange={(e) => setYearPublished(e.target.value)} />
        <button type="submit">Add Book</button>
      </form>

      <button style={{ marginTop: "20px" }} onClick={() => supabase.auth.signOut()}>
        Logout
      </button>
    </div>
  );
}
