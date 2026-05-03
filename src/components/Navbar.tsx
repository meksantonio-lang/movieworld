"use client";

import Link from "next/link";
import GlobalSearch from "./GlobalSearch";

export default function Navbar() {
  return (
    <nav className="border-b border-white/5 bg-purple-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 h-16 flex items-center justify-between">
        
        {/* Branding */}
        <Link href="/" className="flex items-center gap-1 group">
          {/* Mobile logo (stacked) */}
          <span className="block md:hidden text-xs font-black tracking-tighter text-white uppercase group-hover:text-purple-500 transition-colors leading-tight">
            Movie<br />
            wuld <span className="inline-block animate-pulse">🌍</span>
          </span>

          {/* Desktop logo (inline) */}
          <span className="hidden md:block text-xl font-black tracking-tighter text-white uppercase group-hover:text-purple-500 transition-colors">
            Moviewrld <span className="inline-block animate-pulse">🌍</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
          {/* Categories */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-6 flex-wrap">
            <Link href="/" className="text-[9px] sm:text-xs md:text-sm font-bold text-white hover:text-gray-300 hover:underline transition-colors uppercase tracking-tight">
              Movies
            </Link>
            <Link href="/music" className="text-[9px] sm:text-xs md:text-sm font-bold text-white hover:text-gray-300 hover:underline transition-colors uppercase tracking-tight">
              Music
            </Link>
            <Link href="/books" className="text-[9px] sm:text-xs md:text-sm font-bold text-white hover:text-gray-300 hover:underline transition-colors uppercase tracking-tight">
              Books
            </Link>
            <Link href="/anime" className="text-[9px] sm:text-xs md:text-sm font-bold text-white hover:text-gray-300 hover:underline transition-colors uppercase tracking-tight">
              Anime
            </Link>
            <Link href="/adult" className="text-[9px] sm:text-xs md:text-sm font-bold text-white hover:text-gray-300 hover:underline transition-colors uppercase tracking-tight">
              18+
            </Link>
            <Link href="/kdrama" className="text-[9px] sm:text-xs md:text-sm font-bold text-white hover:text-gray-300 hover:underline transition-colors uppercase tracking-tight">
              K-Drama
            </Link>
          </div>

          {/* Responsive Search */}
          <div className="w-16 sm:w-28 md:w-64">
            <GlobalSearch />
          </div>
        </div>
      </div>
    </nav>
  );
}
