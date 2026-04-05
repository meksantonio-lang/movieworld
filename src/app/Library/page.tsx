"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Item = {
  id: number;
  title: string;
  cover?: string;
  genre?: string;
  release_year?: number;
  download_url?: string;
  artist?: string;
  album?: string;
  author?: string;
  created_at?: string;
  downloads?: number;
  source_table?: string; // Added to identify the source table for each item
};

export default function LibraryPage() {
  const [newItems, setNewItems] = useState<Item[]>([]);
  const [popularItems, setPopularItems] = useState<Item[]>([]);

  useEffect(() => {
    async function fetchLibrary() {
      // Fetch newest items from all tables
      const tables = ["movies", "anime", "kdrama", "music", "books"];
      const newestResults = await Promise.all(
        tables.map((table) =>
          supabase.from(table).select("*").order("created_at", { ascending: false }).limit(5)
        )
      );

      // Flatten results
      const newest = newestResults.flatMap((res) => res.data ?? []);
      // Sort across all tables by created_at
      newest.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setNewItems(newest.slice(0, 10));

      // Fetch most downloaded items from all tables
      const popularResults = await Promise.all(
        tables.map((table) =>
          supabase.from(table).select("*").order("downloads", { ascending: false }).limit(5)
        )
      );

      const popular = popularResults.flatMap((res) => res.data ?? []);
      popular.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0));
      setPopularItems(popular.slice(0, 10));
    }
    fetchLibrary();
  }, []);

  async function handleDownload(
    table: string,
    itemId: number,
    currentDownloads: number,
    url: string
  ) {
    try {
      await fetch(`/api/${table}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, downloads: currentDownloads }),
      });
      window.open(url, "_blank");
    } catch (error) {
      console.error("Download error:", error);
    }
  }

  const renderSection = (title: string, items: Item[]) => (
    <section style={{ marginBottom: "40px" }}>
      <h2>{title}</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {items.map((item) => (
          <div key={item.id} style={{ border: "1px solid #ccc", padding: "10px", width: "200px" }}>
            {item.cover && <img src={item.cover} alt={item.title} style={{ width: "100%" }} />}
            <h3>{item.title}</h3>
            {item.genre && <p>Genre: {item.genre}</p>}
            {item.artist && <p>Artist: {item.artist}</p>}
            {item.album && <p>Album: {item.album}</p>}
            {item.author && <p>Author: {item.author}</p>}
            {item.release_year && <p>Year: {item.release_year}</p>}
            {item.downloads !== undefined && <p>Downloads: {item.downloads}</p>}
            {item.download_url && (
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                   handleDownload(item.source_table!, item.id, item.downloads ?? 0, item.download_url!);
                }}
              >
                Download
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <main style={{ padding: "20px" }}>
      <h1>Library</h1>
      {renderSection("Newly Added", newItems)}
      {renderSection("Most Downloaded", popularItems)}
    </main>
  );
}
