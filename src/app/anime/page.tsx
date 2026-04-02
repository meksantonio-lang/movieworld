import { supabase } from "@/lib/supabaseClient";
import MediaCard from "@/components/MediaCard";
import { MediaItemRow, TMDBTvShow } from "@/types/media";

export default async function AnimePage() {
  const { data: anime, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("category", "anime");

  if (error || !anime) {
    console.error(error);
    return <div>Error loading anime</div>;
  }

  const enriched = await Promise.all(
    (anime as MediaItemRow[]).map(async (m) => {
      const res = await fetch(
        `https://api.themoviedb.org/3/tv/${m.tmdb_id}?api_key=${process.env.TMDB_API_KEY}`
      );
      const meta: TMDBTvShow = await res.json();
      return { ...meta, download_link: m.download_link };
    })
  );

  return (
    <section className="px-6 py-12">
      <h2 className="text-2xl font-bold mb-6 text-purple-500">Anime</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {enriched.map((m) => (
          <MediaCard
            key={m.id}
            title={m.name}
            category={m.first_air_date?.slice(0, 4) || "Anime"}
            image={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
            downloadLink={m.download_link}
          />
        ))}
      </div>
    </section>
  );
}
