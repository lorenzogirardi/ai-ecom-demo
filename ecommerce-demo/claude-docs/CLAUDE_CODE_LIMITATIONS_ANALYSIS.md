# Analisi dei Limiti di Claude Code - E-commerce Demo

> **Obiettivo**: Documentare ogni problema trovato nel codice, spiegare PERCHE' Claude Code ha preso quella decisione, e fornire linee guida per scrivere prompt migliori.

**Progetto analizzato**: ecommerce-demo (10 sessioni di sviluppo)
**Issues trovati**: 38+ problemi (9 High, 19 Medium, 10 Low)
**Data analisi**: 2026-01-21

---

## Executive Summary

Claude Code ha prodotto un progetto funzionante e ben strutturato, ma con diversi "debiti tecnici" tipici di uno sviluppo veloce. Questo documento analizza **perche'** sono stati fatti certi errori e come **prevenirli** con prompt migliori.

### Pattern Ricorrenti degli Errori

| Pattern | Frequenza | Causa Root |
|---------|-----------|------------|
| Valori hardcoded | 12 issues | Prompt non specificava configurabilita' |
| Inconsistenze FE/BE | 5 issues | Sviluppo separato senza spec condivisa |
| Feature incomplete | 8 issues | "Demo" implica MVP, non production |
| Security gaps | 9 issues | Prompt focalizzati su funzionalita', non sicurezza |
| Race conditions | 3 issues | Mancanza di requisiti di concurrency |

---

## CATEGORIA 1: ERRORI DI CALCOLO E PRECISIONE

### Issue 1.1: Floating-Point nei Calcoli del Carrello

**File**: `apps/frontend/src/hooks/useCart.ts:72-81`

```typescript
getTotal: () => {
  const { items } = get();
  return items.reduce((total, item) => {
    const price =
      typeof item.product.price === "string"
        ? parseFloat(item.product.price)
        : item.product.price;
    return total + price * item.quantity;  // FLOATING POINT!
  }, 0);
},
```

**Il Problema**: JavaScript usa IEEE 754 floating-point. `19.99 * 3 = 59.96999999999999`

**Perche' Claude Code ha fatto questa scelta**:
- Il prompt originale era: *"Generate useCart hook with Zustand for cart management"*
- Non c'era menzione di precisione decimale o gestione valute
- La soluzione "ovvia" in JS e' usare numeri nativi
- Il pattern `reduce` con moltiplicazione e' idiomatico

**Come prevenire con prompt migliori**:

```markdown
PROMPT MIGLIORATO:
"Generate useCart hook with Zustand.
IMPORTANT: All monetary calculations must use integer cents
(e.g., $19.99 = 1999 cents) to avoid floating-point errors.
Convert to display format only at render time."
```

**Checklist da aggiungere al CLAUDE.md**:
```markdown
## Money Handling Convention
- Store prices as integers (cents)
- Use decimal.js for calculations if float needed
- Never trust client-side price calculations
- Backend is source of truth for all monetary values
```

---

### Issue 1.2: Soglia Spedizione Inconsistente

**File 1**: `apps/frontend/src/app/cart/page.tsx:32`
```typescript
const shipping = subtotal > 50 ? 0 : 9.99;  // $50 threshold
```

**File 2**: `apps/frontend/src/app/checkout/page.tsx:40`
```typescript
const shipping = subtotal > 100 ? 0 : 9.99;  // $100 threshold!
```

**File 3**: `apps/backend/src/modules/orders/orders.routes.ts:130`
```typescript
const shippingAmount = new Prisma.Decimal(0);  // Always free!
```

**Il Problema**: Tre valori diversi per la stessa logica business.

**Perche' Claude Code ha fatto questa scelta**:
- Cart page e Checkout page sviluppati in sessioni DIVERSE
- Il prompt per checkout non menzionava "mantieni consistenza con cart"
- Backend sviluppato con comment "// Free shipping for demo"
- Nessuna spec condivisa definiva le regole di shipping

**Come prevenire con prompt migliori**:

```markdown
PROMPT MIGLIORATO:
"Generate checkout page.
CRITICAL: Shipping calculation must match cart page exactly:
- Free shipping if subtotal > $50
- Otherwise $9.99 flat rate
- Backend must validate these same rules"
```

