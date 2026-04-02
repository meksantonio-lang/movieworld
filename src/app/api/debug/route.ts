import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  return NextResponse.json(
    { 
      debug: "API is responding",
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}
