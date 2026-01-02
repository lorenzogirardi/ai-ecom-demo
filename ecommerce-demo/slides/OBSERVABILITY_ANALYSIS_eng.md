# Observability Analysis - Load Test with X-Ray and Container Insights

**Date**: January 2, 2026
**Test Type**: Stress Test 50 VUs (half capacity)
**Duration**: 13 minutes

---

## Executive Summary

The load test with active observability revealed **critical infrastructure issues** that limit the application's scaling capacity. Despite positive test results (0% errors), the infrastructure could not scale as expected.

```
┌─────────────────────────────────────────────────────────────────┐
│                    KEY FINDINGS                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✅ POSITIVE                    ❌ CRITICAL                      │
│  ─────────────────              ─────────────────                │
│  0% error rate                  4/7 pods Pending                │
│  99.97% requests < 1s           Max node group reached          │
│  p95 = 363ms                    Backend anti-affinity failed    │
│  1.3 GB data transferred        Terminated node occupies slot   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Load Test Results

### k6 Metrics

| Metric | Value | Status |
|--------|-------|--------|
| **Total Iterations** | 57,319 | - |
| **Total Requests** | 217,804 | - |
| **Average RPS** | 73.47/s | - |
| **Data Received** | 1.3 GB | - |
| **Checks Passed** | 100% (229,276) | ✅ |
| **http_req_failed** | 0.00% | ✅ |
| **http_req_duration avg** | 129.1ms | ✅ |
| **http_req_duration p90** | 237.09ms | ✅ |
| **http_req_duration p95** | 363.03ms | ✅ |
| **http_req_duration max** | 2s | ⚠️ |
| **requests_under_500ms** | 98.68% | ✅ |
| **requests_under_1s** | 99.97% | ✅ |

### Comparison with Previous Tests

| Metric | Day 6 (100 VUs) | Day 7 (100 VUs) | Day 8 (50 VUs) |
|--------|-----------------|-----------------|----------------|
| Total Requests | 183,203 | 291,480 | 217,804 |
| Average RPS | 234.8 | 373.4 | ~280* |
| p95 Latency | 380ms | 206ms | 363ms |
| Error Rate | 5.33% | 5.27% | 0% |
| Active Pods | 2→? | 2→7 | 3 (7 requested) |

*Normalized for 100 VUs

---

## 2. Infrastructure Evidence

### 2.1 Pod Distribution Problem

```
┌─────────────────────────────────────────────────────────────────┐
│                    POD DISTRIBUTION                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BACKEND PODS (anti-affinity FAILED)                            │
│  ─────────────────────────────────────                          │
│  ip-10-0-36-88.ec2.internal:                                    │
│    ├── backend-5bbdcd5f98-4qv5b  (Running)                     │
│    └── backend-5bbdcd5f98-n6846  (Running)  ❌ SAME NODE!      │
│                                                                  │
│  ip-10-0-43-61.ec2.internal:                                    │
│    └── backend-5bbdcd5f98-kkdtv  (Running)                     │
│                                                                  │
│  PENDING (4 pods):                                              │
│    ├── backend-5bbdcd5f98-2p4gt                                │
│    ├── backend-5bbdcd5f98-5vj76                                │
│    ├── backend-5bbdcd5f98-m76pc                                │
│    └── backend-5bbdcd5f98-pxn76                                │
│                                                                  │
│  FRONTEND PODS (anti-affinity OK)                               │
│  ─────────────────────────────────                              │
│  ip-10-0-43-61.ec2.internal:                                    │
│    └── frontend-5b8df7fdbd-jgsj6  (Running)                    │
│                                                                  │
│  ip-10-0-51-22.ec2.internal:                                    │
│    └── frontend-5b8df7fdbd-xgcdm  (Running)  ✅ DIFFERENT NODES│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Node Group Saturation