**Checklist da aggiungere al CLAUDE.md**:
```markdown
## Business Rules (Single Source of Truth)
### Shipping
- FREE_SHIPPING_THRESHOLD = 50 (USD)
- FLAT_RATE_SHIPPING = 9.99 (USD)
- Rule: subtotal > threshold ? 0 : flatRate

### Tax
- TAX_RATE = 0.10 (10%)
- Applied to subtotal only, not shipping
```

---

### Issue 1.3: Tax Rate Hardcoded Ovunque

**Locations**:
- `cart/page.tsx:33`: `const tax = subtotal * 0.1`
- `checkout/page.tsx:41`: `const tax = subtotal * 0.1`
- `orders.routes.ts:128`: `const taxRate = new Prisma.Decimal(0.1)`

**Perche' Claude Code ha fatto questa scelta**:
- Il prompt diceva *"simplified - 10% tax"*
- "Simplified" implica hardcoding per demo
- Nessuna menzione di tax configurabile o per regione

**Come prevenire**:

```markdown
PROMPT MIGLIORATO:
"Tax calculation should use a configurable rate from config/constants.
Even for demo, avoid hardcoding business values in multiple files.
Create a shared constants file imported everywhere."
```

---

## CATEGORIA 2: SICUREZZA

### Issue 2.1: JWT Secret con Default Hardcoded

**File**: `apps/backend/src/config/index.ts:60-61`

```typescript
secret: getEnv("JWT_SECRET", "development-secret-change-me"),
```

**Perche' Claude Code ha fatto questa scelta**:
- Pattern comune: default per development, override per production
- Il prompt non specificava "no default secrets"
- Utile per avviare il progetto senza configurazione

**Il Problema Reale**: Se qualcuno deploya senza settare JWT_SECRET, usa il default.

**Come prevenire**:

```markdown
PROMPT MIGLIORATO:
"Configuration should have NO default values for secrets (JWT_SECRET,
DB passwords, API keys). Throw error on startup if missing."
```

**Checklist per CLAUDE.md**:
```markdown
## Security Configuration
- NEVER provide default values for secrets
- Use required() pattern: getEnvRequired("JWT_SECRET")
- Fail fast on missing security config
- Log warning if using development defaults
```

---

### Issue 2.2: Token Non Invalidato al Logout

**File**: `apps/backend/src/modules/auth/auth.routes.ts:407-421`

```typescript
app.post("/logout", { preHandler: [authGuard] }, async (request, reply) => {
  // In a production app, you might want to:
  // 1. Add the token to a blacklist in Redis
  // 2. Delete refresh tokens from the database
  return reply.send({ success: true, message: "Logged out successfully" });
});
```

**Perche' Claude Code ha fatto questa scelta**:
- Il TODO comment indica che Claude SAPEVA fosse incompleto
- Il prompt probabilmente diceva "implement logout endpoint"
- Implementare blacklist richiede Redis setup addizionale
- "Demo" implica semplificazione

**Come prevenire**:

```markdown
PROMPT MIGLIORATO:
"Implement logout that ACTUALLY invalidates the token.
Options:
1. Store token in Redis blacklist with TTL
2. Use short-lived tokens (15min) + refresh tokens
3. Store session ID in DB, delete on logout
Choose option 1 or 2. Do not leave as TODO."
```

---

### Issue 2.3: Password Change Non Invalida Sessioni

**File**: `apps/backend/src/modules/auth/auth.routes.ts:342-405`

```typescript
await prisma.user.update({
  where: { id: request.userId },
  data: { password: hashedPassword },
});
// No session/token invalidation
```

**Perche' Claude Code ha fatto questa scelta**:
- Il prompt era "implement password change"
- Non menzionava invalidazione sessioni
- Tecnicamente la password E' cambiata (requisito soddisfatto)

**Come prevenire**:

```markdown
PROMPT MIGLIORATO:
"Implement password change with these requirements:
1. Verify current password
2. Hash and store new password
3. INVALIDATE ALL existing sessions/tokens for this user
4. Force re-login on all devices
5. Log security event"
```

---

### Issue 2.4: Rate Limit Bypass Token Hardcoded

**File**: `apps/backend/src/config/index.ts:83-86`

```typescript
bypassToken: getEnv(
  "RATE_LIMIT_BYPASS_TOKEN",
  "k6-load-test-bypass-token-2025",
),
```

