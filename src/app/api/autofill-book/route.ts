import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, author } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Missing book title" }, { status: 400 });
    }

    // Build query: title + author if provided
    let query = `title=${encodeURIComponent(title)}`;
    if (author) query += `&author=${encodeURIComponent(author)}`;

    const url = `https://openlibrary.org/search.json?${query}`;
    console.log("OpenLibrary search URL:", url);

    const resp = await fetch(url);
    if (!resp.ok) {
      return NextResponse.json({ error: "OpenLibrary request failed" }, { status: resp.status });
    }
    const json = await resp.json();

    if (!json.docs || json.docs.length === 0) {
      return NextResponse.json({ error: "No match found in OpenLibrary" }, { status: 404 });
    }

    // Map results
    const results = json.docs.slice(0, 10).map((doc: any) => {
      const coverUrl = doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : "";
      return {
        id: doc.key,
        title: doc.title,
        author: doc.author_name?.[0] || author || "",
        publishYear: doc.first_publish_year || "",
        coverUrl,
        downloadUrl: doc.ebook_access === "public" ? `https://openlibrary.org${doc.key}` : "",
      };
    });

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("OpenLibrary error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
