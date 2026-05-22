/**
 * Example: Basic rate limiting with default settings
 * 10 requests per minute per IP
 */

import { NextRequest, NextResponse } from "next/server"
import { withRateLimit } from "@/lib/rate-limit-middleware"

async function handler(req: NextRequest) {
  return NextResponse.json({ message: "Success!" })
}

// Apply rate limiting with defaults (10 req/min)
export const GET = withRateLimit(handler, {
  keyPrefix: "api:basic",
})

export const POST = withRateLimit(handler, {
  keyPrefix: "api:basic",
})
