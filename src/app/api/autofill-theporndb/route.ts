// src/app/api/autofill-theporndb/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    const apiKey = process.env.THEPORNDB_API_KEY;

    // 1. Check if the query is a UUID or a numeric ID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);
    const isNumericID = /^\d+$/.test(query);

    // ✅ DIRECT ID FETCH (If user pastes UUID or ID)
    if (isUUID || isNumericID) {
      console.log(`Detected ID/UUID. Fetching directly: ${query}`);
      
      // Try the /movies/ endpoint first (from your screenshot)
      let restResp = await fetch(`https://api.theporndb.net/movies/${query}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      });

      // If not a movie, fallback to check if it's a scene
      if (!restResp.ok) {
        restResp = await fetch(`https://api.theporndb.net/scenes/${query}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
          },
        });
      }

      if (restResp.ok) {
        const result = await restResp.json();
        const item = result.data;

        // Safely extract image from REST API format
        const coverUrl = 
          item.posters?.[0]?.url || 
          item.posters?.large || 
          item.background?.large || 
          item.image || 
          "/placeholder-poster.png";

        const directMatch = {
          id: item.id,
          title: item.title,
          category: "adult",
          cover_url: coverUrl,
          image: coverUrl,
          download_url: item.url || "", 
          release_year: item.date ? String(item.date).slice(0, 4) : null,
          genre: item.tags?.map((t: any) => t.name).join(", ") || "",
          // REST API usually has 'name' directly on the performer object
          artist: item.performers?.map((p: any) => p.name || p.performer?.name).join(", ") || "",
        };

        // Return as an array of 1 so the frontend auto-selects it
        return NextResponse.json({ results: [directMatch] });
      }
    }

    // ✅ FALLBACK: STANDARD TITLE SEARCH (Existing GraphQL logic)
    console.log(`Fetching by title search: ${query}`);
    
    const resp = await fetch("https://theporndb.net/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query:`
          query SearchScene($term: String!) {
            searchScene(term: $term) {
              id
              title
              date
              urls { url }          
              images { url }        
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
        variables: { term: query },
      }),
    });

    const data = await resp.json();
    const scenes = data?.data?.searchScene || [];

    const results = scenes.map((scene: any) => ({
      id: scene.id,
      title: scene.title,
      category: "adult",
      cover_url: scene.images?.[0]?.url || "/placeholder-poster.png",
      image: scene.images?.[0]?.url || "/placeholder-poster.png",
      download_url: scene.urls?.[0]?.url || "",
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