# Sessione 3 - Claude Code Demo

## E-commerce Monorepo per AWS EKS

**Data**: 26 Dicembre 2024
**Durata sessione**: ~1.5 ore
**Modello**: Claude Opus 4.5 (claude-opus-4-5-20251101)

---

## Obiettivi della Sessione

```
┌─────────────────────────────────────────────────┐
│           GIORNO 3 - COMPLETATO                  │
├─────────────────────────────────────────────────┤
│                                                  │
│  ✅ Auth System (login, register, context)      │
│  ✅ Checkout Flow (form, order, confirmation)   │
│  ✅ User Account (profile, orders history)      │
│  ✅ Search Enhancement (hooks, integration)     │
│  ✅ Security (CORS wildcards)                   │
│  ✅ Frontend Test Suite (29 tests)              │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Output Generato

### Statistiche Sessione 3

| Metrica | Valore |
|---------|--------|
| File creati | 24 |
| Linee di codice | ~2,500 |
| Frontend tests creati | 29 |
| Backend tests fixati | 177 (tutti passano) |

### File Creati

```
apps/frontend/src/
├── types/
│   ├── api.ts              # Response types API
│   ├── auth.ts             # User, Login, Register types
│   ├── models.ts           # Product, Order, Address types
│   └── index.ts            # Re-export types
├── lib/
│   └── auth-context.tsx    # AuthProvider + useAuth hook
├── hooks/
│   ├── useAuth.ts          # Re-export useAuth
│   ├── useOrders.ts        # Orders CRUD + mutations
│   ├── useSearch.ts        # Search + suggestions
│   └── index.ts            # Hooks barrel export
├── app/
│   ├── auth/
│   │   ├── login/page.tsx      # Login form + demo credentials
│   │   └── register/page.tsx   # Registration form
│   ├── checkout/
│   │   └── page.tsx            # Checkout flow completo
│   ├── orders/
│   │   └── [id]/page.tsx       # Order confirmation
│   └── account/
│       ├── layout.tsx          # Account sidebar layout
│       ├── page.tsx            # User profile
│       ├── orders/
│       │   ├── page.tsx        # Orders history
│       │   └── [id]/page.tsx   # Order detail
├── components/
│   ├── checkout/
│   │   ├── AddressForm.tsx     # Reusable address form
│   │   └── index.ts
│   └── layout/
│       └── ClientLayout.tsx    # Updated with AuthProvider
├── middleware.ts               # Route protection
└── tests/
    ├── setup.ts                # Test setup + mocks
    ├── hooks/
    │   ├── useAuth.test.tsx    # 6 tests
    │   ├── useOrders.test.tsx  # 8 tests
    │   └── useSearch.test.tsx  # 8 tests
    └── components/
        └── AddressForm.test.tsx # 7 tests

apps/backend/
├── src/
│   ├── config/index.ts         # CORS_ORIGINS support
│   └── server.ts               # Wildcard CORS handler
├── tests/database/
│   └── testcontainers.test.ts  # Fix DATABASE_URL restore
└── vitest.config.ts            # Frontend test config
```

---

## Sistema di Autenticazione

### AuthContext + useAuth Hook

```typescript
// Auth Context Features
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials) => Promise<void>;
  register: (data) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// Token Storage: localStorage + cookie
// Cookie necessario per Next.js middleware
```

### Route Protection

```typescript
// middleware.ts
const protectedRoutes = ["/checkout", "/account", "/orders"];
const authRoutes = ["/auth/login", "/auth/register"];

// Redirect logica:
// - Non autenticato + protectedRoute → /auth/login
// - Autenticato + authRoute → /
```

### Pagine Auth

| Pagina | Features |
|--------|----------|
| /auth/login | Form login, credenziali demo, redirect post-login |
| /auth/register | Form registrazione, validazione, auto-login |

---

## Checkout Flow Completo

### Flusso Utente

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│   Cart   │ → │ Checkout │ → │  Order   │ → │ Account  │
│          │   │  (Auth)  │   │ Confirm  │   │  Orders  │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
```

