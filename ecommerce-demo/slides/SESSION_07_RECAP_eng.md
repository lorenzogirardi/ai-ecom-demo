# Session 7 - Performance Fix: Autoscaling and Optimizations

## Overview

This session addressed the bottleneck identified in Day 6 (single backend pod at 97% CPU) by implementing:
- **Pod Anti-Affinity** to distribute pods across different nodes
- **Optimized HPA** with reduced CPU threshold (70% → 45%)
- **Cluster Autoscaler** for automatic node scaling

---

## Applied Configurations

### 1. Pod Anti-Affinity (Backend + Frontend)

```yaml
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

**Effect:** Pods are distributed across different nodes instead of concentrating on a single node.

### 2. Optimized HPA

| Parameter | Before | After |
|-----------|--------|-------|
| `targetCPUUtilizationPercentage` | 70% | 45% |
| `maxReplicas` | 5 | 7 |
| `minReplicas` | 2 | 2 |

**Effect:** More aggressive and responsive scaling under load.

### 3. Metrics Server

Installed `metrics-server` for EKS with `--kubelet-insecure-tls` patch to enable HPA metrics.

---

## Stress Test Results

### k6 Metrics Comparison

| Metric | Day 6 (1 pod) | Day 7 (7-9 pods) | Change |
|--------|---------------|------------------|--------|
| **Total Requests** | 183,203 | 291,480 | **+59.1%** |
| **Average RPS** | 234.8 | 373.4 | **+59.0%** |
| **p95 Latency** | 380ms | 206ms | **-45.8%** |
| **p90 Latency** | ~320ms | 174ms | **-45.6%** |
| **Error Rate** | 5.33% | 5.27% | -0.06% |
| **Requests <500ms** | 99.9% | 99.9% | = |
| **Requests <1s** | 100% | 100% | = |

### Improvement Analysis

1. **Throughput +59%**: Ability to handle nearly 60% more traffic
2. **p95 Latency -46%**: Response times almost halved
3. **Error Rate stable**: Errors are related to `/me` endpoint (auth), not overload

---

## Autoscaling Behavior

### HPA (Horizontal Pod Autoscaler)

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

**Observations:**
- HPA scaled from 2 to 9 pods in ~8 minutes
- Peak aggregate CPU: 221%/45% target
- 7 pods Running, 2 pods Pending (node limit)

### Cluster Autoscaler

```
Timeline:
00:00 - 3 active nodes
05:00 - 4 nodes (new node added)
08:00 - 5 nodes (max node group reached)
```

**Cluster Autoscaler Log:**
```
Skipping node group eks-ecommerce-demo-demo-eks-node-group - max size reached
```

**Limit reached:** Node group configured with max 5 nodes in Terraform.

---

## CloudWatch Metrics

### RDS PostgreSQL

| Metric | Value | Notes |
|--------|-------|-------|
| **CPU Peak** | 25.6% | Plenty of headroom available |
| **CPU Average** | 18-22% | Stable during test |
| **Connections** | 6 → 21 | Scales with pods (3 conn/pod) |

**Analysis:** RDS is not a bottleneck. With 7 backend pods, connections rose to 21 (3 per pod from connection pool).

### ElastiCache Redis

| Metric | Value | Notes |
|--------|-------|-------|
| **CPU Peak** | 4.6% | Minimal load |
| **Cache Hit Rate** | 99.9% | Excellent efficiency |
| **Cache Miss** | <0.1% | Nearly zero |

**Analysis:** Redis extremely efficient. Caching works perfectly.

### Comparison with Day 6

| Resource | Day 6 | Day 7 | Notes |
|----------|-------|-------|-------|
| RDS CPU | 18% | 25% | +7% (more pods = more queries) |
| RDS Connections | 6 | 21 | +15 (pod scaling) |
| Redis CPU | 3% | 4.6% | +1.6% |
| Redis Hit Rate | 99.9% | 99.9% | Unchanged |

---

## Node Resource Usage

### Pod Distribution Across Nodes

| Node | Backend Pods | Frontend Pods | Other |
|------|--------------|---------------|-------|
| ip-10-0-35-133 | 2 | 1 | ArgoCD, ESO |
| ip-10-0-42-242 | 2 | 0 | - |
| ip-10-0-43-73 | 2 | 0 | - |
| ip-10-0-60-72 | 0 | 1 | Cluster Autoscaler |
| ip-10-0-63-155 | 1 | 0 | CoreDNS, metrics-server |

### Post-Test Resource Usage

| Node | CPU | Memory | CPU Requests | Memory Requests |
|------|-----|--------|--------------|-----------------|
| ip-10-0-35-133 | 2% | 55% | 44% | 97% |
| ip-10-0-42-242 | 1% | 44% | 28% | 70% |
| ip-10-0-43-73 | 1% | 46% | 28% | 70% |
| ip-10-0-60-72 | 2% | 61% | 31% | 80% |
| ip-10-0-63-155 | 1% | 55% | 28% | 66% |

**Observations:**
- Memory is the main constraint (70-97% requests)
- CPU has plenty of headroom available
- Pod Anti-Affinity works: backend distributed across 4 nodes

### Usage During Stress Test (Peak)

| Node | CPU During Test | Notes |
|------|-----------------|-------|
| ip-10-0-35-133 | ~45% | 2 backend pods |
| ip-10-0-42-242 | ~35% | 2 backend pods |
| ip-10-0-43-73 | ~35% | 2 backend pods |
| ip-10-0-63-155 | ~25% | 1 backend pod |

---

## Pending Pod Analysis

Two pods remained in Pending state during the test:

```
backend-5bc467bfc6-69g2n   0/1   Pending
backend-5bc467bfc6-kc5wf   0/1   Pending
```

**Cause:** Node group at maximum limit (5 nodes)

**Solution:** Increase `max_size` in Terraform EKS module:
```hcl
# infra/terraform/modules/eks/variables.tf
variable "node_max_size" {
  default = 5  # Increase to 7-10
}
```

---

## Scaling Architecture Diagram

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

---

## Conclusions

### Successes

1. **HPA Works Correctly**
   - Reactive scaling from 2 to 7 pods
   - 45% threshold effective for anticipating load

2. **Cluster Autoscaler Operational**
   - Automatic addition of 2 nodes
   - Response to pending pod backlog

3. **Pod Anti-Affinity Effective**
   - Uniform distribution across nodes
   - No single point of failure

4. **Improved Performance**
   - +59% throughput
   - -46% p95 latency

### Identified Limits

1. **Node Group Max Size**
   - 5 nodes not sufficient for 9 pods
   - 2 pods remained Pending

2. **Backend CPU-Bound**
   - Still the main bottleneck
   - Consider code optimizations or larger resources

### Recommendations

| Priority | Action | Impact |
|----------|--------|--------|
| High | Increase node group max to 7-10 | Allows complete scaling |
| Medium | Increase backend CPU limits | More capacity per pod |
| Low | Evaluate additional caching | Reduce CPU load |

---

## Next Steps

1. **Terraform Update**: Increase `node_max_size` to 7-10
2. **Validation Test**: Repeat stress test after change
3. **Monitoring Setup**: Configure Datadog for detailed APM
4. **Cost Analysis**: Evaluate incremental cost of additional nodes

---

## Bug Fixes Identified

### k6 Stress Test - /me Endpoint

During results analysis, a bug was identified in the k6 test:

```javascript
// BEFORE (wrong) - 15,356 errors
const meRes = authGet('/auth/me', token, {...})

