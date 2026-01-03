---
layout: post
title: "Security Hardening"
date: 2026-01-09
category: sessions
order: 9
session: 9
reading_time: 21
tags: [network-policies,pss,owasp,csp]
---


## E-commerce Monorepo for AWS EKS

**Date**: January 3, 2026
**Session Duration**: ~2 hours
**Model**: Claude Opus 4.5 (claude-opus-4-5-20251101)

---

## Session Goals

```
┌─────────────────────────────────────────────────┐
│          DAY 9 - SECURITY HARDENING             │
├─────────────────────────────────────────────────┤
│                                                  │
│  ✅ Network Policies (Zero Trust)               │
│  ✅ Pod Security Standards (PSS)                │
│  ✅ Container Hardening (Seccomp)               │
│  ✅ Content Security Policy (CSP)               │
│  ✅ Auth Rate Limiting                          │
│  ✅ Security Event Logging                      │
│  ✅ Request Body Size Limit                     │
│  ✅ OWASP ZAP Security Scan                     │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Security Audit - Initial State

### Strengths (Already Implemented)

| Area | Implementation |
|------|----------------|
| Container Security | runAsNonRoot, readOnlyRootFilesystem, drop ALL capabilities |
| Input Validation | Zod schemas on all endpoints |
| SQL Injection | Prisma with parameterized queries |
| Authentication | JWT + bcrypt (12 rounds) |
| CORS | Wildcard support, credentials validation |

### Identified Gaps

| Gap | Risk | Priority |
|-----|------|----------|
| No Network Policies | Pods can communicate freely | CRITICAL |
| No Pod Security Standards | No policy enforcement | HIGH |
| CSP disabled | XSS vulnerability | HIGH |
| Weak auth rate limiting | Brute force possible | HIGH |

---

## 1. Network Policies (Zero Trust)

**Principle:** Default deny, explicit allow.

### Default Deny Policy

```yaml
# k8s/network-policies/default-deny.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: default
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

### Backend Policy

```yaml
# k8s/network-policies/backend-policy.yaml
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: backend
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app.kubernetes.io/name: frontend
      ports:
        - protocol: TCP
          port: 4000
  egress:
    # DNS, RDS (5432), Redis (6379), X-Ray (2000), HTTPS (443)
```

### Frontend Policy

```yaml
# k8s/network-policies/frontend-policy.yaml
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: frontend
  ingress:
    - from: []  # Allow from ALB/Ingress
      ports:
        - protocol: TCP
          port: 3000
  egress:
    # DNS, Backend (4000), X-Ray (2000), HTTPS (443)
```

### Resulting Network Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     NETWORK ISOLATION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Internet                                                       │
│       │                                                          │
│       ▼                                                          │
│   ┌───────┐                                                      │
│   │  ALB  │                                                      │
│   └───┬───┘                                                      │
│       │ :3000                                                    │
│       ▼                                                          │
│   ┌──────────┐     :4000      ┌──────────┐                      │
│   │ Frontend │ ──────────────▶│ Backend  │                      │
│   └──────────┘                └────┬─────┘                      │
│                                    │                             │
│                    ┌───────────────┼───────────────┐            │
│                    │               │               │             │
│                    ▼               ▼               ▼             │
│               ┌────────┐     ┌─────────┐    ┌───────────┐       │
│               │  RDS   │     │  Redis  │    │ X-Ray     │       │
│               │ :5432  │     │  :6379  │    │ UDP:2000  │       │
│               └────────┘     └─────────┘    └───────────┘       │
│                                                                  │
│   ❌ Backend ↛ Frontend (blocked)                                │
│   ❌ Frontend ↛ RDS/Redis (blocked)                              │
│   ❌ External ↛ Backend (blocked)                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Pod Security Standards (PSS)

### PSS Levels

| Level | Description |
|-------|-------------|
| `privileged` | Unrestricted (default) |
| `baseline` | Prevents known privilege escalations |
| `restricted` | Maximum security, follows best practices |

### Modes

| Mode | Behavior |
|------|----------|
| `enforce` | Reject non-compliant pods |
| `audit` | Log violations to audit log |
| `warn` | Show warnings to users |

### Implementation (Gradual Rollout)

