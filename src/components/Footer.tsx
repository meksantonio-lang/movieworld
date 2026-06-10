import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-white/5 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* 1. Branding & Tagline */}
          <div className="flex flex-col items-start">
            <Link href="/" className="flex items-center gap-1 group mb-4">
              <span className="text-2xl font-black tracking-tighter text-white uppercase group-hover:text-purple-400 transition-colors">
                Moviewrld <span className="inline-block animate-pulse">🌍</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Your ultimate hub for ratings, reviews, and trending trailers across Movies, Anime, and K-Dramas.
            </p>
          </div>

          {/* 2. Quick Links */}
          <div className="flex flex-col md:items-center">
            <h4 className="text-white font-bold uppercase tracking-widest mb-4">Explore</h4>
            <div className="flex flex-col gap-3 text-gray-400 text-sm font-medium">
              <Link href="/movies" className="hover:text-purple-400 transition-colors">Movies</Link>
              <Link href="/anime" className="hover:text-purple-400 transition-colors">Anime</Link>
              <Link href="/kdrama" className="hover:text-purple-400 transition-colors">K-Drama</Link>
            </div>
          </div>

          {/* 3. Socials & Contact */}
          <div className="flex flex-col md:items-end">
            <h4 className="text-white font-bold uppercase tracking-widest mb-4">Connect With Us</h4>
            <div className="flex items-center gap-4">
              {/* Gmail Icon */}
              <a href="mailto:your.email@gmail.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-purple-400 transition-transform hover:scale-110">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
              </a>
              {/* YouTube Icon */}
              <a href="https://youtube.com/@yourchannel" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-purple-400 transition-transform hover:scale-110">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21.582 6.186a2.506 2.506 0 00-1.766-1.777C18.257 4 12 4 12 4s-6.257 0-7.816.409A2.506 2.506 0 002.418 6.186C2 7.747 2 12 2 12s0 4.253.418 5.814a2.506 2.506 0 001.766 1.777C5.743 20 12 20 12 20s6.257 0 7.816-.409a2.506 2.506 0 001.766-1.777C22 16.253 22 12 22 12s0-4.253-.418-5.814zM9.999 15.595v-7.19l6.549 3.595-6.549 3.595z"/></svg>
              </a>
              {/* Telegram Icon */}
              <a href="https://t.me/yourusername" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-purple-400 transition-transform hover:scale-110">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.888-.667 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
              {/* TikTok Icon */}
              <a href="https://tiktok.com/@yourusername" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-purple-400 transition-transform hover:scale-110">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 15.68a6.34 6.34 0 006.27 6.36 6.3 6.3 0 006.31-6.06V8.53a8.39 8.39 0 004.32 1.15V6.26a4.5 4.5 0 01-2.31-.57z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Moviewrld. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-gray-300">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}