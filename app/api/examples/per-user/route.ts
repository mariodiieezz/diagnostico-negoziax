/**
 * Example: Per-user rate limiting (instead of per-IP)
 * Useful for authenticated endpoints
 */

import { NextRequest, NextResponse } from "next/server"
import { withRateLimit } from "@/lib/rate-limit-middleware"

async function handler(req: NextRequest) {
  const userId = req.headers.get("x-user-id")
  return NextResponse.json({ message: `User ${userId} data` })
}

export const GET = withRateLimit(handler, {
  limit: 100,
  window: 60 * 1000,
  keyPrefix: "api:user",
  // Use user ID instead of IP for rate limiting
  getIdentifier: (req) => {
    const userId = req.headers.get("x-user-id")
    return userId || "anonymous"
  },
})