**Perche' Claude Code ha fatto questa scelta**:
- Aggiunto durante Day 6 per k6 load testing
- Il prompt diceva "add rate limit bypass for load testing"
- Default aggiunto per convenience durante sviluppo

**Il Problema**: Chiunque legge il repo conosce il bypass token.

**Come prevenire**:

```markdown
PROMPT MIGLIORATO:
"Add rate limit bypass header for load testing.
The bypass token MUST NOT have a default value.
Generate a random token and document how to set it."
```

---

### Issue 2.5: localStorage per JWT (XSS Vulnerable)

**File**: `apps/frontend/src/lib/auth-context.tsx:49,86-87`

```typescript
const storedToken = localStorage.getItem(TOKEN_KEY);
localStorage.setItem(TOKEN_KEY, newToken);
```

**Perche' Claude Code ha fatto questa scelta**:
- Pattern molto comune in tutorial React
- Semplice da implementare
- Il prompt non specificava requisiti di sicurezza storage

**Come prevenire**:

```markdown
PROMPT MIGLIORATO:
"Implement auth token storage using httpOnly cookies, not localStorage.
This prevents XSS attacks from stealing tokens.
Backend should set cookie with: httpOnly, secure, sameSite=strict"
```

---

## CATEGORIA 3: RACE CONDITIONS E DATA INTEGRITY

### Issue 3.1: Stock Check Fuori dalla Transaction

**File**: `apps/backend/src/modules/orders/orders.routes.ts:94-125`

```typescript
// Stock check OUTSIDE transaction
for (const item of body.items) {
  if (product.stock < item.quantity) {
    throw new BadRequestError(`Insufficient stock`);
  }
}

// Stock update INSIDE transaction (later)
const order = await prisma.$transaction(async (tx) => {
  for (const item of body.items) {
    await tx.product.update({
      data: { stock: { decrement: item.quantity } },
    });
  }
});
```

**Il Problema**: Due ordini simultanei possono entrambi passare il check e oversellare.

**Perche' Claude Code ha fatto questa scelta**:
- Logicamente corretto: prima valida, poi esegui
- Il prompt non menzionava concurrency o race conditions
- Pattern check-then-act e' intuitivo

**Come prevenire**:

```markdown
PROMPT MIGLIORATO:
"Implement order creation with proper concurrency handling:
1. Use SELECT FOR UPDATE to lock products during stock check
2. Stock validation AND decrement must be in same transaction
3. Handle concurrent order attempts gracefully
4. Consider using optimistic locking with version field"
```

**Checklist per CLAUDE.md**:
```markdown
## Database Transactions
- Stock operations: always use SELECT FOR UPDATE
- Validate AND modify in same transaction
- Consider race conditions for any resource with limited quantity
- Use optimistic locking for high-contention resources
```

---

### Issue 3.2: Cart in localStorage (Multi-Tab Race)

**File**: `apps/frontend/src/hooks/useCart.ts`

**Il Problema**: Due tab aperte, stesso carrello, last-write-wins.

**Perche' Claude Code ha fatto questa scelta**:
- Zustand + persist e' il pattern standard
- Server-side cart richiede auth e piu' complessita'
- Il prompt diceva "cart with localStorage persistence"

**Come prevenire**:

```markdown
PROMPT MIGLIORATO:
"Implement cart with these features:
1. localStorage for anonymous users
2. Server-side sync for logged-in users
3. Merge strategy when user logs in
4. Handle multi-tab conflicts with timestamp versioning"
```

---

## CATEGORIA 4: FEATURES INCOMPLETE

### Issue 4.1: Refresh Token Non Implementato

**File**: `apps/backend/prisma/schema.prisma:36-51`

```prisma
model Session {
  refreshToken String   @unique @map("refresh_token")
  // Schema esiste ma nessun endpoint lo usa!
}
```

**Perche' Claude Code ha fatto questa scelta**:
- Lo schema e' stato generato con "best practices"
- L'endpoint di refresh non era nei requisiti espliciti
- Il campo e' stato aggiunto "per dopo"

**Come prevenire**:

