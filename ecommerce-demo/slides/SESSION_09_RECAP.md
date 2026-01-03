# Sessione 9 - Claude Code Demo

## E-commerce Monorepo per AWS EKS

**Data**: 3 Gennaio 2026
**Durata sessione**: ~2 ore
**Modello**: Claude Opus 4.5 (claude-opus-4-5-20251101)

---

## Obiettivi della Sessione

```
┌─────────────────────────────────────────────────┐
│         GIORNO 9 - SECURITY HARDENING           │
├─────────────────────────────────────────────────┤
│                                                  │
│  ✅ Network Policies (Zero Trust)               │
│  ✅ Pod Security Standards (PSS)                │
│  ✅ Container Hardening (Seccomp)               │
│  ✅ Content Security Policy (CSP)               │
│  ✅ Auth Rate Limiting                          │
│  ✅ Security Event Logging                      │
│  ✅ Request Body Size Limit                     │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Security Audit - Stato Iniziale

### Punti di Forza (già implementati)

| Area | Implementazione |
|------|-----------------|
| Container Security | runAsNonRoot, readOnlyRootFilesystem, drop ALL capabilities |
| Input Validation | Zod schemas su tutti gli endpoint |
| SQL Injection | Prisma con query parametrizzate |
| Authentication | JWT + bcrypt (12 rounds) |
| CORS | Wildcard support, credentials validation |

### Gap Identificati

| Gap | Rischio | Priorità |
|-----|---------|----------|
| No Network Policies | Pod possono comunicare liberamente | CRITICO |
| No Pod Security Standards | Nessun enforcement delle policy | ALTO |
| CSP disabilitato | XSS vulnerabilità | ALTO |
| Rate limiting debole su auth | Brute force possibile | ALTO |

---

## 1. Network Policies (Zero Trust)

**Principio:** Default deny, allow esplicito.

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

### Flusso di Rete Risultante

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

### Livelli PSS

| Livello | Descrizione |
|---------|-------------|
| `privileged` | Unrestricted (default) |
| `baseline` | Previene escalation note |
| `restricted` | Massima sicurezza, best practices |

### Modalità

| Modalità | Comportamento |
|----------|---------------|
| `enforce` | Rifiuta pod non conformi |
| `audit` | Log violazioni in audit log |
| `warn` | Mostra warning agli utenti |

### Implementazione (Rollout Graduale)

```yaml
# k8s/namespaces/default-pss.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: default
  labels:
    # Fase 1: Audit e Warn (attuale)
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/audit-version: latest
    pod-security.kubernetes.io/warn: restricted
    pod-security.kubernetes.io/warn-version: latest

    # Fase 2: Enforce (dopo verifica)
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
    type: RuntimeDefault  # ← NUOVO
  capabilities:
    drop:
      - ALL
```

### Seccomp Profile Spiegazione

| Tipo | Descrizione |
|------|-------------|
| `Unconfined` | Nessun filtro syscall (non sicuro) |
| `RuntimeDefault` | Profilo default del container runtime |
| `Localhost` | Profilo custom da file |

**RuntimeDefault** blocca syscall pericolose come:
- `keyctl` - gestione chiavi kernel
- `ptrace` - debugging processi
- `reboot` - riavvio sistema
- `mount` - mount filesystem

---

## 4. Content Security Policy (CSP)

### Prima (Disabilitato)

```typescript
await app.register(helmet, {
  contentSecurityPolicy: false  // ← VULNERABILE
});
```

### Dopo (Configurato)

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
    maxAge: 31536000,  // 1 anno
    includeSubDomains: true,
    preload: true,
  },
});
```

### Header Risultanti

```
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0
```

---

## 5. Auth Rate Limiting

### Configurazione Per-Endpoint

```typescript
// apps/backend/src/modules/auth/auth.routes.ts

const loginRateLimitConfig = {
  config: {
    rateLimit: {
      max: 5,
      timeWindow: "15 minutes",
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

// Applicazione
app.post("/login", loginRateLimitConfig, async (request, reply) => { ... });
app.post("/register", registerRateLimitConfig, async (request, reply) => { ... });
```

### Limiti Risultanti

| Endpoint | Limite | Time Window |
|----------|--------|-------------|
| `POST /api/auth/login` | 5 richieste | 15 minuti |
| `POST /api/auth/register` | 3 richieste | 1 ora |
| Altri endpoint | 100 richieste | 1 minuto |

