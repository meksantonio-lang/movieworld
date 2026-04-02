"use client";

import Link from "next/link";
import { useFavorites } from "@/context/FavoritesContext";
import { Trash2, Film, Book, Music, ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default function FavoritesPage() {
  const { favorites, toggleFavorite } = useFavorites();

  // Grouping favorites by type for a cleaner layout
  const movies = favorites.filter((fav) => fav.type === "movie");
  const books = favorites.filter((fav) => fav.type === "book");
  const music = favorites.filter((fav) => fav.type === "music");

  if (favorites.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 border border-zinc-800">
          <Film className="text-zinc-700" size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-2">Your library is empty</h1>
        <p className="text-zinc-500 max-w-sm mb-8">
          Items you heart will appear here so you can download them later.
        </p>
        <Link 
          href="/" 
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all"
        >
          Explore Media
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">My Library</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
            {favorites.length} Saved Items
          </p>
        </header>

        <div className="space-y-16">
          {/* MOVIES SECTION */}
          {movies.length > 0 && (
            <section>
              <h2 className="flex items-center gap-3 text-xl font-bold mb-6 text-purple-500 uppercase tracking-tight">
                <Film size={20} /> Saved Movies
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {movies.map((item) => (
                  <FavoriteCard key={`${item.type}-${item.id}`} item={item} onRemove={toggleFavorite} />
                ))}
              </div>
            </section>
          )}

          {/* BOOKS SECTION */}
          {books.length > 0 && (
            <section>
              <h2 className="flex items-center gap-3 text-xl font-bold mb-6 text-blue-500 uppercase tracking-tight">
                <Book size={20} /> Saved Books
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {books.map((item) => (
                  <FavoriteCard key={`${item.type}-${item.id}`} item={item} onRemove={toggleFavorite} />
                ))}
              </div>
            </section>
          )}

          {/* MUSIC SECTION */}
          {music.length > 0 && (
            <section>
              <h2 className="flex items-center gap-3 text-xl font-bold mb-6 text-rose-500 uppercase tracking-tight">
                <Music size={20} /> Saved Music
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {music.map((item) => (
                  <FavoriteCard key={`${item.type}-${item.id}`} item={item} onRemove={toggleFavorite} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-component for the cards to keep code clean
function FavoriteCard({ item, onRemove }: { item: any; onRemove: (item: any) => void }) {
  return (
    <div className="group relative">
      <Link href={item.link}>
        <div
          className={`relative rounded-2xl overflow-hidden border border-zinc-800 group-hover:border-purple-500 transition-all duration-500 shadow-lg bg-zinc-900 ${
            item.type === 'music' ? 'aspect-square' : 'aspect-[2/3]'
          }`}
        >
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
            <span className="text-white font-bold text-sm flex items-center gap-2">
              View <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </Link>
      
      <div className="mt-4 flex justify-between items-start gap-2">
        <div>
          <h3 className="font-bold text-sm md:text-base truncate max-w-[120px] md:max-w-[150px]">{item.title}</h3>
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">{item.type}</p>
        </div>
        <button 
          onClick={() => onRemove(item)}
          className="p-2 text-zinc-600 hover:text-rose-500 transition-colors"
          title="Remove from favorites"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}