# Session 8 - Claude Code Demo

## E-commerce Monorepo for AWS EKS

**Date**: January 2, 2026
**Session Duration**: ~2 hours
**Model**: Claude Opus 4.5 (claude-opus-4-5-20251101)

---

## Session Objectives

```
┌─────────────────────────────────────────────────┐
│          DAY 8 - DEEP OBSERVABILITY             │
├─────────────────────────────────────────────────┤
│                                                  │
│  ✅ Container Insights (EKS Add-on)             │
│  ✅ AWS X-Ray Distributed Tracing               │
│  ✅ Backend Instrumentation                     │
│  ✅ Frontend Instrumentation                    │
│  ✅ X-Ray DaemonSet Deployment                  │
│  ✅ IRSA Configuration                          │
│  ✅ Terraform Codification                      │
│  ✅ Docker Networking Fix                       │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Day Highlights

### 1. Container Insights (EKS Add-on)

**Terraform:**
```hcl
resource "aws_eks_addon" "cloudwatch_observability" {
  cluster_name             = aws_eks_cluster.main.name
  addon_name               = "amazon-cloudwatch-observability"
  service_account_role_arn = aws_iam_role.cloudwatch_observability.arn
}
```

**Available Metrics:**
| Metric | Namespace | Description |
|--------|-----------|-------------|
| `pod_cpu_utilization` | ContainerInsights | CPU usage per pod |
| `pod_memory_utilization` | ContainerInsights | Memory usage per pod |
| `pod_network_rx_bytes` | ContainerInsights | Network in per pod |
| `pod_network_tx_bytes` | ContainerInsights | Network out per pod |

---

### 2. X-Ray Distributed Tracing

#### Backend Integration

**Files created/modified:**
- `apps/backend/src/utils/xray.ts` - X-Ray utility
- `apps/backend/src/server.ts` - Fastify hooks
- `apps/backend/src/config/index.ts` - Configuration

**Approach:**
```typescript
// Avoided setSegment() due to CLS context issues
// Manual segment management via request object

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

#### Frontend Integration

**Files created:**
- `apps/frontend/src/lib/xray.ts` - X-Ray utility
- `apps/frontend/src/instrumentation.ts` - Next.js instrumentation hook

**Features:**
- `captureHTTPsGlobal` to trace SSR → Backend calls
- Automatic initialization via `instrumentation.ts`
- Compatible with Next.js 16 App Router

---

### 3. X-Ray DaemonSet

**Deployment:** `k8s/xray-daemon/xray-daemon.yaml`

```yaml
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

**IRSA Configuration:**
```hcl
# Trust policy updated for both service accounts
StringLike = {
  "...:sub" = [
    "system:serviceaccount:amazon-cloudwatch:cloudwatch-agent",
    "system:serviceaccount:xray-daemon:xray-daemon"
  ]
}
```

---

### 4. Issues Resolved

#### CLS Context Error
```
Error: No context available. ns.run() or ns.bind() must be called first
```

**Cause:** X-Ray SDK uses `cls-hooked` for context, Fastify doesn't set it up.

**Solution:** Removed `setSegment()`, manual segment management via request object.

#### IRSA Permission Error
```
AccessDenied: Not authorized to perform sts:AssumeRoleWithWebIdentity
```

**Cause:** IAM trust policy only included `cloudwatch-agent`, not `xray-daemon`.

**Solution:** Updated trust policy with `StringLike` and list of service accounts.

#### Docker Networking
```
Error: connect ECONNREFUSED 127.0.0.1:4000
```

**Cause:** `localhost:4000` in frontend container points to itself, not backend.

**Solution:** Added `INTERNAL_API_URL=http://backend:4000` for server-side rewrites.

---

### 5. Terraform Codification

All CLI changes have been codified in Terraform:

| Resource | File | Change |
|----------|------|--------|
| IAM Trust Policy | `modules/eks/main.tf` | StringLike with service account list |
| CloudWatch Add-on | `modules/eks/main.tf` | Already present |
| X-Ray Permissions | `modules/eks/main.tf` | `AWSXRayDaemonWriteAccess` attached |

---

## X-Ray Results

**Traces Captured:** 1700+

**Available Annotations:**
- `http_method`: GET, POST, etc.
- `http_url`: /api/catalog/products, etc.
- `http_status`: 200, 404, 500, etc.

**Service Map:**
```
Browser → CloudFront → Frontend (SSR) → Backend → RDS/Redis
                        ↑                ↑
                    X-Ray traces    X-Ray traces
```

---

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `apps/backend/src/utils/xray.ts` | Created | X-Ray utility backend |
| `apps/backend/src/server.ts` | Modified | Fastify hooks |
| `apps/frontend/src/lib/xray.ts` | Created | X-Ray utility frontend |
| `apps/frontend/src/instrumentation.ts` | Created | Next.js init hook |
| `apps/frontend/next.config.js` | Modified | INTERNAL_API_URL |
| `apps/frontend/Dockerfile` | Modified | Build arg |
| `docker-compose.full.yml` | Modified | Environment vars |
| `helm/backend/values-demo.yaml` | Modified | X-Ray env vars |
| `helm/frontend/values-demo.yaml` | Modified | X-Ray env vars |
| `k8s/xray-daemon/xray-daemon.yaml` | Created | DaemonSet manifest |
| `infra/terraform/modules/eks/main.tf` | Modified | IRSA trust policy |

