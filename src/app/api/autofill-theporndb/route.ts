// src/app/api/autofill-theporndb/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    const resp = await fetch("https://theporndb.net/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.THEPORNDB_API_KEY}`,
      },
      body: JSON.stringify({
        query: `
          query SearchScene($term: String!) {
            searchScene(term: $term) {
              id
              title
              date
              urls { url }          # ✅ sub‑selection
              images { url }        # ✅ use images instead of poster
              tags { name }
              performers {
                performer {
                  id
                  name
                }
              }
            }
          }
        `,
        variables: { term: query }, // ✅ correct argument name
      }),
    });

    const data = await resp.json();
    console.log("TPDB raw response:", JSON.stringify(data, null, 2));

    const scenes = data?.data?.searchScene || [];

    const results = scenes.map((scene: any) => ({
      id: scene.id,
      title: scene.title,
      category: "adult",
      cover_url: scene.images?.[0]?.url || "/placeholder-poster.png",
      image: scene.images?.[0]?.url || "/placeholder-poster.png",
      download_url: scene.urls?.[0]?.url || "", // ✅ pick first URL object
      release_year: scene.date ? String(scene.date).slice(0, 4) : null,
      genre: scene.tags?.map((t: any) => t.name).join(", ") || "",
      artist: scene.performers?.map((p: any) => p.performer?.name).join(", ") || "",
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("ThePornDB fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from ThePornDB", detail: String(error) },
      { status: 500 }
    );
  }
}
