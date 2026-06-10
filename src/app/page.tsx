import { getTrendingMovies, getTrendingAnime, getTrendingKDramas, getMediaTrailer } from "@/lib/tmdb";
import MediaCard from "@/components/MediaCard";
import HomepageNews from "@/components/HomepageNews";
import AnimatedIntro from "@/components/AnimatedIntro";
import Link from "next/link";

export const dynamic = "force-dynamic";

function SectionHeader({ title, category }: { title: string; category: string }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-2xl font-bold text-white uppercase tracking-wider">{title}</h3>
      <Link
        href={`/${category}`}
        className="text-sm font-bold text-purple-400 hover:text-purple-300 hover:underline transition-colors uppercase"
      >
        See More →
      </Link>
    </div>
  );
}

export default async function HomePage() {
  // 1. Fetch live data from your TMDB engine
  const [movies, anime, kdrama] = await Promise.all([
    getTrendingMovies(),
    getTrendingAnime(),
    getTrendingKDramas(),
  ]);

  // 2. Slice to get only the top 3 for the homepage grids
  const topMovies = movies.slice(0, 3);
  const topAnime = anime.slice(0, 3);
  const topKdrama = kdrama.slice(0, 3);

  // 3. Grab the #1 trending movie for the Hero Trailer embed
  const heroMovie = movies[0];
  const heroTrailerKey = heroMovie ? await getMediaTrailer("movie", heroMovie.id) : null;

  // Helper function to render a category section
  const renderSection = (title: string, category: string, items: any[]) => (
    <section className="mb-16">
      <SectionHeader title={title} category={category} />
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
        {items.map((m) => {
          const year = m.release_date ? m.release_date.slice(0, 4) : m.first_air_date ? m.first_air_date.slice(0, 4) : "";
          const poster = m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : "/placeholder.png";

          return (
            <MediaCard
              key={m.id}
              id={m.id}
              title={m.title || m.name} 
              category={category}
              image={poster}
              downloadLink="" 
              releaseYear={year}
            />
          );
        })}
      </div>
    </section>
  );

  return (
    <main className="min-h-screen bg-gray-950 px-4 md:px-8 pb-20">
      
      {/* CATCHY INTRO HEADER (Imported Client Component) */}
      <AnimatedIntro />

      {/* RESPONSIVE HERO SECTION */}
      <section className="w-full max-w-7xl mx-auto mb-16 rounded-2xl overflow-hidden shadow-2xl bg-gray-900 flex flex-col md:relative md:aspect-video">
        
        {/* Video Frame Holder */}
        <div className="w-full aspect-video md:absolute md:inset-0 md:h-full">
          {heroTrailerKey ? (
            <iframe
              className="w-full h-full object-cover pointer-events-none"
              src={`https://www.youtube.com/embed/${heroTrailerKey}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${heroTrailerKey}&controls=0&showinfo=0&rel=0`}
              title="Trailer"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : heroMovie?.backdrop_path ? (
            <img 
              src={`https://image.tmdb.org/t/p/original${heroMovie.backdrop_path}`} 
              alt={heroMovie.title}
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Trailer Unavailable
            </div>
          )}
        </div>
        
        {/* Responsive Details Content Block */}
        <div className="w-full p-6 bg-gray-900/90 border-t border-white/5 md:border-none md:p-8 md:bg-gradient-to-t md:from-gray-950 md:via-gray-950/70 md:to-transparent md:absolute md:bottom-0 md:left-0 md:z-10">
          <span className="bg-purple-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">
            #1 Trending
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white mb-2 line-clamp-1">
            {heroMovie?.title || heroMovie?.name}
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl line-clamp-2 md:line-clamp-3">
            {heroMovie?.overview}
          </p>
        </div>
      </section>

      {/* HOLLYWOOD NEWS SECTION */}
      <div className="max-w-7xl mx-auto mb-12">
        <HomepageNews />
      </div>

      {/* RECOMMENDED GRIDS */}
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-black text-white mb-10 border-b border-white/10 pb-4 uppercase tracking-widest">
          Recommended (Must Watch)
        </h2>
        {renderSection("Movies", "movies", topMovies)}
        {renderSection("Anime", "anime", topAnime)}
        {renderSection("K-Drama", "kdrama", topKdrama)}
      </div>
    </main>
  );
}