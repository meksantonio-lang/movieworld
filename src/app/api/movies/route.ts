import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

interface Movie {
  id: number;
  title: string;
  genre: string;
  cover: string | null;
  release_year: number | null;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("movies") // no generic here
      .select("id, title, genre, cover, release_year")
      .order("id", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch movies", detail: error.message },
        { status: 500 }
      );
    }

    // Explicitly cast to Movie[]
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
    const { title, genre, cover, release_year } = body;

    const { data, error } = await supabase
      .from("movies")
      .insert([{ title, genre, cover, release_year }])
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

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
