/**
 * Reusable Rate Limiting Middleware for Next.js API Routes
 *
 * Usage:
 * import { withRateLimit } from '@/lib/rate-limit-middleware'
 *
 * export const POST = withRateLimit(handler, {
 *   limit: 10,
 *   window: 60000,
 *   keyPrefix: 'api:endpoint'
 * })
 */

import { NextRequest, NextResponse } from "next/server"
import rateLimiter, { getClientIdentifier } from "./rate-limit"

export interface RateLimitConfig {
  /** Maximum number of requests allowed */
  limit?: number
  /** Time window in milliseconds */
  window?: number
  /** Key prefix for this route (e.g., 'api:users', 'api:auth') */
  keyPrefix?: string
  /** Custom error message */
  message?: string
  /** Skip rate limiting for certain conditions */
  skip?: (req: NextRequest) => boolean | Promise<boolean>
  /** Custom identifier function (defaults to IP-based) */
  getIdentifier?: (req: NextRequest) => string
}

export type APIRouteHandler = (
  req: NextRequest,
  context?: any
) => Promise<NextResponse> | NextResponse

/**
 * Higher-order function that wraps an API route handler with rate limiting
 */
export function withRateLimit(
  handler: APIRouteHandler,
  config: RateLimitConfig = {}
): APIRouteHandler {
  const {
    limit = 10,
    window = 60 * 1000, // 1 minute default
    keyPrefix = "api",
    message = "Too many requests. Please try again later.",
    skip,
    getIdentifier = getClientIdentifier,
  } = config

  return async (req: NextRequest, context?: any) => {
    try {
      // Check if we should skip rate limiting
      if (skip && (await skip(req))) {
        return handler(req, context)
      }

      // Get client identifier
      const clientId = getIdentifier(req)
      const key = `${keyPrefix}:${clientId}`

      // Check rate limit
      const result = rateLimiter.check(key, limit, window)

      // Add rate limit headers to all responses
      const addRateLimitHeaders = (response: NextResponse) => {
        response.headers.set("X-RateLimit-Limit", String(result.limit))
        response.headers.set("X-RateLimit-Remaining", String(result.remaining))
        response.headers.set("X-RateLimit-Reset", String(result.resetAt))
        return response
      }

      // Rate limit exceeded
      if (!result.success) {
        const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000)
        return addRateLimitHeaders(
          NextResponse.json(
            {
              error: message,
              retryAfter,
            },
            {
              status: 429,
              headers: {
                "Retry-After": String(retryAfter),
              },
            }
          )
        )
      }

      // Call the original handler
      const response = await handler(req, context)

      // Add rate limit headers to successful response
      return addRateLimitHeaders(response)
    } catch (error) {
      console.error("[RateLimit] Middleware error:", error)
      // On error, allow the request through (fail open)
      return handler(req, context)
    }
  }
}

/**
 * Preset configurations for common use cases
 */
export const RateLimitPresets = {
  /** Strict rate limit for auth endpoints (3 requests per 15 minutes) */
  auth: {
    limit: 3,
    window: 15 * 60 * 1000,
    keyPrefix: "auth",
    message: "Too many authentication attempts. Please try again in 15 minutes.",
  },

  /** Standard rate limit for general API endpoints (60 requests per minute) */
  standard: {
    limit: 60,
    window: 60 * 1000,
    keyPrefix: "api",
    message: "Rate limit exceeded. Please slow down.",
  },

  /** Lenient rate limit for read-only endpoints (100 requests per minute) */
  lenient: {
    limit: 100,
    window: 60 * 1000,
    keyPrefix: "api:read",
    message: "Too many requests. Please try again later.",
  },

  /** Very strict rate limit for expensive operations (1 request per minute) */
  strict: {
    limit: 1,
    window: 60 * 1000,
    keyPrefix: "api:expensive",
    message: "This operation is rate-limited to 1 request per minute.",
  },

  /** Form submission rate limit (5 requests per minute) */
  form: {
    limit: 5,
    window: 60 * 1000,
    keyPrefix: "api:form",
    message: "Too many form submissions. Please wait before trying again.",
  },

  /** File upload rate limit (10 uploads per hour) */
  upload: {
    limit: 10,
    window: 60 * 60 * 1000,
    keyPrefix: "api:upload",
    message: "Upload limit reached. Please try again later.",
  },
} as const

/**
 * Create a rate limiter with preset configuration
 *
 * @example
 * export const POST = createRateLimiter('auth')(handler)
 */
export function createRateLimiter(
  preset: keyof typeof RateLimitPresets,
  overrides?: Partial<RateLimitConfig>
) {
  const config = { ...RateLimitPresets[preset], ...overrides }
  return (handler: APIRouteHandler) => withRateLimit(handler, config)
}

/**
 * Combine multiple rate limiters (all must pass)
 * Useful for applying both per-IP and per-user rate limits
 *
 * @example
 * export const POST = combineRateLimiters([
 *   withRateLimit(handler, { limit: 100, keyPrefix: 'ip' }),
 *   withRateLimit(handler, { limit: 10, keyPrefix: 'user', getIdentifier: getUserId })
 * ])
 */
export function combineRateLimiters(limiters: APIRouteHandler[]): APIRouteHandler {
  return async (req: NextRequest, context?: any) => {
    // Apply each limiter in sequence
    let currentHandler = limiters[limiters.length - 1]

    for (let i = limiters.length - 2; i >= 0; i--) {
      const limiter = limiters[i]
      const previousHandler = currentHandler
      currentHandler = async (r: NextRequest, c?: any) => {
        const response = await limiter(r, c)
        if (response.status === 429) {
          return response
        }
        return previousHandler(r, c)
      }
    }

    return currentHandler(req, context)
  }
}
