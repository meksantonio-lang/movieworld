import { supabase } from "@/lib/supabaseClient";
import MediaCard from "@/components/MediaCard";
import { MediaItemRow, TMDBMovie } from "@/types/media";

export default async function MoviesPage() {
  const { data: movies, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("category", "movies");

  if (error || !movies) {
    console.error(error);
    return <div>Error loading movies</div>;
  }

  const enriched = await Promise.all(
    (movies as MediaItemRow[]).map(async (m) => {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${m.tmdb_id}?api_key=${process.env.TMDB_API_KEY}`
      );
      const meta: TMDBMovie = await res.json();
      return { ...meta, download_link: m.download_link };
    })
  );

  return (
    <section className="px-6 py-12">
      <h2 className="text-2xl font-bold mb-6 text-purple-500">Movies</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {enriched.map((m) => (
          <MediaCard
            key={m.id}
            title={m.title}
            category={m.release_date?.slice(0, 4) || "Movie"}
            image={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
            downloadLink={m.download_link}
          />
        ))}
      </div>
    </section>
  );
}
