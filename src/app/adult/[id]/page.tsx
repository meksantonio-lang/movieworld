import { supabase } from "@/lib/supabaseClient";
import MediaDetailCard from "@/components/MediaDetailCard";

export default async function AdultDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // ✅ await first
  const id = Number(resolvedParams.id);

  const { data: adult, error } = await supabase
    .from("media_items")
    .select("*")
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
      cover={adult.cover}
      poster_path={adult.poster_path}
      genre={adult.genre}
      release_year={adult.release_year}
      overview={adult.details?.overview}
      studio={adult.details?.studio}
      download_link={adult.download_link}
    />
  );
}
