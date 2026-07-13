import { MetadataRoute } from 'next'
import { supabase } from "@/lib/supabaseClient";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://moviewrld.com";

  // 1. Fetch all Local Media Items and News Articles concurrently
  const [mediaResponse, newsResponse] = await Promise.all([
    supabase.from("media_items").select("id, category, created_at"),
    supabase.from("news_feed").select("slug, published_at")
  ]);

  const items = mediaResponse.data || [];
  const newsArticles = newsResponse.data || [];

  // 2. Define Core Hub Routes (The high-priority pages)
  const staticUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'always', priority: 1.0 },
    { url: `${baseUrl}/feed`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/movies`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/anime`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/kdrama`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'always', priority: 0.7 },
  ];

  // 3. Define Dynamic Media Routes (Locally saved Movies, TV, Anime)
  const dynamicMediaUrls: MetadataRoute.Sitemap = items.map((item) => ({
    // Perfectly matches your app/[category]/[id] structure
    url: `${baseUrl}/${item.category}/${item.id}`,
    lastModified: item.created_at ? new Date(item.created_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 4. Define Dynamic News Article Routes (Crucial for SEO traffic!)
  const dynamicNewsUrls: MetadataRoute.Sitemap = newsArticles.map((article) => ({
    // FIXED: Maps to your actual Next.js /feed/[slug] folder structure!
    url: `${baseUrl}/feed/${article.slug}`,
    lastModified: article.published_at ? new Date(article.published_at) : new Date(),
    changeFrequency: 'monthly', // Changed from 'never' so Google indexes new user comments/likes
    priority: 0.8,
  }));

  // Combine them all and serve to Google
  return [...staticUrls, ...dynamicMediaUrls, ...dynamicNewsUrls];
}