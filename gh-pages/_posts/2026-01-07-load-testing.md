---
layout: post
title: "Load Testing with k6: Finding Bottlenecks"
date: 2026-01-07
category: Performance
reading_time: 10
tags: [k6, load-testing, performance, kubernetes, autoscaling]
excerpt: "Building a complete load testing framework with k6. Stress tests, HTML reports, and discovering our first bottleneck."
takeaway: "Load testing reveals what logs hide. A single pod at 97% CPU was invisible until we pushed 200 concurrent users."
---

## Day 6: Performance Under Pressure

With infrastructure deployed, it was time to stress test. Goal: **understand system limits and find bottlenecks**.

### What We Built

- k6 load testing framework
- 4 test scenarios (smoke, load, stress, spike)
- HTML report generation
- GitHub Actions pipeline for tests
- Cluster Autoscaler with IRSA

## k6 Framework Structure

```
k6/
├── config.js                 # Centralized configuration
├── helpers/
│   ├── http.js              # HTTP helper with rate limit bypass
│   ├── auth.js              # Authentication helper
│   └── report.js            # HTML report generator
└── scenarios/
    ├── smoke.js             # 30s - Quick health check
    ├── load.js              # 3.5-9min - Standard load test
    ├── stress.js            # 13min - Stress test
    └── spike.js             # Spike test with recovery
```

## Rate Limit Bypass

During load tests, you don't want rate limiting to interfere with results:

```typescript
// Backend: allowList for authorized tests
const rateLimit = {
  max: 100,
  timeWindow: '1 minute',
  allowList: (req) => {
    return req.headers['x-load-test-bypass'] === process.env.RATE_LIMIT_BYPASS_TOKEN;
  }
};
```

```javascript
// k6: Send bypass header
export function request(method, url, body) {
  return http.request(method, url, body, {
    headers: {
      'X-Load-Test-Bypass': __ENV.BYPASS_TOKEN
    }
  });
}
```

## Stress Test Results

### Initial Test (100 VUs, 13 minutes)

```
┌──────────────────────────────────────────────────┐
│              STRESS TEST RESULTS                  │
├──────────────────────────────────────────────────┤
│  Total Requests:     183,203                     │
│  Average RPS:        234.8 req/s                 │
│  Test Duration:      13 minutes                  │
├──────────────────────────────────────────────────┤
│  RESPONSE TIMES                                   │
│  p50:                89ms                        │
│  p95:                380ms                       │
│  p99:                892ms                       │
├──────────────────────────────────────────────────┤
│  ERROR RATE                                       │
│  Failed Requests:    5.33%                       │
│  Requests <500ms:    99.3%                       │
│  Requests <1s:       100%                        │
├──────────────────────────────────────────────────┤
│  THRESHOLDS          ALL PASSED                  │
│  http_req_failed:    <10%                        │
│  http_req_duration:  p95<2000ms                  │
└──────────────────────────────────────────────────┘
```

### The Bottleneck Discovery

While k6 showed passing thresholds, CloudWatch revealed the truth:

```
┌─────────────────────────────────────────────────┐
│           BOTTLENECK IDENTIFIED                  │
├─────────────────────────────────────────────────┤
│                                                  │
│  Backend Pod:    97% CPU utilization            │
│  Number of Pods: 1 (HPA not scaling)            │
│                                                  │
│  Why?                                            │
│  - HPA threshold was 70%                        │
│  - But only 1 pod existed                       │
│  - Pod was overloaded before scaling kicked in  │
│                                                  │
└─────────────────────────────────────────────────┘
```

## Cluster Autoscaler

To handle scaling beyond initial pods:

```yaml
# Cluster Autoscaler Configuration
spec:
  containers:
    - name: cluster-autoscaler
      command:
        - ./cluster-autoscaler
        - --cloud-provider=aws
        - --nodes=2:5:eks-node-group
        - --scale-down-utilization-threshold=0.5
        - --scale-down-delay-after-add=10m
```

### Scaling Parameters

| Parameter | Value |
|-----------|-------|
| Min nodes | 2 (High Availability) |
| Max nodes | 5 |
| Instance type | t3.medium |
| Scale down threshold | 50% utilization |
| Scale down delay | 10 minutes |

## GitHub Actions Pipeline

```yaml
# .github/workflows/load-test.yml
name: Load Test
on:
  workflow_dispatch:
    inputs:
      test_type:
        type: choice
        options: [quick, load, stress, smoke]
      vus:
        default: '20'
      base_url:
        default: 'https://dls03qes9fc77.cloudfront.net'

jobs:
  k6-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run k6
        uses: grafana/k6-action@v0.3.1
        with:
          filename: k6/scenarios/${{ inputs.test_type }}.js
        env:
          K6_VUS: ${{ inputs.vus }}
          K6_BASE_URL: ${{ inputs.base_url }}

      - uses: actions/upload-artifact@v4
        with:
          name: k6-report
          path: k6-report.html
          retention-days: 30
```

## k6 Compatibility Notes

k6 uses a limited ES6 runtime. Some fixes required:

| Issue | Solution |
|-------|----------|
| Optional chaining (`?.`) | Use `&&` checks |
| Spread operator (`...obj`) | Use `Object.assign()` |
| Template literals in headers | Use concatenation |

## CloudWatch Analysis

### RDS PostgreSQL

| Metric | Value | Notes |
|--------|-------|-------|
| CPU Peak | 18% | Plenty of headroom |
| Connections | 6 | Stable, connection pool working |

### ElastiCache Redis

| Metric | Value | Notes |
|--------|-------|-------|
| CPU Peak | 3% | Minimal load |
| Cache Hit Rate | 99.9% | Excellent efficiency |

**Conclusion:** Database and cache are not the bottleneck. The backend compute is.

## Results

| Metric | Value |
|--------|-------|
| Test Scenarios | 4 |
| Total Requests | 200,000+ |
| Peak RPS | ~235 |
| Bottleneck Found | Backend pod CPU |
| Time Spent | ~2 hours |

---

*Next: [Performance Fix: Autoscaling Done Right](/blog/performance-fix/)*
