export async function fetchTMDB(endpoint: string): Promise<any> {
  const res = await fetch(
    `https://api.themoviedb.org/3/${endpoint}?api_key=${process.env.TMDB_API_KEY}&language=en-US`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch TMDB data");
  }

  return res.json();
}
