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
  const { data: adult } = await supabase
    .from("media_items")
    .select("title, details")
    .eq("id", id)
    .eq("category", "adult")
    .single();

  if (!adult) {
    return {
      title: "Content Not Found | MovieWrld",
    };
  }

  const adultTitle = adult.title ?? "Untitled Content";

  return {
    title: `${adultTitle} - Download & Stream | MovieWrld`,
    description: adult.details 
      ? adult.details.substring(0, 160) // Keep description under Google's 160 char limit
      : `Download and stream ${adultTitle} on MovieWrld.`,
    keywords: [
      `${adultTitle} download`,
      `download ${adultTitle}`,
      `${adultTitle} 18+ download`,
      `${adultTitle} adult content download`,
      `${adultTitle} full video download`
    ],
  };
}

export default async function AdultDetail({ params }: Props) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  // ✅ Added cover_url to the select query
  const { data: adult, error } = await supabase
    .from("media_items")
    .select("id, title, poster_path, genre, release_year, author, artist, download_link, details, cover_url")
    .eq("id", id)
    .eq("category", "adult")
    .single();

  if (error) {
    console.error("Supabase error:", error);
    return <div>Error loading adult item</div>;
  }
  if (!adult) {
    return <div>No adult item found for id {id}</div>;
  }

  // --- START OF SCHEMA GENERATION ---
  
  const cleanTitle = adult.title ?? "Untitled Content";
  const genreArray = adult.genre ? adult.genre.split(",") : ["Adult"];
  const baseUrl = "https://moviewrld.com"; 

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": cleanTitle,
    "image": adult.cover_url || adult.poster_path, 
    "description": adult.details || `Watch or download ${cleanTitle}.`,
    "uploadDate": adult.release_year ? `${adult.release_year}-01-01` : undefined, // VideoObject prefers a full date format
    "isFamilyFriendly": false, // ✅ Critical for SafeSearch compliance
    "genre": genreArray,
    "potentialAction": {
      "@type": "WatchAction",
      "target": `${baseUrl}/adult/${id}` 
    }
  };
  // --- END OF SCHEMA GENERATION ---

  return (
    <>
      {/* INJECT SCHEMA HERE */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MediaDetailCard
        category="adult"
        title={adult.title ?? "Untitled"}
        poster_path={adult.poster_path}
        genre={adult.genre}
        release_year={adult.release_year}
        author={adult.author}
        artist={adult.artist}
        extra_details={adult.details}
        download_link={adult.download_link}
      />
    </>
  );
}