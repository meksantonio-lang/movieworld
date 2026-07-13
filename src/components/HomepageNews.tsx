import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function HomepageNews() {
  const { data: news, error } = await supabase
    .from('news_feed')
    .select('id, title, summary, image_url, cover_image, category, slug, published_at, is_manual_entry')
    .or('category.eq.Hollywood,is_manual_entry.eq.true') 
    .order('published_at', { ascending: false })
    .limit(3);

  if (error || !news || news.length === 0) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-6">Trending News</h2>
        <div className="text-purple-400 bg-purple-950/20 p-6 rounded-xl border border-purple-900/50">
          Waiting for the latest scoops... Run your sync API!
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Latest Scoops</h2>
          <p className="text-pink-400 font-medium tracking-wide mt-1">From Hollywood & Beyond</p>
        </div>
        <Link 
          href="/feed" 
          className="text-sm font-bold text-purple-400 hover:text-pink-400 transition-colors uppercase tracking-wider"
        >
          See All News &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {news.map((item) => {
          const displayImage = item.cover_image || item.image_url;
          const isExclusive = item.is_manual_entry === true;

          return (
            <Link href={`/feed/${item.slug}`} key={item.id} className="group cursor-pointer flex flex-col bg-purple-950/20 rounded-xl overflow-hidden border border-purple-900/50 hover:border-pink-500/50 transition-colors">
              {/* FIXED: Increased height to h-64 for better vertical support */}
              <div className="relative h-64 w-full bg-gray-950 overflow-hidden flex items-center justify-center">
                {displayImage ? (
                  /* FIXED: Swapped object-cover for object-contain to stop cropping */
                  <img 
                    src={displayImage} 
                    alt={item.title} 
                    className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-purple-700 font-black text-xl uppercase tracking-widest">
                    MovieWrld
                  </div>
                )}
                
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                  <span className="bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg w-max">
                    {item.category}
                  </span>
                  
                  {isExclusive && (
                     <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded w-max border border-purple-400/50">
                       EXCLUSIVE
                     </span>
                  )}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white leading-tight mb-2 group-hover:text-pink-400 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {item.summary}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}