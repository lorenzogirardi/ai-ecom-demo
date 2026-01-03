---
layout: post
title: "Deep Observability: X-Ray and Container Insights"
date: 2026-01-09
category: Infrastructure
reading_time: 10
tags: [aws, xray, cloudwatch, observability, tracing]
excerpt: "Implementing distributed tracing with AWS X-Ray and Container Insights. From 1700+ traces to performance optimization."
takeaway: "Distributed tracing reveals what metrics can't: the full request journey from browser to database."
---

## Day 8: Seeing Inside the System

With performance fixed, we needed visibility. Goal: **understand every request's journey**.

### What We Implemented

- Container Insights (EKS Add-on)
- AWS X-Ray distributed tracing
- Backend instrumentation (Fastify)
- Frontend instrumentation (Next.js)
- X-Ray DaemonSet deployment

## Container Insights

### Terraform Setup

```hcl
resource "aws_eks_addon" "cloudwatch_observability" {
  cluster_name             = aws_eks_cluster.main.name
  addon_name               = "amazon-cloudwatch-observability"
  service_account_role_arn = aws_iam_role.cloudwatch_observability.arn
}
```

### Available Metrics

| Metric | Namespace | Description |
|--------|-----------|-------------|
| `pod_cpu_utilization` | ContainerInsights | CPU per pod |
| `pod_memory_utilization` | ContainerInsights | Memory per pod |
| `pod_network_rx_bytes` | ContainerInsights | Network in |
| `pod_network_tx_bytes` | ContainerInsights | Network out |

## X-Ray Distributed Tracing

### The Challenge

Fastify doesn't set up the CLS (Continuation-Local Storage) context that X-Ray SDK expects:

```
Error: No context available. ns.run() or ns.bind() must be called first
```

### The Solution

Manual segment management via request object:

```typescript
// apps/backend/src/utils/xray.ts
import AWSXRay from 'aws-xray-sdk-core';

export function openSegment(name: string): AWSXRay.Segment {
  const segment = new AWSXRay.Segment(name);
  return segment;
}

export function closeSegment(segment: AWSXRay.Segment, statusCode: number) {
  if (statusCode >= 400 && statusCode < 500) {
    segment.addErrorFlag();
  } else if (statusCode >= 500) {
    segment.addFaultFlag();
  }
  segment.close();
}
```

### Fastify Hooks

```typescript
// apps/backend/src/server.ts
app.addHook("onRequest", async (request) => {
  const segment = openSegment("ecommerce-backend");
  segment.addAnnotation("http_method", request.method);
  segment.addAnnotation("http_url", request.url);
  request.xraySegment = segment;
});

app.addHook("onResponse", async (request, reply) => {
  closeSegment(request.xraySegment, reply.statusCode);
});
```

## X-Ray DaemonSet

```yaml
# k8s/xray-daemon/xray-daemon.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: xray-daemon
  namespace: xray-daemon
spec:
  template:
    spec:
      serviceAccountName: xray-daemon
      containers:
        - name: xray-daemon
          image: amazon/aws-xray-daemon:3.3.12
          ports:
            - containerPort: 2000
              protocol: UDP
              hostPort: 2000
```

### IRSA Configuration

```hcl
# Trust policy for multiple service accounts
StringLike = {
  "${aws_iam_openid_connect_provider.eks.url}:sub" = [
    "system:serviceaccount:amazon-cloudwatch:cloudwatch-agent",
    "system:serviceaccount:xray-daemon:xray-daemon"
  ]
}
```

## Frontend Instrumentation

### Next.js Integration

```typescript
// apps/frontend/src/instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const AWSXRay = await import('aws-xray-sdk-core');
    const https = await import('https');

    // Capture all HTTPS calls from SSR
    AWSXRay.captureHTTPsGlobal(https);

    console.log('X-Ray instrumentation initialized');
  }
}
```

## Service Map

```
Browser → CloudFront → Frontend (SSR) → Backend → RDS/Redis
                        ↑                ↑
                    X-Ray traces    X-Ray traces
```

## Issues Resolved

### 1. CLS Context Error

**Cause:** X-Ray SDK uses `cls-hooked`, Fastify doesn't initialize it.

**Solution:** Removed `setSegment()`, manual segment management.

### 2. IRSA Permission Error

```
AccessDenied: Not authorized to perform sts:AssumeRoleWithWebIdentity
```

**Cause:** IAM trust policy only included `cloudwatch-agent`.

**Solution:** Updated trust policy with list of service accounts.

### 3. Docker Networking

```
Error: connect ECONNREFUSED 127.0.0.1:4000
```

**Cause:** `localhost:4000` in frontend container points to itself.

**Solution:** Added `INTERNAL_API_URL=http://backend:4000` for container-to-container communication.

## Stress Test Post-Optimizations

After implementing observability and code optimizations:

| Metric | Day 7 | Day 8 | Change |
|--------|-------|-------|--------|
| Total Requests | 291,480 | 396,830 | **+36%** |
| Average RPS | 373.4 | 508.4 | **+36%** |
| p95 Latency | 206ms | 263ms | +57ms |
| Error Rate | 5.27% | **0%** | **-100%** |
| Cache Hit Rate | N/A | 99.95% | NEW |

### Cache Performance

| Metric | Value |
|--------|-------|
| Cache Hits | 33,845 |
| Cache Misses | 18 |
| Hit Rate | 99.95% |

## Total Improvements (Day 6 -> Day 8)

| Metric | Change |
|--------|--------|
| **Throughput** | +116% (235 -> 508 RPS) |
| **Latency** | -31% (380ms -> 263ms p95) |
| **Errors** | -100% (5.33% -> 0%) |
| **Cache** | 99.95% hit rate |

## X-Ray Results

**Traces Captured:** 1700+

**Annotations Available:**
- `http_method`: GET, POST, etc.
- `http_url`: /api/catalog/products, etc.
- `http_status`: 200, 404, 500, etc.

## AWS Cost Impact

| Service | Estimated Cost |
|---------|---------------|
| Container Insights | ~$0.30/pod/day |
| X-Ray | $5/million traces |
| **Total (demo)** | ~$3-5/day |

## Useful Commands

```bash
# Check X-Ray daemon status
kubectl get pods -n xray-daemon
kubectl logs -n xray-daemon -l app=xray-daemon

# Check traces in AWS Console
aws xray get-trace-summaries \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s)

# Container Insights metrics
aws cloudwatch get-metric-data \
  --metric-data-queries '[{
    "Id":"cpu",
    "MetricStat":{
      "Metric":{
        "Namespace":"ContainerInsights",
        "MetricName":"pod_cpu_utilization"
      },
      "Period":300,
      "Stat":"Average"
    }
  }]' \
  --start-time $(date -d '1 hour ago' --iso-8601=seconds) \
  --end-time $(date --iso-8601=seconds)
```

---

*Next: [Security Hardening: Zero Trust and OWASP](/blog/security-hardening/)*
