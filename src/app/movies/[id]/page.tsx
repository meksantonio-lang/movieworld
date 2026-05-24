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

  // Fetch only the fields needed for SEO and OG to keep it fast
  const { data: movie } = await supabase
    .from("media_items")
    .select("title, details, cover_url, poster_path")
    .eq("id", id)
    .eq("category", "movies")
    .single();

  if (!movie) {
    return {
      title: "Movie Not Found | MovieWrld",
    };
  }

  const movieTitle = movie.title ?? "Untitled Movie";
  const movieDesc = movie.details 
    ? movie.details.substring(0, 160) // Keep description under Google's 160 char limit
    : `Download and stream ${movieTitle} on MovieWrld.`;

  // Determine the best image to share, falling back to a default if none exist
  const ogImage = movie.cover_url || movie.poster_path || "https://moviewrld.com/favicon.ico";

  return {
    title: `${movieTitle} - Download & Stream | MovieWrld`,
    description: movieDesc,
    keywords: [
      `${movieTitle} download`,
      `download ${movieTitle}`,
      `${movieTitle} free download`,
      `${movieTitle} full movie download`,
      `${movieTitle} mp4 download`
    ],
    // ✅ NEW: Open Graph for WhatsApp, Discord, Facebook, etc.
    openGraph: {
      title: movieTitle,
      description: movieDesc,
      url: `https://moviewrld.com/movie/${id}`,
      siteName: "MovieWrld",
      images: [
        {
          url: ogImage,
          width: 800,
          height: 600,
          alt: `${movieTitle} Poster`,
        },
      ],
      type: "video.movie", 
    },
    // ✅ NEW: Twitter Specific Cards
    twitter: {
      card: "summary_large_image",
      title: movieTitle,
      description: movieDesc,
      images: [ogImage],
    },
  };
}

export default async function MovieDetail({ params }: Props) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  // Fetch the movie itself
  const { data: movie, error } = await supabase
    .from("media_items")
    .select("id, title, poster_path, genre, release_year, artist, author, download_link, details, cover_url")
    .eq("id", id)
    .eq("category", "movies")
    .single();

  if (error) {
    console.error("Supabase error:", error);
    return <div>Error loading movie</div>;
  }
  if (!movie) {
    return <div>No movie found for id {id}</div>;
  }

  // Fetch episodes linked to this movie/season
  const { data: episodes, error: episodesError } = await supabase
    .from("media_items")
    .select("id, episode_number, download_link")
    .eq("parent_id", id)
    .order("episode_number", { ascending: true });

  if (episodesError) {
    console.error("Supabase error fetching episodes:", episodesError);
  }

  // --- START OF SCHEMA GENERATION ---
  
  // 1. Clean the title
  // Removes " (YYYY) Movie Download" from titles like "Ron's Gone Wrong (2021) Movie Download"
  const cleanTitle = movie.title ? movie.title.replace(/\s\(\d{4}\).*$/, "") : "Untitled Movie";

  // 2. Format genres into an array
  const genreArray = movie.genre ? movie.genre.split(",") : [];

  // 3. Define the Base URL
  const baseUrl = "https://moviewrld.com"; 

  // 4. Construct the JSON-LD Object
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": cleanTitle,
    "image": movie.cover_url || movie.poster_path, 
    "description": movie.details || `Watch or download ${cleanTitle}.`,
    "dateCreated": movie.release_year ? `${movie.release_year}` : undefined,
    "genre": genreArray,
    "potentialAction": {
      "@type": "WatchAction",
      "target": `${baseUrl}/movie/${id}` 
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
        category="movies"
        title={movie.title ?? "Untitled"}
        poster_path={movie.poster_path}
        genre={movie.genre}
        release_year={movie.release_year}
        artist={movie.artist}
        author={movie.author}
        extra_details={movie.details}
        download_link={movie.download_link}
      />

      {episodes && episodes.length > 0 && (
        <>
          <h2 className="mt-8 text-xl font-semibold">Episodes</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {episodes.map((ep) => (
              <a
                key={ep.id}
                href={ep.download_link}
                className="border rounded p-4 hover:bg-gray-100 text-center"
              >
                Episode {ep.episode_number}
              </a>
            ))}
          </div>
        </>
      )}
    </main>
  );
}