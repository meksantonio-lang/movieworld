"use server";

import { searchMedia } from "@/lib/tmdb";

export async function getLiveSearchSuggestions(query: string) {
  if (!query || query.trim() === "") return [];
  
  try {
    // Fetch the search results using your existing engine
    const results = await searchMedia(query, 1);
    
    // Format the top 5 results to be ultra-lightweight for the UI dropdown
    return results.slice(0, 5).map((m: any) => ({
      id: m.id,
      title: m.title || m.name,
      // Map media_type directly to your app's routing categories
      category: m.media_type === "movie" ? "movies" : "anime", 
      // Use 'w92' for a tiny, lightning-fast thumbnail image
      image: m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : "/placeholder.png",
      year: m.release_date ? m.release_date.slice(0, 4) : m.first_air_date ? m.first_air_date.slice(0, 4) : "",
    }));
  } catch (error) {
    console.error("Live search suggestion failed:", error);
    return []; // Return empty array so the UI dropdown just stays hidden on error
  }
}