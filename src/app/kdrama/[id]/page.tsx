// src/app/kdrama/[id]/page.tsx
import { supabase } from "@/lib/supabaseClient";
import MediaDetailCard from "@/components/MediaDetailCard";

export default async function KdramaDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // ✅ await first
  const id = Number(resolvedParams.id);

  const { data: kdrama, error } = await supabase
    .from("media_items")
    .select("*")
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

  return (
    <MediaDetailCard
      category="kdrama"
      title={kdrama.title ?? "Untitled"}
      cover={kdrama.cover}
      poster_path={kdrama.poster_path}
      genre={kdrama.genre}
      release_year={kdrama.release_year}
      episodes={kdrama.details?.episodes}
      studio={kdrama.details?.studio}
      overview={kdrama.details?.overview}
      download_link={kdrama.download_link}
    />
  );
}
