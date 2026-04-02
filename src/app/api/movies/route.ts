import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

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
    let db;
    
    try {
      const { env } = getRequestContext();
      db = (env as any)?.MOVIEDB || (env as any)?.DB;
    } catch (e) {
      console.log("Running in local dev mode - getRequestContext not available");
      return NextResponse.json(
        { result: [] },
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

    if (!db) {
      return NextResponse.json(
        { error: "D1 binding not found. Expected 'MOVIEDB' or 'DB'." },
        { status: 500 }
      );
    }

    const { results } = await (db
      .prepare(
        `SELECT id, title, genre, cover, release_year
         FROM movies
         ORDER BY id DESC`
      )
      .all() as Promise<{ results: Movie[] }>);

    return NextResponse.json(
      { result: results ?? [] },
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