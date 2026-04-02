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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("media_items")
      .insert([{ tmdb_id: Number(tmdbId), category, download_link: downloadLink }]);

    if (error) {
      alert("Error saving: " + error.message);
    } else {
      alert("Saved successfully!");
      setTmdbId("");
      setDownloadLink("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <input
        type="text"
        placeholder="TMDB ID"
        value={tmdbId}
        onChange={(e) => setTmdbId(e.target.value)}
        className="border p-2 w-full"
        required
      />
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
