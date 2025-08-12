// middleware.ts
import { NextResponse } from "next/server";

export function middleware(req: Request) {
  const origin = req.headers.get("origin") || "*";

  // Only touch /api/*
  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  res.headers.set("Vary", "Origin");

  if (req.method === "OPTIONS") {
    // Short-circuit preflight with 200 + CORS headers
    return new NextResponse(null, { status: 200, headers: res.headers });
  }

  return res;
}

export const config = {
  matcher: ["/api/:path*"],
};

  