```yaml
# k8s/namespaces/default-pss.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: default
  labels:
    # Phase 1: Audit and Warn (current)
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/audit-version: latest
    pod-security.kubernetes.io/warn: restricted
    pod-security.kubernetes.io/warn-version: latest

    # Phase 2: Enforce (after verification)
    # pod-security.kubernetes.io/enforce: restricted
    # pod-security.kubernetes.io/enforce-version: latest
```

---

## 3. Container Hardening (Seccomp)

### Helm Values Update

```yaml
# helm/backend/values.yaml & helm/frontend/values.yaml
securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  seccompProfile:
    type: RuntimeDefault  # ← NEW
  capabilities:
    drop:
      - ALL
```

### Seccomp Profile Explanation

| Type | Description |
|------|-------------|
| `Unconfined` | No syscall filtering (insecure) |
| `RuntimeDefault` | Default container runtime profile |
| `Localhost` | Custom profile from file |

**RuntimeDefault** blocks dangerous syscalls like:
- `keyctl` - kernel key management
- `ptrace` - process debugging
- `reboot` - system reboot
- `mount` - filesystem mounting

---

## 4. Content Security Policy (CSP)

### Before (Disabled)

```typescript
await app.register(helmet, {
  contentSecurityPolicy: false  // ← VULNERABLE
});
```

### After (Configured)

```typescript
// apps/backend/src/server.ts
await app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,  // 1 year
    includeSubDomains: true,
    preload: true,
  },
});
```

### Resulting Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
```

---

## 5. Auth Rate Limiting

### Per-Endpoint Configuration

```typescript
// apps/backend/src/modules/auth/auth.routes.ts

const loginRateLimitConfig = {
  config: {
    rateLimit: {
      max: 5,
      timeWindow: "15 minutes",
      allowList: (request) => {
        const bypassHeader = request.headers["x-load-test-bypass"];
        return bypassHeader === config.rateLimit.bypassToken;
      },
    },
  },
};

const registerRateLimitConfig = {
  config: {
    rateLimit: {
      max: 3,
      timeWindow: "1 hour",
      allowList: (request) => { /* same bypass logic */ },
    },
  },
};
```

### Resulting Limits

| Endpoint | Limit | Time Window |
|----------|-------|-------------|
| `POST /api/auth/login` | 5 requests | 15 minutes |
| `POST /api/auth/register` | 3 requests | 1 hour |
| Other endpoints | 100 requests | 1 minute |

**Note:** Rate limits can be bypassed during k6 load tests using `X-Load-Test-Bypass` header.

---

## 6. Security Event Logging

### Logged Events

```typescript
// Login failed - wrong password
logger.warn({
  event: "login_failed",
  reason: "invalid_password",
  userId: user.id,
  email: body.email,
  ip: request.ip,
  timestamp: new Date().toISOString(),
}, "Security: Login failed - invalid password");

// Successful login
logger.info({
  event: "login_success",
  userId: user.id,
  email: user.email,
  ip: request.ip,
  timestamp: new Date().toISOString(),
}, "Security: Login successful");

