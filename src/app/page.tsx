export const dynamic = "force-dynamic";

import { supabase } from "@/lib/supabaseClient";
import MediaCard from "@/components/MediaCard";
import { MediaItemRow, TMDBMovie } from "@/types/media";
import Link from "next/link";

type EnrichedItem = TMDBMovie & {
  download_link?: string | null;
  id?: number | string;
  imdb_id?: string | null;
  poster_thumb?: string | null;
  category?: string;
};

async function fetchCategoryRows(category: string, limit = 8) {
  const { data, error } = await supabase
    .from("media_items")
    .select(
      "id,title,tmdb_id,poster_path,poster_thumb,download_link,release_date,category,created_at"
    )
    .eq("category", category)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`Supabase error fetching ${category}:`, error);
    return [];
  }
  return (data as MediaItemRow[]) ?? [];
}

async function enrichRowsWithTMDB(rows: MediaItemRow[], mediaKind: "movie" | "tv") {
  return Promise.all(
    rows.map(async (r) => {
      const dbDownload = r.download_link ?? null;

      if (!r.tmdb_id) {
        return {
          id: r.id,
          category: r.category,
          download_link: dbDownload,
          release_date: r.release_date ?? "",
          title: r.title ?? `Untitled (${r.id})`,
          poster_path: r.poster_path ?? "",
          poster_thumb: r.poster_thumb ?? null,
        } as EnrichedItem;
      }

      const endpoint =
        mediaKind === "movie"
          ? `https://api.themoviedb.org/3/movie/${r.tmdb_id}`
          : `https://api.themoviedb.org/3/tv/${r.tmdb_id}`;

      try {
        const res = await fetch(`${endpoint}?api_key=${process.env.TMDB_API_KEY}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          return {
            id: r.id,
            category: r.category,
            download_link: dbDownload,
            release_date: r.release_date ?? "",
            title: r.title ?? `Untitled (${r.id})`,
            poster_path: r.poster_path ?? "",
            poster_thumb: r.poster_thumb ?? null,
          } as EnrichedItem;
        }

        const meta: TMDBMovie = await res.json();
        return {
          id: r.id,
          category: r.category,
          download_link: dbDownload,
          release_date: r.release_date ?? meta.release_date ?? "",
          // ✅ Supabase title wins, fallback to TMDB
          title: r.title ?? meta.title ?? `Untitled (${r.id})`,
          // ✅ Supabase poster wins, fallback to TMDB
          poster_path: r.poster_path ?? meta.poster_path ?? "",
          poster_thumb: r.poster_thumb ?? null,
        } as EnrichedItem;
      } catch {
        return {
          id: r.id,
          category: r.category,
          download_link: dbDownload,
          release_date: r.release_date ?? "",
          title: r.title ?? `Untitled (${r.id})`,
          poster_path: r.poster_path ?? "",
          poster_thumb: r.poster_thumb ?? null,
        } as EnrichedItem;
      }
    })
  );
}

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
  const [movieRows, musicRows, animeRows, kdramaRows] = await Promise.all([
    fetchCategoryRows("movies", 8),
    fetchCategoryRows("music", 8),
    fetchCategoryRows("anime", 8),
    fetchCategoryRows("kdrama", 8),
  ]);

  const [movies, anime, kdrama] = await Promise.all([
    enrichRowsWithTMDB(movieRows, "movie"),
    enrichRowsWithTMDB(animeRows, "tv"),
    enrichRowsWithTMDB(kdramaRows, "tv"),
  ]);

  const songs = (musicRows || []).map((s) => ({
    id: s.id,
    category: s.category,
    download_link: s.download_link ?? "",
    release_date: s.release_date ?? "",
    title: s.title ?? `Untitled (${s.id})`,
    poster_path: s.poster_path ?? "",
    poster_thumb: s.poster_thumb ?? null,
  })) as EnrichedItem[];

  const section = (title: string, category: string, items: EnrichedItem[]) => (
    <section className="mb-12">
      <SectionHeader title={title} category={category} />
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No items yet.</p>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
          {items.map((m) => {
            const key = String(m.id);
            
            // ✅ Clean up the title for display on the main page cards
            // This takes everything before the first "(" and trims extra space
            const displayTitle = m.title 
              ? m.title.split("(")[0].trim() 
              : `Untitled (${m.id})`;
              
            const year = m.release_date ? String(m.release_date).slice(0, 4) : "";

            const image =
              m.poster_path && String(m.poster_path).trim() !== ""
                ? String(m.poster_path).startsWith("http")
                  ? String(m.poster_path)
                  : `https://image.tmdb.org/t/p/w500${m.poster_path}`
                : m.poster_thumb && String(m.poster_thumb).trim() !== ""
                ? String(m.poster_thumb)
                : "/placeholder-poster.png";

            return (
              <MediaCard
                key={key}
                id={m.id}
                title={displayTitle} // ✅ Pass the cleaned title to the component
                category={m.category ?? ""}
                image={image}
                downloadLink={m.download_link ?? ""}
                releaseYear={year}
              />
            );
          })}
        </div>
      )}
    </section>
  );

  return (
    <main className="px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">New on Moviewrld</h1>

      {section("New Movies", "movies", movies)}
      {section("Trending Music", "music", songs)}
      {section("Anime", "anime", anime)}
      {section("Kdrama", "kdrama", kdrama)}
    </main>
  );
}