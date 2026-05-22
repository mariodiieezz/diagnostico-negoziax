/**
 * Example: Custom rate limiting configuration
 * 20 requests per 30 seconds
 */

import { NextRequest, NextResponse } from "next/server"
import { withRateLimit } from "@/lib/rate-limit-middleware"

async function handler(req: NextRequest) {
  return NextResponse.json({ message: "Custom rate limit!" })
}

export const GET = withRateLimit(handler, {
  limit: 20,
  window: 30 * 1000, // 30 seconds
  keyPrefix: "api:custom",
  message: "Slow down! Custom rate limit exceeded.",
})