```
┌─────────────────────────────────────────────────────────────────┐
│                    EC2 INSTANCES                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Instance ID          │ State      │ Node                       │
│  ─────────────────────────────────────────────────────────────  │
│  i-007bf4ee22bb43f5a  │ running    │ ip-10-0-36-88.ec2.internal │
│  i-0b55b0e5d90fc4e4b  │ running    │ ip-10-0-43-61.ec2.internal │
│  i-033fb9480a83e806b  │ running    │ ip-10-0-51-22.ec2.internal │
│  i-0c5ee13ae9f441d02  │ running    │ ip-10-0-61-199.ec2.internal│
│  i-007c1073f6dec759b  │ TERMINATED │ -                          │
│                                                                  │
│  Current: 4 running + 1 terminated = 5 (MAX REACHED!)           │
│  Desired: 5 (max_size in Terraform)                             │
│                                                                  │
│  ⚠️ PROBLEM: Terminated instance still occupies a slot         │
│     in node group, preventing scaling to 5 active nodes         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Memory Pressure

```
┌─────────────────────────────────────────────────────────────────┐
│                    NODE MEMORY UTILIZATION                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Node                        │ Memory Requested │ Status        │
│  ─────────────────────────────────────────────────────────────  │
│  ip-10-0-36-88.ec2.internal  │ 91.2%           │ ❌ CRITICAL   │
│  ip-10-0-51-22.ec2.internal  │ 84.0%           │ ⚠️ HIGH       │
│  ip-10-0-43-61.ec2.internal  │ 77.4%           │ ⚠️ HIGH       │
│  ip-10-0-61-199.ec2.internal │ 60.2%           │ ✅ OK         │
│                                                                  │
│  Cluster Autoscaler message:                                    │
│  "0/4 nodes are available: 2 Too many pods, 3 Insufficient     │
│   memory. preemption: 0/4 nodes are available"                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 HPA Behavior

```
┌─────────────────────────────────────────────────────────────────┐
│                    HPA DURING LOAD TEST                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BACKEND HPA                                                     │
│  ─────────────                                                   │
│  Target CPU: 45%                                                 │
│  Current CPU: 356% (peak during test)                           │
│  Min Replicas: 2                                                 │
│  Max Replicas: 7                                                 │
│  Current Replicas: 7 (but only 3 Running, 4 Pending)           │
│                                                                  │
│  FRONTEND HPA                                                    │
│  ─────────────                                                   │
│  Target CPU: 70%                                                 │
│  Current CPU: 5%                                                 │
│  Current Replicas: 2                                             │
│                                                                  │
│  ⚠️ HPA scaled correctly to 7, but infrastructure could not    │
│     support the new pods                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. CPU Usage per Pod

During peak load (with only 3 backend pods active):

| Pod | CPU (cores) | CPU % of Request | Memory |
|-----|-------------|------------------|--------|
| backend-4qv5b | 895m | ~895% | 53Mi |
| backend-n6846 | 864m | ~864% | 52Mi |
| backend-kkdtv | 843m | ~843% | 57Mi |
| frontend-jgsj6 | 3m | ~0.6% | 46Mi |
| frontend-xgcdm | 7m | ~1.4% | 60Mi |

**Observation**: Backend pods used 8-9x more CPU than their request (100m), indicating resource requests are undersized.

---

## 4. Recommendations

### 4.1 Critical (High Priority)

| # | Issue | Recommendation | Impact |
|---|-------|----------------|--------|
| 1 | **Node group max size** | Increase from 5 to 8 | Enables horizontal scaling |
| 2 | **Terminated instance** | Remove manually or wait for ASG cleanup | Frees 1 slot for new node |
| 3 | **Backend anti-affinity** | Verify `podAntiAffinity` configuration in values-demo.yaml | Distributes load across nodes |

### 4.2 Medium (Optimization)

| # | Issue | Recommendation | Impact |
|---|-------|----------------|--------|
| 4 | **Undersized CPU requests** | Increase backend CPU request from 100m to 250m | More accurate scheduling |
| 5 | **Memory pressure** | Consider t3.large instead of t3.medium | More headroom for scaling |
| 6 | **Instance type** | Mix of on-demand + spot for cost optimization | 50-70% savings |

### 4.3 Future (Low Priority)

| # | Issue | Recommendation | Impact |
|---|-------|----------------|--------|
| 7 | **PodDisruptionBudget** | Add PDB for backend (minAvailable: 2) | High availability during rolling updates |
| 8 | **Vertical Pod Autoscaler** | Consider VPA for auto-tuning resources | Automatic optimization |

---

## 5. Proposed Terraform Changes

### 5.1 Node Group Max Size

```hcl
# infra/terraform/modules/eks/variables.tf

