"use client";

import { useState } from "react";

export default function HeroSection({ heroMovie, heroTrailerKey }: { heroMovie: any, heroTrailerKey: string | null }) {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <section className="relative w-full max-w-7xl mx-auto mb-16 rounded-2xl overflow-hidden shadow-2xl bg-gray-900 flex flex-col md:aspect-video group">
      {/* Note: relative positioning ensures the mobile mute button stays anchored perfectly */}
      
      {/* Video Frame Holder */}
      <div className="w-full aspect-video md:absolute md:inset-0 md:h-full">
        {heroTrailerKey ? (
          <iframe
            className="w-full h-full object-cover pointer-events-none"
            src={`https://www.youtube.com/embed/${heroTrailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&playsinline=1&loop=1&playlist=${heroTrailerKey}&controls=0&showinfo=0&rel=0`}
            title="Trailer"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : heroMovie?.backdrop_path ? (
          <img 
            src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path}`} 
            alt={heroMovie.title}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Trailer Unavailable
          </div>
        )}
      </div>

      {/* Unmute/Mute Toggle Button */}
      {heroTrailerKey && (
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-all border border-white/10 shadow-xl pointer-events-auto"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>
      )}
      
      {/* Responsive Details Content Block */}
      <div className="w-full p-6 bg-gray-900/90 border-t border-white/5 md:border-none md:p-8 md:bg-gradient-to-t md:from-gray-950 md:via-gray-950/70 md:to-transparent md:absolute md:bottom-0 md:left-0 md:z-10 pointer-events-none">
        <span className="bg-purple-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block shadow-lg">
          #1 Trending
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-2 line-clamp-1 drop-shadow-md">
          {heroMovie?.title || heroMovie?.name}
        </h2>
        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl line-clamp-2 md:line-clamp-3 drop-shadow-md">
          {heroMovie?.overview}
        </p>
      </div>
    </section>
  );
}