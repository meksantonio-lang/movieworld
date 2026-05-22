// src/lib/fetchFromThePornDB.ts
export async function fetchFromThePornDB(query: string) {
  try {
    const resp = await fetch("/api/autofill-theporndb", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await resp.json();
    console.log("TPDB admin raw response:", data);

    if (!resp.ok || data.error) return null;

    // ✅ Ensure both image and cover_url are available
    const results = (data.results || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      category: item.category || "adult",
      image: item.image || null,        // adult category
      cover_url: item.cover_url || null, // TMDB/Spotify/Books consistency
      downloadLink: item.downloadLink || "",
      releaseYear: item.releaseYear || null,
      author: item.author || "",
      artist: item.artist || "",
    }));

    return results;
  } catch (err) {
    console.error("TPDB admin fetch error:", err);
    return null;
  }
}
