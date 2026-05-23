import { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import MediaDetailCard from "@/components/MediaDetailCard";

type Props = {
  params: Promise<{ id: string }>;
};

// ✅ Generates SEO Metadata for Google Search
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  // Fetch only the fields needed for SEO
  const { data: kdrama } = await supabase
    .from("media_items")
    .select("title, details")
    .eq("id", id)
    .eq("category", "kdrama")
    .single();

  if (!kdrama) {
    return {
      title: "K-Drama Not Found | MovieWrld",
    };
  }

  const kdramaTitle = kdrama.title ?? "Untitled K-Drama";

  return {
    title: `${kdramaTitle} K-Drama - Download & Stream | MovieWrld`,
    description: kdrama.details 
      ? kdrama.details.substring(0, 160) // Keep description under Google's 160 char limit
      : `Download and stream ${kdramaTitle} K-Drama episodes on MovieWrld.`,
    keywords: [
      `${kdramaTitle} kdrama download`,
      `download ${kdramaTitle} episodes`,
      `${kdramaTitle} korean drama free download`,
      `${kdramaTitle} eng sub download`,
      `${kdramaTitle} full season download`
    ],
  };
}

export default async function KdramaDetail({ params }: Props) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  // Fetch the kdrama itself
  const { data: kdrama, error } = await supabase
    .from("media_items")
    .select("id, title, poster_path, genre, release_year, author, artist, download_link, details")
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
    .select("id, episode_number, download_link")
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
        poster_path={kdrama.poster_path}
        genre={kdrama.genre}
        release_year={kdrama.release_year}
        author={kdrama.author}
        artist={kdrama.artist}
        // ✅ new plain-text details field
        extra_details={kdrama.details}
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