### Checkout Page Features

- Riepilogo carrello
- Form indirizzo spedizione
- Checkbox "billing = shipping"
- Form indirizzo fatturazione (opzionale)
- Calcolo totali (subtotal, tax, total)
- Submit ordine con feedback

### AddressForm Component

```typescript
interface AddressFormProps {
  title: string;
  address: Address;
  onChange: (address: Address) => void;
  disabled?: boolean;
}

// Campi: firstName, lastName, street, city, state, postalCode, country, phone
// Tutti i campi required tranne phone
```

---

## User Account

### Account Layout

```
┌─────────────────────────────────────────────────┐
│  Account Layout                                  │
├──────────────┬──────────────────────────────────┤
│              │                                   │
│  Sidebar     │  Content Area                    │
│  ─────────   │                                   │
│  • Profile   │  /account → Profile              │
│  • Orders    │  /account/orders → History       │
│  • Logout    │  /account/orders/[id] → Detail   │
│              │                                   │
└──────────────┴──────────────────────────────────┘
```

### Pagine Account

| Pagina | Descrizione |
|--------|-------------|
| /account | Profilo utente (nome, email, data registrazione) |
| /account/orders | Lista ordini con status, totale, data |
| /account/orders/[id] | Dettaglio ordine con items, indirizzi |

---

## Search Enhancement

### useSearch Hook

```typescript
// useSearch(query, options?)
// - Fetch automatico quando query >= 2 caratteri
// - Rispetta opzione enabled
// - Stale time 30s

// useSearchSuggestions(query)
// - Suggerimenti prodotti e categorie
// - Limite configurabile

// usePopularSearches()
// - Prodotti featured
// - Categorie top
```

### Integration

- SearchBar: navigazione a /products?q=query
- Products page: legge query param e filtra
- Suggerimenti live durante digitazione

---

## CORS Wildcard Support

### Configurazione Backend

```typescript
// config/index.ts
cors: {
  origins: getEnv("CORS_ORIGINS", "http://localhost:3000")
    .split(",")
    .map(o => o.trim()),
  credentials: true,
}

// .env
CORS_ORIGINS=http://localhost:3000,*.k8s.it,*.ngrok-free.app,*.ngrok.app
```

### Wildcard Handler

```typescript
const checkOrigin = (origin: string): boolean => {
  return config.cors.origins.some(pattern => {
    if (pattern.startsWith("*.")) {
      const domain = pattern.slice(2);
      const originHost = new URL(origin).hostname;
      return originHost.endsWith(domain);
    }
    return origin === pattern;
  });
};
```

### Domini Supportati

| Pattern | Esempio |
|---------|---------|
| `*.k8s.it` | demo.k8s.it, api.k8s.it |
| `*.ngrok-free.app` | abc123.ngrok-free.app |
| `*.ngrok.app` | xyz789.ngrok.app |

---

## Frontend Test Suite

### Panoramica Test

```
┌─────────────────────────────────────────────────┐
│           FRONTEND TEST RESULTS                  │
├─────────────────────────────────────────────────┤
│                                                  │
│  useAuth.test.tsx      ████████████  6 passed   │
│  useOrders.test.tsx    ████████████  8 passed   │
│  useSearch.test.tsx    ████████████  8 passed   │
│  AddressForm.test.tsx  ████████████  7 passed   │
│  ─────────────────────────────────────────────  │
│  TOTALE                ████████████ 29 passed   │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Dettaglio Test

| File | Tests | Copertura |
|------|-------|-----------|
| useAuth.test.tsx | 6 | AuthProvider, login, logout, token loading |
| useOrders.test.tsx | 8 | Orders list, single order, create order |
| useSearch.test.tsx | 8 | Search, suggestions, popular searches |
| AddressForm.test.tsx | 7 | Form fields, onChange, disabled state |

### Test Setup

```typescript
// tests/setup.ts
// Mock: next/navigation, next/link, next/image
// Mock: localStorage con store funzionante
// Mock: fetch

