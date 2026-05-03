"use client";

import Link from "next/link";
import GlobalSearch from "./GlobalSearch";

export default function Navbar() {
  return (
    <nav className="border-b border-white/5 bg-purple-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Branding */}
        <Link href="/" className="flex items-center gap-1 group">
          <span className="text-2xl font-black tracking-tighter text-white uppercase group-hover:text-purple-500 transition-colors">
            M<span className="inline-block animate-pulse">🌍</span>viewrld
          </span>
        </Link>

        <div className="flex items-center gap-8">
          {/* Categories now visible on mobile too */}
          <div className="flex items-center gap-6 flex-wrap">
            <Link href="/" className="text-sm font-bold text-white hover:text-gray-300 transition-colors uppercase tracking-widest">
              Movies
            </Link>
            <Link href="/music" className="text-sm font-bold text-white hover:text-gray-300 transition-colors uppercase tracking-widest">
              Music
            </Link>
            <Link href="/books" className="text-sm font-bold text-white hover:text-gray-300 transition-colors uppercase tracking-widest">
              Books
            </Link>
            <Link href="/anime" className="text-sm font-bold text-white hover:text-gray-300 transition-colors uppercase tracking-widest">
              Anime
            </Link>
            <Link href="/adult" className="text-sm font-bold text-white hover:text-gray-300 transition-colors uppercase tracking-widest">
              18+
            </Link>
            <Link href="/kdrama" className="text-sm font-bold text-white hover:text-gray-300 transition-colors uppercase tracking-widest">
              K-Drama
            </Link>
            <Link href="/favorites" className="text-sm font-bold text-white hover:text-gray-300 transition-colors uppercase tracking-widest">
              Library
            </Link>
          </div>
          <GlobalSearch />
        </div>
      </div>
    </nav>
  );
}
