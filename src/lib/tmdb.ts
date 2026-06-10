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
  const data = await fetchTMDB("/discover/tv", `&with_original_language=ja&with_genres=16&sort_by=popularity.desc&page=${page}`);
  return data.results;
}

export async function getTrendingKDramas(page: number = 1) {
  const data = await fetchTMDB("/discover/tv", `&with_original_language=ko&sort_by=popularity.desc&page=${page}`);
  return data.results;
}

// ==========================================
// INDIVIDUAL MEDIA PAGE FETCHERS
// ==========================================

export async function getMediaDetails(type: "movie" | "tv", id: string | number) {
  // Fetches synopsis, runtime, genres, and high-res posters
  return await fetchTMDB(`/${type}/${id}`);
}

export async function getMediaCast(type: "movie" | "tv", id: string | number) {
  // Fetches the cast list and character names
  const data = await fetchTMDB(`/${type}/${id}/credits`);
  // Return only the top 10 cast members to keep the UI clean
  return data.cast.slice(0, 10);
}

export async function getMediaTrailer(type: "movie" | "tv", id: string | number) {
  // Fetches all connected videos, filters specifically for official YouTube trailers
  const data = await fetchTMDB(`/${type}/${id}/videos`);
  const trailer = data.results.find(
    (video: any) => video.site === "YouTube" && video.type === "Trailer" && video.official
  );
  
  // Returns the YouTube embed key (e.g., 'dQw4w9WgXcQ') or null if no trailer exists
  return trailer ? trailer.key : null;
}
// ==========================================
// SEARCH ENGINE
// ==========================================

export async function searchMedia(query: string, page: number = 1) {
  // We use URLSearchParams to safely encode the user's search query (e.g. spaces become %20)
  const encodedQuery = encodeURIComponent(query);
  const data = await fetchTMDB("/search/multi", `&query=${encodedQuery}&page=${page}&include_adult=false`);
  
  // Filter out actors/directors, we only want to show Movies and TV Shows
  return data.results.filter((item: any) => item.media_type === "movie" || item.media_type === "tv");
}