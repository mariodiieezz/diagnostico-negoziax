import { NextRequest, NextResponse } from "next/server"
import { validateFormSubmission } from "@/lib/validation"
import { sanitizeFormData, hasDangerousKeys } from "@/lib/sanitize"
import rateLimiter, { getClientIdentifier } from "@/lib/rate-limit"

// Security constants
const MAX_PAYLOAD_SIZE = 50000 // 50KB max payload
const RATE_LIMIT_REQUESTS = 5 // Max 5 requests
const RATE_LIMIT_WINDOW = 60 * 1000 // Per 1 minute

/**
 * Secured form submission endpoint
 * Implements: validation, sanitization, rate limiting, size limits
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Check Content-Type
    const contentType = req.headers.get("content-type")
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      )
    }

    // 2. Rate limiting
    const clientId = getClientIdentifier(req)
    const rateLimitResult = rateLimiter.check(
      `submit:${clientId}`,
      RATE_LIMIT_REQUESTS,
      RATE_LIMIT_WINDOW
    )

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
            "X-RateLimit-Reset": String(rateLimitResult.resetAt),
          },
        }
      )
    }

    // 3. Get raw payload text to check size
    const rawText = await req.text()
    if (rawText.length > MAX_PAYLOAD_SIZE) {
      return NextResponse.json(
        { error: "Payload too large" },
        { status: 413 }
      )
    }

    // 4. Parse JSON
    let payload: unknown
    try {
      payload = JSON.parse(rawText)
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 }
      )
    }

    // 5. Check for prototype pollution attempts
    if (hasDangerousKeys(payload)) {
      console.warn("[Security] Dangerous keys detected in payload from", clientId)
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      )
    }

    // 6. Validate with Zod schema
    const validationResult = validateFormSubmission(payload)
    if (!validationResult.success) {
      const errors = validationResult.error.flatten()
      return NextResponse.json(
        {
          error: "Validation failed",
          details: errors.fieldErrors,
        },
        { status: 400 }
      )
    }

    // 7. Sanitize all string inputs
    const sanitizedData = sanitizeFormData(
      validationResult.data as Record<string, unknown>
    )

    // 8. Verify webhook configuration
    if (!"https://n8n-n8n.cksi9g.easypanel.host/webhook/b38e2cba-d328-4b20-a7d5-5a5cf105ca58") {
      console.error("[Server] WEBHOOK_URL not configured")
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503 }
      )
    }

    // 9. Forward to webhook with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    try {
      const res = await fetch("https://n8n-n8n.cksi9g.easypanel.host/webhook/b38e2cba-d328-4b20-a7d5-5a5cf105ca58", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": "webhooksecret123",
          "User-Agent": "DiagnosticoNegoziax/1.0",
        },
        body: JSON.stringify(sanitizedData),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Check webhook response
      if (!res.ok) {
        console.error(`[Webhook] Error response: ${res.status}`)
        // Don't expose internal errors to client
        return NextResponse.json(
          { error: "Failed to process submission" },
          { status: 502 }
        )
      }

      // Success
      return NextResponse.json(
        { success: true, message: "Form submitted successfully" },
        {
          status: 200,
          headers: {
            "X-RateLimit-Limit": String(rateLimitResult.limit),
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
          },
        }
      )
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === "AbortError") {
        console.error("[Webhook] Request timeout")
        return NextResponse.json(
          { error: "Request timeout" },
          { status: 504 }
        )
      }

      console.error("[Webhook] Network error:", error)
      return NextResponse.json(
        { error: "Failed to process submission" },
        { status: 502 }
      )
    }
  } catch (error) {
    // Catch-all for unexpected errors
    console.error("[API] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Reject other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}

export async function PATCH() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
