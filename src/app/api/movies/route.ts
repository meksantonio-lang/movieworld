import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

interface Movie {
  id: number;
  title: string;
  genre: string;
  cover: string | null;
  release_year: number | null;
  created_at?: string;
  downloads?: number;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const { data, error } = await supabase
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
    const { title, genre, cover, release_year, download_url } = body;

    const { data, error } = await supabase
      .from("movies")
      .insert([
        {
          title,
          genre,
          cover,
          release_year,
          download_url,
          created_at: new Date().toISOString(),
          downloads: 0,
          source_table: "movies", // ✅ safe column name
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to add movie", detail: error.message },
        { status: 500 }
      );
    }

    const movies: Movie[] = (data as Movie[]) ?? [];
    return NextResponse.json({ result: movies }, { status: 201 });
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

    const { data, error } = await supabase
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
