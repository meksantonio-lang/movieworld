export async function fetchTMDB(endpoint: string): Promise<any> {
  const res = await fetch(
    `https://api.themoviedb.org/3/${endpoint}?api_key=${process.env.TMDB_API_KEY}&language=en-US`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch TMDB data");
  }

  return res.json();
}

// ✅ Unified search for both movies and TV shows
export async function searchTMDB(query: string) {
  try {
    const movieData = await fetchTMDB(`search/movie&query=${encodeURIComponent(query)}`);
    const tvData = await fetchTMDB(`search/tv&query=${encodeURIComponent(query)}`);

    const movies =
      movieData.results?.map((m: any) => ({
        id: m.id,
        title: m.title,
        category: "movie",
        cover_url: m.poster_path
          ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
          : "/placeholder-poster.png",
        releaseYear: m.release_date ? String(m.release_date).slice(0, 4) : null,
        overview: m.overview || "",
      })) || [];

    const tvShows =
      tvData.results?.map((t: any) => ({
        id: t.id,
        title: t.name,
        category: "tv",
        cover_url: t.poster_path
          ? `https://image.tmdb.org/t/p/w500${t.poster_path}`
          : "/placeholder-poster.png",
        releaseYear: t.first_air_date ? String(t.first_air_date).slice(0, 4) : null,
        overview: t.overview || "",
      })) || [];

    return [...movies, ...tvShows];
  } catch (err) {
    console.error("TMDB search error:", err);
    return [];
  }
}
