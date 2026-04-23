// src/app/adult/page.tsx
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import MediaCard from "@/components/MediaCard";
import { MediaItemRow } from "@/types/media";

export default async function AdultPage() {
  const { data: adult, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("category", "adult");

  if (error || !adult) {
    console.error(error);
    return <div>Error loading adult content</div>;
  }

  const enriched = (adult as MediaItemRow[]).map((m) => ({
    id: m.id,
    title: m.title || "Adult Content",
    poster_path: m.cover || "/placeholder.jpg",
    download_link: m.download_link ?? "",
    author: m.author ?? "",
    release_year: m.release_year ? String(m.release_year) : "",
  }));

  return (
    <section className="px-6 py-12 min-h-screen bg-red-700">
      <h2 className="text-2xl font-bold mb-6 text-white">Adult</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {enriched.map((m) => (
          <MediaCard
            key={String(m.id)}
            id={m.id} // ✅ required prop
            title={m.title}
            category="adult" // ✅ keep category consistent
            image={m.poster_path}
            downloadLink={m.download_link}
            author={m.author}
            releaseYear={m.release_year}
          />
        ))}
      </div>
    </section>
  );
}
