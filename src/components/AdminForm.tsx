// src/components/AdminForm.tsx
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AdminFormProps {
  defaultCategory?: string;
}

export default function AdminForm({ defaultCategory = "movies" }: AdminFormProps) {
  const [tmdbId, setTmdbId] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [downloadLink, setDownloadLink] = useState("");

  // extra fields for music/books
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [author, setAuthor] = useState("");

  // helper to call backend autofill route
  async function fetchFromMusicBrainz(artist: string, track: string) {
    try {
      const resp = await fetch("/api/autofill-music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artist, track }),
      });
      if (!resp.ok) return null;
      return await resp.json();
    } catch {
      return null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      category,
      download_link: downloadLink || null,
    };

    if (category === "movies" || category === "anime" || category === "kdrama") {
      payload.tmdb_id = Number(tmdbId) || null;
    }

    if (category === "music") {
      payload.title = title || null;
      payload.genre = genre || null;
      payload.cover_url = coverUrl || null;
      payload.release_year = releaseYear ? Number(releaseYear) : null;
      payload.metadata = { artist, album };
    }

    if (category === "books") {
      payload.title = title || null;
      payload.genre = genre || null;
      payload.cover_url = coverUrl || null;
      payload.release_year = releaseYear ? Number(releaseYear) : null;
      payload.metadata = { author };
    }

    const { error } = await supabase.from("media_items").insert([payload]);

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      alert("Saved successfully!");
      setTmdbId("");
      setDownloadLink("");
      setTitle(""); setGenre(""); setCoverUrl(""); setReleaseYear("");
      setArtist(""); setAlbum(""); setAuthor("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border p-2 w-full"
      >
        <option value="movies">Movies</option>
        <option value="anime">Anime</option>
        <option value="kdrama">Kdrama</option>
        <option value="adult">Adult</option>
        <option value="music">Music</option>
        <option value="books">Books</option>
      </select>

      {category === "movies" || category === "anime" || category === "kdrama" ? (
        <input
          type="text"
          placeholder="TMDB ID"
          value={tmdbId}
          onChange={(e) => setTmdbId(e.target.value)}
          className="border p-2 w-full"
          required
        />
      ) : null}

      {category === "music" && (
        <>
          <input
            type="text"
            placeholder="Track Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full"
            required
          />
          <input
            type="text"
            placeholder="Artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="border p-2 w-full"
            required
          />
          <input
            type="text"
            placeholder="Album"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            className="border p-2 w-full"
          />
          <input
            type="text"
            placeholder="Genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="border p-2 w-full"
          />
          <input
            type="text"
            placeholder="Cover URL"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            className="border p-2 w-full"
          />
          <input
            type="text"
            placeholder="Release Year"
            value={releaseYear}
            onChange={(e) => setReleaseYear(e.target.value)}
            className="border p-2 w-full"
          />
          <button
            type="button"
            onClick={async () => {
              if (!title || !artist) {
                alert("Enter both track title and artist");
                return;
              }
              const data = await fetchFromMusicBrainz(artist, title);
              if (!data) {
                alert("No result from MusicBrainz");
                return;
              }
              setTitle(data.title || title);
              setGenre(data.genre || "");
              setCoverUrl(data.coverUrl || "");
              setReleaseYear(data.releaseYear || "");
              setArtist(data.artist || artist);
              setAlbum(data.album || "");
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Autofill (MusicBrainz)
          </button>
        </>
      )}

      {category === "books" && (
        <>
          <input
            type="text"
            placeholder="Book Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full"
            required
          />
          <input
            type="text"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </>
      )}

      <input
        type="text"
        placeholder="Download Link"
        value={downloadLink}
        onChange={(e) => setDownloadLink(e.target.value)}
        className="border p-2 w-full"
        required
      />

      <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">
        Save
      </button>
    </form>
  );
}
