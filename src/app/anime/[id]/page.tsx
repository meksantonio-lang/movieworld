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
  const { data: anime } = await supabase
    .from("media_items")
    .select("title, details")
    .eq("id", id)
    .eq("category", "anime")
    .single();

  if (!anime) {
    return {
      title: "Anime Not Found | MovieWrld",
    };
  }

  const animeTitle = anime.title ?? "Untitled Anime";

  return {
    title: `${animeTitle} Anime - Download & Stream | MovieWrld`,
    description: anime.details 
      ? anime.details.substring(0, 160) // Keep description under Google's 160 char limit
      : `Download and stream ${animeTitle} anime episodes on MovieWrld.`,
    keywords: [
      `${animeTitle} anime download`,
      `download ${animeTitle} episodes`,
      `${animeTitle} free download`,
      `${animeTitle} sub dub download`,
      `${animeTitle} full season download`
    ],
  };
}

export default async function AnimeDetail({ params }: Props) {
  const resolvedParams = await params;
  const id = Number(resolvedParams.id);

  // Fetch the anime itself
  const { data: anime, error } = await supabase
    .from("media_items")
    .select("id, title, poster_path, genre, release_year, author, artist, download_link, details")
    .eq("id", id)
    .eq("category", "anime")
    .single();

  if (error) {
    console.error("Supabase error:", error);
    return <div>Error loading anime</div>;
  }
  if (!anime) {
    return <div>No anime found for id {id}</div>;
  }

  // Fetch episodes linked to this anime season
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
        category="anime"
        title={anime.title ?? "Untitled"}
        poster_path={anime.poster_path}
        genre={anime.genre}
        release_year={anime.release_year}
        author={anime.author}
        artist={anime.artist}
        // ✅ new plain-text details field
        extra_details={anime.details}
        download_link={anime.download_link}
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