// Password change failed
logger.warn({
  event: "password_change_failed",
  reason: "invalid_current_password",
  userId: request.userId,
  ip: request.ip,
  timestamp: new Date().toISOString(),
}, "Security: Password change failed");
```

### Log Structure

```json
{
  "level": 40,
  "time": 1735920000000,
  "event": "login_failed",
  "reason": "invalid_password",
  "userId": "user-123",
  "email": "attacker@example.com",
  "ip": "192.168.1.100",
  "timestamp": "2026-01-03T10:00:00.000Z",
  "msg": "Security: Login failed - invalid password"
}
```

---

## 7. Request Body Size Limit

### Configuration

```typescript
// apps/backend/src/server.ts
const app = Fastify({
  logger: logger as any,
  trustProxy: true,
  bodyLimit: 1048576,  // 1MB max request body size (DoS protection)
});
```

### DoS Protection

| Without Limit | With Limit (1MB) |
|---------------|------------------|
| Attacker can send huge payloads | Requests > 1MB rejected with 413 |
| Unlimited memory consumption | Memory protected |
| Potential server crash | Server stable |

---

## Files Created/Modified

| File | Action | Description |
|------|--------|-------------|
| `k8s/network-policies/default-deny.yaml` | Created | Default deny ingress/egress (namespace: ecommerce) |
| `k8s/network-policies/backend-policy.yaml` | Created | Allow frontend → backend (namespace: ecommerce) |
| `k8s/network-policies/frontend-policy.yaml` | Created | Allow ALB → frontend (namespace: ecommerce) |
| `k8s/namespaces/ecommerce-pss.yaml` | Created | PSS labels (audit/warn) for ecommerce namespace |
| `helm/backend/values.yaml` | Modified | Seccomp profile |
| `helm/frontend/values.yaml` | Modified | Seccomp profile |
| `apps/backend/src/server.ts` | Modified | CSP, HSTS, bodyLimit, Swagger at /api/docs |
| `apps/backend/src/modules/auth/auth.routes.ts` | Modified | Rate limiting with k6 bypass, security logging |
| `.github/workflows/security-scan.yml` | Created | OWASP ZAP security scan workflow |
| `security/reports/zap/baseline-report.*` | Created | ZAP baseline scan results |
| `security/reports/zap/api-report.*` | Created | ZAP API scan results |

---

## Verification

```bash
# Network Policies
kubectl get networkpolicies
kubectl describe networkpolicy backend-network-policy

# Pod Security Standards
kubectl get ns default --show-labels | grep pod-security

# CSP Header
curl -I https://dls03qes9fc77.cloudfront.net/api/health | grep -i content-security

# Rate Limiting Test
for i in {1..10}; do
  curl -X POST https://dls03qes9fc77.cloudfront.net/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# 429 after 5 attempts
```

---

## OWASP Top 10 Coverage

| # | Vulnerability | Implemented Mitigation |
|---|---------------|------------------------|
| A01 | Broken Access Control | JWT auth, role-based access |
| A02 | Cryptographic Failures | bcrypt (12 rounds), HTTPS only |
| A03 | Injection | Prisma parameterized queries, Zod validation |
| A04 | Insecure Design | Rate limiting, input validation |
| A05 | Security Misconfiguration | CSP, HSTS, helmet, secure defaults |
| A06 | Vulnerable Components | Trivy scanning in CI |
| A07 | Auth Failures | Rate limiting, security logging |
| A08 | Data Integrity | Request validation, signed JWTs |
| A09 | Logging & Monitoring | Security event logging, X-Ray |
| A10 | SSRF | Network policies, egress control |

---

## 8. Bug Fix: Swagger UI Routing

### Problem
Swagger UI at `/api/docs` wasn't working correctly in the browser:
- `/api/docs` → incorrect relative redirect → `/api/index.html/static/index.html`

### Root Cause
1. Swagger UI uses relative redirect `./static/index.html`
2. Without trailing slash, the browser resolves the path incorrectly
3. Next.js `<Link>` component doesn't handle external API URLs properly

### Solution

```typescript
// 1. onRequest hook for trailing slash redirect
app.addHook("onRequest", async (request, reply) => {
  if (request.url === "/api/docs") {
    return reply.redirect(301, "/api/docs/");
  }
});

// 2. Frontend: use <a> instead of <Link> for API URLs
<a href="/api/docs">View Documentation</a>  // ✅
<Link href="/api/docs">...</Link>           // ❌
```

### GitHub Action: CloudFront Cache Invalidation

```yaml
# .github/workflows/invalidate-cache.yml
name: Invalidate CloudFront Cache
on:
  workflow_dispatch:
    inputs:
      paths:
        default: '/*'
