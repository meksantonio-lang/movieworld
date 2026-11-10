import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface RelatedScoopsProps {
  mediaId: number;
}

export default async function RelatedScoops({ mediaId }: RelatedScoopsProps) {
  // Queries the news_feed where the array of related_media_ids contains the current page's mediaId
  const { data: scoops, error } = await supabase
    .from("news_feed")
    .select("id, title, image_url, created_at") // Adjust these column names if your database uses different ones
    .contains("related_media_ids", [mediaId])
    .order("created_at", { ascending: false })
    .limit(3);

  // If there are no related scoops, the component renders nothing, keeping the UI clean
  if (error || !scoops || scoops.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
        <span className="text-2xl">🔥</span>
        <h3 className="text-2xl font-bold text-white uppercase tracking-widest">
          Related Editorials
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scoops.map((scoop) => (
          <Link 
            key={scoop.id} 
            href={`/news/${scoop.id}`} // Adjust this path if your news articles are routed differently
            className="group block bg-gray-900 rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-900/20"
          >
            <div className="aspect-video w-full overflow-hidden bg-gray-800">
              {scoop.image_url ? (
                <img 
                  src={scoop.image_url} 
                  alt={scoop.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold uppercase tracking-widest text-xs">
                  Moviewrld Scoop
                </div>
              )}
            </div>
            <div className="p-5">
              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest mb-2 block">
                {new Date(scoop.created_at).toLocaleDateString()}
              </span>
              <h4 className="text-white font-bold leading-snug group-hover:text-purple-400 transition-colors line-clamp-2">
                {scoop.title}
              </h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}