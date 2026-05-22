# Quick Start Guide - Secure Diagnóstico Negoziax

## ✅ Security Implementation Complete

All security measures have been successfully implemented and tested.

---

## 🚀 Running the Application

### 1. Environment Setup

Ensure your `.env.local` file has these variables:

```bash
WEBHOOK_URL=https://your-webhook-url.com/endpoint
WEBHOOK_SECRET=your-secret-key-here
```

### 2. Install Dependencies

Already done, but if needed:

```bash
npm install
```

### 3. Development Mode

```bash
npm run dev
```

Visit `http://localhost:3000`

### 4. Production Build

```bash
npm run build
npm start
```

---

## 🔒 Security Features Active

When you run the application, these protections are automatically active:

### ✅ Rate Limiting
- **Limit:** 5 requests per minute per IP
- **Response:** Returns 429 with `Retry-After` header
- **Header:** `X-RateLimit-Remaining` shows remaining requests

### ✅ CSRF Protection
- **Token:** Automatically generated for each session
- **Cookie:** HttpOnly, SameSite=strict
- **Validation:** Required on all POST requests

### ✅ Input Validation
- **Server-side:** Zod schema validation
- **Client-side:** Real-time feedback
- **Email:** RFC 5321 compliant (max 254 chars)
- **Phone:** 9-15 digits required
- **Name:** Min 2 words, max 100 chars

### ✅ Input Sanitization
- **HTML escaping:** Prevents XSS attacks
- **Null byte removal:** Prevents injection
- **Whitespace normalization:** Cleans data

### ✅ Payload Protection
- **Max size:** 50KB
- **Content-Type:** Must be `application/json`
- **Timeout:** 10 seconds for webhook

### ✅ Security Headers
All responses include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 🧪 Testing Security Features

### Test 1: Normal Submission (Should Succeed)

1. Open `http://localhost:3000`
2. Fill out the form with valid data
3. Submit
4. Should see success screen

### Test 2: Rate Limiting (Should Block After 5)

1. Submit form 5 times quickly
2. 6th attempt should show error: "Has enviado demasiadas solicitudes..."
3. Wait 60 seconds
4. Should be able to submit again

### Test 3: Invalid Email (Should Show Error)

1. Enter invalid email (e.g., "notanemail")
2. Try to submit
3. Should show validation error

### Test 4: CSRF Protection (Can't Test via Browser)

CSRF protection works automatically. To test manually:

```bash
# This will fail with 403
curl -X POST http://localhost:3000/api/submit \
  -H "Content-Type: application/json" \
  -d '{"nombre_completo":"John Doe","email":"test@example.com","telefono":"123456789"}'
```

### Test 5: Invalid HTTP Method (Should Return 405)

```bash
curl -X GET http://localhost:3000/api/submit
# Returns: {"error":"Method not allowed"}
```

---

## 📊 Monitoring

### Check Security Headers

Visit: https://securityheaders.com

Enter your domain to verify all headers are present.

### Check Rate Limiting

Watch the browser console or use curl:

```bash
curl -I http://localhost:3000/api/submit
```

Look for:
- `X-RateLimit-Limit: 5`
- `X-RateLimit-Remaining: 4` (decrements with each request)

---

## 🐛 Troubleshooting

### "Invalid CSRF token" Error

**Cause:** Cookie not set or expired
**Solution:** Refresh the page to get a new token

### "Too many requests" Error

**Cause:** Rate limit exceeded (5 req/min)
**Solution:** Wait 60 seconds before trying again

### Form Not Submitting

**Causes:**
1. Validation errors (check form fields)
2. WEBHOOK_URL not set (check console logs)
3. Network error (check webhook endpoint)

**Solution:** Check browser console for detailed errors

### Build Errors

If you get TypeScript errors:

```bash
# Clean build cache
rm -rf .next
npm run build
```

---

## 📝 New Files Created

### Security Libraries
- `lib/validation.ts` - Zod validation schemas
- `lib/sanitize.ts` - Input sanitization utilities
- `lib/rate-limit.ts` - Rate limiting system
- `lib/csrf.ts` - CSRF token management

### Configuration
- `next.config.js` - Security headers configuration

### Documentation
- `SECURITY.md` - Comprehensive security documentation
- `SECURITY-IMPLEMENTATION.md` - Implementation details
- `QUICK-START.md` - This file

---

## 🔐 Security Checklist for Production

Before deploying:

- [ ] Set `WEBHOOK_URL` environment variable
- [ ] Set `WEBHOOK_SECRET` with a strong random value
- [ ] Verify `NODE_ENV=production`
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Test form end-to-end
- [ ] Check security headers at securityheaders.com
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Review rate limit settings (adjust if needed)

---

## 📚 Documentation

- **Comprehensive security docs:** `SECURITY.md`
- **Implementation details:** `SECURITY-IMPLEMENTATION.md`
- **This guide:** `QUICK-START.md`

---

## ✨ Summary

Your application now has **enterprise-grade security** with:

✅ 10 security layers  
✅ XSS protection  
✅ CSRF protection  
✅ Rate limiting  
✅ Input validation  
✅ Input sanitization  
✅ Payload size limits  
✅ Security headers  
✅ Error handling  
✅ Prototype pollution prevention  

**The application is production-ready!** 🎉
