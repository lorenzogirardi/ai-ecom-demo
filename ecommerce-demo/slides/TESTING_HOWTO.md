# How To: Test di Qualità con Claude Code

Guida per ottenere test completi e di qualità nei progetti sviluppati con Claude Code.

---

## Contesto: Cosa è Successo in Ecommerce-Demo

### Piano Originale vs Realtà

| Aspetto | Piano Originale | Realtà |
|---------|-----------------|--------|
| Sessione test | Sessione 12 | Sessione 2 |
| Requisiti espliciti | "test unitari" (generico) | Nessun requisito dettagliato |
| Output | Non specificato | 177 test completi |

### Risultato Ottenuto (Senza Input Specifico)

```
┌─────────────────────────────────────────────────┐
│              TEST SUITE GENERATA                 │
├─────────────────────────────────────────────────┤
│                                                  │
│  Unit Tests         ████████████  58 test       │
│  Integration Tests  ████████████ 102 test       │
│  Database Tests     ████████████  17 test       │
│  ─────────────────────────────────────────────  │
│  TOTALE             ████████████ 177 test       │
│                                                  │
│  Coverage: >80%                                  │
│  Pattern: TestFactory, Testcontainers           │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Perché i Test Sono Venuti Bene?

Claude ha applicato **best practice implicite**:

| Pattern Applicato | Descrizione |
|-------------------|-------------|
| **Test Pyramid** | Unit → Integration → E2E (proporzioni corrette) |
| **TestFactory** | Pattern per isolamento e riusabilità dati test |
| **Testcontainers** | Database reale in Docker per test realistici |
| **Mock strategici** | Redis mockato per unit, reale per integration |
| **Coverage target** | Soglia >80% come standard enterprise |

### Struttura Test Generata

```
tests/
├── setup.ts                    # Setup globale
├── utils/
│   ├── factories.ts            # TestFactory pattern
│   └── test-server.ts          # Server Fastify per test
├── unit/                       # Test isolati, veloci
│   ├── config.test.ts
│   ├── error-handler.test.ts
│   ├── auth-guard.test.ts
│   └── redis-cache.test.ts
├── integration/                # Test API con mock DB
│   ├── auth.test.ts
│   ├── catalog.test.ts
│   ├── search.test.ts
│   └── orders.test.ts
└── database/                   # Test con DB reale
    └── testcontainers.test.ts
```

---

## Come Replicare in Futuri Progetti

### Opzione 1: Prompt Esplicito (One-Shot)

Usa questo prompt quando chiedi di creare test:

```
Genera test completi per il backend:

REQUISITI:
- Unit tests per ogni utility e middleware
- Integration tests per ogni endpoint API
- Database tests con Testcontainers (PostgreSQL reale)
- E2E tests per flussi critici

PATTERN:
- TestFactory pattern per generazione dati test
- Setup/teardown per isolamento test
- Mock solo dove necessario (preferire implementazioni reali)

TARGET:
- Coverage: >80%
- Tutti i test devono passare in CI

STACK:
- Vitest (test runner)
- Supertest (HTTP assertions)
- Testcontainers (database reale)
- ioredis-mock (per unit tests Redis)

OUTPUT:
- File di configurazione (vitest.config.ts)
- Setup globale (tests/setup.ts)
- Factory per dati test (tests/utils/factories.ts)
- Test organizzati per tipo (unit/, integration/, database/)
```

---

### Opzione 2: CLAUDE.md del Progetto

Aggiungi questa sezione nel `CLAUDE.md` iniziale:

```markdown
## Testing Requirements

### Filosofia
- TDD quando possibile: scrivi test che falliscono prima del codice
- Preferisci implementazioni reali ai mock
- Ogni modulo deve avere test corrispondenti

### Coverage Target
- Minimo: 80%
- Critico (auth, pagamenti): 90%+

### Struttura Test
tests/
├── unit/           # Test isolati, nessuna dipendenza esterna
├── integration/    # Test API con mock database
├── database/       # Test con Testcontainers
└── e2e/            # Test full-stack (opzionale)

### Pattern Richiesti
- TestFactory per generazione dati consistenti
- Setup/teardown per isolamento
- Naming: `{module}.test.ts`

