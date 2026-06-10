import { MetadataRoute } from 'next'
import { supabase } from "@/lib/supabaseClient";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://moviewrld.com";

  // 1. Fetch all Media Items concurrently with News Articles for faster build times
  const [mediaResponse, newsResponse] = await Promise.all([
    supabase.from("media_items").select("id, category, created_at"),
    supabase.from("news_feed").select("slug, published_at")
  ]);

  const items = mediaResponse.data || [];
  const newsArticles = newsResponse.data || [];

  // 2. Define Core Hub Routes (The high-priority pages)
  const staticUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/feed`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/movies`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/anime`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/kdrama`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ];

  // 3. Define Dynamic Media Routes (Movies, TV, Anime)
  const dynamicMediaUrls: MetadataRoute.Sitemap = items.map((item) => ({
    // Perfectly matches your app/[category]/[id] structure
    url: `${baseUrl}/${item.category}/${item.id}`,
    lastModified: item.created_at ? new Date(item.created_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 4. Define Dynamic News Article Routes (Crucial for SEO traffic!)
  const dynamicNewsUrls: MetadataRoute.Sitemap = newsArticles.map((article) => ({
    url: `${baseUrl}/news/${article.slug}`,
    lastModified: article.published_at ? new Date(article.published_at) : new Date(),
    changeFrequency: 'never', // News articles usually don't change after publication
    priority: 0.8,
  }));

  // Combine them all and serve to Google
  return [...staticUrls, ...dynamicMediaUrls, ...dynamicNewsUrls];
}