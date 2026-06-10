import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client (Bypasses Row Level Security to allow inserts)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Normalizer: standardizes different API responses into our schema format
function normalizeArticle(item: any, source: 'NewsAPI' | 'Jikan') {
  if (source === 'NewsAPI') {
    const title = item.title || 'Untitled Hollywood News';
    return {
      title: title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      summary: item.description || 'No description available.',
      content: item.content || item.description || '',
      image_url: item.urlToImage || null,
      source_url: item.url || `https://newsapi.org/${Math.random()}`,
      source_type: 'NewsAPI',
      category: 'Hollywood',
      // NewsAPI articles always have a clear publishing timestamp
      published_at: item.publishedAt ? new Date(item.publishedAt).toISOString() : new Date().toISOString(),
    };
  } else {
    // Jikan API layout mapping
    const title = item.entry?.title ? `Trending Now: ${item.entry.title}` : 'Anime Update';
    const episodeTitle = item.episodes?.[0]?.title;
    const summary = episodeTitle ? `Latest episode available: ${episodeTitle}` : 'A new anime update is trending.';
    const sourceUrl = item.episodes?.[0]?.url || item.entry?.url || `https://myanimelist.net/anime/${Math.random()}`;

    // Look for a date from the API if it exists, otherwise fall back to a past date so it sits at the bottom
    const apiDate = item.published_at || item.date;
    const fallbackPastDate = new Date('2026-01-01').toISOString(); 

    return {
      title: title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 7),
      summary: summary,
      content: summary,
      image_url: item.entry?.images?.jpg?.large_image_url || item.entry?.images?.jpg?.image_url || null,
      source_url: sourceUrl,
      source_type: 'Jikan',
      category: 'Anime',
      published_at: apiDate ? new Date(apiDate).toISOString() : fallbackPastDate, 
    };
  }
}

// The GET handler that runs when the API route is hit
export async function GET() {
  // --- CRON SECURITY CHECK ---
  const headersList = await headers();
  // If deployed on Vercel in production, ensure the request is coming from their Cron service
  if (
    process.env.NODE_ENV === 'production' && 
    headersList.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized Cron Request' }, { status: 401 });
  }
  // ---------------------------

  try {
    // 1. Fetch from NewsAPI (Troubleshooting version with headers and logging)
    console.log("Fetching NewsAPI with key:", process.env.NEWS_API_KEY ? "Key exists" : "KEY MISSING");
    
    const newsApiRes = await fetch(
      `https://newsapi.org/v2/everything?q=hollywood+OR+movie+OR+celebrity&language=en&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`,
      {
        headers: {
          'User-Agent': 'MovieWrld-App/1.0', // NewsAPI requires a User-Agent now
        }
      }
    );
    const newsData = await newsApiRes.json();
    
    // Log the exact response from NewsAPI to catch silent failures
    if (newsData.status === 'error') {
      console.error("NewsAPI Error:", newsData.message);
    }
    
    // 2. Fetch from Jikan (Anime News)
    const jikanRes = await fetch('https://api.jikan.moe/v4/watch/episodes/popular'); 
    const jikanData = await jikanRes.json();

    const normalizedArticles = [
      ...(newsData.articles || []).map((a: any) => normalizeArticle(a, 'NewsAPI')),
      ...(jikanData.data || []).map((a: any) => normalizeArticle(a, 'Jikan'))
    ];

    // 3. Upsert to Supabase
    const { error } = await supabase
      .from('news_feed')
      .upsert(normalizedArticles, { onConflict: 'source_url' });

    if (error) throw error;
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: `Successfully synced ${normalizedArticles.length} articles.` 
    }, { status: 200 });

  } catch (err) {
    console.error('Sync failed:', err);
    return NextResponse.json({ success: false, error: 'Failed to sync news feed' }, { status: 500 });
  }
}