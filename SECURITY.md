# Security Implementation

This document outlines the comprehensive security measures implemented in the Diagnóstico Negoziax application.

## 🛡️ Security Layers

### 1. Input Validation (Server-Side)

**Location:** `lib/validation.ts`

All user inputs are validated using Zod schemas with strict rules:

- **Email validation:**
  - Max 254 characters (RFC 5321 compliant)
  - Local part max 64 characters
  - Prevents consecutive dots
  - Blocks dangerous characters
  - Valid domain structure required

- **Phone validation:**
  - 9-15 digits required
  - Max 20 characters total (with formatting)
  - Strips non-digit characters for validation

- **Name validation:**
  - Max 100 characters
  - Minimum 2 words (first and last name)
  - No empty or whitespace-only strings

- **Text fields:**
  - Max 500 characters per field
  - No empty or whitespace-only strings

### 2. Input Sanitization

**Location:** `lib/sanitize.ts`

All inputs are sanitized before being processed or stored:

- **HTML escaping** - Prevents XSS attacks
- **Null byte removal** - Prevents null byte injection
- **Whitespace normalization** - Removes excessive spacing
- **Email normalization** - Lowercase and trim emails
- **Phone sanitization** - Removes invalid characters
- **Prototype pollution prevention** - Blocks `__proto__`, `constructor`, `prototype` keys

### 3. Rate Limiting

**Location:** `lib/rate-limit.ts`

Prevents abuse and DoS attacks:

- **Limit:** 5 requests per minute per IP
- **Window:** 60 seconds
- **Response:** 429 status with `Retry-After` header
- **Identifier:** Uses `x-forwarded-for`, `x-real-ip`, or other proxy headers
- **Implementation:** In-memory store with automatic cleanup

**Note:** For production with multiple instances, consider upgrading to Redis or Upstash for distributed rate limiting.

### 4. CSRF Protection

**Location:** `lib/csrf.ts`

Prevents cross-site request forgery attacks:

- **Double-submit cookie pattern**
- **Token generation:** Cryptographically secure random 32-byte hex string
- **Token storage:** HttpOnly cookie with SameSite=strict
- **Validation:** Timing-safe comparison to prevent timing attacks
- **Lifetime:** 24 hours
- **Header:** `x-csrf-token` required on all POST requests

### 5. Payload Size Limits

**Locations:** `app/api/submit/route.ts`, `next.config.js`

Prevents memory exhaustion attacks:

- **Max payload size:** 50KB
- **Enforced at:** API route level (checked before parsing)
- **Next.js config:** Also configured in next.config.js
- **Response:** 413 Payload Too Large

### 6. Content-Type Validation

**Location:** `app/api/submit/route.ts`

Prevents content-type confusion attacks:

- **Required:** `application/json`
- **Response:** 415 Unsupported Media Type if invalid

### 7. Security Headers

**Location:** `next.config.js`

Implemented via Next.js configuration:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 8. HTTP Method Restriction

**Location:** `app/api/submit/route.ts`

Only POST requests are allowed:

- **Allowed:** POST
- **Blocked:** GET, PUT, DELETE, PATCH
- **Response:** 405 Method Not Allowed

### 9. Timeout Protection

**Location:** `app/api/submit/route.ts`

Prevents hanging requests:

- **Webhook timeout:** 10 seconds
- **Automatic abort** if webhook doesn't respond
- **Response:** 504 Gateway Timeout

### 10. Error Handling

**Location:** `app/api/submit/route.ts`

Secure error handling that doesn't leak sensitive information:

- **Generic error messages** for external users
- **Detailed logging** on server side only
- **No stack traces** exposed to clients
- **Consistent response format** for all errors

## 🔐 Authentication Flow

### Form Submission Process

1. **User loads page** → Server generates CSRF token
2. **User fills form** → Client-side validation provides UX feedback
3. **User submits** → Client sends CSRF token in header
4. **Server receives request:**
   - ✅ Check Content-Type
   - ✅ Check rate limit
   - ✅ Validate CSRF token
   - ✅ Check payload size
   - ✅ Parse JSON
   - ✅ Check for dangerous keys
   - ✅ Validate with Zod schema
   - ✅ Sanitize all inputs
   - ✅ Forward to webhook
   - ✅ Return response

## 📋 Security Checklist

- [x] Server-side input validation
- [x] Input sanitization (XSS prevention)
- [x] Rate limiting
- [x] CSRF protection
- [x] Payload size limits
- [x] Content-Type validation
- [x] Security headers
- [x] HTTP method restriction
- [x] Timeout protection
- [x] Error handling (no information leakage)
- [x] Email validation (RFC compliant)
- [x] Phone validation
- [x] Prototype pollution prevention
- [x] Timing-safe comparisons
- [x] HttpOnly cookies
- [x] SameSite cookie protection

## 🚀 Production Recommendations

### Immediate

1. **Environment variables:**
   - Ensure `WEBHOOK_URL` is set
   - Ensure `WEBHOOK_SECRET` is set with a strong secret
   - Use different secrets for dev/staging/production

2. **HTTPS:**
   - Always use HTTPS in production
   - CSRF cookies will be secure=true in production

### Future Enhancements

1. **Distributed Rate Limiting:**
   - Upgrade to Redis/Upstash for multi-instance deployments
   - Consider per-account rate limits (not just IP-based)

2. **Advanced Monitoring:**
   - Log suspicious activity (blocked requests, rate limits hit)
   - Set up alerts for unusual patterns
   - Monitor error rates

3. **Web Application Firewall:**
   - Consider Cloudflare or AWS WAF
   - Additional DDoS protection
   - Geo-blocking if needed

4. **Security Audit:**
   - Regular security audits
   - Penetration testing
   - Dependency updates (`npm audit`)

## 🐛 Known Vulnerabilities

Check for vulnerabilities with:

```bash
npm audit
```

Fix with:

```bash
npm audit fix
```

For breaking changes:

```bash
npm audit fix --force
```

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [RFC 5321 - Email](https://tools.ietf.org/html/rfc5321)

## 📧 Security Contact

For security issues, please contact: mariodiezagudo@gmail.com
