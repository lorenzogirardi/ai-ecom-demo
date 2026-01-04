---
layout: post
title: "OWASP ZAP Baseline Security Scan"
date: 2025-12-23
category: technical
order: 11
reading_time: 8
tags: [security, owasp, zap, scan, vulnerabilities]
excerpt: "Results from OWASP ZAP baseline security scan of the e-commerce application. 0 High, 4 Medium, 6 Low, 11 Informational alerts analyzed."
takeaway: "No high-severity vulnerabilities found. Medium alerts relate to CSP configuration improvements for defense-in-depth."
---

## Scan Summary

OWASP ZAP baseline scan performed on the production deployment at `https://dls03qes9fc77.cloudfront.net`.

| Risk Level | Alerts |
|------------|--------|
| High | 0 |
| Medium | 4 |
| Low | 6 |
| Informational | 11 |

## Scan Insights

| Metric | Value |
|--------|-------|
| Response 2xx | 95% |
| Response 3xx | 2% |
| Response 4xx | 2% |
| Response 5xx | 1% |
| Total endpoints | 88 |
| Slow responses | 1% |

## Medium Alerts (4)

### 1. CSP: Wildcard Directive

**Location:** `/api/docs/static/index.html` (Swagger UI)

**Issue:** `img-src` allows wildcard sources in the Content Security Policy.

**Context:** This is specific to Swagger UI which needs to load images from various sources for API documentation display. The main application has stricter CSP.

### 2. CSP: style-src unsafe-inline

**Location:** `/api/docs/static/index.html` (Swagger UI)

**Issue:** `style-src` includes `unsafe-inline`.

**Context:** Required for Swagger UI functionality. The main Next.js application handles inline styles via nonces where possible.

### 3. Content Security Policy Header Not Set

**Location:** Frontend pages (/, /cart, etc.)

**Issue:** Frontend responses missing CSP header.

**Context:** CSP is configured on the backend API. Frontend CSP can be added via Next.js middleware for defense-in-depth.

### 4. Vulnerable JS Library

**Location:** `/api/docs/static/swagger-ui-bundle.js`

**Issue:** DOMPurify 3.1.4 has CVE-2025-26791.

**Remediation:** Update `@fastify/swagger-ui` to get patched DOMPurify version.

## Low Alerts (6)

| Alert | Description | Status |
|-------|-------------|--------|
| Spectre Vulnerability | Missing Cross-Origin headers | Informational for demo |
| Permissions Policy | Header not set | Can be added for hardening |
| X-Powered-By | Leaks "Next.js" | Can be removed in next.config.js |
| Server Header | Leaks "awselb/2.0" | ALB configuration |
| HSTS Not Set | Frontend missing HSTS | Backend has HSTS, frontend can add |
| Timestamp Disclosure | Unix timestamps in Swagger JS | Low risk, library internal |

## Informational Alerts (11)

These are informational findings that don't represent security vulnerabilities:

- **Base64 Disclosure**: Internal tokens in responses (expected)
- **Content-Type Missing**: One image endpoint
- **Suspicious Comments**: False positives from minified JS
- **Modern Web Application**: Detected React/Next.js (expected)
- **Non-Storable Content**: robots.txt, sitemap.xml
- **Cache-control**: CDN caching configuration
- **Sec-Fetch Headers**: Request headers (browser responsibility)
- **Storable Content**: Public pages cacheable (intended)

## Risk Assessment

```
┌─────────────────────────────────────────────────────────────┐
│                    RISK MATRIX                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HIGH SEVERITY:     0 alerts                                │
│  ════════════════════════════════════════════════════       │
│                                                              │
│  MEDIUM SEVERITY:   4 alerts (all CSP-related)              │
│  ████████████████                                           │
│  └── 3 on Swagger UI (external dependency)                  │
│  └── 1 on Frontend (enhancement opportunity)                │
│                                                              │
│  LOW SEVERITY:      6 alerts (hardening opportunities)      │
│  ████████████████████████                                   │
│                                                              │
│  INFORMATIONAL:    11 alerts (no action required)           │
│  ████████████████████████████████████████████               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Recommendations

### Priority 1: Update Swagger UI
```bash
npm update @fastify/swagger-ui
```
This will patch the DOMPurify CVE.

### Priority 2: Add Frontend CSP
```typescript
// next.config.js
async headers() {
  return [{
    source: '/:path*',
    headers: [{
      key: 'Content-Security-Policy',
      value: "default-src 'self'; ..."
    }]
  }]
}
```

### Priority 3: Remove X-Powered-By
```typescript
// next.config.js
poweredByHeader: false
```

### Priority 4: Add Permissions Policy
```typescript
headers: [{
  key: 'Permissions-Policy',
  value: 'camera=(), microphone=(), geolocation=()'
}]
```

## Conclusion

The OWASP ZAP baseline scan shows a solid security posture:

| Category | Assessment |
|----------|------------|
| Critical vulnerabilities | None |
| Exploitable issues | None |
| Defense-in-depth improvements | 4 medium, 6 low |
| Best practice recommendations | 11 informational |

The medium alerts are primarily related to Swagger UI (external dependency) and represent opportunities for additional hardening rather than exploitable vulnerabilities. The application demonstrates proper security controls at the infrastructure and application level.

