// src/app/api/tmdb-search/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const type = url.searchParams.get("type") === "tv" ? "tv" : "movie";

  if (!q) return NextResponse.json({ error: "Missing query parameter q" }, { status: 400 });
  if (q.length > 200) return NextResponse.json({ error: "Query too long" }, { status: 400 });

  const TMDB_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_KEY) return NextResponse.json({ error: "TMDB key not configured" }, { status: 500 });

  const endpoint = type === "tv" ? "search/tv" : "search/movie";
  const tmdbRes = await fetch(
    `https://api.themoviedb.org/3/${endpoint}?api_key=${TMDB_KEY}&query=${encodeURIComponent(q)}&page=1`
  );

  const body = await tmdbRes.text();

  if (!tmdbRes.ok) {
    try {
      const json = JSON.parse(body);
      return NextResponse.json(json, { status: tmdbRes.status });
    } catch {
      return NextResponse.json({ error: "TMDB error", details: body }, { status: tmdbRes.status });
    }
  }

  try {
    const json = JSON.parse(body);
    return NextResponse.json(json, { status: tmdbRes.status });
  } catch {
    return NextResponse.json({ error: "Invalid response from TMDB" }, { status: 502 });
  }
}