---

## Session 8 Statistics

| Metric | Value |
|--------|-------|
| Files created/modified | 11 |
| Commits | 5 |
| X-Ray traces captured | 1700+ |
| Issues resolved | 3 |
| Lines of code | ~400 |

---

## Cost Analysis: Claude vs Traditional Team

### Session 8 - Deep Observability

```
┌─────────────────────────────────────────────────────────┐
│              SESSION 8 COST COMPARISON                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  TASK                        │ CLAUDE  │ TRAD. TEAM     │
│  ─────────────────────────────────────────────────────  │
│  Container Insights setup    │   -     │  1-2 hrs       │
│  X-Ray SDK integration       │   -     │  3-4 hrs       │
│  DaemonSet + IRSA config     │   -     │  2-3 hrs       │
│  Debug CLS/IRSA issues       │   -     │  2-4 hrs       │
│  Terraform codification      │   -     │  1-2 hrs       │
│  Documentation               │   -     │  1-2 hrs       │
│  ─────────────────────────────────────────────────────  │
│  TOTAL                       │  2 hrs  │ 10-17 hrs      │
│                                                          │
│  Claude cost: ~$2                                       │
│  Team cost: €800 - €1,700 (€80-100/hr Senior DevOps)   │
│  ─────────────────────────────────────────────────────  │
│  SAVINGS: €798 - €1,698                                 │
│  ROI: ~500x                                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Cumulative ROI (Sessions 1-8)

```
┌─────────────────────────────────────────────────────────┐
│                  TOTAL PROJECT COST                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Claude Code (8 sessions)                               │
│  ────────────────────────                               │
│  Session 1: ~$3                                         │
│  Session 2: ~$2                                         │
│  Session 3: ~$3                                         │
│  Session 4: ~$2                                         │
│  Session 5: ~$3                                         │
│  Session 6: ~$2                                         │
│  Session 7: ~$2                                         │
│  Session 8: ~$2                                         │
│  Total: ~$19                                            │
│                                                          │
│  Traditional Team                                       │
│  ────────────────────────                               │
│  Sessions 1-6: €14,074 - €17,214                       │
│  Session 7: €800 - €1,600                              │
│  Session 8: €800 - €1,700                              │
│  Total: €15,674 - €20,514                              │
│                                                          │
│  ═══════════════════════════════════════════════════    │
│  TOTAL SAVINGS: €15,655 - €20,495                      │
│  AVERAGE ROI: ~1,000x                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Estimated AWS Costs

| Service | Estimated Cost |
|---------|---------------|
| Container Insights | ~$0.30/pod/day |
| X-Ray | $5/million traces |
| **Total (demo)** | ~$3-5/day |

---

## Useful Commands

```bash
# Check X-Ray daemon status
kubectl get pods -n xray-daemon
kubectl logs -n xray-daemon -l app=xray-daemon

# Check traces in AWS Console
aws xray get-trace-summaries \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --region us-east-1

# Container Insights metrics
aws cloudwatch get-metric-data \
  --metric-data-queries '[{"Id":"cpu","MetricStat":{"Metric":{"Namespace":"ContainerInsights","MetricName":"pod_cpu_utilization"},"Period":300,"Stat":"Average"}}]' \
  --start-time $(date -d '1 hour ago' --iso-8601=seconds) \
  --end-time $(date --iso-8601=seconds)

# Check add-on status
aws eks describe-addon \
  --cluster-name ecommerce-demo-demo-eks \
  --addon-name amazon-cloudwatch-observability

# Restart frontend/backend to apply env vars
kubectl rollout restart deployment/frontend -n ecommerce
kubectl rollout restart deployment/backend -n ecommerce
```

---

## Next Steps (Day 9)

```
┌─────────────────────────────────────────────────┐
│          DAY 9 - SECURITY HARDENING             │
├─────────────────────────────────────────────────┤
│                                                  │
│  [ ] OWASP Top 10 Review                        │
│  [ ] Network Policies (namespace isolation)     │
│  [ ] Container Hardening (securityContext)      │
│  [ ] Pod Security Standards                     │
│  [ ] Secrets Rotation Strategy                  │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Screenshots

### X-Ray Traces in CloudWatch

![CloudWatch X-Ray Trace 001](https://res.cloudinary.com/ethzero/image/upload/v1735833696/ai/ai-ecom-demo/cloudwatch-trace-001.png)

![CloudWatch X-Ray Trace 002](https://res.cloudinary.com/ethzero/image/upload/v1735833696/ai/ai-ecom-demo/cloudwatch-trace-002.png)

### APM Performance Evaluation

![APM Performance Evaluation](https://res.cloudinary.com/ethzero/image/upload/v1735833696/ai/ai-ecom-demo/apm-performance-evaluation.png)

---

*Generated with Claude Code - Session of January 2, 2026*