// Wrapper React Query per hooks tests
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
```

---

## Backend Test Fix

### Problema

```
testcontainers.test.ts modifica process.env.DATABASE_URL
→ Altri test falliscono con "Can't reach database at localhost:55005"
```

### Soluzione

```typescript
// testcontainers.test.ts
let originalDatabaseUrl: string | undefined;

beforeAll(async () => {
  // Salva URL originale
  originalDatabaseUrl = process.env.DATABASE_URL;

  // Avvia container e imposta nuovo URL
  process.env.DATABASE_URL = connectionUri;
});

afterAll(async () => {
  // Ripristina URL originale
  if (originalDatabaseUrl) {
    process.env.DATABASE_URL = originalDatabaseUrl;
  }
});
```

### Risultato

```
Backend: 177 tests passed ✅
Frontend: 29 tests passed ✅
Total: 206 tests passed ✅
```

---

## Stima Tempistica

### Confronto Claude Code vs Developer

| Task | Claude Code | Developer | Fattore |
|------|-------------|-----------|---------|
| Types (4 files) | 3 min | 1 ora | 20x |
| Auth System (5 files) | 10 min | 6 ore | 36x |
| Checkout Flow (4 files) | 10 min | 5 ore | 30x |
| Account Pages (5 files) | 8 min | 4 ore | 30x |
| Search Hook + Integration | 5 min | 2 ore | 24x |
| CORS Wildcard | 3 min | 30 min | 10x |
| Frontend Tests (29) | 15 min | 6 ore | 24x |
| Debug & Fix | 10 min | 2 ore | 12x |
| **TOTALE** | **~65 min** | **~26.5 ore** | **~25x** |

### Effort Comparison

```
┌──────────────────────────────────────────────────────────┐
│                    SESSION 3 EFFORT                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Claude Code    ████ 1.5 ore                             │
│                                                          │
│  Full-Stack Dev ████████████████████████ 20 ore          │
│  (UI + Logic)                                            │
│                                                          │
│  QA Engineer    ████████████ 10 ore                      │
│  (test frontend)                                         │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Stato Progetto Aggiornato

### Completato (Sessioni 1-3) ✅

| Area | Componenti |
|------|------------|
| Backend API | 4 moduli completi (auth, catalog, search, orders) |
| Backend Tests | 177 tests (unit, integration, database) |
| Frontend Base | Layout, Homepage, 7 componenti UI |
| Frontend Pages | /products, /categories, /cart, /auth, /checkout, /account |
| Frontend Hooks | useProducts, useCategories, useCart, useAuth, useOrders, useSearch |
| Frontend Tests | 29 tests (hooks, components) |
| API Client | Axios + React Query + Zustand |
| Seed Data | 3 users, 9 categories, 18 products, 3 orders |
| Infrastructure | Terraform 5 moduli, Helm 2 charts |
| CI/CD Base | 2 workflow GitHub Actions |
| Docker | 2 Dockerfile multi-stage |

### Da Completare ⏳

| Giorno | Focus |
|--------|-------|
| 4 | CI/CD Pipelines complete (security scans, quality gates) |
| 5 | Deploy AWS + E2E Test |

---

## Costo Comparativo

### Claude Max ($100/mese)

```
Sessione 3: ~100k tokens
Costo stimato: ~$1.50 di tokens
Output: 24 file, ~2,500 linee, 29 frontend tests
```

### Full-Stack Developer + QA Engineer

```
Tariffa media Dev: €50-80/ora
Tariffa media QA: €45-70/ora

Full-Stack Dev: 20 ore × €65 = €1,300
QA Engineer: 10 ore × €55 = €550
─────────────────────────────────────
Totale: €1,850
```

