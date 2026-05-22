# Rate Limiting Guide

Complete guide to implementing rate limiting in your Next.js API routes.

---

## 🚀 Quick Start

### Basic Usage

```typescript
import { withRateLimit } from "@/lib/rate-limit-middleware"

async function handler(req: NextRequest) {
  return NextResponse.json({ message: "Success!" })
}

// Apply default rate limiting (10 req/min)
export const POST = withRateLimit(handler)
```

### Using Presets

```typescript
import { createRateLimiter } from "@/lib/rate-limit-middleware"

// Authentication endpoint - very strict (3 req/15min)
export const POST = createRateLimiter("auth")(loginHandler)

// Standard API endpoint (60 req/min)
export const GET = createRateLimiter("standard")(dataHandler)

// Form submission (5 req/min)
export const POST = createRateLimiter("form")(submitHandler)
```

---

## 📋 Available Presets

| Preset | Limit | Window | Use Case |
|--------|-------|--------|----------|
| `auth` | 3 requests | 15 minutes | Login, signup, password reset |
| `standard` | 60 requests | 1 minute | General API endpoints |
| `lenient` | 100 requests | 1 minute | Read-only endpoints |
| `strict` | 1 request | 1 minute | Expensive operations |
| `form` | 5 requests | 1 minute | Form submissions |
| `upload` | 10 requests | 1 hour | File uploads |

---

## 🎯 Common Patterns

### 1. Basic Rate Limiting

```typescript
// app/api/data/route.ts
import { NextRequest, NextResponse } from "next/server"
import { withRateLimit } from "@/lib/rate-limit-middleware"

async function handler(req: NextRequest) {
  return NextResponse.json({ data: "example" })
}

export const GET = withRateLimit(handler, {
  limit: 10,
  window: 60 * 1000, // 1 minute
  keyPrefix: "api:data",
})
```

### 2. Custom Configuration

```typescript
export const POST = withRateLimit(handler, {
  limit: 20,
  window: 30 * 1000, // 30 seconds
  keyPrefix: "api:custom",
  message: "Custom error message",
})
```

### 3. Authentication Endpoints

```typescript
// app/api/auth/login/route.ts
import { createRateLimiter } from "@/lib/rate-limit-middleware"

async function loginHandler(req: NextRequest) {
  // Login logic
  return NextResponse.json({ success: true })
}

// Very strict: 3 attempts per 15 minutes
export const POST = createRateLimiter("auth")(loginHandler)
```

### 4. Conditional Rate Limiting

```typescript
export const GET = withRateLimit(handler, {
  limit: 10,
  window: 60 * 1000,
  // Skip rate limiting for admin users
  skip: async (req) => {
    const adminKey = req.headers.get("x-admin-key")
    return adminKey === process.env.ADMIN_KEY
  },
})
```

### 5. Per-User Rate Limiting

```typescript
export const GET = withRateLimit(handler, {
  limit: 100,
  window: 60 * 1000,
  keyPrefix: "api:user",
  // Rate limit by user ID instead of IP
  getIdentifier: (req) => {
    const userId = req.headers.get("x-user-id")
    return userId || "anonymous"
  },
})
```

### 6. Multiple Rate Limits

Apply both IP-based and user-based limits:

```typescript
// First: IP limit (100 req/min)
const withIpLimit = withRateLimit(handler, {
  limit: 100,
  window: 60 * 1000,
  keyPrefix: "api:ip",
})

// Then: User limit (1000 req/hour)
export const GET = withRateLimit(withIpLimit, {
  limit: 1000,
  window: 60 * 60 * 1000,
  keyPrefix: "api:user",
  getIdentifier: (req) => req.headers.get("x-user-id") || "anonymous",
})
```

---

## 🔧 Configuration Options

### RateLimitConfig

```typescript
interface RateLimitConfig {
  /** Maximum number of requests allowed */
  limit?: number // Default: 10

  /** Time window in milliseconds */
  window?: number // Default: 60000 (1 minute)

  /** Key prefix for this route */
  keyPrefix?: string // Default: "api"

  /** Custom error message */
  message?: string

  /** Skip rate limiting conditionally */
  skip?: (req: NextRequest) => boolean | Promise<boolean>

  /** Custom identifier function */
  getIdentifier?: (req: NextRequest) => string
}
```

---

## 📊 Response Headers

Every response includes these headers:

```
X-RateLimit-Limit: 10          // Maximum requests allowed
X-RateLimit-Remaining: 7        // Requests remaining in window
X-RateLimit-Reset: 1234567890   // Unix timestamp when limit resets
```

When rate limited (429 response):

```
Retry-After: 45                 // Seconds until limit resets
```

---

## 🧪 Testing Rate Limits

### From Browser Console

```javascript
// Test rate limiting
async function testRateLimit() {
  for (let i = 1; i <= 12; i++) {
    const res = await fetch('/api/data')
    const remaining = res.headers.get('X-RateLimit-Remaining')
    console.log(`Request ${i}: ${res.status}, Remaining: ${remaining}`)
  }
}

testRateLimit()
```

### Using curl

```bash
# Make 6 requests quickly (should get rate limited on 6th)
for i in {1..6}; do
  curl -i http://localhost:3000/api/data
  echo "---"
done
```

### Check Headers

```bash
curl -I http://localhost:3000/api/data
# Look for X-RateLimit-* headers
```

---

