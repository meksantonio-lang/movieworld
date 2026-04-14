// src/components/globalSearch.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, Film, Book, Music } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      const { data, error } = await supabase
        .from("media_items")
        .select("*")
        .ilike("title", `%${query}%`)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Search error:", error);
        setResults([]);
      } else {
        setResults(data ?? []);
      }
    }, 300); // debounce: wait 300ms after typing stops

    return () => clearTimeout(handler);
  }, [query]);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-lg text-zinc-400 hover:border-purple-500 transition-all w-48 md:w-64"
      >
        <Search size={16} />
        <span className="text-sm">Search...</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex justify-center items-start pt-20 px-4">
          <div className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Input */}
            <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
              <Search className="text-purple-500" size={20} />
              <input
                autoFocus
                type="text"
                placeholder="Type movie, book, or song..."
                className="flex-1 bg-transparent border-none outline-none text-white text-lg"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button onClick={() => { setIsOpen(false); setQuery(""); }}>
                <X className="text-zinc-500 hover:text-white" size={20} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {results.length > 0 ? (
                results.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${item.category}?id=${item.id}`}
                    onClick={() => { setIsOpen(false); setQuery(""); }}
                    className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group"
                  >
                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      {item.category === "movies" && <Film size={18} />}
                      {item.category === "books" && <Book size={18} />}
                      {item.category === "songs" && <Music size={18} />}
                    </div>
                    <div>
                      <h4 className="text-white font-medium">{item.title}</h4>
                      <p className="text-xs text-zinc-500 uppercase tracking-tighter">
                        {item.category}
                      </p>
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
