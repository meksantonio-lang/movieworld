// src/app/api/tmdb-search/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  if (!q) return NextResponse.json({ error: "Missing query parameter q" }, { status: 400 });
  if (q.length > 200) return NextResponse.json({ error: "Query too long" }, { status: 400 });

  const TMDB_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_KEY) return NextResponse.json({ error: "TMDB key not configured" }, { status: 500 });

  try {
    // 🔎 Search both movies and TV shows
    const [movieRes, tvRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&page=1`),
      fetch(`https://api.themoviedb.org/3/search/tv?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&page=1`),
    ]);

    const [movieData, tvData] = await Promise.all([movieRes.json(), tvRes.json()]);

    // ✅ Normalize results into a unified shape
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

    // ✅ Merge both sets
    return NextResponse.json({ results: [...movies, ...tvShows] });
  } catch (err: any) {
    console.error("TMDB search error:", err);
    return NextResponse.json({ error: "Failed to fetch TMDB data", detail: String(err) }, { status: 500 });
  }
}
