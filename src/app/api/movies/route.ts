// src/app/api/movies/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

interface Movie {
  id: number;
  title: string | null;
  genre: string | null;
  cover: string | null;
  release_year: number | null;
  created_at?: string;
  downloads?: number;
  tmdb_id?: number | null;
}

// Use server-only keys. Set SUPABASE_SERVICE_ROLE_KEY in .env.local (do NOT expose this to clients).
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // Fail fast at import time so developer sees missing config
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var");
}

const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("movies")
      .select("id, title, genre, cover, release_year, created_at, downloads")
      .order("id", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch movies", detail: error.message },
        { status: 500 }
      );
    }

    const movies: Movie[] = (data as Movie[]) ?? [];
    return NextResponse.json({ result: movies }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Unexpected server error", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Minimal validation
    const title = typeof body.title === "string" ? body.title.trim() : null;
    const download_url = typeof body.download_url === "string" ? body.download_url.trim() : null;
    const genre = typeof body.genre === "string" ? body.genre.trim() : null;
    const cover = typeof body.cover === "string" ? body.cover.trim() : null;
    const release_year = body.release_year ? Number(body.release_year) : null;
    const tmdb_id = body.tmdb_id ? Number(body.tmdb_id) : null;
    const metadata = body.metadata ?? null; // optional JSON object

    // Build payload for movies table (if you still want to keep it)
    const moviePayload: any = {
      title,
      genre,
      cover,
      release_year,
      download_url,
      created_at: new Date().toISOString(),
      downloads: 0,
      source_table: "movies",
    };

    // Build canonical media_items payload
    const mediaPayload: any = {
      title,
      tmdb_id: tmdb_id ?? null,
      category: "movies",
      download_link: download_url,
      cover_url: cover,
      genre: genre,
      release_year: release_year ?? null,
      metadata: metadata ?? null,
      created_at: new Date().toISOString(),
    };

    // Insert into media_items first (canonical)
    const { data: mediaData, error: mediaError } = await supabaseAdmin
      .from("media_items")
      .insert([mediaPayload])
      .select()
      .single();

    if (mediaError) {
      console.error("Insert media_items error:", mediaError);
      return NextResponse.json(
        { error: "Failed to add media item", detail: mediaError.message },
        { status: 500 }
      );
    }

    // Optionally also insert into movies table to preserve legacy behavior
    // If you don't want to keep the movies table, remove this block.
    const { data: moviesData, error: moviesError } = await supabaseAdmin
      .from("movies")
      .insert([moviePayload])
      .select();

    if (moviesError) {
      // Log the error but still return success for media_items insertion.
      console.warn("Warning: inserted media_items but failed to insert into movies table:", moviesError);
    }

    return NextResponse.json({ result: mediaData }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Unexpected server error", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, downloads } = body;

    const { data, error } = await supabaseAdmin
      .from("movies")
      .update({ downloads: downloads + 1 })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { error: "Failed to update downloads", detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: data }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Unexpected server error", detail: String(error) },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
