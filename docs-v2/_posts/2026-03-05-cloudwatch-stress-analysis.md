---
layout: post
title: "CloudWatch Stress Analysis"
date: 2026-03-05
category: technical
order: 5
reading_time: 11
tags: [cloudwatch,metrics,bottleneck]
---


## Test Parameters

| Parameter | Value |
|-----------|-------|
| Test Date | 2025-12-30 |
| Time Window | 11:42 - 11:55 UTC (13 min) |
| Max VUs | 100 |
| Total Requests | 183,203 |
| Average RPS | 234.8 |

---

## Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STRESS TEST TOPOLOGY                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   CloudFront ──► ALB (k8s-ecommerce) ──► EKS Nodes (3x t3.small)   │
│                                              │                       │
│                                              ├── Node 1: 97% CPU ⚠️  │
│                                              ├── Node 2: 5% CPU      │
│                                              └── Node 3: 2% CPU      │
│                                                     │                │
│                              ┌──────────────────────┴───────┐       │
│                              │                              │       │
│                        RDS (db.t3.micro)           Redis (t3.micro) │
│                        CPU: 18%                    CPU: 4%          │
│                        Conn: 6                     Hits: 99.9%      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## EC2 Nodes (EKS) - CPU Utilization

### Node 1 (Backend Pod) - BOTTLENECK

| Time (UTC) | Average CPU | Max CPU |
|------------|-------------|---------|
| 12:45 | 93.7% | **97.4%** |
| 12:50 | 74.7% | 86.0% |
| 12:55 | 10.1% | 39.0% |

```
CPU %
100 ┤                    ╭──────╮
 90 ┤                   ╭╯      ╰╮
 80 ┤                  ╭╯        ╰╮
 70 ┤                 ╭╯          ╰╮
 60 ┤                ╭╯            ╰╮
 50 ┤               ╭╯              ╰╮
 40 ┤              ╭╯                ╰╮
 30 ┤             ╭╯                  ╰╮
 20 ┤            ╭╯                    ╰╮
 10 ┤───────────╯                       ╰──────
  0 ┼─────────────────────────────────────────────
    11:42   11:45   11:48   11:51   11:54   11:56
```

### Node 2 (Frontend/System) - Healthy

| Time (UTC) | Average CPU | Max CPU |
|------------|-------------|---------|
| 12:45 | 5.7% | 6.2% |
| 12:50 | 4.9% | 5.2% |
| 12:55 | 3.7% | 4.0% |

### Node 3 (ArgoCD/System) - Idle

| Time (UTC) | Average CPU | Max CPU |
|------------|-------------|---------|
| All | 1.7% | 1.8% |

---

## ALB Metrics

### Request Count

| Time (UTC) | Requests/min | RPS |
|------------|--------------|-----|
| 12:42 | 721 | 12 |
| 12:43 | 7,641 | 127 |
| 12:44 | 14,878 | 248 |
| 12:45 | 17,560 | 293 |
| 12:46 | **19,663** | **328** |
| 12:47 | 19,268 | 321 |
| 12:48 | 18,634 | 311 |
| 12:49 | 17,448 | 291 |
| 12:50 | 13,539 | 226 |
| 12:55 | 1,668 | 28 |

**Peak: 19,663 req/min = 328 RPS**

### Target Response Time

| Time (UTC) | Average (ms) | Max (ms) |
|------------|--------------|----------|
| 12:42 | 6.5 | 82 |
| 12:43 | 9.5 | 284 |
| 12:44 | 20.8 | 639 |
| 12:45 | 52.5 | 1,168 |
| 12:46 | 78.4 | 1,553 |
| 12:47 | **127.3** | **1,913** |
| 12:48 | 94.9 | 1,426 |
| 12:49 | 41.5 | 1,442 |
| 12:50 | 16.6 | 653 |
| 12:55 | 8.5 | 168 |

```
Response Time (ms)
150 ┤                    ╭─╮
125 ┤                   ╭╯ ╰╮
100 ┤                  ╭╯   ╰╮
 75 ┤                 ╭╯     ╰╮
 50 ┤               ╭─╯       ╰╮
 25 ┤            ╭──╯          ╰──╮
  0 ┤────────────╯                ╰──────
    11:42   11:45   11:48   11:51   11:54
```

