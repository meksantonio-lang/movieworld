// server/utils/lookupMusic.ts
// Server-only utility. Uses global fetch (Node 18+ / Next.js runtime).
export async function lookupMusicByArtistAndAlbum(artist: string, album: string, theAudioDbKey = "1") {
  artist = artist.trim();
  album = album.trim();
  if (!artist || !album) return { ok: false, reason: "missing-artist-or-album" };

  // 1) Try MusicBrainz search for release
  try {
    const q = encodeURIComponent(`artist:${artist} AND release:${album}`);
    const mbRes = await fetch(`https://musicbrainz.org/ws/2/release/?query=${q}&fmt=json`);
    if (mbRes.ok) {
      const mbJson = await mbRes.json();
      const release = mbJson.releases?.[0];
      if (release) {
        const mbid = release.id;
        const releaseDate = release.date ?? null;
        // Try Cover Art Archive
        try {
          const caRes = await fetch(`https://coverartarchive.org/release/${mbid}/`);
          if (caRes.ok) {
            const caJson = await caRes.json();
            const front = caJson.images?.find((i: any) => i.front) ?? caJson.images?.[0];
            const coverUrl = front?.image ?? null;
            return {
              ok: true,
              source: "musicbrainz",
              mbid,
              artist: release["artist-credit"]?.[0]?.name ?? artist,
              album: release.title ?? album,
              releaseDate,
              coverUrl,
            };
          }
        } catch (e) {
          // ignore cover archive errors and fall through to fallback
        }
      }
    }
  } catch (e) {
    // ignore and fallback
  }

  // 2) Fallback: TheAudioDB search by artist + album
  try {
    const url = `https://theaudiodb.com/api/v1/json/${theAudioDbKey}/searchalbum.php?s=${encodeURIComponent(artist)}&a=${encodeURIComponent(album)}`;
    const taRes = await fetch(url);
    if (taRes.ok) {
      const taJson = await taRes.json();
      const albumObj = taJson.album?.[0];
      if (albumObj) {
        const coverUrl = albumObj.strAlbumThumb ?? albumObj.strAlbumCDart ?? null;
        return {
          ok: true,
          source: "theaudiodb",
          artist: albumObj.strArtist ?? artist,
          album: albumObj.strAlbum ?? album,
          releaseDate: albumObj.intYearReleased ?? null,
          coverUrl,
        };
      }
    }
  } catch (e) {
    // ignore
  }

  return { ok: false, reason: "no-metadata-found" };
}