variable "node_max_size" {
  description = "Maximum number of nodes"
  type        = number
  default     = 8  # Was 5
}
```

### 5.2 Backend Resources (Helm)

```yaml
# helm/backend/values-demo.yaml

resources:
  requests:
    cpu: 250m      # Was 100m
    memory: 128Mi  # Was 64Mi
  limits:
    cpu: 1000m     # Was 500m
    memory: 256Mi  # Was 128Mi
```

### 5.3 Anti-Affinity Fix

```yaml
# helm/backend/values-demo.yaml

affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:  # Was preferred
      - labelSelector:
          matchExpressions:
            - key: app
              operator: In
              values:
                - backend
        topologyKey: kubernetes.io/hostname
```

---

## 6. Cost Impact

| Change | Current Cost | New Cost | Delta |
|--------|--------------|----------|-------|
| t3.medium × 5 | $0.0416/hr × 5 = $0.208/hr | - | - |
| t3.medium × 8 | - | $0.0416/hr × 8 = $0.333/hr | +$0.125/hr |
| t3.large × 5 | - | $0.0832/hr × 5 = $0.416/hr | +$0.208/hr |

**Note**: With Cluster Autoscaler, extra nodes are only added during load peaks.

---

## 7. X-Ray Traces

### Trace Count

During the test, X-Ray traces were generated for each backend request.

**Captured Annotations:**
- `http_method`: GET, POST
- `http_url`: /api/catalog/products, /api/auth/login, etc.
- `http_status`: 200, 401

### Service Map

```
                    ┌──────────────────┐
                    │    CloudFront    │
                    │   (CDN/HTTPS)    │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │       ALB        │
                    │  (Load Balancer) │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐   ┌────────▼────────┐   ┌──────▼──────┐
│   Frontend    │   │    Frontend     │   │   (more)    │
│   Pod 1       │   │    Pod 2        │   │             │
│ (Next.js SSR) │   │ (Next.js SSR)   │   │             │
└───────┬───────┘   └────────┬────────┘   └─────────────┘
        │                    │
        └────────┬───────────┘
                 │
        ┌────────▼────────┐
        │     Backend     │
        │  (3 pods only)  │◄──── X-Ray Traces
        │                 │
        └───────┬─────────┘
                │
       ┌────────┴────────┐
       │                 │
┌──────▼──────┐   ┌──────▼──────┐
│     RDS     │   │   Redis     │
│ (PostgreSQL)│   │ (ElastiCache)│
└─────────────┘   └─────────────┘
```

---

## 8. Conclusions

### Test Outcome: ✅ PASSED (with reservations)

The test demonstrated that the application can handle 50 VUs with 0% errors, but also revealed **significant infrastructure limitations**:

1. **Autoscaling works** - HPA correctly scaled to 7 replicas
2. **Infrastructure doesn't support scaling** - Only 3/7 pods were scheduled
3. **Node group is saturated** - Max size reached + terminated node occupying slot
4. **Memory is the bottleneck** - All nodes above 60% memory

### Next Actions

1. **Immediate**: Verify and remove terminated instance
2. **Today**: Increase node_max_size to 8
3. **Next session**: Implement resource tuning recommendations
4. **Future**: Consider larger instance types or spot/on-demand mix

---

*Document generated during Session 8 - Deep Observability - January 2, 2026*
