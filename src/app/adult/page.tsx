export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import MediaCard from "@/components/MediaCard";
import { MediaItemRow } from "@/types/media";

const PAGE_SIZE = 24;

async function fetchAdultRows(page = 1) {
  const offset = (page - 1) * PAGE_SIZE;
  const { data, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("category", "adult")
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error("Supabase error fetching adult:", error);
    return { rows: [], error };
  }
  return { rows: (data as MediaItemRow[]) ?? [], error: null };
}

function mapAdult(rows: MediaItemRow[]) {
  return rows.map((m) => ({
    id: m.id,
    title: m.title || "Adult Content",
    image: m.cover || "/placeholder.jpg",
    download_link: m.download_link ?? "",
    author: m.author ?? "",
    releaseYear: m.release_year ? String(m.release_year) : "",
  }));
}

export default async function AdultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>;
}) {
  const params = await searchParams; // ✅ await first

  const page = Math.max(
    1,
    Number(Array.isArray(params?.page) ? params.page[0] : params.page ?? "1")
  );

  const { rows } = await fetchAdultRows(page);
  const adultItems = mapAdult(rows);

  const hasMore = (rows?.length ?? 0) === PAGE_SIZE;
  const nextPage = page + 1;
  const prevPage = Math.max(1, page - 1);

  return (
    <section className="px-6 py-12 min-h-screen bg-red-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Adult</h2>
        <Link href="/" className="text-sm text-gray-200 hover:underline">
          ← Back to Home
        </Link>
      </div>

      {adultItems.length === 0 ? (
        <p className="text-sm text-gray-200">No adult content found.</p>
      ) : (
        <>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {adultItems.map((m) => (
              <MediaCard
                key={String(m.id)}
                id={m.id}
                title={m.title}
                category="adult"
                image={m.image}
                downloadLink={m.download_link}
                author={m.author}
                releaseYear={m.releaseYear}
              />
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div>
              {page > 1 && (
                <Link
                  href={`/adult?page=${prevPage}`}
                  className="inline-block px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                >
                  ← Previous
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-200">Page {page}</span>
              {hasMore ? (
                <Link
                  href={`/adult?page=${nextPage}`}
                  className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                >
                  Load more
                </Link>
              ) : (
                <span className="text-sm text-gray-200">End of results</span>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
