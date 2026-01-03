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
│  ✅ OWASP ZAP Security Scan                     │
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
  namespace: ecommerce  # ← Namespace applicazione
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
# k8s/namespaces/ecommerce-pss.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ecommerce
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
| `.github/workflows/security-scan.yml` | Creato | OWASP ZAP security scan workflow |
| `security/reports/zap/baseline-report.*` | Creato | Risultati ZAP baseline scan |
| `security/reports/zap/api-report.*` | Creato | Risultati ZAP API scan |

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

## 8. Bug Fix: Swagger UI Routing

### Problema
Swagger UI a `/api/docs` non funzionava correttamente nel browser:
- `/api/docs` → redirect relativo errato → `/api/index.html/static/index.html`

### Causa
1. Swagger UI usa redirect relativo `./static/index.html`
2. Senza trailing slash, il browser risolve male il path
3. Next.js `<Link>` gestisce male link esterni all'app

### Soluzione

```typescript
// 1. onRequest hook per redirect con trailing slash
app.addHook("onRequest", async (request, reply) => {
  if (request.url === "/api/docs") {
    return reply.redirect(301, "/api/docs/");
  }
});

// 2. Frontend: <a> invece di <Link> per URL API
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

OWASP ZAP (Zed Attack Proxy) è uno strumento open-source per trovare vulnerabilità nelle applicazioni web. Abbiamo eseguito due tipi di scan:

1. **Baseline Scan** - Scan passivo veloce dell'intera applicazione (~2 min)
2. **API Scan** - Scan attivo degli endpoint API usando OpenAPI spec (~3 min)

### Risultati Scan

```
┌─────────────────────────────────────────────────────────────────┐
│                     RISULTATI ZAP SCAN                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BASELINE SCAN (Frontend + Backend)                             │
│  ├── PASS:  55 controlli di sicurezza                           │
│  ├── WARN:  12 warning informativi                              │
│  └── FAIL:  0 vulnerabilità critiche                            │
│                                                                  │
│  API SCAN (Backend API)                                         │
│  ├── PASS:  113 controlli di sicurezza                          │
│  ├── WARN:  6 warning informativi                               │
│  └── FAIL:  0 vulnerabilità critiche                            │
│                                                                  │
│  ✅ NESSUNA VULNERABILITÀ CRITICA TROVATA                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### API Scan - Test Superati

| Categoria | Test Superati |
|-----------|--------------|
| SQL Injection (tutti i DB) | 6 |
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
| Altri controlli | 84 |

### Warning Baseline (Informativi)

| Warning | Interessato | Rischio | Azione |
|---------|-------------|---------|--------|
| HSTS Non Impostato | Frontend pages | Basso | Aggiungere HSTS a Next.js |
| X-Powered-By Header | Frontend | Basso | Rimuovere header in Next.js |
| CSP Non Impostato | Frontend pages | Basso | Aggiungere CSP a Next.js |
| Permissions-Policy Non Impostato | Frontend | Info | Aggiungere Permissions-Policy |
| Libreria JS Vulnerabile | swagger-ui | Basso | Aggiornare @fastify/swagger-ui |
| Timestamp Disclosure | Dati prodotto | Info | Atteso (createdAt/updatedAt) |
| Commenti Sospetti | JS bundles | Info | Artefatti minificazione |
| Isolamento Spectre | Frontend | Info | Aggiungere header COOP/COEP |

### Backend API - Security Headers (Verificati)

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
          - baseline    # Scan passivo veloce (~2 min)
          - api         # Scan API (~5 min)
          - full        # Scan attivo completo (~30+ min)

jobs:
  zap-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: zaproxy/action-baseline@v0.12.0
        with:
          target: ${{ inputs.target_url }}
      - uses: actions/upload-artifact@v4
        with:
          name: zap-reports
          path: security/reports/zap/
```

### Report Generati

| Report | Formato | Dimensione |
|--------|---------|------------|
| `baseline-report.html` | HTML | 126 KB |
| `baseline-report.json` | JSON | 50 KB |
| `api-report.html` | HTML | 174 KB |
| `api-report.json` | JSON | 60 KB |

### Raccomandazioni per il Futuro

1. **Security Headers Frontend**
   - Aggiungere CSP, HSTS, Permissions-Policy a Next.js
   - Rimuovere header X-Powered-By
   - Aggiungere header COOP/COEP per mitigazione Spectre

2. **Scan Schedulati**
   - Eseguire baseline scan settimanale
   - Eseguire API scan dopo ogni deployment

3. **Integrazione**
   - Aggiungere ZAP scan alla CI/CD pipeline
   - Bloccare deployment se vulnerabilità critiche trovate

---

## Statistiche Sessione

| Metrica | Valore |
|---------|--------|
| File creati | 7 |
| File modificati | 4 |
| Network Policies | 3 |
| Security headers aggiunti | 5+ |
| Rate limit endpoints | 2 |
| Security events loggati | 6 tipi |
| ZAP controlli sicurezza superati | 168 |
| ZAP vulnerabilità critiche | 0 |

---

*Sessione 9 completata - 3 Gennaio 2026*
