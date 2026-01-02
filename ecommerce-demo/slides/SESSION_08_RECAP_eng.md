# Session 8 Recap - Deep Observability

## Objective
Implement advanced observability for post-load-test analysis:
- **Container Insights**: Pod-level metrics (CPU, memory, network)
- **AWS X-Ray**: Distributed tracing for latency breakdown

---

## Achievements

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

## Files Modified/Created

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

## Estimated Costs

| Service | Estimated Cost |
|---------|---------------|
| Container Insights | ~$0.30/pod/day |
| X-Ray | $5/million traces |
| **Total (demo)** | ~$3-5/day |

---

## Screenshots

### X-Ray Traces in CloudWatch

![CloudWatch X-Ray Trace 001](https://res.cloudinary.com/ethzero/image/upload/v1735833696/ai/ai-ecom-demo/cloudwatch-trace-001.png)

![CloudWatch X-Ray Trace 002](https://res.cloudinary.com/ethzero/image/upload/v1735833696/ai/ai-ecom-demo/cloudwatch-trace-002.png)

### APM Performance Evaluation

![APM Performance Evaluation](https://res.cloudinary.com/ethzero/image/upload/v1735833696/ai/ai-ecom-demo/apm-performance-evaluation.png)

---

## Next Steps (Day 9)

1. **OWASP Top 10 Review**
   - SQL Injection (Prisma already protects)
   - XSS (React already protects)
   - CSRF, Auth issues

2. **Network Policies**
   - Namespace isolation
   - Ingress/egress rules
   - Default deny

3. **Container Hardening**
   - securityContext
   - readOnlyRootFilesystem
   - runAsNonRoot

4. **Pod Security Standards**
   - Baseline/Restricted profiles
   - Namespace labels
