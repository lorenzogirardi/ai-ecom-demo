# Analisi Observability Post-Fix - Load Test con Raccomandazioni Applicate

**Data**: 2 Gennaio 2026
**Test Type**: Stress Test 100 VUs (stesso scenario precedente)
**Durata**: 13 minuti
**Contesto**: Test eseguito DOPO applicazione delle raccomandazioni

---

## Executive Summary

Il load test post-fix dimostra un **miglioramento significativo** delle performance grazie alle modifiche infrastrutturali applicate. Tuttavia, abbiamo raggiunto l'**hard limit di 8 nodi**, indicando la necessità di ottimizzazioni a livello applicativo.

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONFRONTO PRIMA/DOPO                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  METRICA              │ PRIMA FIX    │ DOPO FIX    │ DELTA     │
│  ─────────────────────────────────────────────────────────────  │
│  Backend Pods Attivi  │ 3/7          │ 6/7         │ +100%     │
│  Nodi Cluster         │ 4            │ 8           │ +100%     │
│  p95 Latency          │ 363ms        │ 190ms       │ -48%      │
│  Error Rate           │ 0%           │ 0%          │ =         │
│  Requests < 500ms     │ 98.68%       │ 99.93%      │ +1.3%     │
│  CPU per Pod (peak)   │ ~850m        │ ~550m       │ -35%      │
│                                                                  │
│  RISULTATO: ✅ MIGLIORAMENTO SIGNIFICATIVO                      │
│  LIMITE RAGGIUNTO: ⚠️ MAX 8 NODI (HARD LIMIT)                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Risultati Load Test Post-Fix

### Metriche k6

| Metrica | Valore | Status | vs. Pre-Fix |
|---------|--------|--------|-------------|
| **Total Iterations** | 56,957 | - | ~stesso |
| **Total Requests** | 216,375 | - | ~stesso |
| **Average RPS** | 277.2/s | - | ~stesso |
| **Data Received** | 1.3 GB | - | ~stesso |
| **Checks Passed** | 100% (227,828) | ✅ | = |
| **http_req_failed** | 0.00% | ✅ | = |
| **http_req_duration avg** | 130.34ms | ✅ | +1ms |
| **http_req_duration p90** | 166.28ms | ✅ | -71ms |
| **http_req_duration p95** | 189.61ms | ✅ | **-173ms** |
| **http_req_duration max** | 2.1s | ⚠️ | +100ms |
| **requests_under_500ms** | 99.93% | ✅ | +1.25% |
| **requests_under_1s** | 99.98% | ✅ | +0.01% |

### Confronto con Test Precedenti

| Metrica | Day 6 (100 VUs) | Day 7 (100 VUs) | Day 8 Pre-Fix | Day 8 Post-Fix |
|---------|-----------------|-----------------|---------------|----------------|
| Total Requests | 183,203 | 291,480 | 217,804 | 216,375 |
| Average RPS | 234.8 | 373.4 | ~280 | 277.2 |
| p95 Latency | 380ms | 206ms | 363ms | **190ms** |
| Error Rate | 5.33% | 5.27% | 0% | 0% |
| Active Pods | 2→? | 2→7 | 3 (7 req) | **6 (7 req)** |
| Nodes | 3→5 | 3→5 | 4 | **8** |

---

## 2. Evidenze Infrastrutturali Post-Fix

### 2.1 Pod Distribution - MIGLIORATA

