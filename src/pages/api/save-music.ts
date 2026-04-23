// pages/api/save-music.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { saveMusicAndCover } from "../../server/utils/saveMusicAndCover";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
  try {
    const payload = req.body ?? {};
    // map client naming to server expected fields (download_url -> download_link)
    if (payload.download_url && !payload.download_link) payload.download_link = payload.download_url;

    const result = await saveMusicAndCover(payload);
    if (!result.ok) return res.status(500).json({ ok: false, error: result.error });
    return res.status(200).json({ ok: true, id: result.id, poster_path: result.poster_path, poster_thumb: result.poster_thumb });
  } catch (err: any) {
    console.error("save-music error:", err);
    return res.status(500).json({ ok: false, error: err.message || "internal_error" });
  }
}
