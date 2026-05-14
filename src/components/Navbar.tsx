"use client";

import Link from "next/link";
import { useState } from "react";
import GlobalSearch from "./GlobalSearch";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="border-b border-white/5 bg-purple-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 h-16 flex items-center justify-between">
        
        {/* Branding */}
        <Link href="/" className="flex items-center gap-1 group">
          {/* Mobile logo */}
          <span className="block md:hidden text-xs font-black tracking-tighter text-white uppercase group-hover:text-purple-500 transition-colors leading-tight">
            Movie<br />
            wrld <span className="inline-block animate-pulse">🌍</span>
          </span>

          {/* Desktop logo */}
          <span className="hidden md:block text-xl font-black tracking-tighter text-white uppercase group-hover:text-purple-500 transition-colors">
            Moviewrld <span className="inline-block animate-pulse">🌍</span>
          </span>
        </Link>

        {/* Desktop Categories */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
          <Link href="/" className="text-xl font-bold text-white hover:text-gray-300 hover:underline transition-colors uppercase">
            Movies
          </Link>
          <Link href="/music" className="text-xl font-bold text-white hover:text-gray-300 hover:underline transition-colors uppercase">
            Music
          </Link>
          <Link href="/books" className="text-xl font-bold text-white hover:text-gray-300 hover:underline transition-colors uppercase">
            Books
          </Link>
          <Link href="/anime" className="text-xl font-bold text-white hover:text-gray-300 hover:underline transition-colors uppercase">
            Anime
          </Link>
          <Link href="/adult" className="text-xl font-bold text-white hover:text-gray-300 hover:underline transition-colors uppercase">
            18+
          </Link>
          <Link href="/kdrama" className="text-xl font-bold text-white hover:text-gray-300 hover:underline transition-colors uppercase">
            K-Drama
          </Link>
        </div>

        {/* Search */}
        <div className="w-16 sm:w-28 md:w-64">
          <GlobalSearch />
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-white focus:outline-none ml-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown with animation */}
      <div
        className={`md:hidden bg-purple-800 overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-3 grid grid-cols-3 gap-3 text-center">
          <Link href="/" className="text-lg font-bold text-white hover:text-gray-300">Movies</Link>
          <Link href="/music" className="text-lg font-bold text-white hover:text-gray-300">Music</Link>
          <Link href="/books" className="text-lg font-bold text-white hover:text-gray-300">Books</Link>
          <Link href="/anime" className="text-lg font-bold text-white hover:text-gray-300">Anime</Link>
          <Link href="/adult" className="text-lg font-bold text-white hover:text-gray-300">18+</Link>
          <Link href="/kdrama" className="text-lg font-bold text-white hover:text-gray-300">K-Drama</Link>
        </div>
      </div>
    </nav>
  );
}