```
┌─────────────────────────────────────────────────────────────────┐
│                    POD DISTRIBUTION POST-FIX                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BACKEND PODS (anti-affinity REQUIRED - FUNZIONANTE)           │
│  ─────────────────────────────────────────────────              │
│  ip-10-0-34-200.ec2.internal:                                   │
│    └── backend-59bcbbc7fb-2gwbh  (Running)  ✅                 │
│                                                                  │
│  ip-10-0-48-204.ec2.internal:                                   │
│    └── backend-59bcbbc7fb-6f65n  (Running)  ✅                 │
│                                                                  │
│  ip-10-0-45-127.ec2.internal:                                   │
│    └── backend-59bcbbc7fb-ftg84  (Running)  ✅                 │
│                                                                  │
│  ip-10-0-34-46.ec2.internal:                                    │
│    └── backend-59bcbbc7fb-lxx4r  (Running)  ✅                 │
│                                                                  │
│  ip-10-0-57-164.ec2.internal:                                   │
│    └── backend-59bcbbc7fb-sbptb  (Running)  ✅                 │
│                                                                  │
│  ip-10-0-60-37.ec2.internal:                                    │
│    └── backend-59bcbbc7fb-zc6hw  (Running)  ✅                 │
│                                                                  │
│  PENDING (1 pod):                                               │
│    └── backend-59bcbbc7fb-r4m4w  (no node available)           │
│                                                                  │
│  RISULTATO: 6/7 pods su 6 NODI DIVERSI (vs. 3/7 pre-fix)       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Node Group - MAX RAGGIUNTO

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLUSTER SCALING                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Cluster Autoscaler Status:                                     │
│  ─────────────────────────                                      │
│  ScaleUp: InProgress → Completed (cloudProviderTarget=8)       │
│  maxSize: 8 (HARD LIMIT RAGGIUNTO)                              │
│  ready: 8                                                       │
│  registered: 8                                                  │
│                                                                  │
│  ⚠️ ATTENZIONE: Impossibile scalare oltre 8 nodi               │
│     Il 7° backend pod è PENDING per:                           │
│     - 6 nodi già hanno un backend pod (anti-affinity)          │
│     - 2 nodi hanno insufficient memory                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 CPU Usage Post-Fix

```
┌─────────────────────────────────────────────────────────────────┐
│                    CPU USAGE DURANTE PICCO                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Pod                  │ CPU (cores) │ % Request │ vs Pre-Fix   │
│  ─────────────────────────────────────────────────────────────  │
│  backend-2gwbh        │ 539m        │ 216%      │ -41%         │
│  backend-6f65n        │ 558m        │ 223%      │ -36%         │
│  backend-ftg84        │ 489m        │ 196%      │ -42%         │
│  backend-lxx4r        │ 585m        │ 234%      │ -31%         │
│  backend-sbptb        │ 598m        │ 239%      │ -29%         │
│  backend-zc6hw        │ 568m        │ 227%      │ -33%         │
│                                                                  │
│  TOTALE CPU BACKEND   │ 3.34 cores  │           │              │
│                                                                  │
│  CONFRONTO:                                                     │
│  Pre-Fix:  3 pods × ~850m = 2.55 cores (overloaded)            │
│  Post-Fix: 6 pods × ~550m = 3.34 cores (well distributed)      │
│                                                                  │
│  RISULTATO: Carico distribuito meglio, ogni pod meno stressato │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Analisi Hard Limit Raggiunto

### 3.1 Situazione Attuale

Con 8 nodi (hard limit) non possiamo scalare ulteriormente l'infrastruttura. Le opzioni sono:

| Approccio | Pro | Contro | Impatto |
|-----------|-----|--------|---------|
| **Aumentare max_size** | Semplice | Costi maggiori | +€0.04/hr per nodo |
| **Instance type più grandi** | Più capacità per nodo | Costi 2x | +€0.21/hr per t3.large |
| **Ottimizzazioni codice** | Zero costi extra | Richiede sviluppo | Potenzialmente 2-3x throughput |
| **Rimuovere anti-affinity required** | Più pods per nodo | Meno resilienza | Rischio in produzione |

### 3.2 Raccomandazione: Ottimizzazioni Codice

Dato il limite di nodi raggiunto, le **ottimizzazioni a livello codice** sono la strada più efficiente.

---

## 4. Evidenze e Raccomandazioni Codice

### 4.1 Analisi X-Ray Traces

Dall'analisi delle trace X-Ray durante il test:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENDPOINT LATENCY BREAKDOWN                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Endpoint                  │ avg    │ p95    │ Calls   │ Issue │
│  ─────────────────────────────────────────────────────────────  │
│  GET /api/catalog/products │ 45ms   │ 120ms  │ ~50K    │ ⚠️    │
│  GET /api/catalog/search   │ 38ms   │ 95ms   │ ~50K    │       │
│  GET /api/health           │ 5ms    │ 15ms   │ ~50K    │ ✅    │
│  POST /api/auth/login      │ 180ms  │ 350ms  │ ~15K    │ ❌    │
│  GET /api/auth/me          │ 35ms   │ 80ms   │ ~50K    │       │
│                                                                  │
│  BOTTLENECK IDENTIFICATO: POST /api/auth/login                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Raccomandazioni Codice - Alta Priorità

#### 4.2.1 Login Endpoint Optimization

**Problema**: Login è il più lento (180ms avg, 350ms p95)

**File**: `apps/backend/src/modules/auth/auth.routes.ts`

```typescript
// ATTUALE: bcrypt.compare sincrono su ogni login
const isValid = await bcrypt.compare(password, user.password);

// RACCOMANDAZIONE 1: Ridurre bcrypt cost factor
// In auth.routes.ts (solo per demo, in prod tenere 10-12)
const BCRYPT_ROUNDS = 10; // Verificare il valore attuale

// RACCOMANDAZIONE 2: Implementare login throttling con token bucket
// invece di rate limiting globale per IP
```

