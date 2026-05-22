/**
 * Example: Conditional rate limiting
 * Skip rate limiting for certain conditions (e.g., admin users, internal requests)
 */

import { NextRequest, NextResponse } from "next/server"
import { withRateLimit } from "@/lib/rate-limit-middleware"

async function handler(req: NextRequest) {
  return NextResponse.json({ message: "Conditional rate limiting" })
}

export const GET = withRateLimit(handler, {
  limit: 10,
  window: 60 * 1000,
  keyPrefix: "api:conditional",
  // Skip rate limiting if admin header is present
  skip: async (req) => {
    const isAdmin = req.headers.get("x-admin-key") === process.env.ADMIN_KEY
    const isInternal = req.headers.get("x-internal-request") === "true"
    return isAdmin || isInternal
  },
})
