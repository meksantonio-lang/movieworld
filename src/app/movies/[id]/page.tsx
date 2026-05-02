// src/app/movies/[id]/page.tsx
import { supabase } from "@/lib/supabaseClient";
import MediaDetailCard from "@/components/MediaDetailCard";

export default async function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // ✅ await first
  const id = Number(resolvedParams.id);

  // Fetch the movie/season itself
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

  // Fetch episodes linked to this movie/season
  const { data: episodes, error: episodesError } = await supabase
    .from("media_items")
    .select("*")
    .eq("parent_id", id)
    .order("episode_number", { ascending: true });

  if (episodesError) {
    console.error("Supabase error fetching episodes:", episodesError);
  }

  return (
    <main className="px-6 py-10">
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
