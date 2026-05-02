import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    // Step 1: Get Spotify token
    const tokenResp = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenResp.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Failed to get Spotify token" },
        { status: 500 }
      );
    }

    // Step 2: Search Spotify for up to 5 tracks
    const searchResp = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=track&limit=5`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const searchData = await searchResp.json();
    if (!searchData.tracks || searchData.tracks.items.length === 0) {
      return NextResponse.json({ error: "No track found" }, { status: 404 });
    }

    // Step 3: Return simplified metadata for each match
    const tracks = searchData.tracks.items.map((track: any) => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map((a: any) => a.name).join(", "),
      album: track.album?.name || "",
      release_date: track.album?.release_date || "",
      cover_url: track.album?.images[0]?.url || "",
      genre: "", // Spotify doesn’t provide per-track genre
    }));

    return NextResponse.json({ tracks });
  } catch (err) {
    console.error("Spotify API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
