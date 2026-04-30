export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import MediaCard from "@/components/MediaCard";
import { MediaItemRow } from "@/types/media";

type EnrichedBook = {
  id: number | string;
  title: string;
  poster_path: string;
  release_date: string;
  download_link: string;
  author?: string | null;
};

const PAGE_SIZE = 24;

async function fetchBookRows(page = 1) {
  const offset = (page - 1) * PAGE_SIZE;
  const { data, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("category", "books")
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error("Supabase error fetching books:", error);
    return { rows: [], error };
  }
  return { rows: (data as MediaItemRow[]) ?? [], error: null };
}

function mapBooks(rows: MediaItemRow[]): EnrichedBook[] {
  return rows.map((r) => ({
    id: r.id,
    title: r.title ?? `Book ${r.id}`,
    poster_path: r.poster_path ?? "/placeholder-poster.png",
    release_date: r.release_date ?? "",
    download_link: r.download_link ?? "",
    author: r.author ?? r.details?.author ?? null,
  }));
}

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams; // ✅ await first

  const page = Math.max(
    1,
    Number(Array.isArray(params?.page) ? params.page[0] : params.page ?? "1")
  );

  const { rows } = await fetchBookRows(page);
  const books = mapBooks(rows);

  const hasMore = (rows?.length ?? 0) === PAGE_SIZE;
  const nextPage = page + 1;
  const prevPage = Math.max(1, page - 1);

  return (
    <main className="px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-purple-700">All Books</h1>
        <Link href="/" className="text-sm text-gray-600 hover:underline">
          ← Back to Home
        </Link>
      </div>

      {books.length === 0 ? (
        <p className="text-sm text-gray-500">No books found.</p>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {books.map((b) => (
              <MediaCard
                key={String(b.id)}
                id={b.id}
                title={b.title}
                category="books"
                image={b.poster_path}
                downloadLink={b.download_link}
                author={b.author ?? ""}
                releaseYear={b.release_date ? b.release_date.slice(0, 4) : ""}
              />
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div>
              {page > 1 && (
                <Link
                  href={`/books?page=${prevPage}`}
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
                  href={`/books?page=${nextPage}`}
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
