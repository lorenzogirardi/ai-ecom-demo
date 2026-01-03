---
layout: post
title: "Security Hardening: Zero Trust and OWASP"
date: 2026-01-10
category: Security
reading_time: 12
tags: [security, kubernetes, network-policies, owasp, csp]
excerpt: "Implementing Zero Trust networking, Pod Security Standards, and passing 168 OWASP ZAP security checks."
takeaway: "Security is layers. Network policies, CSP, rate limiting, and security logging work together."
---

## Day 9: Defense in Depth

Application works, performs well, and we can see inside it. Now: **make it secure**.

### Security Audit Results

**Already Strong:**
- Container: runAsNonRoot, readOnlyRootFilesystem, drop ALL
- Input: Zod validation on all endpoints
- SQL: Prisma parameterized queries
- Auth: JWT + bcrypt (12 rounds)

**Gaps Found:**
- No Network Policies (pods communicate freely)
- No Pod Security Standards enforcement
- CSP disabled in Helmet
- Weak rate limiting on auth endpoints

## 1. Network Policies (Zero Trust)

### Principle: Default Deny, Explicit Allow

```yaml
# k8s/network-policies/default-deny.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: ecommerce
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

### Backend Policy

```yaml
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

### Resulting Network Isolation

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
│                    ▼               ▼               ▼             │
│               ┌────────┐     ┌─────────┐    ┌───────────┐       │
│               │  RDS   │     │  Redis  │    │ X-Ray     │       │
│               │ :5432  │     │  :6379  │    │ UDP:2000  │       │
│               └────────┘     └─────────┘    └───────────┘       │
│                                                                  │
│   BLOCKED:                                                       │
│   Backend → Frontend                                             │
│   Frontend → RDS/Redis                                           │
│   External → Backend directly                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Pod Security Standards

### PSS Levels

| Level | Description |
|-------|-------------|
| `privileged` | Unrestricted (default) |
| `baseline` | Prevents known escalations |
| `restricted` | Maximum security |

### Gradual Rollout

```yaml
# k8s/namespaces/ecommerce-pss.yaml
metadata:
  labels:
    # Phase 1: Audit and Warn
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted

    # Phase 2: Enforce (after testing)
    # pod-security.kubernetes.io/enforce: restricted
```

### Seccomp Profile

```yaml
# helm/backend/values.yaml
securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  seccompProfile:
    type: RuntimeDefault  # Blocks dangerous syscalls
  capabilities:
    drop:
      - ALL
```

## 3. Content Security Policy

### Before (Vulnerable)

```typescript
await app.register(helmet, {
  contentSecurityPolicy: false  // XSS risk
});
```

### After (Secure)

```typescript
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

## 4. Auth Rate Limiting

```typescript
// Per-endpoint configuration
const loginRateLimitConfig = {
  config: {
    rateLimit: {
      max: 5,
      timeWindow: "15 minutes",
      allowList: (request) => {
        // Bypass for load tests
        return request.headers["x-load-test-bypass"] === config.rateLimit.bypassToken;
      },
    },
  },
};

const registerRateLimitConfig = {
  config: {
    rateLimit: {
      max: 3,
      timeWindow: "1 hour",
    },
  },
};
```

| Endpoint | Limit | Time Window |
|----------|-------|-------------|
| `POST /api/auth/login` | 5 | 15 minutes |
| `POST /api/auth/register` | 3 | 1 hour |
| Other endpoints | 100 | 1 minute |

## 5. Security Event Logging

```typescript
// Login failed
logger.warn({
  event: "login_failed",
  reason: "invalid_password",
  userId: user.id,
  email: body.email,
  ip: request.ip,
  timestamp: new Date().toISOString(),
}, "Security: Login failed - invalid password");

// Login success
logger.info({
  event: "login_success",
  userId: user.id,
  email: user.email,
  ip: request.ip,
  timestamp: new Date().toISOString(),
}, "Security: Login successful");
```

## 6. Request Body Size Limit

```typescript
const app = Fastify({
  bodyLimit: 1048576,  // 1MB max (DoS protection)
});
```

## OWASP ZAP Security Scan

### Results

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
│  NO CRITICAL VULNERABILITIES FOUND                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Tests Passed

| Category | Tests |
|----------|-------|
| SQL Injection (all DB types) | 6 |
| Cross-Site Scripting (XSS) | 5 |
| Remote Code Execution | 4 |
| Path Traversal | 1 |
| Command Injection | 2 |
| CSRF | 1 |
| Log4Shell / Spring4Shell | 2 |
| Buffer Overflow | 2 |
| XML/XSLT Injection | 3 |
| SSTI | 2 |
| Cloud Metadata Exposure | 1 |

## OWASP Top 10 Coverage

| # | Vulnerability | Mitigation |
|---|---------------|------------|
| A01 | Broken Access Control | JWT auth, role-based access |
| A02 | Cryptographic Failures | bcrypt (12 rounds), HTTPS |
| A03 | Injection | Prisma, Zod validation |
| A04 | Insecure Design | Rate limiting, validation |
| A05 | Security Misconfiguration | CSP, HSTS, secure defaults |
| A06 | Vulnerable Components | Trivy scanning in CI |
| A07 | Auth Failures | Rate limiting, logging |
| A08 | Data Integrity | Signed JWTs, validation |
| A09 | Logging & Monitoring | Security events, X-Ray |
| A10 | SSRF | Network policies, egress control |

## Results

| Metric | Value |
|--------|-------|
| Network Policies | 3 |
| Security Headers | 5+ |
| Rate Limited Endpoints | 2 |
| Security Events Logged | 6 types |
| ZAP Checks Passed | 168 |
| Critical Vulnerabilities | 0 |

---

*Next: [Operational Portal: Self-Service for L1 Support](/blog/operational-portal/)*
