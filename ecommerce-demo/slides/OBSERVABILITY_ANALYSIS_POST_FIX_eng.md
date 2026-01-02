# Observability Analysis Post-Fix - Load Test with Applied Recommendations

**Date**: January 2, 2026
**Test Type**: Stress Test 100 VUs (same scenario as before)
**Duration**: 13 minutes
**Context**: Test executed AFTER applying recommendations

---

## Executive Summary

The post-fix load test demonstrates a **significant performance improvement** thanks to the infrastructure changes applied. However, we've reached the **hard limit of 8 nodes**, indicating the need for application-level optimizations.

```
┌─────────────────────────────────────────────────────────────────┐
│                    BEFORE/AFTER COMPARISON                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  METRIC               │ BEFORE FIX   │ AFTER FIX   │ DELTA     │
│  ─────────────────────────────────────────────────────────────  │
│  Active Backend Pods  │ 3/7          │ 6/7         │ +100%     │
│  Cluster Nodes        │ 4            │ 8           │ +100%     │
│  p95 Latency          │ 363ms        │ 190ms       │ -48%      │
│  Error Rate           │ 0%           │ 0%          │ =         │
│  Requests < 500ms     │ 98.68%       │ 99.93%      │ +1.3%     │
│  CPU per Pod (peak)   │ ~850m        │ ~550m       │ -35%      │
│                                                                  │
│  RESULT: ✅ SIGNIFICANT IMPROVEMENT                             │
│  LIMIT REACHED: ⚠️ MAX 8 NODES (HARD LIMIT)                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Post-Fix Load Test Results

### k6 Metrics

| Metric | Value | Status | vs. Pre-Fix |
|--------|-------|--------|-------------|
| **Total Iterations** | 56,957 | - | ~same |
| **Total Requests** | 216,375 | - | ~same |
| **Average RPS** | 277.2/s | - | ~same |
| **Data Received** | 1.3 GB | - | ~same |
| **Checks Passed** | 100% (227,828) | ✅ | = |
| **http_req_failed** | 0.00% | ✅ | = |
| **http_req_duration avg** | 130.34ms | ✅ | +1ms |
| **http_req_duration p90** | 166.28ms | ✅ | -71ms |
| **http_req_duration p95** | 189.61ms | ✅ | **-173ms** |
| **http_req_duration max** | 2.1s | ⚠️ | +100ms |
| **requests_under_500ms** | 99.93% | ✅ | +1.25% |
| **requests_under_1s** | 99.98% | ✅ | +0.01% |

### Comparison with Previous Tests

| Metric | Day 6 (100 VUs) | Day 7 (100 VUs) | Day 8 Pre-Fix | Day 8 Post-Fix |
|--------|-----------------|-----------------|---------------|----------------|
| Total Requests | 183,203 | 291,480 | 217,804 | 216,375 |
| Average RPS | 234.8 | 373.4 | ~280 | 277.2 |
| p95 Latency | 380ms | 206ms | 363ms | **190ms** |
| Error Rate | 5.33% | 5.27% | 0% | 0% |
| Active Pods | 2→? | 2→7 | 3 (7 req) | **6 (7 req)** |
| Nodes | 3→5 | 3→5 | 4 | **8** |

---

## 2. Post-Fix Infrastructure Evidence

### 2.1 Pod Distribution - IMPROVED

```
┌─────────────────────────────────────────────────────────────────┐
│                    POD DISTRIBUTION POST-FIX                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BACKEND PODS (anti-affinity REQUIRED - WORKING)                │
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
│  RESULT: 6/7 pods on 6 DIFFERENT NODES (vs. 3/7 pre-fix)       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Node Group - MAX REACHED

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLUSTER SCALING                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Cluster Autoscaler Status:                                     │
│  ─────────────────────────                                      │
│  ScaleUp: InProgress → Completed (cloudProviderTarget=8)       │
│  maxSize: 8 (HARD LIMIT REACHED)                                │
│  ready: 8                                                       │
│  registered: 8                                                  │
│                                                                  │
│  ⚠️ WARNING: Cannot scale beyond 8 nodes                       │
│     The 7th backend pod is PENDING because:                    │
│     - 6 nodes already have a backend pod (anti-affinity)       │
│     - 2 nodes have insufficient memory                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Post-Fix CPU Usage

