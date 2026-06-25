"use server";

import { searchMedia } from "@/lib/tmdb";

export async function getLiveSearchSuggestions(query: string) {
  if (!query || query.trim() === "") return [];
  
  try {
    const results = await searchMedia(query, 1);
    
    return results.slice(0, 5).map((m: any) => ({
      id: m.id,
      title: m.title || m.name,
      // All TMDB results go to the movies folder so your dynamic page can fetch them
      linkCategory: "movies", 
      // Accurately label TV shows vs Movies for the UI
      displayCategory: m.media_type === "tv" ? "TV Show" : "Movie",
      // Fallback to a reliable remote placeholder if TMDB has no image
      image: m.poster_path 
        ? `https://image.tmdb.org/t/p/w92${m.poster_path}` 
        : "https://via.placeholder.com/92x138/111827/a855f7?text=No+Image",
      year: m.release_date ? m.release_date.slice(0, 4) : m.first_air_date ? m.first_air_date.slice(0, 4) : "",
    }));
  } catch (error) {
    console.error("Live search suggestion failed:", error);
    return []; 
  }
}