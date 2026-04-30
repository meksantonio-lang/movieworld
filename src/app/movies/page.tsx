// src/app/movies/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import MediaCard from "@/components/MediaCard";
import { MediaItemRow, TMDBMovie } from "@/types/media";

type EnrichedItem = TMDBMovie & {
  download_link?: string | null;
  id: number | string;
};

const PAGE_SIZE = 24;

async function fetchMovieRows(page = 1) {
  const offset = (page - 1) * PAGE_SIZE;
  const { data, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("category", "movies")
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error("Supabase error fetching movies:", error);
    return { rows: [], error };
  }
  return { rows: (data as MediaItemRow[]) ?? [], error: null };
}

export default async function MoviesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  const params = await searchParams; // ✅ await first

  const page = Math.max(
    1,
    Number(Array.isArray(params?.page) ? params.page[0] : params.page ?? "1")
  );

  const { rows } = await fetchMovieRows(page);

  return (
    <main className="px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-purple-700">All Movies</h1>
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          ← Back to Home
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">No movies found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {rows.map((m) => (
            <MediaCard
              key={String(m.id)}
              id={m.id}
              title={m.title ?? `Untitled (${m.id})`}
              category="movies"
              image={
                m.poster_path
                  ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
                  : "/placeholder-poster.png"
              }
              downloadLink={m.download_link ?? ""}
              releaseYear={m.release_date ? m.release_date.slice(0, 4) : ""}
            />
          ))}
        </div>
      )}
    </main>
  );
}