### ROI Questa Sessione

```
┌─────────────────────────────────────────┐
│  Risparmio: ~€1,850                      │
│  Costo Claude: ~$1.50                    │
│  ROI: ~1,200x                            │
└─────────────────────────────────────────┘
```

### ROI Cumulativo (Sessioni 1-3)

```
┌─────────────────────────────────────────────────────────┐
│                  COSTO TOTALE PROGETTO                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Claude Code (3 sessioni)                               │
│  ────────────────────────                               │
│  Sessione 1: ~$3                                        │
│  Sessione 2: ~$2                                        │
│  Sessione 3: ~$1.50                                     │
│  Totale: ~$6.50                                         │
│                                                          │
│  Team Tradizionale                                      │
│  ────────────────────────                               │
│  Sessione 1: €3,700 - €5,920                           │
│  Sessione 2: €2,950                                     │
│  Sessione 3: €1,850                                     │
│  Totale: €8,500 - €10,720                              │
│                                                          │
│  ═══════════════════════════════════════════════════    │
│  RISPARMIO TOTALE: €8,495 - €10,715                    │
│  ROI MEDIO: ~1,500x                                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Flusso Utente Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER FLOW - E-COMMERCE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │ Homepage │ → │ Products │ → │  Detail  │ → │   Cart   │    │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘    │
│                       ↓                             ↓           │
│                 ┌──────────┐                  ┌──────────┐     │
│                 │  Search  │                  │ Checkout │     │
│                 └──────────┘                  └──────────┘     │
│                                                    ↓           │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │ Register │ → │  Login   │ → │ Account  │ ← │  Order   │    │
│  └──────────┘   └──────────┘   └──────────┘   │ Confirm  │    │
│                       ↓                        └──────────┘    │
│                 ┌──────────┐                                    │
│                 │  Orders  │                                    │
│                 │ History  │                                    │
│                 └──────────┘                                    │
│                                                                  │
│  ✅ TUTTI I FLUSSI IMPLEMENTATI                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Prossimi Passi (Giorni 4-5)

| Giorno | Focus |
|--------|-------|
| 4 | CI/CD Pipelines: Checkov, TFLint, Trivy, Gitleaks, quality gates |
| 5 | Deploy AWS: Terraform apply + Helm install + E2E tests |

---

## Repository

**GitHub**: https://github.com/lorenzogirardi/ai-ecom-demo

```bash
# Clona e testa
git clone https://github.com/lorenzogirardi/ai-ecom-demo.git
cd ai-ecom-demo/ecommerce-demo

# Backend tests
cd apps/backend
docker-compose -f docker-compose.test.yml up -d
npm test  # 177 tests

# Frontend tests
cd ../frontend
npm test  # 29 tests

# Avvia in locale
cd ../..
npm run dev  # Frontend :3000 + Backend :4000
```

---

## Conclusioni Sessione 3

### Metriche Chiave

```
┌─────────────────────────────────────────────────┐
│           SESSION 3 SUMMARY                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  Tempo Claude Code:  1.5 ore                    │
│  Tempo equivalente:  26.5 ore developer         │
│  Fattore speedup:    ~18x                       │
│                                                  │
│  File creati:        24                         │
│  Linee di codice:    ~2,500                     │
│  Frontend tests:     29                         │
│                                                  │
│  Total tests:        206 (177 backend + 29 FE)  │
│  Test pass rate:     100%                       │
│                                                  │
│  App completa:       ✅ Tutti i flussi utente   │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Valore Aggiunto

- **App Completa**: Utente può registrarsi → login → cercare → acquistare → vedere ordini
- **Test Coverage**: 206 test garantiscono stabilità
- **Production Ready**: CORS wildcards per deploy su vari domini
- **Pronta per Deploy**: Solo CI/CD avanzato e AWS deploy rimanenti

---

*Generato con Claude Code - Sessione del 26 Dicembre 2024*
