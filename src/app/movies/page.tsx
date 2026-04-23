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

async function enrichMovies(rows: MediaItemRow[]) {
  return Promise.all(
    rows.map(async (r) => {
      const dbDownload = r.download_link ?? null;

      if (!r.tmdb_id || Number(r.tmdb_id) === 0) {
        return {
          title: r.title ?? `Movie ${r.id}`,
          poster_path: r.poster_path ?? "",
          id: r.id,
          download_link: dbDownload,
          release_date: r.release_date ?? "",
        } as EnrichedItem;
      }

      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/movie/${r.tmdb_id}?api_key=${process.env.TMDB_API_KEY}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          console.warn(`TMDB movie fetch failed for id ${r.tmdb_id}:`, res.status);
          return {
            title: `Movie ${r.tmdb_id}`,
            poster_path: "",
            id: r.id,
            download_link: dbDownload,
            release_date: "",
          } as EnrichedItem;
        }
        const meta: TMDBMovie = await res.json();
        return { ...meta, download_link: dbDownload, id: r.id } as EnrichedItem;
      } catch (err) {
        console.error("TMDB fetch error:", err);
        return {
          title: `Movie ${r.tmdb_id}`,
          poster_path: "",
          id: r.id,
          download_link: dbDownload,
          release_date: "",
        } as EnrichedItem;
      }
    })
  );
}

export default async function MoviesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  const params = await searchParams; // ✅ await first

  const page = Math.max(
    1,
    Number(Array.isArray(params?.page) ? params.page[0] : params.page ?? "1")
  );

  const { rows } = await fetchMovieRows(page);
  const movies = await enrichMovies(rows);

  const hasMore = (rows?.length ?? 0) === PAGE_SIZE;
  const nextPage = page + 1;
  const prevPage = Math.max(1, page - 1);

  return (
    <main className="px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-purple-700">All Movies</h1>
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          ← Back to Home
        </Link>
      </div>

      {movies.length === 0 ? (
        <p className="text-sm text-gray-500">No movies found.</p>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {movies.map((m) => (
              <MediaCard
                key={String(m.id)}
                id={m.id} // ✅ required prop
                title={m.title ?? `Untitled (${m.id})`}
                category="movies" // ✅ keep category consistent
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

          <div className="mt-8 flex items-center justify-between">
            <div>
              {page > 1 && (
                <Link
                  href={`/movies?page=${prevPage}`}
                  className="inline-block px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                >
                  ← Previous
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Page {page}</span>
              {hasMore ? (
                <Link
                  href={`/movies?page=${nextPage}`}
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                >
                  Load more
                </Link>
              ) : (
                <span className="text-sm text-gray-500">End of results</span>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
