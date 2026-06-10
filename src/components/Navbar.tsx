"use client";

import Link from "next/link";
import { useState } from "react";
import GlobalSearch from "./GlobalSearch";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    // Changed bg-gray-950/90 to bg-purple-900 for that deep magenta/purple look
    <nav className="sticky top-0 z-50 w-full bg-purple-900 shadow-lg border-b border-purple-700">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 group shrink-0" onClick={closeMenu}>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase transition-colors">
              MovieWrld <span className="inline-block animate-pulse">🌍</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 font-bold text-sm tracking-widest uppercase">
            <Link href="/feed" className="text-white hover:text-purple-300 transition-colors">News Feed</Link>
            {/* Adjusted hover colors to pop against the purple background */}
            <Link href="/movies" className="text-white hover:text-purple-300 transition-colors">Movies</Link>
            <Link href="/anime" className="text-white hover:text-purple-300 transition-colors">Anime</Link>
            <Link href="/kdrama" className="text-white hover:text-purple-300 transition-colors">K-Drama</Link>
            
            <Link href="/watchlist" className="text-pink-300 hover:text-pink-200 transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
              </svg>
              Watchlist
            </Link>
          </div>

          {/* Global Search Bar */}
          <div className="hidden sm:block flex-grow max-w-md ml-auto">
            <GlobalSearch />
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white hover:text-purple-300 transition-colors"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        // Changed bg-gray-900 to bg-purple-950 for the mobile menu body
        <div className="md:hidden bg-purple-950 border-b border-purple-800 px-4 py-4 space-y-4 shadow-xl">
          <div className="mb-4">
            <GlobalSearch />
          </div>
          <div className="flex flex-col gap-4 font-bold text-sm tracking-widest uppercase pb-2">
            <Link href="/feed" onClick={closeMenu} className="text-white hover:text-purple-300 block">News Feed</Link>
            <Link href="/movies" onClick={closeMenu} className="text-white hover:text-purple-300 block">Movies</Link>
            <Link href="/anime" onClick={closeMenu} className="text-white hover:text-purple-300 block">Anime</Link>
            <Link href="/kdrama" onClick={closeMenu} className="text-white hover:text-purple-300 block">K-Drama</Link>
            <Link href="/watchlist" onClick={closeMenu} className="text-pink-300 hover:text-pink-200 block flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
              </svg>
              Watchlist
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}