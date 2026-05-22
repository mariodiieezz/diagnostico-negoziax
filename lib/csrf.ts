import { cookies } from "next/headers"

const CSRF_TOKEN_NAME = "csrf-token"
const CSRF_HEADER_NAME = "x-csrf-token"

/**
 * Generate a random CSRF token
 */
function generateToken(): string {
  // Generate 32 random bytes and convert to hex
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

/**
 * Get or create CSRF token
 * Call this in a Server Component or API route to ensure token exists
 */
export async function ensureCsrfToken(): Promise<string> {
  const cookieStore = await cookies()
  const existingToken = cookieStore.get(CSRF_TOKEN_NAME)

  if (existingToken?.value) {
    return existingToken.value
  }

  // Generate new token
  const token = generateToken()

  // Set cookie (httpOnly for security, sameSite for CSRF protection)
  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  })

  return token
}

/**
 * Validate CSRF token from request
 * Returns true if valid, false otherwise
 */
export async function validateCsrfToken(req: Request): Promise<boolean> {
  try {
    // Get token from header
    const headerToken = req.headers.get(CSRF_HEADER_NAME)
    if (!headerToken) {
      return false
    }

    // Get token from cookie
    const cookieStore = await cookies()
    const cookieToken = cookieStore.get(CSRF_TOKEN_NAME)
    if (!cookieToken?.value) {
      return false
    }

    // Compare tokens (timing-safe comparison)
    return timingSafeEqual(headerToken, cookieToken.value)
  } catch (error) {
    console.error("CSRF validation error:", error)
    return false
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

/**
 * Get CSRF token for client-side use
 * This should be called from a Server Component and passed to client
 */
export async function getCsrfToken(): Promise<string> {
  return ensureCsrfToken()
}

/**
 * CSRF token header name (for client-side reference)
 */
export const CSRF_TOKEN_HEADER = CSRF_HEADER_NAME
