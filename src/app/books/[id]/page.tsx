import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import MediaDetailCard from "@/components/MediaDetailCard";

type Props = {
  params: Promise<{ id: string }>;
};

// ✅ Generates SEO Metadata for Google Search & Social Media (OG)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  // Fetch only the fields needed for SEO and OG
  const { data: book } = await supabase
    .from("media_items")
    .select("title, author, details, cover_url, poster_path")
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
  const fullTitle = `${bookTitle}${authorString}`;

  const bookDesc = book.details 
    ? book.details.substring(0, 160) // Keep description under Google's 160 char limit
    : `Download and read ${fullTitle} on MovieWrld.`;

  // Determine the best image to share, falling back to a default if none exist
  const ogImage = book.cover_url || book.poster_path || "https://moviewrld.com/favicon.ico";

  return {
    title: `${fullTitle} - Download PDF & EPUB | MovieWrld`,
    description: bookDesc,
    keywords: [
      `${bookTitle} pdf download`,
      `download ${bookTitle} ebook`,
      `${bookTitle} epub free download`,
      `${fullTitle} download`,
      `read ${bookTitle} online free`
    ],
    // ✅ NEW: Open Graph for WhatsApp, Discord, Facebook, etc.
    openGraph: {
      title: fullTitle,
      description: bookDesc,
      url: `https://moviewrld.com/books/${id}`,
      siteName: "MovieWrld",
      images: [
        {
          url: ogImage,
          width: 800,
          height: 1200, // Portrait ratio works best for book covers
          alt: `${fullTitle} Cover`,
        },
      ],
      type: "book", 
    },
    // ✅ NEW: Twitter Specific Cards
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: bookDesc,
      images: [ogImage],
    },
  };
}

export default async function BookDetail({ params }: Props) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  // Fetch the book itself
  // ✅ Added cover_url to the select query
  const { data: book, error } = await supabase
    .from("media_items")
    .select("id, title, poster_path, genre, release_year, author, artist, download_link, details, cover_url")
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

  // --- START OF SCHEMA GENERATION ---
  
  const cleanTitle = book.title ?? "Untitled Book";
  // Convert standard genres or default to "eBook"
  const genreArray = book.genre ? book.genre.split(",") : ["eBook"];
  const baseUrl = "https://moviewrld.com"; 

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": cleanTitle,
    "image": book.cover_url || book.poster_path, 
    "description": book.details || `Download and read ${cleanTitle}${book.author ? ` by ${book.author}` : ''}.`,
    "datePublished": book.release_year ? `${book.release_year}` : undefined,
    "genre": genreArray,
    "author": book.author ? {
      "@type": "Person",
      "name": book.author
    } : undefined,
    "potentialAction": {
      "@type": "ReadAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${baseUrl}/books/${id}`, // ✅ Points directly to this page
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      }
    }
  };
  // --- END OF SCHEMA GENERATION ---

  return (
    <main className="px-6 py-10">
      {/* INJECT SCHEMA HERE */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MediaDetailCard
        category="books"
        title={book.title ?? "Untitled"}
        poster_path={book.poster_path}
        genre={book.genre}
        release_year={book.release_year}
        author={book.author}
        artist={book.artist}
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