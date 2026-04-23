// src/app/music/[id]/page.tsx
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default async function MusicDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // ✅ await first
  const id = Number(resolvedParams.id); // ✅ cast to number for bigint column

  const { data: music, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("id", id) // ✅ safe numeric comparison
    .eq("category", "music")
    .single();

  if (error || !music) return <div>Error loading music</div>;

  return (
    <section className="px-6 py-12">
      <Link
        href="/music"
        className="text-purple-600 underline mb-4 inline-block"
      >
        ← Back to Music
      </Link>

      <h2 className="text-2xl font-bold mb-6 text-purple-500">{music.title}</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {music.cover && (
          <img
            src={music.cover}
            alt={music.title}
            className="w-64 h-auto rounded shadow"
          />
        )}

        <div>
          <p className="text-lg">Genre: {music.genre}</p>
          <p className="text-lg">Year: {music.release_year}</p>

          {/* Render metadata from details JSON if present */}
          {music.details?.artist && (
            <p className="mt-2 text-gray-700">Artist: {music.details.artist}</p>
          )}
          {music.details?.album && (
            <p className="mt-2 text-gray-700">Album: {music.details.album}</p>
          )}
          {music.details?.release_date && (
            <p className="mt-2 text-gray-700">
              Release Date: {music.details.release_date}
            </p>
          )}
          {music.details?.overview && (
            <p className="mt-2 text-gray-700">{music.details.overview}</p>
          )}

          {music.download_link && (
            <a
              href={music.download_link}
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
