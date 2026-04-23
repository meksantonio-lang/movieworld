// pages/api/fetch-cover.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { fetchAndSaveCover } from "../../server/utils/fetchAndSaveCover";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { songId, artist, album } = req.body ?? {};

  if (!songId || !artist || !album) {
    return res.status(400).json({ error: "Missing required fields: songId, artist, album" });
  }

  try {
    const result = await fetchAndSaveCover({
      songId: Number(songId),
      artist: String(artist),
      album: String(album),
    });

    if (!result.ok) {
      return res.status(500).json({ ok: false, error: result.reason ?? result.error ?? "fetch_failed", details: result });
    }

    return res.status(200).json({ ok: true, publicUrl: result.publicUrl ?? null });
  } catch (err) {
    console.error("API /api/fetch-cover error:", err);
    return res.status(500).json({ ok: false, error: "internal_server_error" });
  }
}