```markdown
PROMPT MIGLIORATO:
"Implement complete JWT auth with:
1. Access token (15min expiry)
2. Refresh token (7 days)
3. POST /auth/refresh endpoint
4. Refresh token rotation (invalidate old on use)
5. Logout invalidates refresh token

Do not just add schema fields - implement the full flow."
```

---

### Issue 4.2: Discount Amount Field Mai Usato

**File**: `apps/backend/prisma/schema.prisma:131`

```prisma
discountAmount  Decimal     @default(0) @map("discount_amount")  // UNUSED
```

**File**: `apps/frontend/src/components/cart/CartSummary.tsx:10,67-74`

```typescript
discount?: number;  // Prop defined but never passed
```

**Perche' Claude Code ha fatto questa scelta**:
- Schema generato con campi "standard" per e-commerce
- Component ha prop per "future use"
- Nessun prompt chiedeva sistema coupon

**Come prevenire**:

```markdown
PROMPT MIGLIORATO:
"Generate e-commerce schema.
IMPORTANT: Only include fields that will be used.
Do not add 'future use' fields without implementation.
If adding discount field, also implement:
- Coupon table
- Validation endpoint
- Application logic"
```

---

### Issue 4.3: Stripe Config Presente Ma Non Usato

**File**: `apps/backend/src/config/index.ts:110-114`

```typescript
stripe: {
  secretKey: getEnv("STRIPE_SECRET_KEY", ""),
  webhookSecret: getEnv("STRIPE_WEBHOOK_SECRET", ""),
},
```

**Perche' Claude Code ha fatto questa scelta**:
- Config generata con "common integrations"
- ORIGINAL_IDEA.md diceva "mock payment"
- Config esiste per "quando serve"

**Il Problema**: Ordini creati senza pagamento reale.

**Come prevenire**:

```markdown
PROMPT MIGLIORATO:
"Payment handling options:
A) Mock payment (for demo) - add clear 'DEMO MODE' indicator
B) Stripe integration - full implementation required

Choose A or B. If A, add:
- Banner 'Demo Mode - No Real Payments'
- Block in production without STRIPE_SECRET_KEY"
```

---

## CATEGORIA 5: PERFORMANCE

### Issue 5.1: N+1 Query negli Orders

**File**: `apps/backend/src/modules/orders/orders.routes.ts:191-208`

```typescript
prisma.order.findMany({
  include: {
    items: {
      include: {
        product: { select: { id: true, name: true, imageUrl: true } },
      },
    },
  },
});
```

**Perche' Claude Code ha fatto questa scelta**:
- Prisma include e' il pattern standard
- Funziona correttamente
- Performance non era un requisito esplicito

**Come prevenire**:

```markdown
PROMPT MIGLIORATO:
"Implement orders list endpoint.
Performance requirements:
- Limit includes to necessary fields
- Add pagination (max 20 items)
- Consider query count (avoid N+1)
- Log slow queries (>100ms)"
```

---

### Issue 5.2: Cache Key Collision

**File**: `apps/backend/src/modules/search/search.routes.ts:30`

```typescript
const cacheKey = `search:${searchTerm}:${type}:${page}:${categoryId || ""}`;
// "search:laptop:all:1:" vs "search:laptop:all:1" - collision!
```

**Perche' Claude Code ha fatto questa scelta**:
- Pattern `value || ""` e' comune per null handling
- Non ovvio che crei collisioni
- Test non copriva questo edge case

**Come prevenire**:

```markdown
PROMPT MIGLIORATO:
"Implement search caching.
Cache key requirements:
- Use explicit null marker (e.g., '__NULL__')
- Include ALL query parameters in key
- Test cache key uniqueness for edge cases
- Add cache key validation"
```

---

## CATEGORIA 6: CONFIGURAZIONE E DEFAULTS

### Issue 6.1: Swagger Abilitato di Default

**File**: `apps/backend/src/config/index.ts:90-92`

```typescript
swagger: {
  enabled: getEnvBoolean("ENABLE_SWAGGER", true),  // Default TRUE!
},
```

**Perche' Claude Code ha fatto questa scelta**:
- Utile durante sviluppo
- Il prompt non specificava produzione vs development

**Come prevenire**:

```markdown
PROMPT MIGLIORATO:
"Configuration should have sensible production defaults:
- Swagger: disabled by default (enable in dev)
- Debug logging: disabled by default
- Rate limiting: enabled by default"
```

