// src/app/movies/[id]/page.tsx
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default async function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // ✅ await first
  const id = Number(resolvedParams.id); // ✅ cast to number for bigint column

  const { data: movie, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("id", id) // ✅ safe numeric comparison
    .eq("category", "movies")
    .single();

  if (error || !movie) return <div>Error loading movie</div>;

  return (
    <section className="px-6 py-12">
      <Link
        href="/movies"
        className="text-purple-600 underline mb-4 inline-block"
      >
        ← Back to Movies
      </Link>

      <h2 className="text-2xl font-bold mb-6 text-purple-500">{movie.title}</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {movie.cover && (
          <img
            src={movie.cover}
            alt={movie.title}
            className="w-64 h-auto rounded shadow"
          />
        )}

        <div>
          <p className="text-lg">Genre: {movie.genre}</p>
          <p className="text-lg">Year: {movie.release_year}</p>

          {/* Render metadata from details JSON if present */}
          {movie.details?.overview && (
            <p className="mt-2 text-gray-700">{movie.details.overview}</p>
          )}
          {movie.details?.runtime && (
            <p className="mt-2 text-gray-700">
              Runtime: {movie.details.runtime} mins
            </p>
          )}
          {movie.details?.artist && (
            <p className="mt-2 text-gray-700">Artist: {movie.details.artist}</p>
          )}
          {movie.details?.author && (
            <p className="mt-2 text-gray-700">Author: {movie.details.author}</p>
          )}

          {movie.download_link && (
            <a
              href={movie.download_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded"
            >
              Download
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
