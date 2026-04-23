// src/app/kdrama/[id]/page.tsx
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default async function KdramaDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // ✅ await first
  const id = Number(resolvedParams.id); // ✅ cast to number for bigint column

  const { data: kdrama, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("id", id) // ✅ safe numeric comparison
    .eq("category", "kdrama")
    .single();

  if (error || !kdrama) return <div>Error loading kdrama</div>;

  return (
    <section className="px-6 py-12">
      <Link href="/kdrama" className="text-purple-600 underline mb-4 inline-block">
        ← Back to Kdrama
      </Link>

      <h2 className="text-2xl font-bold mb-6 text-purple-500">{kdrama.title}</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {kdrama.cover && (
          <img
            src={kdrama.cover}
            alt={kdrama.title}
            className="w-64 h-auto rounded shadow"
          />
        )}

        <div>
          <p className="text-lg">Genre: {kdrama.genre}</p>
          <p className="text-lg">Year: {kdrama.release_year}</p>

          {kdrama.download_link && (
            <a
              href={kdrama.download_link}
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