### Stack
- Runner: Vitest
- HTTP: Supertest
- Database: Testcontainers
- Mocking: Solo quando necessario

### Convenzioni
- Un file test per ogni modulo/route
- Describe blocks per raggruppare casi correlati
- Test names che descrivono il comportamento atteso
```

---

### Opzione 3: Skill Dedicata

Crea una skill in `~/.claude/skills/testing/SKILL.md`:

```markdown
---
name: testing
description: >-
  Testing patterns per progetti TypeScript/Node.js. Genera test completi
  con Vitest, Testcontainers e pattern TestFactory. Triggers on "test",
  "coverage", "unit test", "integration test", "TDD", "vitest", "jest".
  PROACTIVE: Genera test quando viene creato nuovo codice.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Testing Skill

## Quick Reference

| Tipo Test | Quando | Tool |
|-----------|--------|------|
| Unit | Utility, helpers, pure functions | Vitest |
| Integration | API endpoints, middleware | Vitest + Supertest |
| Database | Query, transactions, relations | Testcontainers |
| E2E | Flussi utente critici | Playwright/Cypress |

## Test Pyramid

       /\
      /E2E\        <- Pochi, lenti, costosi
     /──────\
    /Integr. \     <- Moderati
   /──────────\
  /   Unit     \   <- Molti, veloci, economici
 /──────────────\

## Pattern Obbligatori

### TestFactory
class TestFactory {
  static createUser(overrides?: Partial<User>): User
  static createProduct(overrides?: Partial<Product>): Product
  static createOrder(userId: string, items: OrderItem[]): Order
}

### Setup/Teardown
beforeAll: Setup database/mocks
afterEach: Pulisci dati test
afterAll: Chiudi connessioni

## Checklist Pre-Commit

- [ ] Nuovi test per nuovo codice
- [ ] Test esistenti ancora passano
- [ ] Coverage non diminuita
- [ ] Nessun test skippato (.skip)
```

---

## Confronto Opzioni

| Opzione | Pro | Contro | Quando Usare |
|---------|-----|--------|--------------|
| **Prompt esplicito** | Controllo totale | Da ripetere ogni volta | Progetti one-shot |
| **CLAUDE.md** | Automatico per progetto | Solo per quel progetto | Progetti strutturati |
| **Skill** | Riusabile ovunque | Setup iniziale | Multi-progetto |

---

## Esempio: Prompt Completo per Nuovo Progetto

```
Crea un backend API con test completi.

STACK:
- Fastify + TypeScript
- Prisma + PostgreSQL
- Redis per cache

MODULI:
- Auth (register, login, me)
- Products (CRUD)
- Orders (create, list, cancel)

TESTING (IMPORTANTE):
- Vitest come test runner
- TestFactory pattern per dati
- Testcontainers per database tests
- Coverage target: 80%+
- Struttura: tests/unit, tests/integration, tests/database

Genera codice E test insieme, non separatamente.
```

---

## Anti-Pattern da Evitare

| Anti-Pattern | Problema | Soluzione |
|--------------|----------|-----------|
| "Aggiungi test dopo" | Test superficiali | Chiedi test insieme al codice |
| Nessun requisito | Claude decide | Specifica coverage e tipi |
| Solo unit test | Falsa sicurezza | Richiedi integration + database |
| Mock everything | Test fragili | Usa Testcontainers |

---

## Checklist per Progetti Futuri

Prima di iniziare un nuovo progetto con Claude Code:

- [ ] Definisci requisiti test nel CLAUDE.md
- [ ] Specifica coverage target (es. 80%)
- [ ] Indica stack test preferito (Vitest, Jest, etc.)
- [ ] Richiedi pattern specifici (TestFactory, etc.)
- [ ] Chiedi test INSIEME al codice, non dopo

---

## Risorse

- [Vitest Documentation](https://vitest.dev/)
- [Testcontainers](https://testcontainers.com/)
- [Testing Library](https://testing-library.com/)
- [Test Pyramid - Martin Fowler](https://martinfowler.com/bliki/TestPyramid.html)

---

*Documento basato sull'esperienza ecommerce-demo: 177 test generati senza requisiti espliciti*
*Versione: 1.0.0 - 2026-01-15*
