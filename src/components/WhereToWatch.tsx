import Image from "next/image";

type Provider = {
  provider_id: number;
  provider_name: string;
  logo_path: string;
};

type WatchProvidersResponse = {
  results: {
    [countryCode: string]: {
      link: string;
      free?: Provider[];
      ads?: Provider[];
    };
  };
};

// A clean, scalable dictionary mapping streaming platforms to their search URLs
const directLinkMap: Record<string, (query: string) => string> = {
  'tubi': (q) => `https://tubitv.com/search/${q}`,
  'crunchyroll': (q) => `https://www.crunchyroll.com/search?q=${q}`,
  'pluto': (q) => `https://pluto.tv/search?q=${q}`,
  'plex': (q) => `https://watch.plex.tv/search?query=${q}`,
  'kanopy': (q) => `https://www.kanopy.com/en/search?q=${q}`,
  'roku': (q) => `https://therokuchannel.roku.com/search/${q}`,
  'peacock': (q) => `https://www.peacocktv.com/watch/search?q=${q}`,
  'retrocrush': (q) => `https://www.retrocrush.tv/search?q=${q}`,
  'vudu': (q) => `https://www.vudu.com/content/movies/search?searchString=${q}`,
  'anime-planet': (q) => `https://www.anime-planet.com/anime/all?name=${q}`,
};

function getDirectLink(providerName: string, title: string) {
  const encodedTitle = encodeURIComponent(title);
  const name = providerName.toLowerCase();

  // 1. Check if the platform exists in our map and build the premium deep link
  for (const [platform, urlBuilder] of Object.entries(directLinkMap)) {
    if (name.includes(platform)) {
      return urlBuilder(encodedTitle);
    }
  }

  // 2. The Universal Umbrella Fallback
  // If TMDB returns a legit platform we haven't mapped, run a targeted Google Search.
  return `https://www.google.com/search?q=Watch+${encodedTitle}+on+${encodeURIComponent(providerName)}`;
}

export default async function WhereToWatch({ 
  id,
  mediaType = "movie",
  movieTitle, 
  releaseYear, 
  topActor 
}: { 
  id?: string | number; 
  mediaType?: "movie" | "tv";
  movieTitle: string;
  releaseYear?: string;
  topActor?: string;
}) {
  const AMAZON_TAG = "moviewrld-20";

  const preciseQuery = [movieTitle, releaseYear, topActor].filter(Boolean).join(" ");
  const searchKeyword = encodeURIComponent(preciseQuery);
  const amazonUrl = `https://www.amazon.com/s?k=${searchKeyword}&i=instant-video&tag=${AMAZON_TAG}`;

  let freePlatforms: Provider[] = [];

  if (id) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${id}/watch/providers?api_key=${process.env.TMDB_API_KEY}`,
        { next: { revalidate: 3600 } } 
      );
      
      if (res.ok) {
        const data: WatchProvidersResponse = await res.json();
        const usProviders = data.results?.US;
        
        if (usProviders) {
          freePlatforms = [...(usProviders.free || []), ...(usProviders.ads || [])];
        }
      }
    } catch (error) {
      console.error("Failed to fetch TMDB watch providers", error);
    }
  }

  return (
    <section className="bg-gray-900 p-6 md:p-8 rounded-3xl border border-white/5 shadow-2xl max-w-4xl mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-2xl font-black text-white">Where to Watch</h3>
          <p className="text-xs text-gray-500 mt-1">Stream, rent, or buy instantly</p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        
        {freePlatforms.length > 0 && (
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-green-400">
              <span className="w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor]"></span>
              Free to Watch (With Ads)
            </h4>
            
            <div className="flex flex-wrap gap-4">
              {freePlatforms.map((provider) => {
                const directLink = getDirectLink(provider.provider_name, movieTitle);

                return (
                  <a
                    key={provider.provider_id}
                    href={directLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 transition rounded-lg p-3 group border border-gray-700 hover:border-green-500 w-full sm:w-auto"
                  >
                    <Image
                      src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                      alt={provider.provider_name}
                      width={40}
                      height={40}
                      className="rounded-md"
                    />
                    <div className="flex flex-col pr-2">
                      <span className="text-white font-medium">{provider.provider_name}</span>
                      <span className="text-xs font-bold text-green-400 tracking-wider">
                        STREAM NOW
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-[#00A8E1]">
            <span className="w-2 h-2 rounded-full bg-current"></span>
            Available to Rent or Buy
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

      </div>
    </section>
  );
}