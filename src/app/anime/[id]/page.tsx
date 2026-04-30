// src/app/anime/[id]/page.tsx
import { supabase } from "@/lib/supabaseClient";
import MediaDetailCard from "@/components/MediaDetailCard";

export default async function AnimeDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // ✅ await first
  const id = Number(resolvedParams.id);

  const { data: anime, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("id", id)
    .eq("category", "anime")
    .single();

  if (error) {
    console.error("Supabase error:", error);
    return <div>Error loading anime</div>;
  }
  if (!anime) {
    return <div>No anime found for id {id}</div>;
  }

  return (
    <MediaDetailCard
      category="anime"
      title={anime.title ?? "Untitled"}
      cover={anime.cover}
      poster_path={anime.poster_path}
      genre={anime.genre}
      release_year={anime.release_year}
      episodes={anime.details?.episodes}
      studio={anime.details?.studio}
      overview={anime.details?.overview}
      download_link={anime.download_link}
    />
  );
}
