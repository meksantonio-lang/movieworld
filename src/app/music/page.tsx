import { supabase } from "@/lib/supabaseClient";
import MediaCard from "@/components/MediaCard";
import { MediaItemRow } from "@/types/media";

export default async function MusicPage() {
  const { data: music, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("category", "music");

  if (error || !music) {
    console.error(error);
    return <div>Error loading music</div>;
  }

  const enriched = (music as MediaItemRow[]).map((m) => ({
    id: m.id,
    title: "Music Track",
    poster_path: "/music-placeholder.jpg",
    download_link: m.download_link,
  }));

  return (
    <section className="px-6 py-12 min-h-screen bg-gray-900">
      <h2 className="text-2xl font-bold mb-6 text-white">Music</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {enriched.map((m) => (
          <MediaCard
            key={m.id}
            title={m.title}
            category="Music"
            image={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
            downloadLink={m.download_link}
          />
        ))}
      </div>
    </section>
  );
}