// AFTER (correct)
const meRes = authGet(endpoints.me, token, {...})  // = '/api/auth/me'
```

**Problem:** The path `/auth/me` doesn't exist, the correct endpoint is `/api/auth/me`.

**Impact:** All `me ok` checks failed (0% success rate, 15,356 errors).

**Fix:** Commit `6b9291e` - Use `endpoints.me` instead of hardcoded path.

---

## Modified Files

| File | Change |
|------|--------|
| `helm/backend/values-demo.yaml` | Pod Anti-Affinity, HPA 45%, maxReplicas 7 |
| `helm/frontend/values-demo.yaml` | Pod Anti-Affinity |
| `k6/scenarios/stress.js` | Fix /me endpoint path |

---

## Post-Fix Validation Test (200 VUs)

After fixing the `/me` endpoint, a new stress test was executed to validate the corrections.

### k6 Metrics - Final Test

| Metric | Value |
|--------|-------|
| **Total Requests** | 428,677 |
| **Average RPS** | 549.6 |
| **p95 Latency** | 222ms |
| **Error Rate** | **0.00%** |
| **Requests <500ms** | 99.68% |
| **Requests <1s** | 99.96% |
| **All Checks** | ✅ 100% (451,328 passed) |

### Autoscaling During Test

| Component | Before | During | Note |
|-----------|--------|--------|------|
| **Backend Pods** | 2 | 7 | HPA max reached |
| **EKS Nodes** | 3 | 5 | Cluster Autoscaler active |
| **Node CPU Peak** | 2% | 89% | High load handled |

### CloudWatch Metrics

| Resource | Metric | Peak | Note |
|----------|--------|------|------|
| **RDS PostgreSQL** | CPU | 37.5% | Stable, headroom available |
| **RDS PostgreSQL** | Connections | 6 → 21 | 3 connections per pod |
| **ElastiCache Redis** | CPU | 5.5% | Minimal load |

### Progressive Comparison

| Metric | Day 6 (1 pod) | Day 7 (7 pods) | Post-Fix (7 pods) |
|--------|---------------|----------------|-------------------|
| Total Requests | 183,203 | 291,480 | **428,677** |
| RPS | 234.8 | 373.4 | **549.6** |
| p95 Latency | 380ms | 206ms | **222ms** |
| Error Rate | 5.33% | 5.27% | **0.00%** |

### Total Improvements vs Day 6

| Metric | Change |
|--------|--------|
| **Throughput** | +134% (234 → 549 RPS) |
| **Latency p95** | -42% (380 → 222ms) |
| **Error Rate** | -100% (5.33% → 0%) |
| **Pod Capacity** | +250% (2 → 7 pods) |
| **Node Capacity** | +67% (3 → 5 nodes) |

### Bug Fix Validation

```
Before fix:
  ✗ me ok: 0% — ✓ 0 / ✗ 15,356

After fix:
  ✓ me ok: 100% — ✓ 22,651 / ✗ 0
```

---

## Screenshots

### Issue: Pods on Same Node
![Issue Pods Same Node](https://res.cloudinary.com/ethzero/image/upload/v1767107555/ai/ai-ecom-demo/issue-pods-same-node-001.png)

### Video: Stress Test with Autoscaling (3x speed)
[▶️ Watch stress test video](https://res.cloudinary.com/ethzero/video/upload/v1767120353/ai/ai-ecom-demo/stress-test-final-3x.mp4)

---

*Document generated: 2025-12-30*
*Tests executed: Stress Test 100 VUs + Validation Test 200 VUs*
