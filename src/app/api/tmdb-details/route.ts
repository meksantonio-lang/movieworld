// src/app/api/tmdb-details/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const kind = url.searchParams.get("kind") === "tv" ? "tv" : "movie";

  if (!id) {
    return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
  }

  const TMDB_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_KEY) {
    return NextResponse.json({ error: "TMDB key not configured" }, { status: 500 });
  }

  try {
    const endpoint = `${kind}/${encodeURIComponent(id)}`;
    const tmdbRes = await fetch(
      `https://api.themoviedb.org/3/${endpoint}?api_key=${TMDB_KEY}&language=en-US`
    );

    if (!tmdbRes.ok) {
      const body = await tmdbRes.text();
      try {
        const json = JSON.parse(body);
        return NextResponse.json(json, { status: tmdbRes.status });
      } catch {
        return NextResponse.json({ error: "TMDB error", details: body }, { status: tmdbRes.status });
      }
    }

    const json = await tmdbRes.json();

    // ✅ Normalize fields so your UI can consume them consistently
    const normalized = {
      id: json.id,
      title: kind === "movie" ? json.title : json.name,
      category: kind,
      cover_url: json.poster_path
        ? `https://image.tmdb.org/t/p/w500${json.poster_path}`
        : "/placeholder-poster.png",
      release_year:
        kind === "movie"
          ? json.release_date
            ? String(json.release_date).slice(0, 4)
            : null
          : json.first_air_date
          ? String(json.first_air_date).slice(0, 4)
          : null,
      overview: json.overview || "",
      author: json.production_companies?.[0]?.name || "",
      genre: json.genres?.map((g: any) => g.name).join(", ") || "",
      extra_details: kind === "tv" ? `Seasons: ${json.number_of_seasons}` : `Runtime: ${json.runtime} min`,
    };

    return NextResponse.json(normalized, { status: 200 });
  } catch (err: any) {
    console.error("TMDB details error:", err);
    return NextResponse.json(
      { error: "Failed to fetch TMDB details", detail: String(err) },
      { status: 500 }
    );
  }
}
