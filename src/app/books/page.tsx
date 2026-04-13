// src/app/books/page.tsx
import { supabase } from "@/lib/supabaseClient";
import MediaCard from "@/components/MediaCard";
import { MediaItemRow } from "@/types/media";

export default async function BooksPage() {
  const { data: books, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("category", "books");

  if (error || !books) {
    console.error(error);
    return <div>Error loading books</div>;
  }

  // Books metadata may come from OpenLibrary later; for now, just show download links
  const enriched = (books as MediaItemRow[]).map((m) => ({
    id: m.id,
    title: "Book",
    poster_path: "/book-placeholder.jpg",
    release_date: null,
    download_link: m.download_link,
  }));

  return (
    <section className="px-6 py-12">
      <h2 className="text-2xl font-bold mb-6 text-purple-500">Books</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {enriched.map((m) => (
          <MediaCard
            key={m.id}
            title={m.title}
            category="Book"
            image={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
            downloadLink={m.download_link}
          />
        ))}
      </div>
    </section>
  );
}
