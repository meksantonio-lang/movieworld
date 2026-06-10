"use server";

import { searchMedia } from "@/lib/tmdb";

export async function getLiveSearchSuggestions(query: string) {
  if (!query) return [];
  
  // Fetch the search results using your existing engine
  const results = await searchMedia(query, 1);
  
  // Only return the top 5 results for the dropdown menu so it doesn't get too long
  return results.slice(0, 5); 
}