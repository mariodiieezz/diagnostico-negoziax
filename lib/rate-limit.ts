/**
 * Simple in-memory rate limiter
 * For production with multiple instances, consider using Redis/Upstash
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private requests = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (IP address, user ID, etc.)
   * @param limit - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with success status and retry information
   */
  check(
    identifier: string,
    limit: number = 10,
    windowMs: number = 60 * 1000 // 1 minute default
  ): { success: boolean; limit: number; remaining: number; resetAt: number } {
    const now = Date.now()
    const entry = this.requests.get(identifier)

    // No previous requests or window expired
    if (!entry || now > entry.resetAt) {
      const resetAt = now + windowMs
      this.requests.set(identifier, { count: 1, resetAt })
      return {
        success: true,
        limit,
        remaining: limit - 1,
        resetAt,
      }
    }

    // Within rate limit
    if (entry.count < limit) {
      entry.count++
      this.requests.set(identifier, entry)
      return {
        success: true,
        limit,
        remaining: limit - entry.count,
        resetAt: entry.resetAt,
      }
    }

    // Rate limit exceeded
    return {
      success: false,
      limit,
      remaining: 0,
      resetAt: entry.resetAt,
    }
  }

  /**
   * Remove expired entries
   */
  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetAt) {
        this.requests.delete(key)
      }
    }
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string) {
    this.requests.delete(identifier)
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.requests.clear()
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

export default rateLimiter

/**
 * Get client identifier from request
 * Uses multiple fallbacks to ensure we can always identify the client
 */
export function getClientIdentifier(req: Request): string {
  // Try to get real IP from various headers (for proxies/load balancers)
  const forwardedFor = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")
  const cfConnectingIp = req.headers.get("cf-connecting-ip") // Cloudflare
  const trueClientIp = req.headers.get("true-client-ip")

  // Use first IP from x-forwarded-for if available
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim())
    if (ips[0]) return ips[0]
  }

  // Try other headers
  if (realIp) return realIp
  if (cfConnectingIp) return cfConnectingIp
  if (trueClientIp) return trueClientIp

  // Fallback to a default (not ideal but prevents errors)
  return "unknown-client"
}
