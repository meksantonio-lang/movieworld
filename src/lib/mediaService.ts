// src/lib/mediaService.ts
import { supabase } from "@/lib/supabaseClient";

export async function saveMovieDetails(id: string, tmdbData: any) {
  const { error } = await supabase
    .from("media_items")
    .update({ details: tmdbData })
    .eq("id", id);

  if (error) {
    console.error("Error saving details:", error);
  } else {
    console.log("Details saved successfully");
  }
}
