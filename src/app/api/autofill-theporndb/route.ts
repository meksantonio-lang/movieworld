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
          query SearchScenes($search: String!) {
            searchScene(search: $search) {
              edges {
                node {
                  id
                  title
                  date
                  url
                  tags { name }
                  performers { name }
                  studio { name }
                  images { url }
                }
              }
            }
          }
        `,
        variables: { search: query },
      }),
    });

    const data = await resp.json();

    const results =
      data?.data?.searchScene?.edges?.map((edge: any) => ({
        title: edge.node.title,
        release_year: edge.node.date
          ? Number(String(edge.node.date).split("-")[0])
          : null,
        cover_url: edge.node.images?.[0]?.url || "",
        genre: edge.node.tags?.map((t: any) => t.name).join(", ") || "",
        download_url: edge.node.url,
        metadata: {
          performers: edge.node.performers?.map((p: any) => p.name) || [],
          studio: edge.node.studio?.name || "",
        },
      })) || [];

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("ThePornDB fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from ThePornDB", detail: String(error) },
      { status: 500 }
    );
  }
}

