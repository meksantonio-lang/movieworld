// src/app/music/page.tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import MediaCard from "@/components/MediaCard";
import { MediaItemRow } from "@/types/media";

type EnrichedSong = {
  id?: number | string;
  title?: string;
  poster_path?: string;
  release_date?: string;
  download_link?: string | null;
};

const PAGE_SIZE = 24;

async function fetchMusicRows(page = 1) {
  const offset = (page - 1) * PAGE_SIZE;
  const { data, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("category", "songs") // category is 'songs' in your DB
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error("Supabase error fetching music:", error);
    return { rows: [], error };
  }
  return { rows: (data as MediaItemRow[]) ?? [], error: null };
}

function mapMusic(rows: MediaItemRow[]): EnrichedSong[] {
  return rows.map((r) => ({
    id: r.id,
    title: r.title ?? `Song ${r.id}`,
    poster_path: r.poster_path ?? "",
    release_date: r.release_date ?? "",
    download_link: r.download_link ?? "",
  }));
}

export default async function MusicPage({ searchParams }: { searchParams?: { page?: string } }) {
  const page = Math.max(1, Number(searchParams?.page ?? "1"));
  const { rows } = await fetchMusicRows(page);
  const songs = mapMusic(rows);

  const hasMore = (rows?.length ?? 0) === PAGE_SIZE;
  const nextPage = page + 1;
  const prevPage = Math.max(1, page - 1);

  return (
    <main className="px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-purple-700">All Music</h1>
        <Link href="/" className="text-sm text-gray-600 hover:underline">← Back to Home</Link>
      </div>

      {songs.length === 0 ? (
        <p className="text-sm text-gray-500">No songs found.</p>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {songs.map((s) => {
              const key = s.id ?? Math.random().toString(36).slice(2, 9);
              const title = s.title ?? `Untitled (${s.id ?? "?"})`;
              const year = s.release_date ? String(s.release_date).slice(0, 4) : "";
              const image = s.poster_path ? s.poster_path : "/placeholder-poster.png";

              return (
                <MediaCard
                  key={key}
                  title={title}
                  category={year}
                  image={image}
                  downloadLink={s.download_link ?? ""}
                />
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div>
              {page > 1 && (
                <Link
                  href={`/music?page=${prevPage}`}
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
                  href={`/music?page=${nextPage}`}
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
