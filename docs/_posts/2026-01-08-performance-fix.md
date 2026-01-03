---
layout: post
title: "Performance Fix: Autoscaling Done Right"
date: 2026-01-08
category: Performance
reading_time: 10
tags: [kubernetes, hpa, autoscaling, performance, optimization]
excerpt: "Fixing the Day 6 bottleneck with Pod Anti-Affinity and aggressive HPA settings. From 235 to 550 RPS."
takeaway: "Autoscaling is not magic. Pod distribution, HPA thresholds, and resource limits all need tuning."
---

## Day 7: Fixing the Bottleneck

Day 6 revealed our bottleneck: a single backend pod at 97% CPU. Time to fix it.

### Changes Applied

- Pod Anti-Affinity (distribute pods across nodes)
- Optimized HPA thresholds (70% -> 45%)
- Increased max replicas (5 -> 7)
- Metrics Server installation for EKS

## Pod Anti-Affinity

### The Problem

All backend pods were landing on the same node:

```
Node 1: [backend-1] [backend-2] [frontend-1]
Node 2: [system pods only]
Node 3: [system pods only]
```

### The Solution

```yaml
# helm/backend/values-demo.yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchLabels:
              app.kubernetes.io/name: backend
          topologyKey: kubernetes.io/hostname
```

**Result:**

```
Node 1: [backend-1] [frontend-1]
Node 2: [backend-2] [backend-3]
Node 3: [backend-4] [backend-5]
```

## Optimized HPA

### Before vs After

| Parameter | Before | After |
|-----------|--------|-------|
| `targetCPUUtilizationPercentage` | 70% | 45% |
| `maxReplicas` | 5 | 7 |
| `minReplicas` | 2 | 2 |

**Why 45%?** With a lower threshold, HPA scales proactively *before* pods become overloaded.

## Stress Test Comparison

### k6 Metrics: Day 6 vs Day 7

| Metric | Day 6 (1 pod) | Day 7 (7-9 pods) | Change |
|--------|---------------|------------------|--------|
| **Total Requests** | 183,203 | 291,480 | **+59.1%** |
| **Average RPS** | 234.8 | 373.4 | **+59.0%** |
| **p95 Latency** | 380ms | 206ms | **-45.8%** |
| **p90 Latency** | ~320ms | 174ms | **-45.6%** |
| **Error Rate** | 5.33% | 5.27% | -0.06% |

### Autoscaling Behavior

```
Timeline during stress test:
00:00 - 2 pods (CPU 0%)
02:00 - 3 pods (CPU >45%)
03:00 - 4 pods (scaling)
05:00 - 5 pods (scaling)
06:00 - 7 pods (rapid scaling)
08:00 - 9 pods (max reached)
13:00 - Test completed
```

### Node Scaling

```
00:00 - 3 active nodes
05:00 - 4 nodes (Cluster Autoscaler adds 1)
08:00 - 5 nodes (max node group reached)
```

## Bug Fix: k6 Endpoint Path

During analysis, we found a bug in the k6 test:

```javascript
// BEFORE (wrong) - 15,356 errors
const meRes = authGet('/auth/me', token, {...})

// AFTER (correct)
const meRes = authGet(endpoints.me, token, {...})  // = '/api/auth/me'
```

All 15,356 `/me` endpoint errors were due to a wrong path.

## Post-Fix Validation (200 VUs)

After fixing the endpoint bug:

| Metric | Value |
|--------|-------|
| **Total Requests** | 428,677 |
| **Average RPS** | 549.6 |
| **p95 Latency** | 222ms |
| **Error Rate** | **0.00%** |
| **Requests <500ms** | 99.68% |
| **All Checks** | 100% (451,328 passed) |

## Total Improvements (Day 6 -> Day 7)

| Metric | Change |
|--------|--------|
| **Throughput** | +134% (234 -> 549 RPS) |
| **Latency p95** | -42% (380 -> 222ms) |
| **Error Rate** | -100% (5.33% -> 0%) |
| **Pod Capacity** | +250% (2 -> 7 pods) |
| **Node Capacity** | +67% (3 -> 5 nodes) |

## Node Resource Usage

### Pod Distribution After Anti-Affinity

| Node | Backend Pods | Frontend Pods | Other |
|------|--------------|---------------|-------|
| ip-10-0-35-133 | 2 | 1 | ArgoCD, ESO |
| ip-10-0-42-242 | 2 | 0 | - |
| ip-10-0-43-73 | 2 | 0 | - |
| ip-10-0-60-72 | 0 | 1 | Cluster Autoscaler |
| ip-10-0-63-155 | 1 | 0 | CoreDNS, metrics-server |

## Pending Pod Analysis

Two pods remained Pending during peak:

```
backend-5bc467bfc6-69g2n   0/1   Pending
backend-5bc467bfc6-kc5wf   0/1   Pending
```

**Cause:** Node group at maximum limit (5 nodes)

**Solution:** Increase `max_size` in Terraform EKS module to 7-10.

## Architecture Under Load

```
                    ┌─────────────────────────────────────┐
                    │         CloudFront CDN              │
                    └─────────────────────────────────────┘
                                    │
                    ┌─────────────────────────────────────┐
                    │      Application Load Balancer      │
                    │           (373 RPS peak)            │
                    └─────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
   ┌────┴────┐                 ┌────┴────┐                 ┌────┴────┐
   │ Node 1  │                 │ Node 2  │                 │ Node 3  │
   │ 2 pods  │                 │ 2 pods  │                 │ 2 pods  │
   └────┬────┘                 └────┬────┘                 └────┬────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
              ┌─────┴─────┐                   ┌─────┴─────┐
              │    RDS    │                   │   Redis   │
              │  (25% CPU)│                   │ (99.9% HR)│
              └───────────┘                   └───────────┘
```

## Lessons Learned

1. **HPA needs aggressive thresholds** - 70% is too high for bursty traffic
2. **Pod Anti-Affinity is essential** - Without it, pods concentrate on one node
3. **Metrics Server required** - EKS doesn't install it by default
4. **Node group limits matter** - Set realistic max sizes

---

*Next: [Deep Observability: X-Ray and Container Insights](/blog/observability/)*
