// src/app/movies/[id]/page.tsx
import { supabase } from "@/lib/supabaseClient";
import MediaDetailCard from "@/components/MediaDetailCard";

export default async function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // ✅ await first
  const id = Number(resolvedParams.id);

  const { data: movie, error } = await supabase
    .from("media_items")
    .select("*")
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

  return (
    <MediaDetailCard
      category="movies"
      title={movie.title ?? "Untitled"}
      cover={movie.cover}
      poster_path={movie.poster_path}
      genre={movie.genre}
      release_year={movie.release_year}
      artist={movie.artist ?? movie.details?.artist}
      author={movie.author ?? movie.details?.author}
      runtime={movie.details?.runtime}
      episodes={movie.details?.episodes}
      studio={movie.details?.studio}
      publisher={movie.details?.publisher}
      overview={movie.details?.overview}
      download_link={movie.download_link}
    />
  );
}
