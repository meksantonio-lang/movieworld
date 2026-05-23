import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import MediaDetailCard from "@/components/MediaDetailCard";

type Props = {
  params: Promise<{ id: string }>;
};

// ✅ Generates SEO Metadata for Google Search
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  // Fetch only the fields needed for SEO
  const { data: book } = await supabase
    .from("media_items")
    .select("title, author, details")
    .eq("id", id)
    .eq("category", "books")
    .single();

  if (!book) {
    return {
      title: "Book Not Found | MovieWrld",
    };
  }

  const bookTitle = book.title ?? "Untitled Book";
  const authorString = book.author ? ` by ${book.author}` : "";

  return {
    title: `${bookTitle}${authorString} - Download PDF & EPUB | MovieWrld`,
    description: book.details 
      ? book.details.substring(0, 160) // Keep description under Google's 160 char limit
      : `Download and read ${bookTitle}${authorString} on MovieWrld.`,
    keywords: [
      `${bookTitle} pdf download`,
      `download ${bookTitle} ebook`,
      `${bookTitle} epub free download`,
      `${bookTitle}${authorString} download`,
      `read ${bookTitle} online free`
    ],
  };
}

export default async function BookDetail({ params }: Props) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  // Fetch the book itself
  const { data: book, error } = await supabase
    .from("media_items")
    .select("id, title, poster_path, genre, release_year, author, artist, download_link, details")
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
    .select("id, episode_number, download_link")
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
        poster_path={book.poster_path}
        genre={book.genre}
        release_year={book.release_year}
        author={book.author}
        artist={book.artist}
        // ✅ new plain-text details field
        extra_details={book.details}
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