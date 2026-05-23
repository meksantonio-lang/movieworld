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
  const { data: music } = await supabase
    .from("media_items")
    .select("title, artist, details")
    .eq("id", id)
    .eq("category", "music")
    .single();

  if (!music) {
    return {
      title: "Music Not Found | MovieWrld",
    };
  }

  const musicTitle = music.title ?? "Untitled Track";
  const artistString = music.artist ? ` by ${music.artist}` : "";

  return {
    title: `${musicTitle}${artistString} - Download MP3 | MovieWrld`,
    description: music.details 
      ? music.details.substring(0, 160) // Keep description under Google's 160 char limit
      : `Download and stream ${musicTitle}${artistString} on MovieWrld.`,
    keywords: [
      `${musicTitle} mp3 download`,
      `download ${musicTitle} audio`,
      `${musicTitle}${artistString} free download`,
      `${musicTitle} song download`,
      `latest music download`
    ],
  };
}

export default async function MusicDetail({ params }: Props) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  const { data: music, error } = await supabase
    .from("media_items")
    .select("id, title, poster_path, genre, release_year, artist, author, download_link, details")
    .eq("id", id)
    .eq("category", "music")
    .single();

  if (error) {
    console.error("Supabase error:", error);
    return <div>Error loading music</div>;
  }
  if (!music) {
    return <div>No music found for id {id}</div>;
  }

  return (
    <MediaDetailCard
      category="music"
      title={music.title ?? "Untitled"}
      poster_path={music.poster_path}
      genre={music.genre}
      release_year={music.release_year}
      artist={music.artist}
      author={music.author}
      // ✅ new plain-text details field
      extra_details={music.details}
      download_link={music.download_link}
    />
  );
}