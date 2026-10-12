// lib/tmdb.ts

const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

/**
 * Base fetch function with built-in Next.js caching.
 * Caches data for 1 hour (3600 seconds) to make your site lightning fast 
 * and prevent hitting TMDB rate limits.
 */
async function fetchTMDB(endpoint: string, queryParams: string = "") {
  if (!API_KEY) throw new Error("Missing TMDB_API_KEY in .env.local");

  const url = `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US${queryParams}`;
  
  const response = await fetch(url, {
    next: { revalidate: 3600 }, 
  });

  if (!response.ok) {
    throw new Error(`TMDB fetch failed: ${response.statusText}`);
  }

  return response.json();
}

// ==========================================
// HOMEPAGE GRID FETCHERS (Now with Pagination)
// ==========================================

export async function getTrendingMovies(page: number = 1) {
  const data = await fetchTMDB("/trending/movie/week", `&page=${page}`);
  return data.results;
}

export async function getTrendingAnime(page: number = 1) {
  // Calculates a cutoff date 18 months in the past dynamically
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - 18);
  const formattedCutoff = cutoffDate.toISOString().split("T")[0];

  // Filters for recent Japanese animation with genuine audience traction
  const data = await fetchTMDB(
    "/discover/tv",
    `&with_original_language=ja&with_genres=16&first_air_date.gte=${formattedCutoff}&vote_count.gte=25&sort_by=popularity.desc&page=${page}`
  );
  return data.results;
}

export async function getTrendingKDramas(page: number = 1) {
  // Calculates a cutoff date 18 months in the past dynamically
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - 18);
  const formattedCutoff = cutoffDate.toISOString().split("T")[0];

  // Enforces Korean language, Drama genre (18), recent air dates, and minimum votes to eliminate variety/talk shows
  const data = await fetchTMDB(
    "/discover/tv",
    `&with_original_language=ko&with_genres=18&without_genres=10767,10763&first_air_date.gte=${formattedCutoff}&vote_count.gte=15&sort_by=popularity.desc&page=${page}`
  );
  return data.results;
}

// ==========================================
// INDIVIDUAL MEDIA PAGE FETCHERS
// ==========================================

export async function getMediaDetails(type: "movie" | "tv", id: string | number) {
  return await fetchTMDB(`/${type}/${id}`);
}

export async function getMediaCast(type: "movie" | "tv", id: string | number) {
  const data = await fetchTMDB(`/${type}/${id}/credits`);
  return data.cast.slice(0, 10);
}

export async function getMediaTrailer(type: "movie" | "tv", id: string | number) {
  const data = await fetchTMDB(`/${type}/${id}/videos`);
  const trailer = data.results.find(
    (video: any) => video.site === "YouTube" && video.type === "Trailer" && video.official
  );
  
  return trailer ? trailer.key : null;
}

// ==========================================
// SEARCH ENGINE
// ==========================================

export async function searchMedia(query: string, page: number = 1) {
  const encodedQuery = encodeURIComponent(query);
  const data = await fetchTMDB("/search/multi", `&query=${encodedQuery}&page=${page}&include_adult=false`);
  
  return data.results.filter((item: any) => item.media_type === "movie" || item.media_type === "tv");
}

// ==========================================
// MOOD-BASED RECOMMENDATIONS
// ==========================================

export async function getMediaByMood(mood: string) {
  let genreIds = "";
  
  switch (mood.toLowerCase()) {
    case "happy":
      genreIds = "35,16,10751";
      break;
    case "sad":
      genreIds = "18,10752";
      break;
    case "scary":
      genreIds = "27,53,9648";
      break;
    case "romantic":
      genreIds = "10749";
      break;
    default:
      genreIds = "28,12";
  }

  const data = await fetchTMDB("/discover/movie", `&with_genres=${genreIds}&sort_by=popularity.desc&page=1`);
  return data.results;
}

export async function getMediaWatchProviders(type: "movie" | "tv", id: number) {
  try {
    const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const token = process.env.TMDB_ACCESS_TOKEN;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = token
      ? `https://api.themoviedb.org/3/${type}/${id}/watch/providers`
      : `https://api.themoviedb.org/3/${type}/${id}/watch/providers?api_key=${apiKey}`;

    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;

    const data = await res.json();
    return data.results || null;
  } catch (error) {
    console.error("Error fetching watch providers:", error);
    return null;
  }
}