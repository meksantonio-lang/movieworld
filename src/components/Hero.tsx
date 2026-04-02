"use client";
import Link from "next/link";
import { Music, Film, BookOpen } from "lucide-react";

export default function Hero() {
  return (
    <section className="h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white flex flex-col items-center justify-center gap-8">
      
      <h1 className="text-4xl md:text-6xl font-bold text-center">
        Welcome to <span className="text-purple-500">MovieWorld</span>
      </h1>

      <p className="text-gray-400 text-center max-w-xl">
        Download music, movies, and books — all in one place.
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <Link
        href='/music'
         className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 transition px-6 py-3 rounded-full">
          <Music size={20} />
          Music
        </Link>

        <Link href='/movies' className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition px-6 py-3 rounded-full">
          <Film size={20} />
          Movies
        </Link>

        <Link href='/books' className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition px-6 py-3 rounded-full">
          <BookOpen size={20} />
          Books
        </Link>
      </div>
    </section>
  );
}