import { supabase } from "@/lib/supabaseClient";
import MediaDetailCard from "@/components/MediaDetailCard";

export default async function MusicDetail({ params }: { params: Promise<{ id: string }> }) {
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
