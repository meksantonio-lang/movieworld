"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getLiveSearchSuggestions } from "@/app/actions"; // Import the new server action

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Debounced Search Effect (waits 300ms after you stop typing)
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Don't search if the query is too short
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      const results = await getLiveSearchSuggestions(query);
      setSuggestions(results);
      setShowDropdown(true);
      setIsSearching(false);
    };

    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300); 

    return () => clearTimeout(timeoutId);
  }, [query]);

  // 3. Handle hitting "Enter" (Sends you to the full search page)
  const handleSearch = (e: React.FormEvent | React.MouseEvent) => {
    if ('preventDefault' in e) e.preventDefault();
    if (!query.trim()) return;
    
    setShowDropdown(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery(""); 
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full group z-50" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="relative">
        {/* Search Icon */}
        <svg 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-400 transition-colors" 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        
        {/* Input Field */}
        <input
          type="text"
          placeholder="Search movies, anime..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
          className="w-full bg-gray-950/50 border border-white/10 text-white text-sm rounded-full pl-10 pr-10 py-2 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder-gray-500"
        />

        {/* Loading Spinner or Clear Button */}
        {isSearching ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        ) : query && (
          <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        )}
      </form>

      {/* Live Suggestions Dropdown Menu */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          <ul className="flex flex-col">
            {suggestions.map((item) => {
              // Format the data perfectly for the dropdown
              const linkCategory = item.media_type === "movie" ? "movies" : "anime";
              const year = item.release_date ? item.release_date.slice(0, 4) : item.first_air_date ? item.first_air_date.slice(0, 4) : "";
              const title = item.title || item.name;
              const poster = item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : "/placeholder.png";

              return (
                <li key={item.id} className="border-b border-white/5 last:border-none">
                  <Link 
                    href={`/${linkCategory}/${item.id}`}
                    onClick={() => { setShowDropdown(false); setQuery(""); }}
                    className="flex items-center gap-3 p-3 hover:bg-gray-800 transition-colors"
                  >
                    <img src={poster} alt={title} className="w-10 h-14 object-cover rounded bg-gray-950" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white line-clamp-1">{title}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">{linkCategory}</span>
                        {year && <span className="text-[10px] text-gray-500">• {year}</span>}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          
          {/* Footer of the dropdown to go to full results */}
          <div className="p-2 border-t border-white/5 bg-gray-950/50">
            <button 
              onClick={handleSearch}
              className="w-full text-center text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors py-1"
            >
              See all results for "{query}" →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}