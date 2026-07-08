import { getTrendingMovies, getTrendingAnime, getTrendingKDramas, getMediaTrailer } from "@/lib/tmdb";
import MediaCard from "@/components/MediaCard";
import HomepageNews from "@/components/HomepageNews";
import AnimatedIntro from "@/components/AnimatedIntro";
import Link from "next/link";
import MoodSelector from "@/components/MoodSelector";
import HeroSection from "@/components/HeroSection";

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

      {/* THE NEW INTERACTIVE HERO SECTION */}
      <HeroSection heroMovie={heroMovie} heroTrailerKey={heroTrailerKey} />

      {/* HOLLYWOOD NEWS SECTION */}
      <div className="max-w-7xl mx-auto mb-12">
        <HomepageNews />
      </div>

      {/* THE NEW MOOD SELECTOR (Gamified Engine) */}
      <div className="mb-16">
        <MoodSelector />
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