"use client";

import React, { useState, useEffect } from "react";
import { createClient, Session } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ADMIN_EMAIL = "meksantonio@gmail.com";
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY!;

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);

  // Movies
  const [movieTitle, setMovieTitle] = useState("");
  const [movieDownloadUrl, setMovieDownloadUrl] = useState("");

  // Anime
  const [animeTitle, setAnimeTitle] = useState("");
  const [animeDownloadUrl, setAnimeDownloadUrl] = useState("");

  // K-Drama
  const [dramaTitle, setDramaTitle] = useState("");
  const [dramaDownloadUrl, setDramaDownloadUrl] = useState("");

  // Music (manual fields)
  const [songTitle, setSongTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [musicPoster, setMusicPoster] = useState("");
  const [musicReleaseYear, setMusicReleaseYear] = useState("");
  const [musicGenre, setMusicGenre] = useState("");
  const [musicDownloadUrl, setMusicDownloadUrl] = useState("");

  // Books (manual fields)
  const [bookTitle, setBookTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [bookPoster, setBookPoster] = useState("");
  const [bookReleaseYear, setBookReleaseYear] = useState("");
  const [bookGenre, setBookGenre] = useState("");
  const [bookDownloadUrl, setBookDownloadUrl] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div>
        <h1>Admin Login</h1>
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
      </div>
    );
  }

  if (session.user.email !== ADMIN_EMAIL) {
    return (
      <div>
        <h1>Access Denied</h1>
        <button onClick={() => supabase.auth.signOut()}>Logout</button>
      </div>
    );
  }

  async function fetchFromTMDB(title: string, category: "movie" | "anime" | "drama") {
    let endpoint = "search/movie";
    if (category === "anime" || category === "drama") endpoint = "search/tv";

    const res = await fetch(
      `https://api.themoviedb.org/3/${endpoint}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`
    );
    const data = await res.json();
    return data.results[0];
  }

  async function addMovie() {
    const movie = await fetchFromTMDB(movieTitle, "movie");
    await fetch("/api/movies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: movie.title,
        genre: movie.genre_ids.join(","),
        cover: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        release_year: parseInt(movie.release_date.split("-")[0]),
        download_url: movieDownloadUrl,
      }),
    });
    setMovieTitle(""); setMovieDownloadUrl("");
  }

  async function addAnime() {
    const anime = await fetchFromTMDB(animeTitle, "anime");
    await fetch("/api/anime", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: anime.name,
        genre: anime.genre_ids.join(","),
        cover: `https://image.tmdb.org/t/p/w500${anime.poster_path}`,
        release_year: parseInt(anime.first_air_date.split("-")[0]),
        download_url: animeDownloadUrl,
      }),
    });
    setAnimeTitle(""); setAnimeDownloadUrl("");
  }

  async function addDrama() {
    const drama = await fetchFromTMDB(dramaTitle, "drama");
    await fetch("/api/drama", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: drama.name,
        genre: drama.genre_ids.join(","),
        cover: `https://image.tmdb.org/t/p/w500${drama.poster_path}`,
        release_year: parseInt(drama.first_air_date.split("-")[0]),
        download_url: dramaDownloadUrl,
      }),
    });
    setDramaTitle(""); setDramaDownloadUrl("");
  }

  async function addMusic() {
    await fetch("/api/music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: songTitle,
        artist,
        album,
        cover: musicPoster,
        release_year: parseInt(musicReleaseYear),
        genre: musicGenre,
        download_url: musicDownloadUrl,
      }),
    });
    setSongTitle(""); setArtist(""); setAlbum("");
    setMusicPoster(""); setMusicReleaseYear(""); setMusicGenre(""); setMusicDownloadUrl("");
  }

  async function addBook() {
    await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: bookTitle,
        author,
        cover: bookPoster,
        release_year: parseInt(bookReleaseYear),
        genre: bookGenre,
        download_url: bookDownloadUrl,
      }),
    });
    setBookTitle(""); setAuthor("");
    setBookPoster(""); setBookReleaseYear(""); setBookGenre(""); setBookDownloadUrl("");
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {session.user.email}</p>

      {/* Movies */}
      <h2>Add Movie</h2>
      <form onSubmit={(e) => { e.preventDefault(); addMovie(); }}>
        <input placeholder="Movie Title" value={movieTitle} onChange={(e) => setMovieTitle(e.target.value)} />
        <input placeholder="Download URL" value={movieDownloadUrl} onChange={(e) => setMovieDownloadUrl(e.target.value)} />
        <button type="submit">Add Movie</button>
      </form>

      {/* Anime */}
      <h2>Add Anime</h2>
      <form onSubmit={(e) => { e.preventDefault(); addAnime(); }}>
        <input placeholder="Anime Title" value={animeTitle} onChange={(e) => setAnimeTitle(e.target.value)} />
        <input placeholder="Download URL" value={animeDownloadUrl} onChange={(e) => setAnimeDownloadUrl(e.target.value)} />
        <button type="submit">Add Anime</button>
      </form>

      {/* K-Drama */}
      <h2>Add K-Drama</h2>
      <form onSubmit={(e) => { e.preventDefault(); addDrama(); }}>
        <input placeholder="Drama Title" value={dramaTitle} onChange={(e) => setDramaTitle(e.target.value)} />
        <input placeholder="Download URL" value={dramaDownloadUrl} onChange={(e) => setDramaDownloadUrl(e.target.value)} />
        <button type="submit">Add Drama</button>
      </form>

      {/* Music */}
      <h2>Add Music (Manual)</h2>
      <form onSubmit={(e) => { e.preventDefault(); addMusic(); }}>
        <input placeholder="Song Title" value={songTitle} onChange={(e) => setSongTitle(e.target.value)} />
        <input placeholder="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
        <input placeholder="Album" value={album} onChange={(e) => setAlbum(e.target.value)} />
        <input placeholder="Import Poster URL" value={musicPoster} onChange={(e) => setMusicPoster(e.target.value)} />
        <input placeholder="Release Year" value={musicReleaseYear} onChange={(e) => setMusicReleaseYear(e.target.value)} />
        <input placeholder="Genre" value={musicGenre} onChange={(e) => setMusicGenre(e.target.value)} />
        <input placeholder="Download URL" value={musicDownloadUrl} onChange={(e) => setMusicDownloadUrl(e.target.value)} />
        <button type="submit">Add Music</button>
      </form>

      {/* Books */}
      <h2>Add Book (Manual)</h2>
      <form onSubmit={(e) => { e.preventDefault(); addBook(); }}>
        <input placeholder="Book Title" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} />
        <input placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
        <input placeholder="Import Poster URL" value={bookPoster} onChange={(e) => setBookPoster(e.target.value)} />
        <input placeholder="Release Year" value={bookReleaseYear} onChange={(e) => setBookReleaseYear(e.target.value)} />
        <input placeholder="Genre" value={bookGenre} onChange={(e) => setBookGenre(e.target.value)} />
        <input placeholder="Download URL" value={bookDownloadUrl} onChange={(e) => setBookDownloadUrl(e.target.value)} />
        <button type="submit">Add Book</button>
      </form>

      <button style={{ marginTop: "20px" }} onClick={() => supabase.auth.signOut()}>
        Logout
      </button>
    </div>
  );
}
