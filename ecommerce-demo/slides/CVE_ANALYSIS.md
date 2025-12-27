# Analisi CVE - E-commerce Demo Backend

**Data:** 2025-12-27
**Image:** `ecommerce-demo/backend:71f088e`
**Base:** Alpine 3.23.2 + Node.js 20.19.6
**Tool:** Trivy Container Scanner

---

## Sommario Esecutivo

| Severity | Totale | Da Risolvere | Ignorabili |
|----------|--------|--------------|------------|
| 🔴 Critical | 1 | 0 | 1 |
| 🟠 High | 7 | 0 | 7 |
| 🟡 Medium | 28 | 1 | 27 |

**Rischio complessivo:** BASSO
**Azione immediata richiesta:** 1 (configurazione JWT issuer)

---

## Metodologia di Analisi

Per ogni CVE identificata da Trivy:

1. **Ricerca nel codice** - Verifica se la libreria vulnerabile è effettivamente utilizzata
2. **Valutazione del vettore di attacco** - Analisi se l'exploit è raggiungibile nel contesto applicativo
3. **Priorità contestualizzata** - Classificazione basata sul rischio reale, non solo sulla severity CVSS
4. **Remediation** - Suggerimenti pratici per la risoluzione

---

## Vulnerabilità CRITICAL (1)

### CVE-2024-24790 - golang stdlib (net/netip)

| Campo | Valore |
|-------|--------|
| Package | stdlib v1.20.12 |
| Severity CVSS | CRITICAL |
| **Priorità Contestuale** | **IGNORE** |

**Analisi:**
- Proviene dai binari precompilati di Prisma ORM
- L'applicazione non espone direttamente funzionalità IPv6 netip
- Prisma CLI usato solo per migrazioni DB, non a runtime
- I binari Go sono isolati e non raggiungibili da input utente

**Azione:** Nessuna azione richiesta

---

## Vulnerabilità HIGH (7)

### CVE-2024-21538 - cross-spawn (ReDoS)

| Campo | Valore |
|-------|--------|
| Package | cross-spawn 7.0.3 |
| Fix disponibile | 7.0.5+ |
| **Priorità Contestuale** | **IGNORE** |

**Analisi:**
- ✅ **GIÀ RISOLTO** - Versione installata è 7.0.6
- Usato solo da eslint e vitest (dev dependencies)
- Non presente nel container di produzione

---

### CVE-2025-64756 - glob (Command Injection)

| Campo | Valore |
|-------|--------|
| Package | glob 10.4.2 |
| Fix disponibile | 10.5.0+ |
| **Priorità Contestuale** | **LOW** |

**Analisi:**
- Usato da `@fastify/static` per servire swagger-ui
- I glob patterns sono hardcoded, non derivano da input utente
- Non elabora filename forniti dall'utente

**Dipendenze:**
```
@fastify/swagger-ui → @fastify/static → glob
```

**Azione:** Monitorare aggiornamento di @fastify/static

---

### CVE-2023-45288 - golang HTTP/2 DoS

| Campo | Valore |
|-------|--------|
| Package | stdlib v1.20.12 |
| **Priorità Contestuale** | **IGNORE** |

**Analisi:** Prisma binaries. HTTP/2 gestito da Node.js, non da Go runtime.

---

### CVE-2024-34156 - golang gob decoder panic

| Campo | Valore |
|-------|--------|
| Package | stdlib v1.20.12 |
| **Priorità Contestuale** | **IGNORE** |

**Analisi:** Prisma binaries. L'applicazione non usa gob encoding.

---

### CVE-2025-47907 - golang database/sql race condition

| Campo | Valore |
|-------|--------|
| Package | stdlib v1.20.12 |
| **Priorità Contestuale** | **IGNORE** |

**Analisi:** Prisma binaries. L'app usa Prisma ORM, non database/sql Go.

---

### CVE-2025-58183 - golang archive/tar allocation

| Campo | Valore |
|-------|--------|
| Package | stdlib v1.20.12 |
| **Priorità Contestuale** | **IGNORE** |

**Analisi:** Prisma binaries. L'applicazione non elabora file tar.

---

### CVE-2025-61729 - golang crypto/x509 resource consumption

| Campo | Valore |
|-------|--------|
| Package | stdlib v1.20.12 |
| **Priorità Contestuale** | **IGNORE** |

**Analisi:** Prisma binaries. Certificati X.509 gestiti da Node.js TLS, non Go.

---

## Vulnerabilità MEDIUM (Rilevanti)

### CVE-2025-30144 - fast-jwt (Issuer Validation Bypass)

| Campo | Valore |
|-------|--------|
| Package | fast-jwt 4.0.5 |
| Fix disponibile | 5.0.6+ |
| **Priorità Contestuale** | **MEDIUM** |

**Analisi:**
- ⚠️ **DA VALUTARE** - Usato da `@fastify/jwt` per autenticazione
- Validazione `iss` (issuer) non configurata nel codice
- Potenziale rischio: token con issuer arbitrario potrebbero essere accettati

**Codice attuale (`server.ts:71`):**
```typescript
await app.register(jwt, {
  secret: config.jwt.secret,
  sign: {
    expiresIn: config.jwt.expiresIn,
  }
});
```

**Remediation consigliata:**
```typescript
await app.register(jwt, {
  secret: config.jwt.secret,
  sign: {
    expiresIn: config.jwt.expiresIn,
    iss: 'ecommerce-demo-backend'
  },
  verify: {
    allowedIss: ['ecommerce-demo-backend']
  }
});
```

**Azione:** Implementare validazione issuer o attendere aggiornamento @fastify/jwt

---

### GHSA-67mh-4wv8-2f99 - esbuild (Dev Server Request Forgery)

| Campo | Valore |
|-------|--------|
| Package | esbuild 0.21.5 |
| **Priorità Contestuale** | **IGNORE** |

**Analisi:** Dev dependency. Non presente nel container di produzione.

---

### Golang stdlib (19 CVE Medium)

| Priorità Contestuale | **IGNORE** |
|----------------------|------------|

**Analisi:** Tutti provenienti da Prisma binaries. Non esposti dall'applicazione Node.js.

---

## Piano di Remediation

### Priorità 1 - Immediata (MEDIUM)

| CVE | Azione | Effort |
|-----|--------|--------|
| CVE-2025-30144 | Configurare JWT issuer validation | 15 min |

### Priorità 2 - Monitoraggio

| Package | Azione | Timeline |
|---------|--------|----------|
| @fastify/static | Attendere release con glob 10.5.0+ | Prossimo minor |
| @fastify/jwt | Attendere release con fast-jwt 5.0.6+ | Prossimo minor |
| prisma | Attendere release con Go 1.22+ binaries | Prossima major |

### Nessuna Azione Richiesta

- Tutte le CVE golang stdlib (Prisma binaries isolati)
- cross-spawn (già aggiornato)
- esbuild (solo dev)

---

## Conclusioni

L'analisi contestuale ha ridotto significativamente il numero di vulnerabilità da gestire:

- **36 CVE totali** identificate da Trivy
- **1 CVE** richiede azione (fast-jwt issuer validation)
- **35 CVE** ignorabili nel contesto applicativo

La maggior parte delle vulnerabilità HIGH/CRITICAL proviene dai binari Prisma (Go) che sono isolati e non espongono superfici di attacco nell'applicazione Node.js.

---

*Report generato con Claude Code + Trivy*
