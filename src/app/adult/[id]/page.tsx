// src/app/adult/[id]/page.tsx
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default async function AdultDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // ✅ await first
  const id = Number(resolvedParams.id); // ✅ cast to number for bigint column

  const { data: adult, error } = await supabase
    .from("media_items")
    .select("*")
    .eq("id", id) // ✅ safe numeric comparison
    .eq("category", "adult")
    .single();

  if (error || !adult) return <div>Error loading adult item</div>;

  return (
    <section className="px-6 py-12">
      <Link href="/adult" className="text-purple-600 underline mb-4 inline-block">
        ← Back to Adult
      </Link>

      <h2 className="text-2xl font-bold mb-6 text-purple-500">{adult.title}</h2>

      <div className="flex flex-col md:flex-row gap-6">
        {adult.cover && (
          <img
            src={adult.cover}
            alt={adult.title}
            className="w-64 h-auto rounded shadow"
          />
        )}

        <div>
          {adult.genre && <p className="text-lg">Genre: {adult.genre}</p>}
          {adult.release_year && <p className="text-lg">Year: {adult.release_year}</p>}

          {adult.download_link && (
            <a
              href={adult.download_link}
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
