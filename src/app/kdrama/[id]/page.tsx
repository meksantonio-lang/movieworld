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
  const { data: kdrama } = await supabase
    .from("media_items")
    .select("title, details, cover_url, poster_path")
    .eq("id", id)
    .eq("category", "kdrama")
    .single();

  if (!kdrama) {
    return {
      title: "K-Drama Not Found | MovieWrld",
    };
  }

  const kdramaTitle = kdrama.title ?? "Untitled K-Drama";
  const kdramaDesc = kdrama.details 
    ? kdrama.details.substring(0, 160) // Keep description under Google's 160 char limit
    : `Download and stream ${kdramaTitle} K-Drama episodes on MovieWrld.`;

  // Determine the best image to share, falling back to a default if none exist
  const ogImage = kdrama.cover_url || kdrama.poster_path || "https://moviewrld.com/favicon.ico";

  return {
    title: `${kdramaTitle} K-Drama - Download & Stream | MovieWrld`,
    description: kdramaDesc,
    keywords: [
      `${kdramaTitle} kdrama download`,
      `download ${kdramaTitle} episodes`,
      `${kdramaTitle} korean drama free download`,
      `${kdramaTitle} eng sub download`,
      `${kdramaTitle} full season download`
    ],
    // ✅ NEW: Open Graph for WhatsApp, Discord, Facebook, etc.
    openGraph: {
      title: kdramaTitle,
      description: kdramaDesc,
      url: `https://moviewrld.com/kdrama/${id}`,
      siteName: "MovieWrld",
      images: [
        {
          url: ogImage,
          width: 800,
          height: 600,
          alt: `${kdramaTitle} Poster`,
        },
      ],
      type: "video.tv_show", 
    },
    // ✅ NEW: Twitter Specific Cards
    twitter: {
      card: "summary_large_image",
      title: kdramaTitle,
      description: kdramaDesc,
      images: [ogImage],
    },
  };
}

export default async function KdramaDetail({ params }: Props) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  // Fetch the kdrama itself
  // ✅ Added cover_url to the select query
  const { data: kdrama, error } = await supabase
    .from("media_items")
    .select("id, title, poster_path, genre, release_year, author, artist, download_link, details, cover_url")
    .eq("id", id)
    .eq("category", "kdrama")
    .single();

  if (error) {
    console.error("Supabase error:", error);
    return <div>Error loading kdrama</div>;
  }
  if (!kdrama) {
    return <div>No kdrama found for id {id}</div>;
  }

  // Fetch episodes linked to this kdrama season
  const { data: episodes, error: episodesError } = await supabase
    .from("media_items")
    .select("id, episode_number, download_link")
    .eq("parent_id", id)
    .order("episode_number", { ascending: true });

  if (episodesError) {
    console.error("Supabase error fetching episodes:", episodesError);
  }

  // --- START OF SCHEMA GENERATION ---
  
  const cleanTitle = kdrama.title ?? "Untitled K-Drama";
  const genreArray = kdrama.genre ? kdrama.genre.split(",") : ["Korean Drama"];
  const baseUrl = "https://moviewrld.com"; 

  // Map the fetched episodes into Google's Episode schema
  const episodeSchema = episodes && episodes.length > 0 
    ? episodes.map(ep => ({
        "@type": "TVEpisode",
        "episodeNumber": ep.episode_number,
        "name": `Episode ${ep.episode_number}`,
        "url": `${baseUrl}/kdrama/${id}` // Pointing back to the main series page where they can find the link
      }))
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": cleanTitle,
    "image": kdrama.cover_url || kdrama.poster_path, 
    "description": kdrama.details || `Watch or download the K-Drama ${cleanTitle}.`,
    "dateCreated": kdrama.release_year ? `${kdrama.release_year}` : undefined,
    "genre": genreArray,
    "containsSeason": {
      "@type": "TVSeason",
      "seasonNumber": 1, // Assuming standard single-season kdrama format
      "episode": episodeSchema
    },
    "potentialAction": {
      "@type": "WatchAction",
      "target": `${baseUrl}/kdrama/${id}` 
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
        category="kdrama"
        title={kdrama.title ?? "Untitled"}
        poster_path={kdrama.poster_path}
        genre={kdrama.genre}
        release_year={kdrama.release_year}
        author={kdrama.author}
        artist={kdrama.artist}
        extra_details={kdrama.details}
        download_link={kdrama.download_link}
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