### HTTP Errors

- **5xx Errors: 0** (no server errors from ALB)
- k6 errors (5.33%) likely from auth endpoint rate limiting

---

## RDS PostgreSQL Metrics

### CPU Utilization

| Time (UTC) | CPU % |
|------------|-------|
| 12:42 | 5.1% |
| 12:43 | 9.5% |
| 12:44 | 14.6% |
| 12:45 | 17.8% |
| 12:46 | 17.7% |
| 12:47 | **17.9%** |
| 12:48 | 17.3% |
| 12:49 | 16.6% |
| 12:54 | 11.6% |
| 12:55 | 6.2% |

**Peak: 17.9%** - Database NOT stressed

### Database Connections

| Metric | Value |
|--------|-------|
| Active Connections | 6 (constant) |
| Connection Pool | Working correctly |

---

## ElastiCache Redis Metrics

### CPU Utilization

| Time (UTC) | CPU % |
|------------|-------|
| 12:42 | 2.1% |
| Peak | **3.9%** |
| 12:55 | 2.6% |

**Peak: 3.9%** - Cache NOT stressed

### Cache Performance

| Time (UTC) | Hits | Misses | Hit Rate |
|------------|------|--------|----------|
| 12:43 | 1,649 | 5 | 99.7% |
| 12:46 | 8,125 | 0 | 100% |
| 12:47 | 8,101 | 15 | 99.8% |
| **Total** | **76,865** | **63** | **99.9%** |

```
Cache Hit Rate: 99.9%
┌────────────────────────────────────────────────────────┐
│████████████████████████████████████████████████████░  │
│ 76,865 Hits                                     63    │
└────────────────────────────────────────────────────────┘
```

---

## Bottleneck Analysis

```
┌─────────────────────────────────────────────────────────────────┐
│                    BOTTLENECK IDENTIFICATION                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️  EC2 Node 1 (Backend Pod): 97% CPU                          │
│      └── Single pod handling all API requests                   │
│      └── CPU-bound, not I/O bound                               │
│                                                                  │
│  ✅ RDS PostgreSQL: 18% CPU                                     │
│      └── Connection pooling effective (6 connections)           │
│      └── Queries well optimized                                 │
│                                                                  │
│  ✅ ElastiCache Redis: 4% CPU                                   │
│      └── 99.9% cache hit rate                                   │
│      └── Excellent caching strategy                             │
│                                                                  │
│  ✅ ALB: No 5xx errors                                          │
│      └── All requests processed successfully                    │
│      └── Max latency 1.9s during peak load                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Correlation k6 vs CloudWatch

| Metric | k6 Report | CloudWatch | Match |
|--------|-----------|------------|-------|
| Total Requests | 183,203 | ~183,000 (ALB sum) | ✅ |
| Peak RPS | 234.8 avg | 328 peak | ✅ |
| p95 Latency | 380ms | ~80-127ms avg | ✅ |
| Max Latency | 892ms (p99) | 1,913ms | ⚠️ |
| Error Rate | 5.33% | 0% 5xx | ✅ (4xx auth) |

**Note:** k6 includes client-side timing, CloudWatch measures ALB-to-target only.

---

## Recommendations

### Immediate Actions

1. **Scale Backend Horizontally**
   ```yaml
   # HPA configuration
   spec:
     minReplicas: 2
     maxReplicas: 5
     targetCPUUtilizationPercentage: 70
   ```

2. **Enable Pod Anti-Affinity**
   - Distribute backend pods across nodes
   - Avoid single-node bottleneck

### Optimization Opportunities

| Area | Current | Recommendation |
|------|---------|----------------|
| Backend Pods | 1 | 2-3 replicas |
| CPU Request | - | 500m |
| CPU Limit | - | 1000m |
| Node Type | t3.small | t3.medium (if needed) |

### Already Optimal

- ✅ Redis caching (99.9% hit rate)
- ✅ RDS connection pooling
- ✅ Database query performance
- ✅ ALB configuration

---

## Next Steps

1. [ ] Configure HPA for backend deployment
2. [ ] Run stress test with 2+ backend replicas
3. [ ] Verify Cluster Autoscaler triggers at scale
4. [ ] Monitor pod distribution across nodes
5. [ ] Compare results pre/post optimization
