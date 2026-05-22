/**
 * Example: Using preset for authentication endpoints
 * 3 requests per 15 minutes (very strict)
 */

import { NextRequest, NextResponse } from "next/server"
import { createRateLimiter } from "@/lib/rate-limit-middleware"

async function loginHandler(req: NextRequest) {
  const body = await req.json()
  // Simulate auth logic
  return NextResponse.json({ message: "Login successful", user: body.email })
}

// Use the 'auth' preset for strict rate limiting
export const POST = createRateLimiter("auth")(loginHandler)
