// src/app/kdrama/[id]/page.tsx
import { supabase } from "@/lib/supabaseClient";
import MediaDetailCard from "@/components/MediaDetailCard";

export default async function KdramaDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // ✅ await first
  const id = Number(resolvedParams.id);

  // Fetch the kdrama/season itself
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

  // Fetch episodes linked to this kdrama season
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