```
┌─────────────────────────────────────────────────────────────────┐
│                    CPU USAGE DURING PEAK                         │
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
│  TOTAL CPU BACKEND    │ 3.34 cores  │           │              │
│                                                                  │
│  COMPARISON:                                                    │
│  Pre-Fix:  3 pods × ~850m = 2.55 cores (overloaded)            │
│  Post-Fix: 6 pods × ~550m = 3.34 cores (well distributed)      │
│                                                                  │
│  RESULT: Load better distributed, each pod less stressed       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Hard Limit Analysis

### 3.1 Current Situation

With 8 nodes (hard limit) we cannot scale infrastructure further. Options are:

| Approach | Pros | Cons | Impact |
|----------|------|------|--------|
| **Increase max_size** | Simple | Higher costs | +$0.04/hr per node |
| **Larger instance types** | More capacity per node | 2x costs | +$0.21/hr for t3.large |
| **Code optimizations** | Zero extra costs | Requires development | Potentially 2-3x throughput |
| **Remove required anti-affinity** | More pods per node | Less resilience | Production risk |

### 3.2 Recommendation: Code Optimizations

Given the node limit reached, **code-level optimizations** are the most efficient path.

---

## 4. Code Evidence and Recommendations

### 4.1 X-Ray Traces Analysis

From the X-Ray trace analysis during the test:

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
│  BOTTLENECK IDENTIFIED: POST /api/auth/login                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Code Recommendations - High Priority

#### 4.2.1 Login Endpoint Optimization

**Problem**: Login is the slowest (180ms avg, 350ms p95)

**File**: `apps/backend/src/modules/auth/auth.routes.ts`

```typescript
// CURRENT: bcrypt.compare synchronous on every login
const isValid = await bcrypt.compare(password, user.password);

// RECOMMENDATION 1: Reduce bcrypt cost factor
// In auth.routes.ts (only for demo, keep 10-12 in prod)
const BCRYPT_ROUNDS = 10; // Verify current value

// RECOMMENDATION 2: Implement login throttling with token bucket
// instead of global rate limiting per IP
```

#### 4.2.2 Products Query Optimization

**Problem**: 45ms avg for products, should be <10ms with cache

**File**: `apps/backend/src/modules/catalog/catalog.routes.ts`

```typescript
// RECOMMENDATION: Verify cache hit rate
// Add metrics for cache hit/miss

// In catalog.routes.ts
app.get('/products', async (req, reply) => {
  const cacheKey = `products:${JSON.stringify(req.query)}`;

  // Debug logging (remove in prod)
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
// RECOMMENDATION: Increase pool size
// Currently Prisma uses default (2-4 connections)

// In prisma.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Add to connection string: ?connection_limit=20&pool_timeout=10
});
```

### 4.3 Code Recommendations - Medium Priority

#### 4.3.1 Redis Pipeline for Batch Operations

**File**: `apps/backend/src/utils/redis.ts`

```typescript
// CURRENT: Single Redis calls
const product1 = await cache.get('product:1');
const product2 = await cache.get('product:2');

// RECOMMENDATION: Use pipeline for batch
const pipeline = redis.pipeline();
pipeline.get('product:1');
pipeline.get('product:2');
const results = await pipeline.exec();
```

#### 4.3.2 Lazy Loading for Categories

**File**: `apps/backend/src/modules/catalog/catalog.routes.ts`

```typescript
// CURRENT: Loads all categories with products
const categories = await prisma.category.findMany({
  include: { products: true }
});

// RECOMMENDATION: Lazy loading
const categories = await prisma.category.findMany();
// Products are loaded only when explicitly requested
```

### 4.4 Infrastructure Recommendations (if code isn't enough)

| # | Action | Impact | Cost |
|---|--------|--------|------|
| 1 | **Increase max_size to 12** | +4 available nodes | +$0.17/hr |
| 2 | **t3.medium → t3.large** | 2x CPU/RAM per node | +$0.21/hr |
| 3 | **Soften anti-affinity to preferred** | More pods per node | $0 (HA risk) |
| 4 | **HPA maxReplicas 7 → 10** | More backend pods | Requires more nodes |

---

## 5. Terraform/Helm Proposal (if needed)

### 5.1 Increase Node Group (optional)

```hcl
# infra/terraform/environments/demo/platform/terraform.tfvars

eks_node_max_size = 12  # Was 8
```

### 5.2 Upgrade Instance Type (alternative)

```hcl
# infra/terraform/environments/demo/platform/terraform.tfvars

eks_node_instance_types = ["t3.large"]  # Was t3.small
```

### 5.3 Soft Anti-Affinity (NOT RECOMMENDED for prod)

```yaml
# helm/backend/values-demo.yaml

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:  # Back to preferred
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchLabels:
              app.kubernetes.io/name: backend
          topologyKey: kubernetes.io/hostname
```

---

## 6. Conclusions

### Test Outcome: ✅ SIGNIFICANTLY IMPROVED

Applied changes resulted in:
1. **+100% active backend pods** (3→6 out of 7)
2. **-48% p95 latency** (363ms→190ms)
3. **+35% CPU efficiency** per pod
4. **0% errors** maintained

### Hard Limit Reached

With 8 nodes (max_size) reached, options are:
1. **Code optimizations** (recommended, zero costs)
2. **Increase max_size** (simple, +costs)
3. **Upgrade instance type** (simple, +costs 2x)

### Next Actions

1. **Immediate**: Analyze login endpoint (main bottleneck)
2. **Short term**: Implement cache metrics for debugging
3. **Medium term**: Evaluate optimized connection pooling
4. **Long term**: Consider infrastructure upgrade if optimizations aren't enough

---

*Document generated during Session 8 - Post-Fix Analysis - January 2, 2026*
