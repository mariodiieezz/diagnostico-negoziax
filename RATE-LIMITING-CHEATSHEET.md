# Rate Limiting Cheat Sheet

Quick reference for common rate limiting patterns.

---

## 🚀 Quick Imports

```typescript
import { withRateLimit, createRateLimiter } from "@/lib/rate-limit-middleware"
import { NextRequest, NextResponse } from "next/server"
```

---

## 📦 Presets (One-Liner)

```typescript
// Authentication (3 req/15min) - STRICTEST
export const POST = createRateLimiter("auth")(handler)

// Form submission (5 req/min)
export const POST = createRateLimiter("form")(handler)

// Standard API (60 req/min)
export const GET = createRateLimiter("standard")(handler)

// Read-only (100 req/min) - MOST LENIENT
export const GET = createRateLimiter("lenient")(handler)

// Expensive ops (1 req/min)
export const POST = createRateLimiter("strict")(handler)

// File uploads (10 req/hour)
export const POST = createRateLimiter("upload")(handler)
```

---

## 🎯 Common Patterns

### Default (10 req/min)

```typescript
export const GET = withRateLimit(handler)
```

### Custom Limit

```typescript
export const POST = withRateLimit(handler, {
  limit: 20,           // 20 requests
  window: 30 * 1000,   // per 30 seconds
})
```

### Custom Message

```typescript
export const POST = withRateLimit(handler, {
  limit: 5,
  window: 60000,
  message: "Too many submissions. Wait 1 minute.",
})
```

### By User ID

```typescript
export const GET = withRateLimit(handler, {
  limit: 100,
  window: 60000,
  getIdentifier: (req) => req.headers.get("x-user-id") || "anon",
})
```

### By API Key

```typescript
export const GET = withRateLimit(handler, {
  limit: 1000,
  window: 60000,
  getIdentifier: (req) => req.headers.get("x-api-key") || "anon",
})
```

### Skip for Admins

```typescript
export const GET = withRateLimit(handler, {
  limit: 10,
  window: 60000,
  skip: (req) => req.headers.get("x-admin") === process.env.ADMIN_KEY,
})
```

### Multiple Limits

```typescript
// IP: 100/min, User: 1000/hour
const withIp = withRateLimit(handler, {
  limit: 100,
  window: 60000,
  keyPrefix: "ip",
})

export const GET = withRateLimit(withIp, {
  limit: 1000,
  window: 3600000,
  keyPrefix: "user",
  getIdentifier: (req) => req.headers.get("x-user-id") || "anon",
})
```

---

## 📊 Response Headers (Automatic)

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1234567890
Retry-After: 45  (only on 429)
```

---

## 🧪 Test from Browser

```javascript
// Make 12 requests, log remaining
for (let i = 1; i <= 12; i++) {
  const res = await fetch('/api/data')
  console.log(`${i}: ${res.status}, Remaining:`, 
    res.headers.get('X-RateLimit-Remaining'))
}
```

---

## 🔧 Time Conversions

```typescript
1000           // 1 second
60 * 1000      // 1 minute
5 * 60 * 1000  // 5 minutes
60 * 60 * 1000 // 1 hour
```

---

## 📋 Preset Summary

| Preset | Limit | Window | Time |
|--------|-------|--------|------|
| `auth` | 3 | 900000 | 15 min |
| `form` | 5 | 60000 | 1 min |
| `standard` | 60 | 60000 | 1 min |
| `lenient` | 100 | 60000 | 1 min |
| `strict` | 1 | 60000 | 1 min |
| `upload` | 10 | 3600000 | 1 hour |

---

## 🚨 Common Mistakes

❌ **Forget to export:**
```typescript
const GET = withRateLimit(handler) // Wrong!
```

✅ **Correct:**
```typescript
export const GET = withRateLimit(handler)
```

---

❌ **Wrong time units:**
```typescript
window: 60  // 60 milliseconds, not 60 seconds!
```

✅ **Correct:**
```typescript
window: 60 * 1000  // 60 seconds
```

---

❌ **Missing identifier:**
```typescript
getIdentifier: (req) => req.headers.get("x-user-id")  // Returns null!
```

✅ **Correct:**
```typescript
getIdentifier: (req) => req.headers.get("x-user-id") || "anonymous"
```

---

## 🎬 Copy-Paste Templates

### Template: Standard API Route

```typescript
import { NextRequest, NextResponse } from "next/server"
import { createRateLimiter } from "@/lib/rate-limit-middleware"

async function handler(req: NextRequest) {
  // Your logic here
  return NextResponse.json({ data: "example" })
}

export const GET = createRateLimiter("standard")(handler)
```

### Template: Auth Route

```typescript
import { NextRequest, NextResponse } from "next/server"
import { createRateLimiter } from "@/lib/rate-limit-middleware"

async function loginHandler(req: NextRequest) {
  const body = await req.json()
  // Auth logic
  return NextResponse.json({ success: true })
}

export const POST = createRateLimiter("auth")(loginHandler)
```

### Template: Form Route

```typescript
import { NextRequest, NextResponse } from "next/server"
import { createRateLimiter } from "@/lib/rate-limit-middleware"

async function submitHandler(req: NextRequest) {
  const body = await req.json()
  // Process form
  return NextResponse.json({ success: true })
}

export const POST = createRateLimiter("form")(submitHandler)
```

### Template: Per-User Route

```typescript
import { NextRequest, NextResponse } from "next/server"
import { withRateLimit } from "@/lib/rate-limit-middleware"

async function handler(req: NextRequest) {
  const userId = req.headers.get("x-user-id")
  // Your logic
  return NextResponse.json({ data: "user data" })
}

export const GET = withRateLimit(handler, {
  limit: 100,
  window: 60 * 1000,
  getIdentifier: (req) => req.headers.get("x-user-id") || "anonymous",
})
```

---

## 🔗 Links

- Full guide: `RATE-LIMITING.md`
- Examples: `app/api/examples/`
- Core code: `lib/rate-limit-middleware.ts`