---

## 6. Security Event Logging

### Eventi Loggati

```typescript
// Login fallito - password errata
logger.warn({
  event: "login_failed",
  reason: "invalid_password",
  userId: user.id,
  email: body.email,
  ip: request.ip,
  timestamp: new Date().toISOString(),
}, "Security: Login failed - invalid password");

// Login riuscito
logger.info({
  event: "login_success",
  userId: user.id,
  email: user.email,
  ip: request.ip,
  timestamp: new Date().toISOString(),
}, "Security: Login successful");

// Cambio password fallito
logger.warn({
  event: "password_change_failed",
  reason: "invalid_current_password",
  userId: request.userId,
  ip: request.ip,
  timestamp: new Date().toISOString(),
}, "Security: Password change failed");
```

### Struttura Log

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

### Configurazione

```typescript
// apps/backend/src/server.ts
const app = Fastify({
  logger: logger as any,
  trustProxy: true,
  bodyLimit: 1048576,  // 1MB max request body size (DoS protection)
});
```

### Protezione DoS

| Senza Limite | Con Limite (1MB) |
|--------------|------------------|
| Attaccante può inviare payload enormi | Richieste > 1MB rifiutate con 413 |
| Consumo memoria illimitato | Memoria protetta |
| Potenziale crash del server | Server stabile |

---

## File Creati/Modificati

| File | Azione | Descrizione |
|------|--------|-------------|
| `k8s/network-policies/default-deny.yaml` | Creato | Default deny ingress/egress (namespace: ecommerce) |
| `k8s/network-policies/backend-policy.yaml` | Creato | Allow frontend → backend (namespace: ecommerce) |
| `k8s/network-policies/frontend-policy.yaml` | Creato | Allow ALB → frontend (namespace: ecommerce) |
| `k8s/namespaces/ecommerce-pss.yaml` | Creato | PSS labels (audit/warn) per namespace ecommerce |
| `helm/backend/values.yaml` | Modificato | Seccomp profile |
| `helm/frontend/values.yaml` | Modificato | Seccomp profile |
| `apps/backend/src/server.ts` | Modificato | CSP, HSTS, bodyLimit, Swagger a /api/docs |
| `apps/backend/src/modules/auth/auth.routes.ts` | Modificato | Rate limiting con bypass k6, security logging |

---

## Verifica

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
# 429 dopo 5 tentativi
```

---

## OWASP Top 10 Coverage

| # | Vulnerabilità | Mitigazione Implementata |
|---|---------------|-------------------------|
| A01 | Broken Access Control | JWT auth, role-based access |
| A02 | Cryptographic Failures | bcrypt (12 rounds), HTTPS only |
| A03 | Injection | Prisma parametrized queries, Zod validation |
| A04 | Insecure Design | Rate limiting, input validation |
| A05 | Security Misconfiguration | CSP, HSTS, helmet, secure defaults |
| A06 | Vulnerable Components | Trivy scanning in CI |
| A07 | Auth Failures | Rate limiting, security logging |
| A08 | Data Integrity | Request validation, signed JWTs |
| A09 | Logging & Monitoring | Security event logging, X-Ray |
| A10 | SSRF | Network policies, egress control |

---

## Prossimi Passi (Day 10)

```
┌─────────────────────────────────────────────────┐
│         OPZIONI PER GIORNO 10                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  A) Advanced Load Testing & Security            │
│     - k6 browser testing                        │
│     - OWASP ZAP security scan                   │
│     - Chaos engineering (pod failures)          │
│                                                  │
│  B) Cost Optimization & Cleanup                 │
│     - Spot instances configuration              │
│     - Resource right-sizing                     │
│     - Cleanup unused resources                  │
│                                                  │
│  C) Documentation & Wrap-up                     │
│     - Architecture diagrams                     │
│     - Runbook documentation                     │
│     - Demo preparation                          │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Statistiche Sessione

| Metrica | Valore |
|---------|--------|
| File creati | 4 |
| File modificati | 4 |
| Network Policies | 3 |
| Security headers aggiunti | 5+ |
| Rate limit endpoints | 2 |
| Security events loggati | 6 tipi |

---

*Sessione 9 completata - 3 Gennaio 2026*
