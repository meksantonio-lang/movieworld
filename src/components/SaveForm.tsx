"use client";
import { useState } from "react";

interface SaveFormProps {
  category: "movies" | "anime" | "kdrama" | "adult" | "music" | "books";
}

export default function SaveForm({ category }: SaveFormProps) {
  const [title, setTitle] = useState("");
  const [posterPath, setPosterPath] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [downloadLink, setDownloadLink] = useState("");

  async function saveToLibrary(item: any) {
    const res = await fetch("https://movieworld.wuaze.com/downloads/save.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });

    const result: { success: boolean; message: string } = await res.json();
    alert(result.message);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveToLibrary({
          category, // dynamic category from props
          id: Date.now(),
          title,
          poster_path: posterPath,
          release_date: releaseDate,
          downloadLink,
        });
      }}
      className="flex flex-col gap-4"
    >
      <input
        type="text"
        placeholder="Title *"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Poster Path"
        value={posterPath}
        onChange={(e) => setPosterPath(e.target.value)}
      />
      <input
        type="text"
        placeholder="Release Date"
        value={releaseDate}
        onChange={(e) => setReleaseDate(e.target.value)}
      />
      <input
        type="text"
        placeholder="Download Link *"
        value={downloadLink}
        onChange={(e) => setDownloadLink(e.target.value)}
        required
      />
      <button type="submit">💾 Save to {category}</button>
    </form>
  );
}
