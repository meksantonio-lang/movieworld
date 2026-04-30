export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import MediaCard from "@/components/MediaCard";
import { MediaItemRow } from "@/types/media";

export default async function AdultPage() {
  const { data: adult, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("category", "adult")
    .order("created_at", { ascending: false });

  if (error || !adult) {
    console.error(error);
    return <div>Error loading adult content</div>;
  }

  const enriched = (adult as MediaItemRow[]).map((m) => ({
    id: m.id,
    title: m.title || "Adult Content",
    image: m.cover || "/placeholder.jpg", // ✅ consistent naming
    download_link: m.download_link ?? "",
    author: m.author ?? "",
    releaseYear: m.release_year ? String(m.release_year) : "",
  }));

  return (
    <section className="px-6 py-12 min-h-screen bg-red-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Adult</h2>
        <Link href="/" className="text-sm text-gray-200 hover:underline">
          ← Back to Home
        </Link>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {enriched.map((m) => (
          <MediaCard
            key={String(m.id)}
            id={m.id}
            title={m.title}
            category="adult" // ✅ always "adult"
            image={m.image}
            downloadLink={m.download_link}
            author={m.author}
            releaseYear={m.releaseYear}
          />
        ))}
      </div>
    </section>
  );
}
