"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  image_url: string;
  cover_image: string; // <-- Added this!
  source_type: string; // <-- Added this!
  category: string;
  slug: string;
  published_at: string;
}

export default function NewsGrid({ initialNews }: { initialNews: NewsItem[] }) {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  // If the server gave us exactly 12 items, assume there might be more. 
  const [hasMore, setHasMore] = useState(initialNews.length === 12); 

  const loadMore = async () => {
    setIsLoading(true);
    const nextPage = page + 1;
    
    // Calculate the range for Supabase (e.g., items 12 to 23)
    const start = (nextPage - 1) * 12;
    const end = start + 11;

    // Upgraded the Load More query to match the new schema!
    const { data, error } = await supabase
      .from("news_feed")
      .select("id, title, summary, image_url, cover_image, source_type, category, slug, published_at")
      .order("published_at", { ascending: false })
      .range(start, end);

    if (!error && data) {
      setNews((prev) => [...prev, ...data]); // Append new articles to the bottom
      setPage(nextPage);
      
      // If we got back less than 12 items, we've hit the end of the database!
      if (data.length < 12) {
        setHasMore(false); 
      }
    }
    setIsLoading(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map((item) => {
          // Smart fallback: Cover Image first, then API Image, then nothing
          const displayImage = item.cover_image || item.image_url;

          return (
            <Link href={`/feed/${item.slug}`} key={item.id} className="group flex flex-col bg-purple-950/30 rounded-xl overflow-hidden border border-purple-900/50 hover:border-purple-500 transition-colors">
              {/* Image Container */}
              <div className="relative h-56 w-full bg-gray-900 overflow-hidden">
                {displayImage ? (
                  <img 
                    src={displayImage} 
                    alt={item.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-purple-700 font-black text-xl uppercase tracking-widest">
                    MovieWrld
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  {item.category}
                </div>
              </div>
              
              {/* Text Content */}
              <div className="p-5 flex flex-col flex-grow">
                <h2 className="text-xl font-bold text-white leading-tight mb-3 group-hover:text-pink-400 transition-colors line-clamp-2">
                  {item.title}
                </h2>
                <p className="text-sm text-gray-400 line-clamp-3 mb-4 flex-grow">
                  {item.summary}
                </p>
                <div className="flex justify-between items-center text-xs text-purple-400 font-medium">
                  <span>
                    {new Date(item.published_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                  {/* Highlight your manual posts so users know it's exclusive! */}
                  {item.source_type === 'Manual' && (
                    <span className="text-pink-500 font-bold uppercase tracking-wider text-[10px]">Exclusive Scoop</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-16 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className="bg-purple-900/40 hover:bg-purple-700 text-white font-bold py-3 px-12 rounded-full transition-colors border border-purple-500/50 hover:border-pink-500 tracking-widest uppercase text-sm disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </>
  );
}