// src/app/page.tsx
export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabaseClient";
import MediaCard from "@/components/MediaCard";
import { MediaItemRow, TMDBMovie } from "@/types/media";
import Link from "next/link"; // added for SectionHeader links

type EnrichedItem = TMDBMovie & {
  download_link?: string | null;
  id?: number | string;
  imdb_id?: string | null;
};

async function fetchCategoryRows(category: string, limit = 8) {
  const { data, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`Supabase error fetching ${category}:`, error);
    return [];
  }
  return (data as MediaItemRow[]) ?? [];
}

/**
 * Enrich rows using TMDB.
 * mediaKind: "movie" | "tv"
 */
async function enrichRowsWithTMDB(rows: MediaItemRow[], mediaKind: "movie" | "tv") {
  return Promise.all(
    rows.map(async (r) => {
      const dbDownload = r.download_link ?? null;

      // If no tmdb_id, return a minimal fallback object
      if (!r.tmdb_id) {
        return {
          title: (r as any).title ?? `Item ${r.id}`,
          poster_path: (r as any).poster_path ?? "",
          id: r.id,
          download_link: dbDownload,
          release_date: (r as any).release_date ?? "",
        } as EnrichedItem;
      }

      const endpoint =
        mediaKind === "movie"
          ? `https://api.themoviedb.org/3/movie/${r.tmdb_id}`
          : `https://api.themoviedb.org/3/tv/${r.tmdb_id}`;

      try {
        const res = await fetch(`${endpoint}?api_key=${process.env.TMDB_API_KEY}`, { cache: "no-store" });
        if (!res.ok) {
          console.warn(`TMDB ${mediaKind} fetch failed for id ${r.tmdb_id}:`, res.status);
          return {
            title: `${mediaKind === "movie" ? "Movie" : "Show"} ${r.tmdb_id}`,
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
          title: `${mediaKind === "movie" ? "Movie" : "Show"} ${r.tmdb_id}`,
          poster_path: "",
          id: r.id,
          download_link: dbDownload,
          release_date: "",
        } as EnrichedItem;
      }
    })
  );
}

// NEW: SectionHeader helper
function SectionHeader({ title, category }: { title: string; category: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold text-purple-600">{title}</h3>
      <Link
        href={`/${category}`}
        className="text-sm text-purple-600 hover:underline"
        aria-label={`See all ${title}`}
      >
        See all →
      </Link>
    </div>
  );
}

export default async function HomePage() {
  // fetch rows in parallel
  const [movieRows, songRows, animeRows, kdramaRows] = await Promise.all([
    fetchCategoryRows("movies", 8),
    fetchCategoryRows("songs", 8),
    fetchCategoryRows("anime", 8),
    fetchCategoryRows("kdrama", 8),
  ]);

  // Enrich: movies -> movie endpoint; anime/kdrama -> tv endpoint
  const [movies, anime, kdrama] = await Promise.all([
    enrichRowsWithTMDB(movieRows, "movie"),
    enrichRowsWithTMDB(animeRows, "tv"),
    enrichRowsWithTMDB(kdramaRows, "tv"),
  ]);

  // Songs: use DB fields directly (manual metadata)
  const songs = (songRows || []).map((s) => ({
    title: (s as any).title ?? `Song ${s.id}`,
    poster_path: (s as any).poster_path ?? "",
    id: s.id,
    download_link: s.download_link ?? "",
    release_date: (s as any).release_date ?? "",
  })) as EnrichedItem[];

  // UPDATED: section helper now uses SectionHeader
  const section = (title: string, category: string, items: EnrichedItem[]) => (
    <section className="mb-12">
      <SectionHeader title={title} category={category} />
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No items yet.</p>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {items.map((m) => {
            const key = m.id ?? m.imdb_id ?? m.title ?? Math.random().toString(36).slice(2, 9);
            const titleText = m.title ?? `Untitled (${m.id ?? "?"})`;
            const year = m.release_date ? String(m.release_date).slice(0, 4) : "";
            const image = m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "/placeholder-poster.png";
            return (
              <MediaCard
                key={key}
                title={titleText}
                category={year}
                image={image}
                downloadLink={m.download_link ?? ""}
              />
            );
          })}
        </div>
      )}
    </section>
  );

  return (
    <main className="px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">New on Movieworld</h1>

      {section("New Movies", "movies", movies)}
      {section("Trending Songs", "music", songs)}
      {section("Anime", "anime", anime)}
      {section("Kdrama", "kdrama", kdrama)}
    </main>
  );
}
