/**
 * Example: Multiple rate limits (both IP and user-based)
 * IP: 100 requests per minute
 * User: 1000 requests per hour
 */

import { NextRequest, NextResponse } from "next/server"
import { withRateLimit } from "@/lib/rate-limit-middleware"

async function handler(req: NextRequest) {
  return NextResponse.json({ message: "Multiple rate limits applied" })
}

// First apply IP-based rate limit
const withIpLimit = withRateLimit(handler, {
  limit: 100,
  window: 60 * 1000,
  keyPrefix: "api:ip",
})

// Then apply user-based rate limit
export const GET = withRateLimit(withIpLimit, {
  limit: 1000,
  window: 60 * 60 * 1000,
  keyPrefix: "api:user",
  getIdentifier: (req) => {
    const userId = req.headers.get("x-user-id")
    return userId || "anonymous"
  },
})
