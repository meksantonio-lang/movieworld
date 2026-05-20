// src/app/api/adult/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

interface Adult {
  id: number;
  title: string | null;
  genre: string | null;
  cover_url: string | null;
  release_year: number | null;
  created_at?: string;
  downloads?: number;
  metadata?: any;
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env var");
}

const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

// ✅ Fetch adult items
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("media_items")
      .select("id, title, genre, cover_url, release_year, created_at, downloads")
      .eq("category", "adult")
      .order("id", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch adult items", detail: error.message }, { status: 500 });
    }

    const adultItems: Adult[] = (data as Adult[]) ?? [];
    return NextResponse.json({ result: adultItems }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Unexpected server error", detail: String(error) }, { status: 500 });
  }
}

// ✅ Insert new adult item
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const title = typeof body.title === "string" ? body.title.trim() : null;
    const download_url = typeof body.download_url === "string" ? body.download_url.trim() : null;
    const genre = typeof body.genre === "string" ? body.genre.trim() : null;
    const cover = typeof body.cover === "string" ? body.cover.trim() : null;
    const release_year = body.release_year ? Number(body.release_year) : null;
    const metadata = body.metadata ?? null;

    const mediaPayload: any = {
      title,
      category: "adult",
      download_link: download_url,
      cover_url: cover,
      genre,
      release_year,
      metadata,
      created_at: new Date().toISOString(),
      is_adult: true, // ✅ flag set
      downloads: 0,
    };

    const { data: mediaData, error: mediaError } = await supabaseAdmin
      .from("media_items")
      .insert([mediaPayload])
      .select()
      .single();

    if (mediaError) {
      console.error("Insert media_items error:", mediaError);
      return NextResponse.json({ error: "Failed to add adult item", detail: mediaError.message }, { status: 500 });
    }

    return NextResponse.json({ result: mediaData }, { status: 201 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Unexpected server error", detail: String(error) }, { status: 500 });
  }
}

// ✅ Update downloads count
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, downloads } = body;

    const { data, error } = await supabaseAdmin
      .from("media_items")
      .update({ downloads: downloads + 1 })
      .eq("id", id)
      .eq("category", "adult")
      .select();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: "Failed to update downloads", detail: error.message }, { status: 500 });
    }

    return NextResponse.json({ result: data }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Unexpected server error", detail: String(error) }, { status: 500 });
  }
}

// ✅ Handle CORS preflight
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
