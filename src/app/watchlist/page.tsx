"use client";

import { useState, useEffect } from "react";
import MediaCard from "@/components/MediaCard";
import { SavedMedia } from "@/components/BookmarkButton";
import Link from "next/link";

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<SavedMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // We must fetch from localStorage inside a useEffect so it only runs on the client browser
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("mw_watchlist") || "[]");
    // Reverse it so the newest saved items show up first
    setWatchlist(saved.reverse());
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <main className="min-h-screen bg-gray-950 px-4 md:px-8 py-16"></main>;
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 md:px-8 py-16">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest">
            My Watchlist
          </h1>
          <span className="bg-purple-600/20 text-purple-400 font-bold px-4 py-1 rounded-full text-sm">
            {watchlist.length} {watchlist.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-24 h-24 text-gray-800 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
            <h2 className="text-2xl text-white font-bold mb-4">Your watchlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              Keep track of movies and anime you want to watch later. Click the bookmark icon on any title to add it here.
            </p>
            <Link href="/" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-colors">
              Explore Trending
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {watchlist.map((m) => (
              <MediaCard
                key={m.id}
                id={m.id}
                title={m.title} 
                category={m.category}
                image={m.image}
                releaseYear={m.year}
              />
            ))}
          </div>
        )}
        
      </div>
    </main>
  );
}