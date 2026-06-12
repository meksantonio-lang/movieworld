import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticlePage({ params }: PageProps) {
  // ✅ Await the dynamic parameters to satisfy Next.js 15 async requirements
  const resolvedParams = await params;

  // Fetch the specific article matching the URL slug
  const { data: article, error } = await supabase
    .from('news_feed')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .single();

  if (error || !article) {
    notFound(); // Triggers the Next.js 404 page if the article doesn't exist
  }

  // Determine the best cover image to show
  const displayImage = article.cover_image || article.image_url;

  // Clean the text: Replace non-breaking spaces with normal spaces so words wrap naturally
  const rawContent = article.content || article.summary || "";
  const cleanContent = rawContent.replace(/&nbsp;/g, ' ');

  return (
    <main className="min-h-screen bg-black py-10 px-4 md:px-8">
      <article className="max-w-4xl mx-auto bg-purple-950/20 border border-purple-900/50 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Back Button */}
        <div className="p-6 pb-0">
          <Link href="/feed" className="inline-flex items-center text-purple-400 hover:text-pink-400 transition-colors font-medium text-sm mb-6">
            &larr; Back to The Feed
          </Link>
        </div>

        {/* Header Section */}
        <div className="px-6 md:px-12 pt-4 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {article.category}
            </span>
            <span className="text-gray-400 text-sm font-medium">
              {new Date(article.published_at).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
            {article.title}
          </h1>
        </div>

        {/* Feature Image */}
        {displayImage && (
          <div className="w-full h-[400px] md:h-[500px] relative bg-gray-900">
            <img 
              src={displayImage} 
              alt={article.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="px-6 md:px-12 py-10">
          
         {/* THE UPGRADED RICH TEXT RENDERER */}
          <div 
            className="prose prose-invert prose-lg max-w-none text-gray-300 whitespace-pre-wrap
              [&_img]:w-full [&_img]:rounded-xl [&_img]:my-8 [&_img]:shadow-2xl [&_img]:border [&_img]:border-white/10"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />

          {/* Source Link for API-pulled articles */}
          {article.source_url && (
            <div className="mt-12 pt-8 border-t border-purple-900/50">
              <p className="text-gray-400 mb-4">This story was aggregated from an external source.</p>
              <a 
                href={article.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-purple-700 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
              >
                Read Full Story on {article.source_type}
              </a>
            </div>
          )}
        </div>
      </article>
    </main>
  );
}