"use client";

import { useState, useEffect } from "react";

// We define what a saved item looks like
export interface SavedMedia {
  id: number;
  title: string;
  category: string;
  image: string;
  year: string;
}

export default function BookmarkButton({ media }: { media: SavedMedia }) {
  const [isSaved, setIsSaved] = useState(false);

  // 1. Check local storage on load to see if this is already saved
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("mw_watchlist") || "[]");
    const exists = saved.some((item: SavedMedia) => item.id === media.id);
    setIsSaved(exists);
  }, [media.id]);

  // 2. Handle adding/removing from the watchlist
  const toggleBookmark = () => {
    let saved = JSON.parse(localStorage.getItem("mw_watchlist") || "[]");
    
    if (isSaved) {
      // Remove it
      saved = saved.filter((item: SavedMedia) => item.id !== media.id);
    } else {
      // Add it
      saved.push(media);
    }
    
    localStorage.setItem("mw_watchlist", JSON.stringify(saved));
    setIsSaved(!isSaved);
    
    // Dispatch a custom event so the Navbar can update a badge if we want to add one later
    window.dispatchEvent(new Event("watchlistUpdated"));
  };

  return (
    <button 
      onClick={toggleBookmark}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${
        isSaved 
          ? "bg-pink-600 text-white hover:bg-pink-700" 
          : "bg-white/10 text-gray-300 hover:bg-white/20"
      }`}
    >
      <svg className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
      </svg>
      {isSaved ? "Saved" : "Watchlist"}
    </button>
  );
}