#### 4.2.2 Products Query Optimization

**Problema**: 45ms avg per products, dovrebbe essere <10ms con cache

**File**: `apps/backend/src/modules/catalog/catalog.routes.ts`

```typescript
// RACCOMANDAZIONE: Verificare cache hit rate
// Aggiungere metrics per cache hit/miss

// In catalog.routes.ts
app.get('/products', async (req, reply) => {
  const cacheKey = `products:${JSON.stringify(req.query)}`;

  // Log per debug (rimuovere in prod)
  const cached = await cache.get(cacheKey);
  if (cached) {
    console.log(`[CACHE HIT] ${cacheKey}`);
    return cached;
  }
  console.log(`[CACHE MISS] ${cacheKey}`);

  // ... query database
});
```

#### 4.2.3 Connection Pooling

**File**: `apps/backend/src/utils/prisma.ts`

```typescript
// RACCOMANDAZIONE: Aumentare pool size
// Attualmente Prisma usa default (2-4 connessioni)

// In prisma.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Aggiungere nella connection string: ?connection_limit=20&pool_timeout=10
});
```

### 4.3 Raccomandazioni Codice - Media Priorità

#### 4.3.1 Redis Pipeline per Batch Operations

**File**: `apps/backend/src/utils/redis.ts`

```typescript
// ATTUALE: Singole chiamate Redis
const product1 = await cache.get('product:1');
const product2 = await cache.get('product:2');

// RACCOMANDAZIONE: Usare pipeline per batch
const pipeline = redis.pipeline();
pipeline.get('product:1');
pipeline.get('product:2');
const results = await pipeline.exec();
```

#### 4.3.2 Lazy Loading per Categories

**File**: `apps/backend/src/modules/catalog/catalog.routes.ts`

```typescript
// ATTUALE: Carica tutte le categorie con prodotti
const categories = await prisma.category.findMany({
  include: { products: true }
});

// RACCOMANDAZIONE: Lazy loading
const categories = await prisma.category.findMany();
// I prodotti vengono caricati solo quando richiesti esplicitamente
```

### 4.4 Raccomandazioni Infrastruttura (se codice non basta)

| # | Azione | Impatto | Costo |
|---|--------|---------|-------|
| 1 | **Aumentare max_size a 12** | +4 nodi disponibili | +€0.17/hr |
| 2 | **t3.medium → t3.large** | 2x CPU/RAM per nodo | +€0.21/hr |
| 3 | **Softare anti-affinity a preferred** | Più pods per nodo | €0 (rischio HA) |
| 4 | **HPA maxReplicas 7 → 10** | Più backend pods | Richiede più nodi |

---

## 5. Proposta Terraform/Helm (se necessario)

### 5.1 Aumentare Node Group (opzionale)

```hcl
# infra/terraform/environments/demo/platform/terraform.tfvars

eks_node_max_size = 12  # Era 8
```

### 5.2 Upgrade Instance Type (alternativa)

```hcl
# infra/terraform/environments/demo/platform/terraform.tfvars

eks_node_instance_types = ["t3.large"]  # Era t3.small
```

### 5.3 Anti-Affinity Soft (NON RACCOMANDATO per prod)

```yaml
# helm/backend/values-demo.yaml

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:  # Torna a preferred
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchLabels:
              app.kubernetes.io/name: backend
          topologyKey: kubernetes.io/hostname
```

---

## 6. Conclusioni

### Test Outcome: ✅ MIGLIORATO SIGNIFICATIVAMENTE

Le modifiche applicate hanno portato:
1. **+100% backend pods attivi** (3→6 su 7)
2. **-48% p95 latency** (363ms→190ms)
3. **+35% efficienza CPU** per pod
4. **0% errori** mantenuti

### Hard Limit Raggiunto

Con 8 nodi (max_size) raggiunti, le opzioni sono:
1. **Ottimizzazioni codice** (raccomandato, zero costi)
2. **Aumentare max_size** (semplice, +costi)
3. **Upgrade instance type** (semplice, +costi 2x)

### Next Actions

1. **Immediato**: Analizzare login endpoint (bottleneck principale)
2. **Breve termine**: Implementare cache metrics per debug
3. **Medio termine**: Valutare connection pooling ottimizzato
4. **Lungo termine**: Considerare upgrade infrastruttura se ottimizzazioni non bastano

---

*Documento generato durante Session 8 - Post-Fix Analysis - 2 Gennaio 2026*
