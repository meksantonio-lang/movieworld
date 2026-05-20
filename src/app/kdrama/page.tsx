export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import MediaCard from "@/components/MediaCard";
import { MediaItemRow, TMDBTvShow } from "@/types/media";

type EnrichedItem = {
  id: number | string;
  title: string;
  poster_path: string;
  download_link?: string | null;
  release_date?: string;
};

const PAGE_SIZE = 24;

async function fetchKdramaRows(page = 1) {
  const offset = (page - 1) * PAGE_SIZE;
  const { data, error } = await supabase
    .from("media_items")
    .select("id,title,poster_path,poster_thumb,download_link,release_date,tmdb_id,created_at")
    .eq("category", "kdrama")
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error("Supabase error fetching kdrama:", error);
    return { rows: [], error };
  }
  return { rows: (data as MediaItemRow[]) ?? [], error: null };
}

async function enrichKdrama(rows: MediaItemRow[]) {
  return Promise.all(
    rows.map(async (r) => {
      const dbDownload = r.download_link ?? null;

      if (!r.tmdb_id || Number(r.tmdb_id) === 0) {
        return {
          id: r.id,
          title: r.title ?? `Untitled (${r.id})`,
          poster_path: r.poster_path ?? r.poster_thumb ?? "",
          download_link: dbDownload,
          release_date: r.release_date ?? "",
        } as EnrichedItem;
      }

      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${r.tmdb_id}?api_key=${process.env.TMDB_API_KEY}`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          console.warn(`TMDB tv fetch failed for id ${r.tmdb_id}:`, res.status);
          return {
            id: r.id,
            title: r.title ?? `Untitled (${r.id})`,
            poster_path: r.poster_path ?? r.poster_thumb ?? "",
            download_link: dbDownload,
            release_date: r.release_date ?? "",
          } as EnrichedItem;
        }

        const meta: TMDBTvShow = await res.json();
        return {
          id: r.id,
          // ✅ Supabase title wins, fallback to TMDB
          title: r.title ?? meta.name ?? `Untitled (${r.id})`,
          // ✅ Supabase poster wins, fallback to TMDB
          poster_path: r.poster_path ?? r.poster_thumb ?? meta.poster_path ?? "",
          download_link: dbDownload,
          release_date: r.release_date ?? meta.first_air_date ?? "",
        } as EnrichedItem;
      } catch (err) {
        console.error("TMDB fetch error:", err);
        return {
          id: r.id,
          title: r.title ?? `Untitled (${r.id})`,
          poster_path: r.poster_path ?? r.poster_thumb ?? "",
          download_link: dbDownload,
          release_date: r.release_date ?? "",
        } as EnrichedItem;
      }
    })
  );
}

export default async function KdramaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams;
  const page = Math.max(
    1,
    Number(Array.isArray(params?.page) ? params.page[0] : params.page ?? "1")
  );

  const { rows } = await fetchKdramaRows(page);
  const kdramas = await enrichKdrama(rows);

  const hasMore = (rows?.length ?? 0) === PAGE_SIZE;
  const nextPage = page + 1;
  const prevPage = Math.max(1, page - 1);

  return (
    <main className="px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-purple-700">All K‑Drama</h1>
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          ← Back to Home
        </Link>
      </div>

      {kdramas.length === 0 ? (
        <p className="text-sm text-gray-500">No K‑Drama found.</p>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {kdramas.map((m) => (
              <MediaCard
                key={String(m.id)}
                id={m.id}
                title={m.title ?? `Untitled (${m.id})`}
                category="kdrama"
                image={
                  m.poster_path && String(m.poster_path).trim() !== ""
                    ? String(m.poster_path).startsWith("http")
                      ? String(m.poster_path)
                      : `https://image.tmdb.org/t/p/w500${m.poster_path}`
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
                  href={`/kdrama?page=${prevPage}`}
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
                  href={`/kdrama?page=${nextPage}`}
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
