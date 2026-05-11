import { supabase } from "@/lib/supabaseClient";
import MediaDetailCard from "@/components/MediaDetailCard";

export default async function AdultDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  const { data: adult, error } = await supabase
    .from("media_items")
    .select("id, title, poster_path, genre, release_year, author, artist, download_link, details")
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

  return (
    <MediaDetailCard
      category="adult"
      title={adult.title ?? "Untitled"}
      poster_path={adult.poster_path}
      genre={adult.genre}
      release_year={adult.release_year}
      author={adult.author}
      artist={adult.artist}
      // ✅ new plain-text details field
      extra_details={adult.details}
      download_link={adult.download_link}
    />
  );
}
