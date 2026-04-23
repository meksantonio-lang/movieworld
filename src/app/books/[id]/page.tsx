// src/app/books/[id]/page.tsx
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default async function BookDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // ✅ await first
  const id = Number(resolvedParams.id); // ✅ cast to number for bigint column

  const { data: book, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("id", id) // ✅ safe numeric comparison
    .eq("category", "books")
    .single();

  if (error || !book) return <div>Error loading book</div>;

  return (
    <section className="px-6 py-12">
      <Link
        href="/books"
        className="text-purple-600 underline mb-4 inline-block"
      >
        ← Back to Books
      </Link>

      <h2 className="text-2xl font-bold mb-6 text-purple-500">{book.title}</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {book.cover && (
          <img
            src={book.cover}
            alt={book.title}
            className="w-64 h-auto rounded shadow"
          />
        )}

        <div>
          <p className="text-lg">Author: {book.author}</p>
          <p className="text-lg">Year: {book.release_year}</p>
          <p className="text-lg">Genre: {book.genre}</p>

          {/* Render metadata from details JSON if present */}
          {book.details?.publisher && (
            <p className="mt-2 text-gray-700">
              Publisher: {book.details.publisher}
            </p>
          )}
          {book.details?.publish_year && (
            <p className="mt-2 text-gray-700">
              Published: {book.details.publish_year}
            </p>
          )}
          {book.details?.overview && (
            <p className="mt-2 text-gray-700">{book.details.overview}</p>
          )}

          {book.download_link && (
            <a
              href={book.download_link}
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
