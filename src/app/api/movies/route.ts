import { NextResponse } from "next/server";

export const runtime = "edge";

type Movie = {
  id: number;
  title: string;
  genre: string;
  cover: string | null;
  release_year: number | null;
};

export async function GET() {
  try {
    // TODO: Replace with your actual database client for Vercel (e.g., Supabase, PlanetScale, Neon, etc.)
    // For now, return an empty result to keep the route working.
    const results: Movie[] = [];

    return NextResponse.json(
      { result: results },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies", detail: String(error) },
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
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
