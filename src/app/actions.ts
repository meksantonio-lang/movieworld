"use server";

import { searchMedia, getMediaByMood } from "@/lib/tmdb";

export async function getLiveSearchSuggestions(query: string) {
  if (!query || query.trim() === "") return [];
  
  try {
    const results = await searchMedia(query, 1);
    
    return results.slice(0, 5).map((m: any) => {
      // Dynamic category routing
      const isMovie = m.media_type === "movie" || typeof m.release_date === "string" || (m.title && !m.name);
      const linkCategory = isMovie ? "movies" : "anime";

      // Safe year extraction
      const year = m.release_date?.substring(0, 4) || m.first_air_date?.substring(0, 4) || "";

      return {
        id: m.id,
        title: m.title || m.name,
        linkCategory: linkCategory, 
        displayCategory: m.media_type === "tv" ? "TV Show" : "Movie",
        image: m.poster_path 
          ? `https://image.tmdb.org/t/p/w92${m.poster_path}` 
          : "https://via.placeholder.com/92x138/111827/a855f7?text=No+Image",
        year: year,
      };
    });
  } catch (error) {
    console.error("Live search suggestion failed:", error);
    return []; 
  }
}

export async function fetchMoodRecommendations(mood: string) {
  try {
    const results = await getMediaByMood(mood);
    
    // Format the top 10 results perfectly for your MediaCard component
    return results.slice(0, 10).map((m: any) => {
      const isMovie = m.media_type === "movie" || typeof m.release_date === "string" || (m.title && !m.mal_id);
      const linkCategory = isMovie ? "movies" : "anime"; 
      
      const image = m.poster_path 
        ? `https://image.tmdb.org/t/p/w500${m.poster_path}` 
        : "https://via.placeholder.com/500x750/111827/a855f7?text=No+Poster";
        
      const year = m.release_date?.substring(0, 4) || m.first_air_date?.substring(0, 4) || "";

      return {
        id: m.id || m.mal_id,
        title: m.title || m.name,
        category: linkCategory, 
        image: image,
        releaseYear: year,
      };
    });
  } catch (error) {
    console.error("Mood fetch failed:", error);
    return []; 
  }
}