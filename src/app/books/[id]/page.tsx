import { supabase } from "@/lib/supabaseClient";
import MediaDetailCard from "@/components/MediaDetailCard";

export default async function BookDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // ✅ await first
  const id = Number(resolvedParams.id);

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

  return (
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
  );
}
