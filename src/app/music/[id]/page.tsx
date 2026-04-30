import { supabase } from "@/lib/supabaseClient";
import MediaDetailCard from "@/components/MediaDetailCard";

export default async function MusicDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // ✅ await first
  const id = Number(resolvedParams.id);

  const { data: music, error } = await supabase
    .from("media_items")
    .select("*")
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
      cover={music.cover}
      poster_path={music.poster_path}
      genre={music.genre}
      release_year={music.release_year}
      artist={music.artist ?? music.details?.artist}
      publisher={music.details?.publisher}
      overview={music.details?.overview}
      download_link={music.download_link}
    />
  );
}
