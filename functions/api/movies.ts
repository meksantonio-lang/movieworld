interface Env {
  MOVIEDB: D1Database;
}

interface D1Database {
  prepare(sql: string): {
    bind(...params: any[]): any;
    all(): Promise<{ results: any[] }>;
    run(): Promise<{ success: boolean }>;
  };
}

export async function onRequest(context: any): Promise<Response> {
  const { request } = context;
  const method = request.method;
  
  // Handle CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }
  
  if (method === "GET") {
    return handleGetMovies(context);
  } else if (method === "POST") {
    return handleAddMovie(context);
  }
  
  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { status: 405, headers: { "Content-Type": "application/json" } }
  );
}

async function handleGetMovies(context: any): Promise<Response> {
  try {
    const { MOVIEDB } = context.env;
    
    if (!MOVIEDB) {
      return new Response(
        JSON.stringify({ error: "Database not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const movies = await MOVIEDB.prepare("SELECT * FROM movies ORDER BY id DESC").all();
    
    return new Response(JSON.stringify({ result: movies.results || [] }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
    });
  } catch (error: any) {
    console.error("GET Movies Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Failed to fetch movies"
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        } 
      }
    );
  }
}

async function handleAddMovie(context: any): Promise<Response> {
  try {
    const { request } = context;
    const { MOVIEDB } = context.env;
    
    if (!MOVIEDB) {
      return new Response(
        JSON.stringify({ success: false, error: "Database not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { title, genre, year, url } = body;
    
    if (!title) {
      return new Response(
        JSON.stringify({ success: false, error: "Title is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Insert movie into database
    const result = await MOVIEDB.prepare(
      "INSERT INTO movies (title, genre, release_year, cover) VALUES (?, ?, ?, ?)"
    )
    .bind(title, genre || null, year || null, url || null)
    .run();
    
    return new Response(
      JSON.stringify({ success: true, result }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  } catch (error: any) {
    console.error("POST Movie Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Failed to add movie"
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        } 
      }
    );
  }
}
