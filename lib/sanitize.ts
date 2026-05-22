import validator from "validator"

/**
 * Sanitize string input to prevent XSS and injection attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") return ""

  // Trim whitespace
  let cleaned = input.trim()

  // Escape HTML to prevent XSS
  cleaned = validator.escape(cleaned)

  // Remove null bytes (can cause issues in some systems)
  cleaned = cleaned.replace(/\0/g, "")

  // Normalize whitespace (replace multiple spaces with single space)
  cleaned = cleaned.replace(/\s+/g, " ")

  return cleaned
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== "string") return ""

  // Normalize and validate email
  const normalized = validator.normalizeEmail(email, {
    gmail_remove_dots: false, // Keep dots in gmail addresses
    gmail_remove_subaddress: false, // Keep + aliases
    outlookdotcom_remove_subaddress: false,
    yahoo_remove_subaddress: false,
    icloud_remove_subaddress: false,
  })

  return normalized || email.toLowerCase().trim()
}

/**
 * Sanitize phone number (keep only digits and common separators)
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== "string") return ""

  // Keep only digits, spaces, hyphens, parentheses, and plus sign
  return phone.replace(/[^\d\s\-()+ ]/g, "").trim()
}

/**
 * Sanitize an object containing form data
 */
export function sanitizeFormData(data: Record<string, unknown>): Record<string, string> {
  const sanitized: Record<string, string> = {}

  for (const [key, value] of Object.entries(data)) {
    // Sanitize key name (prevent prototype pollution)
    const safeKey = validator.escape(String(key))

    if (typeof value === "string") {
      // Special handling for specific fields
      if (key === "email") {
        sanitized[safeKey] = sanitizeEmail(value)
      } else if (key === "telefono") {
        sanitized[safeKey] = sanitizePhone(value)
      } else {
        sanitized[safeKey] = sanitizeString(value)
      }
    } else if (value !== null && value !== undefined) {
      // Convert other types to string and sanitize
      sanitized[safeKey] = sanitizeString(String(value))
    }
  }

  return sanitized
}

/**
 * Validate that an object doesn't contain dangerous keys (prototype pollution prevention)
 */
export function hasDangerousKeys(obj: unknown): boolean {
  if (typeof obj !== "object" || obj === null) return false

  const dangerousKeys = ["__proto__", "constructor", "prototype"]
  const keys = Object.keys(obj)

  return keys.some((key) => dangerousKeys.includes(key.toLowerCase()))
}
