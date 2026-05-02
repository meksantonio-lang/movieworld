// src/app/books/[id]/page.tsx
import { supabase } from "@/lib/supabaseClient";
import MediaDetailCard from "@/components/MediaDetailCard";

export default async function BookDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // ✅ await first
  const id = Number(resolvedParams.id);

  // Fetch the book itself
  const { data: book, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("id", id)
    .eq("category", "books")
    .single();

  if (error) {
    console.error("Supabase error:", error);
    return <div>Error loading book</div>;
  }
  if (!book) {
    return <div>No book found for id {id}</div>;
  }

  // Fetch chapters linked to this book
  const { data: chapters, error: chaptersError } = await supabase
    .from("media_items")
    .select("*")
    .eq("parent_id", id)
    .order("episode_number", { ascending: true }); // reuse episode_number as chapter_number

  if (chaptersError) {
    console.error("Supabase error fetching chapters:", chaptersError);
  }

  return (
    <main className="px-6 py-10">
      <MediaDetailCard
        category="books"
        title={book.title ?? "Untitled"}
        cover={book.cover}
        poster_path={book.poster_path}
        genre={book.genre}
        release_year={book.release_year}
        author={book.author ?? book.details?.author}
        publisher={book.details?.publisher}
        overview={book.details?.overview}
        download_link={book.download_link}
      />

      {chapters && chapters.length > 0 && (
        <>
          <h2 className="mt-8 text-xl font-semibold">Chapters</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {chapters.map((ch) => (
              <a
                key={ch.id}
                href={ch.download_link}
                className="border rounded p-4 hover:bg-gray-100 text-center"
              >
                Chapter {ch.episode_number}
              </a>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
