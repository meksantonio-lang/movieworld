// src/app/api/tmdb-details/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const kind = url.searchParams.get("kind") === "tv" ? "tv" : "movie";

  if (!id) return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });

  const TMDB_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_KEY) return NextResponse.json({ error: "TMDB key not configured" }, { status: 500 });

  const endpoint = kind === "movie" ? `movie/${encodeURIComponent(id)}` : `tv/${encodeURIComponent(id)}`;
  const tmdbRes = await fetch(`https://api.themoviedb.org/3/${endpoint}?api_key=${TMDB_KEY}`);

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
