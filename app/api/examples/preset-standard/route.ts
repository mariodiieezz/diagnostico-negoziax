/**
 * Example: Using preset for standard API endpoints
 * 60 requests per minute
 */

import { NextRequest, NextResponse } from "next/server"
import { createRateLimiter } from "@/lib/rate-limit-middleware"

async function handler(req: NextRequest) {
  return NextResponse.json({ message: "Standard API endpoint", data: [] })
}

// Use the 'standard' preset (60 req/min)
export const GET = createRateLimiter("standard")(handler)
