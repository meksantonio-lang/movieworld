// pages/api/lookup-music.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { lookupMusicByArtistAndAlbum } from "../../server/utils/lookupMusic";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const { artist, album } = req.body ?? {};
  if (!artist || !album) return res.status(400).json({ ok: false, error: "Missing artist or album" });

  try {
    const THEAUDIODB_API_KEY = process.env.THEAUDIODB_API_KEY ?? "1";
    const result = await lookupMusicByArtistAndAlbum(String(artist), String(album), THEAUDIODB_API_KEY);
    if (!result.ok) return res.status(404).json(result);
    return res.status(200).json(result);
  } catch (err) {
    console.error("lookup-music error:", err);
    return res.status(500).json({ ok: false, error: "internal_server_error" });
  }
}
