// src/app/anime/[id]/page.tsx
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default async function AnimeDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // ✅ await first
  const id = Number(resolvedParams.id); // ✅ cast to number for bigint column

  const { data: anime, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("id", id) // ✅ safe numeric comparison
    .eq("category", "anime")
    .single();

  if (error || !anime) return <div>Error loading anime</div>;

  return (
    <section className="px-6 py-12">
      <Link href="/anime" className="text-purple-600 underline mb-4 inline-block">
        ← Back to Anime
      </Link>

      <h2 className="text-2xl font-bold mb-6 text-purple-500">{anime.title}</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {anime.cover && (
          <img
            src={anime.cover}
            alt={anime.title}
            className="w-64 h-auto rounded shadow"
          />
        )}

        <div>
          <p className="text-lg">Genre: {anime.genre}</p>
          <p className="text-lg">Year: {anime.release_year}</p>

          {anime.download_link && (
            <a
              href={anime.download_link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block bg-purple-600 text-white px-4 py-2 rounded"
            >
              Download
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
