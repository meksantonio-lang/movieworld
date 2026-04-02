"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Heart, Music2, Disc } from "lucide-react";
import { useFavorites } from "@/context/FavoritesContext";

type Track = {
  id: number;
  title: string;
  artist: string;
  category: string;
  image: string;
  fileUrl: string; 
};

interface MusicDetailClientProps {
  track: Track;
}

export default function MusicDetailClient({ track }: MusicDetailClientProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [isDownloading, setIsDownloading] = useState(false);

  const favoriteStatus = isFavorite(track.id, "music");

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = track.fileUrl;
      link.setAttribute("download", `${track.title} - ${track.artist}_MediaHub.mp3`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsDownloading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="p-8 max-w-7xl mx-auto">
        <Link href="/music" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors w-fit">
          <ArrowLeft size={20} />
          <span className="font-bold uppercase text-xs tracking-widest">Library</span>
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-8 py-10 flex flex-col items-center text-center">
        {/* Album Art with Disc Effect */}
        <div className="relative group mb-12">
          <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(147,51,234,0.15)] border border-white/10 relative z-10 bg-zinc-900">
            <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
          </div>
          <Disc className="absolute -right-16 top-1/2 -translate-y-1/2 text-zinc-800/50 w-48 h-48 -z-0 group-hover:rotate-180 transition-transform duration-[3s] ease-in-out hidden md:block" />
        </div>

        <span className="text-purple-500 font-bold tracking-[0.4em] text-xs uppercase mb-4">{track.category}</span>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-2 leading-none">{track.title}</h1>
        <p className="text-2xl md:text-3xl text-zinc-400 font-medium mb-10">{track.artist}</p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-3 bg-white text-black font-black py-5 px-12 rounded-full hover:bg-purple-600 hover:text-white transition-all active:scale-95 shadow-xl disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <div className="w-5 h-5 border-2 border-zinc-400 border-t-black rounded-full animate-spin" />
                Processing MP3...
              </>
            ) : (
              <>
                <Download size={20} strokeWidth={3} /> 
                Download 320kbps
              </>
            )}
          </button>

          <button 
            onClick={() => toggleFavorite({ 
              id: track.id, 
              title: track.title, 
              type: "music", 
              link: `/music/${track.id}`, 
              image: track.image 
            })}
            className={`p-5 rounded-full border transition-all active:scale-90 ${
              favoriteStatus 
              ? "bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-900/20" 
              : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-rose-500"
            }`}
          >
            <Heart fill={favoriteStatus ? "white" : "none"} size={24} />
          </button>
        </div>

        {/* Dynamic Player UI */}
        <div className="mt-16 w-full max-w-md bg-zinc-900/30 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-6">
            <Music2 className="text-purple-500" size={20} />
            <div className="h-1.5 bg-zinc-800 flex-1 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 w-1/3 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
            </div>
            <span className="text-[10px] text-zinc-500 font-bold tabular-nums">0:45 / 3:20</span>
          </div>
          <div className="flex justify-center items-center gap-1">
            <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Mastered Audio</span>
            <span className="w-1 h-1 bg-zinc-700 rounded-full mx-2"></span>
            <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest italic">MediaHub Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
}