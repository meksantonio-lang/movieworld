import { searchMedia } from "@/lib/tmdb";
import MediaCard from "@/components/MediaCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";
  const currentPage = Number(resolvedSearchParams.page) || 1;

  if (!query) {
    return (
      <main className="min-h-screen bg-gray-950 px-4 md:px-8 py-16 flex items-center justify-center">
        <h1 className="text-2xl text-gray-500 font-bold">Please enter a search term above.</h1>
      </main>
    );
  }

  const results = await searchMedia(query, currentPage);

  return (
    <main className="min-h-screen bg-gray-950 px-4 md:px-8 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 border-b border-white/10 pb-6">
          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest mb-2">
            Search Results
          </h1>
          <p className="text-purple-400 font-bold">
            Showing results for: <span className="text-white">"{query}"</span>
          </p>
        </div>
        
        {results.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl text-gray-500 font-bold mb-4">No results found for "{query}".</h2>
            <p className="text-gray-600">Try checking for typos or using different keywords.</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {results.map((m: any) => {
              const year = m.release_date ? m.release_date.slice(0, 4) : m.first_air_date ? m.first_air_date.slice(0, 4) : "";
              
              // Smart Image Fallback for the grid
              const poster = m.poster_path 
                ? `https://image.tmdb.org/t/p/w500${m.poster_path}` 
                : "https://via.placeholder.com/500x750/111827/a855f7?text=No+Poster";
              
              // Route all TMDB results to the /movies/[id] dynamic page
              const linkCategory = "movies"; 

              return (
                <MediaCard
                  key={m.id}
                  id={m.id}
                  title={m.title || m.name} 
                  category={linkCategory}
                  image={poster}
                  releaseYear={year}
                />
              );
            })}
          </div>
        )}

        {results.length > 0 && (
          <div className="flex justify-center items-center gap-4 mt-16 border-t border-white/10 pt-10">
            {currentPage > 1 ? (
              <Link
                href={`/search?q=${encodeURIComponent(query)}&page=${currentPage - 1}`}
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
              href={`/search?q=${encodeURIComponent(query)}&page=${currentPage + 1}`}
              className="px-6 py-3 bg-gray-900 border border-white/10 text-white font-bold rounded-lg hover:bg-purple-600 hover:border-purple-600 transition-all"
            >
              Next Page →
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}