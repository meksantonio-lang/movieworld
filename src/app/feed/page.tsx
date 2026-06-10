import { createClient } from '@supabase/supabase-js';
import NewsGrid from '@/components/NewsGrid';

// This forces Next.js to ALWAYS fetch fresh data instead of using a cached snapshot
export const dynamic = "force-dynamic";

// Initialize Supabase admin client for server-side fetching
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function FeedPage() {
  // Fetch ONLY the first 12 news items for the initial, lightning-fast server render
  const { data: initialNews, error } = await supabase
    .from('news_feed')
    .select('id, title, summary, image_url, category, slug, published_at')
    .order('published_at', { ascending: false })
    .limit(12);

  if (error) {
    return <div className="text-white text-center py-20">Error loading the feed.</div>;
  }

  return (
    <main className="min-h-screen bg-black py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2">
          The Feed
        </h1>
        <p className="text-purple-300 mb-10 font-medium tracking-wide">
          Latest headlines, gossip, and release dates.
        </p>

        {/* The Client Component takes over from here! */}
        <NewsGrid initialNews={initialNews || []} />
      </div>
    </main>
  );
}