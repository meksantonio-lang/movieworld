"use client";

import { useFavorites } from "@/context/FavoritesContext";
import { User, Settings, Award, Clock } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { favorites } = useFavorites();

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Profile Header */}
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 flex flex-col md:flex-row items-center gap-8 mb-8">
          <div className="w-32 h-32 bg-purple-600 rounded-full flex items-center justify-center text-4xl font-bold shadow-[0_0_30px_rgba(147,51,234,0.3)]">
            A
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">Antonio Ebubechukwu</h1>
            <p className="text-zinc-500 mb-4">Premium Member • Joined Feb 2026</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="bg-zinc-800 px-3 py-1 rounded-full text-xs border border-zinc-700 flex items-center gap-1">
                <Award size={12} className="text-purple-500" /> AI Prompting Certified
              </span>
              <span className="bg-zinc-800 px-3 py-1 rounded-full text-xs border border-zinc-700 flex items-center gap-1">
                <Award size={12} className="text-purple-500" /> Entrepreneurship
              </span>
            </div>
          </div>
          <button className="p-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 transition">
            <Settings size={20} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
            <p className="text-zinc-500 text-sm uppercase">Saved Items</p>
            <p className="text-3xl font-bold mt-1">{favorites.length}</p>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
            <p className="text-zinc-500 text-sm uppercase">Downloads</p>
            <p className="text-3xl font-bold mt-1">12</p>
          </div>
          <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
            <p className="text-zinc-500 text-sm uppercase">Points</p>
            <p className="text-3xl font-bold mt-1 text-purple-500">450</p>
          </div>
        </div>

        {/* Recent Activity Section */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock size={20} className="text-purple-500" /> Recent Downloads
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
              <div>
                <p className="font-semibold text-white">Movie Title {i}</p>
                <p className="text-xs text-zinc-500">Downloaded on Feb 1, 2026</p>
              </div>
              <Link href="#" className="text-purple-500 text-sm font-medium hover:underline">
                Re-download
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}