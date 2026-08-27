"use client";

export default function WhereToWatch({ 
  movieTitle, 
  releaseYear, 
  topActor 
}: { 
  movieTitle: string;
  releaseYear?: string;
  topActor?: string;
}) {
  const AMAZON_TAG = "moviewrld-20";

  // 1. Combine the title, year, and actor into one highly specific search string
  // filter(Boolean) automatically removes the year or actor if they happen to be missing
  const preciseQuery = [movieTitle, releaseYear, topActor].filter(Boolean).join(" ");
  
  // 2. Encode the string so spaces become valid URL characters
  const searchKeyword = encodeURIComponent(preciseQuery);
  
  // 3. The upgraded universal Amazon Prime Video affiliate link
  const amazonUrl = `https://www.amazon.com/s?k=${searchKeyword}&i=instant-video&tag=${AMAZON_TAG}`;

  return (
    <section className="bg-gray-900 p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl max-w-4xl mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-2xl font-black text-white">Where to Watch</h3>
          <p className="text-xs text-gray-500 mt-1">Stream, rent, or buy instantly</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-[#00A8E1]">
          <span className="w-2 h-2 rounded-full bg-current"></span>
          Available on Amazon Prime
        </h4>
        
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-between w-full sm:w-max gap-4 bg-[#00A8E1]/10 hover:bg-[#00A8E1] border border-[#00A8E1]/30 hover:border-[#00A8E1] rounded-xl px-6 py-4 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-[#00A8E1] group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.707 3.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 11.414V19a2 2 0 002 2h4a1 1 0 001-1v-4h2v4a1 1 0 001 1h4a2 2 0 002-2v-7.586l-.707.707a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-lg font-bold text-white tracking-wide">Get on Amazon</span>
          </div>
          <svg className="w-5 h-5 text-[#00A8E1] group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </section>
  );
}