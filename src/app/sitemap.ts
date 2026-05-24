import { MetadataRoute } from 'next'
import { supabase } from "@/lib/supabaseClient";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://moviewrld.com";

  // Fetch all your media items
  const { data: items } = await supabase
    .from("media_items")
    .select("id, category, created_at");

  // Define static routes with explicit typing
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    // You can add more objects here later like { url: `${baseUrl}/contact`, ... }
  ];

  if (!items) return staticUrls;

  // Define dynamic routes from database with explicit typing
  const dynamicUrls: MetadataRoute.Sitemap = items.map((item) => {
    // Map "movies" category to your singular "/movie/[id]" route, leave others as is
    const routeCategory = item.category === "movies" ? "movie" : item.category;
    
    return {
      url: `${baseUrl}/${routeCategory}/${item.id}`,
      lastModified: item.created_at ? new Date(item.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    };
  });

  return [...staticUrls, ...dynamicUrls];
}