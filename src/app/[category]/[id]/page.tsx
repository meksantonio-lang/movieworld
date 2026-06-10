import type { Metadata } from 'next';
import BookmarkButton from "@/components/BookmarkButton";
import { getMediaDetails, getMediaCast, getMediaTrailer } from "@/lib/tmdb";
import { supabase } from "@/lib/supabaseClient";
import LikeButton from "@/components/LikeButton";
import CommentSection from "@/components/CommentSection";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ category: string; id: string }>;
};

// ✅ 1. DYNAMIC METADATA GENERATOR (Next.js 15 Async Params)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tmdbType = resolvedParams.category === "movies" ? "movie" : "tv";
  const mediaId = Number(resolvedParams.id);

  // Fetch just the details for the SEO card
  const details = await getMediaDetails(tmdbType, mediaId);
  
  if (!details) {
    return {
      title: "Title Not Found | Moviewrld",
    };
  }

  // Format title and image for the card
  const title = details.title || details.name;
  const description = details.overview || "Check out this title on Moviewrld!";
  const posterUrl = details.poster_path 
    ? `https://image.tmdb.org/t/p/w500${details.poster_path}` 
    : "https://moviewrld.com/Logo.png"; // Fallback to your main logo if no poster exists

  return {
    title: `${title} | Moviewrld`,
    description: description,
    openGraph: {
      title: `${title} | Moviewrld`,
      description: description,
      url: `https://moviewrld.com/${resolvedParams.category}/${resolvedParams.id}`,
      siteName: "Moviewrld",
      images: [
        {
          url: posterUrl,
          width: 500,
          height: 750,
          alt: `${title} Poster`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Moviewrld`,
      description: description,
      images: [posterUrl],
    },
  };
}

// 2. MAIN PAGE COMPONENT (Next.js 15 Async Params)
export default async function MediaPage({ params }: PageProps) {
  const resolvedParams = await params;
  const tmdbType = resolvedParams.category === "movies" ? "movie" : "tv";
  const mediaId = Number(resolvedParams.id);

  // 1. Fetch all TMDB data AND your Supabase admin review concurrently
  const [details, cast, trailerKey, adminReviewResult] = await Promise.all([
    getMediaDetails(tmdbType, mediaId),
    getMediaCast(tmdbType, mediaId),
    getMediaTrailer(tmdbType, mediaId),
    supabase.from("admin_reviews").select("review_text").eq("media_id", mediaId).single(),
  ]);

  const adminReview = adminReviewResult.data?.review_text || null;

  // 2. Format details
  const title = details.title || details.name;
  const year = details.release_date ? details.release_date.slice(0, 4) : details.first_air_date?.slice(0, 4);
  const runtime = details.runtime ? `${details.runtime} min` : details.episode_run_time?.[0] ? `${details.episode_run_time[0]} min / ep` : "TBA";
  const backdrop = details.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : null;
  const poster = details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : "/placeholder.png";

  // Map genres if available from TMDB response
  const genres = details.genres ? details.genres.map((g: any) => g.name) : [];

  // Map the top 5 cast members into structural objects for Google's bot
  const structuredActors = cast && cast.length > 0 
    ? cast.slice(0, 5).map((actor: any) => ({
        "@type": "PerformanceRole",
        "actor": {
          "@type": "Person",
          "name": actor.name
        },
        "characterName": actor.character
      }))
    : undefined;

  return (
    <main className="min-h-screen bg-gray-950 pb-20">
      
      {/* 🤖 ENHANCED JSON-LD SCHEMA FOR GOOGLE RICH RESULTS */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": tmdbType === "movie" ? "Movie" : "TVSeries",
            "name": title,
            "image": poster,
            "description": details.overview || "No synopsis available.",
            "dateCreated": year,
            "genre": genres,
            "actor": structuredActors,
            "aggregateRating": details.vote_average ? {
              "@type": "AggregateRating",
              "ratingValue": details.vote_average,
              "bestRating": "10",
              "ratingCount": details.vote_count || 1
            } : undefined
          }),
        }}
      />

      {/* HERO BACKDROP */}
      <div className="w-full h-[40vh] md:h-[60vh] relative">
        {backdrop && (
          <img src={backdrop} alt={title} className="w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-32 md:-mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* POSTER */}
          <div className="shrink-0 w-48 md:w-72 rounded-2xl overflow-hidden shadow-2xl border border-white/10 mx-auto md:mx-0">
            <img src={poster} alt={title} className="w-full h-auto object-cover" />
          </div>

          {/* DETAILS & LIKE BUTTON */}
          <div className="flex flex-col justify-end pt-4 md:pt-16">
            {/* INTERACTIVE BUTTONS */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <LikeButton mediaId={mediaId} />
              <BookmarkButton 
                media={{
                  id: mediaId,
                  title: title,
                  category: resolvedParams.category,
                  image: poster,
                  year: year || ""
                }} 
              />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-md">
              {title}
            </h1>

            <div className="mb-8">
              <LikeButton mediaId={mediaId} />
            </div>

            <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mb-8">
              {details.overview || "No synopsis available for this title."}
            </p>
          </div>
        </div>

        {/* ⭐ MOVIEWRLD CRITIC REVIEW */}
        {adminReview && (
          <div className="mt-16 bg-gradient-to-br from-purple-900/30 via-gray-900 to-gray-900 border border-purple-500/30 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">🌍</span>
              <h3 className="text-xl md:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 uppercase">
                MovieWorld Review
              </h3>
            </div>
            <p className="text-gray-200 text-lg italic font-medium leading-relaxed whitespace-pre-wrap">
              "{adminReview}"
            </p>
            <p className="text-purple-400 text-xs font-bold uppercase tracking-widest mt-4 text-right">
              — Official Editorial
            </p>
          </div>
        )}

        {/* CAST LIST */}
        {cast && cast.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">Top Cast</h3>
            <div className="flex overflow-x-auto gap-4 pb-4 snap-x custom-scrollbar">
              {cast.map((actor: any) => (
                <div key={actor.id} className="shrink-0 w-32 snap-start">
                  <div className="w-32 h-40 bg-gray-900 rounded-lg overflow-hidden mb-3">
                    {actor.profile_path ? (
                      <img src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} alt={actor.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">No Photo</div>
                    )}
                  </div>
                  <h5 className="text-white font-bold text-sm line-clamp-1">{actor.name}</h5>
                  <p className="text-gray-500 text-xs line-clamp-1">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TRAILER EMBED */}
        {trailerKey && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-4">Official Trailer</h3>
            <div className="aspect-video w-full max-w-4xl bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${trailerKey}?rel=0`}
                title="Official Trailer"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}

        {/* COMMUNITY REVIEW SECTION */}
        <div className="mt-24">
           <CommentSection mediaId={mediaId} />
        </div>

      </div>
    </main>
  );
}