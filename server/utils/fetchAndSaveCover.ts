// server/utils/fetchAndSaveCover.ts
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE!; // MUST be server-only
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

async function fetchMusicBrainzReleaseMBID(artist: string, album: string) {
  const q = encodeURIComponent(`artist:${artist} AND release:${album}`);
  const res = await fetch(`https://musicbrainz.org/ws/2/release/?query=${q}&fmt=json`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.releases?.[0]?.id ?? null;
}

async function fetchCoverArtUrlByMBID(mbid: string) {
  const res = await fetch(`https://coverartarchive.org/release/${mbid}/`);
  if (!res.ok) return null;
  const json = await res.json();
  const front = json.images?.find((i: any) => i.front) ?? json.images?.[0];
  return front?.image ?? null;
}

async function fetchTheAudioDBCover(artist: string, album: string, apiKey = "1") {
  const url = `https://theaudiodb.com/api/v1/json/${apiKey}/searchalbum.php?s=${encodeURIComponent(artist)}&a=${encodeURIComponent(album)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  return json.album?.[0]?.strAlbumThumb ?? null;
}

export async function fetchAndSaveCover({
  songId,
  artist,
  album,
}: {
  songId: number;
  artist: string;
  album: string;
}) {
  // 1) Try MusicBrainz -> Cover Art Archive
  const mbid = await fetchMusicBrainzReleaseMBID(artist, album);
  let coverUrl = mbid ? await fetchCoverArtUrlByMBID(mbid) : null;

  // 2) Fallback to TheAudioDB
  if (!coverUrl) coverUrl = await fetchTheAudioDBCover(artist, album);

  if (!coverUrl) return { ok: false, reason: "no-cover-found" };

  // 3) Download and upload to Supabase Storage (recommended)
  const imgRes = await fetch(coverUrl);
  if (!imgRes.ok) return { ok: false, reason: "download-failed" };
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  const ext = (imgRes.headers.get("content-type") || "image/jpeg").split("/")[1] || "jpg";
  const filePath = `covers/music/${songId}-${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("covers")
    .upload(filePath, buffer, { contentType: imgRes.headers.get("content-type") || "image/jpeg", upsert: false });

  let publicUrl = coverUrl;
  if (!uploadErr) {
    const { data } = supabase.storage.from("covers").getPublicUrl(filePath);
    publicUrl = data.publicUrl;
  }

  // 4) Update DB row
  const { error } = await supabase
    .from("media_items")
    .update({ poster_path: publicUrl, artist, album })
    .eq("id", songId);

  return { ok: !error, error, publicUrl };
}
