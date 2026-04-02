"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, Film, Book, Music } from "lucide-react";
import { globalData } from "@/lib/searchData";

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  // This filters the data whenever 'query' changes
  const results = query.trim() === "" 
    ? [] 
    : globalData.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );

  // Debugging: This will show you in the browser console if search is working
  useEffect(() => {
    if (query) console.log("Searching for:", query, "Results found:", results.length);
  }, [query, results]);

  return (
    <div className="relative">
      {/* 1. The Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-lg text-zinc-400 hover:border-purple-500 transition-all w-48 md:w-64"
      >
        <Search size={16} />
        <span className="text-sm">Search...</span>
      </button>

      {/* 2. The Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex justify-center items-start pt-20 px-4">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Search Input Area */}
            <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
              <Search className="text-purple-500" size={20} />
              <input
                autoFocus
                type="text"
                placeholder="Type movie or book name..."
                className="flex-1 bg-transparent border-none outline-none text-white text-lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button onClick={() => { setIsOpen(false); setQuery(""); }}>
                <X className="text-zinc-500 hover:text-white" size={20} />
              </button>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length > 0 ? (
                results.map((item, index) => (
                  <Link
                    key={index}
                    href={item.link}
                    onClick={() => { setIsOpen(false); setQuery(""); }}
                    className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group"
                  >
                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      {item.type === "movie" && <Film size={18} />}
                      {item.type === "book" && <Book size={18} />}
                      {item.type === "music" && <Music size={18} />}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{item.title}</h4>
                      <p className="text-xs text-zinc-500 uppercase tracking-tighter">{item.type} • {item.category}</p>
                    </div>
                  </Link>
                ))
              ) : query !== "" ? (
                <div className="p-10 text-center text-zinc-500">
                  No matches for "{query}"
                </div>
              ) : (
                <div className="p-10 text-center text-zinc-600 text-sm">
                  Start typing to search...
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}