**Checklist per CLAUDE.md**:
```markdown
## Production Defaults
- ENABLE_SWAGGER=false (expose in dev only)
- LOG_LEVEL=info (not debug)
- ENABLE_RATE_LIMITING=true
- NODE_ENV must be 'production' in prod
```

---

## LEZIONI APPRESE: COME SCRIVERE PROMPT MIGLIORI

### 1. Specifica Sempre i Requisiti Non-Funzionali

```markdown
BAD:  "Implement cart functionality"
GOOD: "Implement cart with:
       - Integer cents for prices (no floating point)
       - Optimistic UI with server validation
       - Multi-tab sync via BroadcastChannel
       - Max 99 quantity per item"
```

### 2. Esplicita la Consistenza Cross-Component

```markdown
BAD:  "Generate checkout page"
GOOD: "Generate checkout page.
       MUST match cart page for:
       - Shipping calculation (see cart/page.tsx:32)
       - Tax calculation (see cart/page.tsx:33)
       - Price display format"
```

### 3. Definisci Security Requirements Upfront

```markdown
BAD:  "Implement authentication"
GOOD: "Implement authentication with:
       - httpOnly cookies (not localStorage)
       - CSRF protection
       - Token refresh with rotation
       - Session invalidation on password change
       - Brute force protection (5 attempts/15min)"
```

### 4. Specifica Cosa NON Fare

```markdown
ADD TO PROMPT:
"Do NOT:
- Add default values for secrets
- Leave TODO comments for security features
- Add schema fields without implementation
- Hardcode business values in multiple files"
```

### 5. Richiedi Test per Edge Cases

```markdown
ADD TO PROMPT:
"Include tests for:
- Concurrent requests (race conditions)
- Boundary values (0, negative, max)
- Cache key collisions
- Transaction rollback scenarios"
```

### 6. Usa CLAUDE.md come Single Source of Truth

```markdown
## Business Rules (aggiungere al CLAUDE.md)
FREE_SHIPPING_THRESHOLD=50
FLAT_SHIPPING_RATE=9.99
TAX_RATE=0.10
MAX_CART_QUANTITY=99
SESSION_TIMEOUT_MINUTES=15

## Security Conventions
- No default secrets
- Fail fast on missing config
- Use httpOnly cookies for tokens
```

---

## TEMPLATE: Checklist Pre-Prompt per E-commerce

Prima di chiedere a Claude Code di implementare funzionalita' e-commerce, verifica:

```markdown
## CHECKLIST PRE-PROMPT

### Money & Prices
[ ] Specificato formato (cents vs decimali)?
[ ] Definita precisione (2 decimali)?
[ ] Definita currency handling?
[ ] Chi e' source of truth (backend)?

### Security
[ ] Dove salvare token (httpOnly cookie)?
[ ] Come invalidare sessioni?
[ ] Rate limiting requirements?
[ ] Input validation requirements?

### Consistency
[ ] Esistono componenti simili? (Link al file)
[ ] Business rules gia' definite? (Link a CLAUDE.md)
[ ] Formato dati condiviso FE/BE?

### Concurrency
[ ] Risorse con quantita' limitata? (stock, seats)
[ ] Operazioni che devono essere atomiche?
[ ] Multi-tab/device considerations?

### Production Readiness
[ ] Defaults sicuri per production?
[ ] Feature flags per demo vs prod?
[ ] Logging e monitoring requirements?
```

---

## CONCLUSIONI

### Cosa Claude Code Fa Bene
- Struttura del progetto
- Pattern idiomatici
- Codice funzionante al primo tentativo
- TypeScript corretto
- Test coverage decente

### Dove Claude Code Ha Bisogno di Guida
- Requisiti non-funzionali (performance, security, concurrency)
- Consistenza tra componenti sviluppati separatamente
- Production vs development defaults
- Edge cases e race conditions
- Business rules cross-component

### La Regola d'Oro

> **Se non lo specifichi nel prompt, Claude Code assumera' la soluzione piu' semplice che funziona.**

Questo e' razionale per un "demo", ma crea debito tecnico per "production".

---

*Documento generato dall'analisi del codebase ecommerce-demo*
*38 issues analizzati, categorizzati per root cause*
*Obiettivo: migliorare i prompt per progetti futuri*
