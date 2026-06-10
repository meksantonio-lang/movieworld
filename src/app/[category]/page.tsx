import { getTrendingMovies, getTrendingAnime, getTrendingKDramas } from "@/lib/tmdb";
import MediaCard from "@/components/MediaCard";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function CategoryPage({ params, searchParams }: PageProps) {
  // ✅ Await both dynamic params and searchParams for Next.js 15 compliance
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const { category } = resolvedParams;
  
  // Grab the page number from the URL (e.g., ?page=2), default to 1 if it doesn't exist
  const currentPage = Number(resolvedSearchParams.page) || 1;

  let items = [];
  let title = "";

  // 1. Fetch the correct data based on the URL parameter and current page
  if (category === "movies") {
    items = await getTrendingMovies(currentPage);
    title = "Trending Movies";
  } else if (category === "anime") {
    items = await getTrendingAnime(currentPage);
    title = "Trending Anime";
  } else if (category === "kdrama") {
    items = await getTrendingKDramas(currentPage);
    title = "Trending K-Dramas";
  } else {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 md:px-8 py-16">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-black text-white mb-12 border-b border-white/10 pb-6 uppercase tracking-widest">
          {title}
        </h1>
        
        {/* Media Grid */}
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((m: any) => {
            const year = m.release_date ? m.release_date.slice(0, 4) : m.first_air_date ? m.first_air_date.slice(0, 4) : "";
            const poster = m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "/placeholder.png";

            return (
              <MediaCard
                key={m.id}
                id={m.id}
                title={m.title || m.name} 
                category={category}
                image={poster}
                releaseYear={year}
              />
            );
          })}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-4 mt-16 border-t border-white/10 pt-10">
          {currentPage > 1 ? (
            <Link
              href={`/${category}?page=${currentPage - 1}`}
              className="px-6 py-3 bg-gray-900 border border-white/10 text-white font-bold rounded-lg hover:bg-purple-600 hover:border-purple-600 transition-all"
            >
              ← Previous
            </Link>
          ) : (
            <button disabled className="px-6 py-3 bg-gray-900/50 border border-white/5 text-gray-600 font-bold rounded-lg cursor-not-allowed">
              ← Previous
            </button>
          )}
          
          <span className="text-purple-400 font-bold mx-4 px-4 py-2 bg-purple-900/20 rounded-lg">
            Page {currentPage}
          </span>

          <Link
            href={`/${category}?page=${currentPage + 1}`}
            className="px-6 py-3 bg-gray-900 border border-white/10 text-white font-bold rounded-lg hover:bg-purple-600 hover:border-purple-600 transition-all"
          >
            Next Page →
          </Link>
        </div>
        
      </div>
    </main>
  );
}