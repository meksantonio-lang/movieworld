// src/app/api/autofill-music/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { artist, track } = await req.json();

    if (!artist || !track) {
      return NextResponse.json({ error: "Missing artist or track" }, { status: 400 });
    }

    // 1. Try recording search
    const recQuery = `artist:${encodeURIComponent(artist)} AND recording:${encodeURIComponent(track)}`;
    const recUrl = `https://musicbrainz.org/ws/2/recording/?query=${recQuery}&fmt=json`;

    console.log("MusicBrainz recording search URL:", recUrl);

    const recResp = await fetch(recUrl, { headers: { "User-Agent": "Movieworld/1.0 (antonio@example.com)" } });
    const recJson = await recResp.json();

    console.log("Recording search response:", JSON.stringify(recJson, null, 2));

    if (recJson.recordings && recJson.recordings.length > 0) {
      const rec = recJson.recordings[0];
      const release = rec.releases?.[0];
      let coverUrl = "";
      if (release?.id) {
        coverUrl = `https://coverartarchive.org/release/${release.id}/front-250.jpg`;
      }
      return NextResponse.json({
        title: rec.title,
        artist: rec["artist-credit"]?.[0]?.name || artist,
        album: release?.title || "",
        releaseYear: release?.date ? release.date.split("-")[0] : "",
        coverUrl,
        genre: "",
      });
    }

    // 2. If no recording match, try release search
    const relQuery = `artist:${encodeURIComponent(artist)} AND release:${encodeURIComponent(track)}`;
    const relUrl = `https://musicbrainz.org/ws/2/release/?query=${relQuery}&fmt=json`;

    console.log("MusicBrainz release search URL:", relUrl);

    const relResp = await fetch(relUrl, { headers: { "User-Agent": "Movieworld/1.0 (antonio@example.com)" } });
    const relJson = await relResp.json();

    console.log("Release search response:", JSON.stringify(relJson, null, 2));

    if (relJson.releases && relJson.releases.length > 0) {
      const release = relJson.releases[0];
      let coverUrl = "";
      if (release.id) {
        coverUrl = `https://coverartarchive.org/release/${release.id}/front-250.jpg`;
      }
      return NextResponse.json({
        title: release.title,
        artist: release["artist-credit"]?.[0]?.name || artist,
        album: release.title,
        releaseYear: release.date ? release.date.split("-")[0] : "",
        coverUrl,
        genre: "",
      });
    }

    return NextResponse.json({ error: "No match found in MusicBrainz" }, { status: 404 });
  } catch (err: any) {
    console.error("MusicBrainz error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