## 📁 Example Routes

The project includes example routes demonstrating different patterns:

```
app/api/examples/
├── basic/              # Basic rate limiting (10 req/min)
├── custom/             # Custom configuration (20 req/30s)
├── preset-auth/        # Auth preset (3 req/15min)
├── preset-standard/    # Standard preset (60 req/min)
├── conditional/        # Skip for admins
├── per-user/           # Rate limit by user ID
└── multiple/           # IP + user rate limits
```

Test them:

```bash
npm run dev

# Basic
curl http://localhost:3000/api/examples/basic

# Custom
curl http://localhost:3000/api/examples/custom

# Auth
curl -X POST http://localhost:3000/api/examples/preset-auth \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## 🎨 Custom Identifier Examples

### By API Key

```typescript
getIdentifier: (req) => {
  const apiKey = req.headers.get("x-api-key")
  return apiKey || "anonymous"
}
```

### By Session ID

```typescript
getIdentifier: (req) => {
  const sessionId = req.cookies.get("session-id")?.value
  return sessionId || "anonymous"
}
```

### By User ID from JWT

```typescript
import { verifyJWT } from "@/lib/auth"

getIdentifier: async (req) => {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return "anonymous"
  
  try {
    const payload = await verifyJWT(token)
    return payload.userId
  } catch {
    return "anonymous"
  }
}
```

### By Email

```typescript
getIdentifier: (req) => {
  const body = await req.json()
  return body.email || "anonymous"
}
```

---

## 🔄 Upgrading to Redis

The current implementation uses in-memory storage. For production with multiple instances:

### Install Redis Client

```bash
npm install ioredis
```

### Update rate-limit.ts

```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

class RedisRateLimiter {
  async check(key: string, limit: number, window: number) {
    const now = Date.now()
    const windowKey = `ratelimit:${key}:${Math.floor(now / window)}`
    
    const count = await redis.incr(windowKey)
    
    if (count === 1) {
      await redis.expire(windowKey, Math.ceil(window / 1000))
    }
    
    return {
      success: count <= limit,
      limit,
      remaining: Math.max(0, limit - count),
      resetAt: Math.ceil(now / window) * window + window,
    }
  }
}
```

---

## ⚙️ Environment Variables

```bash
# Optional: Admin bypass key
ADMIN_KEY=your-secret-admin-key

# For Redis (production)
REDIS_URL=redis://localhost:6379
```

---

## 🐛 Troubleshooting

### Rate limit not working

**Check:**
1. Middleware is applied to route: `export const POST = withRateLimit(handler)`
2. Server restarted after code changes
3. Headers are present: `curl -I http://localhost:3000/api/route`

### Getting rate limited immediately

**Cause:** Previous requests still in memory
**Solution:** Restart dev server to clear rate limit store

### Rate limit not reset after window

**Cause:** Time drift or incorrect window calculation
**Solution:** Check system time, verify window value in milliseconds

### Different rate limits on different requests

**Cause:** Different IP detection
**Solution:** Check `x-forwarded-for` header consistency

---

## 📈 Monitoring

### Log Rate Limit Events

```typescript
export const POST = withRateLimit(handler, {
  limit: 10,
  window: 60000,
  skip: async (req) => {
    const identifier = getClientIdentifier(req)
    console.log(`[RateLimit] Request from ${identifier}`)
    return false
  },
})
```

### Track 429 Responses

```typescript
// Add to your monitoring/analytics
if (response.status === 429) {
  analytics.track('rate_limit_exceeded', {
    endpoint: req.url,
    identifier: getClientIdentifier(req),
  })
}
```

---

## 🚀 Production Checklist

- [ ] Rate limits configured for all API routes
- [ ] Tested rate limiting works
- [ ] Rate limit headers present in responses
- [ ] Consider upgrading to Redis for multi-instance
- [ ] Monitor 429 responses
- [ ] Document rate limits in API documentation
- [ ] Set appropriate limits per endpoint type
- [ ] Consider per-user limits for authenticated endpoints

---

## 📚 Additional Resources

- **Core implementation:** `lib/rate-limit.ts`
- **Middleware:** `lib/rate-limit-middleware.ts`
- **Examples:** `app/api/examples/`
- **Security docs:** `SECURITY.md`

---

## 💡 Best Practices

1. **Choose appropriate limits** - Don't make them too strict or too lenient
2. **Use presets** - Start with presets and customize as needed
3. **Monitor 429s** - High rate of 429s indicates limits may be too strict
4. **Per-user for auth** - Use per-user rate limiting for authenticated endpoints
5. **Per-IP for public** - Use IP-based for public endpoints
6. **Combine limits** - Apply both IP and user limits for defense in depth
7. **Document limits** - Make rate limits clear in API documentation
8. **Test thoroughly** - Test rate limiting before deploying
9. **Upgrade to Redis** - Use Redis for production with multiple instances
10. **Adjust over time** - Monitor and adjust limits based on usage patterns

---

## ✨ Summary

Your API routes now have **flexible, reusable rate limiting** that can be applied with a single line of code. The middleware handles:

- ✅ Rate limit tracking
- ✅ Automatic header injection
- ✅ Custom identifiers (IP, user, API key)
- ✅ Conditional bypassing
- ✅ Multiple rate limits
- ✅ Preset configurations
- ✅ Fail-open on errors

**All examples are ready to test at `/api/examples/*`**