jobs:
  invalidate:
    runs-on: ubuntu-latest
    steps:
      - name: Create CloudFront Invalidation
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ env.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "${{ inputs.paths }}"
```

---

## 9. OWASP ZAP Security Scan

### Overview

OWASP ZAP (Zed Attack Proxy) is an open-source security testing tool for finding vulnerabilities in web applications. We ran two scan types:

1. **Baseline Scan** - Quick passive scan of the entire application (~2 min)
2. **API Scan** - Active scan of API endpoints using OpenAPI spec (~3 min)

### Scan Results Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                     ZAP SCAN RESULTS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BASELINE SCAN (Frontend + Backend)                             │
│  ├── PASS:  55 security checks                                  │
│  ├── WARN:  12 informational warnings                           │
│  └── FAIL:  0 critical vulnerabilities                          │
│                                                                  │
│  API SCAN (Backend API)                                         │
│  ├── PASS:  113 security checks                                 │
│  ├── WARN:  6 informational warnings                            │
│  └── FAIL:  0 critical vulnerabilities                          │
│                                                                  │
│  ✅ NO CRITICAL VULNERABILITIES FOUND                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### API Scan - Tests Passed

| Category | Tests Passed |
|----------|-------------|
| SQL Injection (all DB types) | 6 |
| Cross-Site Scripting (XSS) | 5 |
| Remote Code Execution | 4 |
| Path Traversal | 1 |
| Command Injection | 2 |
| CSRF | 1 |
| Log4Shell / Spring4Shell | 2 |
| Buffer Overflow / Format String | 2 |
| XML/XSLT Injection | 3 |
| Server-Side Template Injection | 2 |
| Cloud Metadata Exposure | 1 |
| Other security checks | 84 |

### Baseline Warnings (Informational)

| Warning | Affected | Risk | Action |
|---------|----------|------|--------|
| Strict-Transport-Security Not Set | Frontend pages | Low | Add HSTS to Next.js |
| X-Powered-By Header | Frontend | Low | Remove header in Next.js |
| CSP Not Set | Frontend pages | Low | Add CSP to Next.js |
| Permissions-Policy Not Set | Frontend | Info | Add Permissions-Policy |
| Vulnerable JS Library | swagger-ui | Low | Update @fastify/swagger-ui |
| Timestamp Disclosure | Product data | Info | Expected (createdAt/updatedAt) |
| Suspicious Comments | JS bundles | Info | Minification artifacts |
| Spectre Isolation | Frontend | Info | Add COOP/COEP headers |

### Backend API - Security Headers (Verified)

```bash
$ curl -I https://dls03qes9fc77.cloudfront.net/api/health

Content-Security-Policy: default-src 'self'; script-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
```

### GitHub Action Workflow

```yaml
# .github/workflows/security-scan.yml
name: Security Scan (OWASP ZAP)

on:
  workflow_dispatch:
    inputs:
      scan_type:
        type: choice
        options:
          - baseline    # Quick passive scan (~2 min)
          - api         # API-focused scan (~5 min)
          - full        # Full active scan (~30+ min)

jobs:
  zap-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: zaproxy/action-baseline@v0.12.0  # or action-api-scan
        with:
          target: ${{ inputs.target_url }}
      - uses: actions/upload-artifact@v4
        with:
          name: zap-reports
          path: security/reports/zap/
```

### Reports Generated

| Report | Format | Size |
|--------|--------|------|
| `baseline-report.html` | HTML | 126 KB |
| `baseline-report.json` | JSON | 50 KB |
| `api-report.html` | HTML | 174 KB |
| `api-report.json` | JSON | 60 KB |

### Recommendations for Future

1. **Frontend Security Headers**
   - Add CSP, HSTS, Permissions-Policy to Next.js
   - Remove X-Powered-By header
   - Add COOP/COEP headers for Spectre mitigation

2. **Scheduled Scans**
   - Run baseline scan weekly on schedule
   - Run API scan after each deployment

3. **Integration**
   - Add ZAP scan to CI/CD pipeline
   - Block deployment if critical vulnerabilities found

---

## Screenshots

### OWASP ZAP Security Scan Workflow
![ZAP Security Scan](https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/github-action-zap.png)

### CloudFront Cache Invalidation
![CloudFront Invalidation](https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/github-action-cloudfront-001.png)

![CloudFront Invalidation Result](https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/github-action-cloudfront-002.png)

---

## Session Statistics

| Metric | Value |
|--------|-------|
| Files created | 7 |
| Files modified | 4 |
| Network Policies | 3 |
| Security headers added | 5+ |
| Rate limited endpoints | 2 |
| Security events logged | 6 types |
| ZAP security checks passed | 168 |
| ZAP critical vulnerabilities | 0 |

---

*Session 9 completed - January 3, 2026*
