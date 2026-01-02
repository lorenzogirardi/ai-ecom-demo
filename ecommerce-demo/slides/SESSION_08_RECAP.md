# Session 8 Recap - Deep Observability

## Obiettivo
Implementare observability avanzata per analisi post-load-test:
- **Container Insights**: Metriche a livello pod (CPU, memoria, network)
- **AWS X-Ray**: Distributed tracing per breakdown latenza

---

## Risultati Raggiunti

### 1. Container Insights (EKS Add-on)

**Terraform:**
```hcl
resource "aws_eks_addon" "cloudwatch_observability" {
  cluster_name             = aws_eks_cluster.main.name
  addon_name               = "amazon-cloudwatch-observability"
  service_account_role_arn = aws_iam_role.cloudwatch_observability.arn
}
```

**Metriche Disponibili:**
| Metrica | Namespace | Descrizione |
|---------|-----------|-------------|
| `pod_cpu_utilization` | ContainerInsights | CPU usage per pod |
| `pod_memory_utilization` | ContainerInsights | Memory usage per pod |
| `pod_network_rx_bytes` | ContainerInsights | Network in per pod |
| `pod_network_tx_bytes` | ContainerInsights | Network out per pod |

---

### 2. X-Ray Distributed Tracing

#### Backend Integration

**File creati/modificati:**
- `apps/backend/src/utils/xray.ts` - Utility X-Ray
- `apps/backend/src/server.ts` - Fastify hooks
- `apps/backend/src/config/index.ts` - Configurazione

**Approccio:**
```typescript
// Evitato setSegment() per problemi CLS context
// Gestione manuale segmenti via request object

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

**File creati:**
- `apps/frontend/src/lib/xray.ts` - Utility X-Ray
- `apps/frontend/src/instrumentation.ts` - Next.js instrumentation hook

**Caratteristiche:**
- `captureHTTPsGlobal` per tracciare chiamate SSR → Backend
- Inizializzazione automatica via `instrumentation.ts`
- Compatibile con Next.js 16 App Router

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
# Trust policy aggiornata per entrambi i service account
StringLike = {
  "...:sub" = [
    "system:serviceaccount:amazon-cloudwatch:cloudwatch-agent",
    "system:serviceaccount:xray-daemon:xray-daemon"
  ]
}
```

---

### 4. Problemi Risolti

#### CLS Context Error
```
Error: No context available. ns.run() or ns.bind() must be called first
```

**Causa:** X-Ray SDK usa `cls-hooked` per context, Fastify non lo configura.

**Soluzione:** Rimosso `setSegment()`, gestione manuale segmenti via request object.

#### IRSA Permission Error
```
AccessDenied: Not authorized to perform sts:AssumeRoleWithWebIdentity
```

**Causa:** Trust policy IAM includeva solo `cloudwatch-agent`, non `xray-daemon`.

**Soluzione:** Aggiornata trust policy con `StringLike` e lista di service account.

#### Docker Networking
```
Error: connect ECONNREFUSED 127.0.0.1:4000
```

**Causa:** `localhost:4000` nel container frontend punta a se stesso, non al backend.

**Soluzione:** Aggiunto `INTERNAL_API_URL=http://backend:4000` per rewrites server-side.

---

### 5. Terraform Codification

Tutte le modifiche CLI sono state riportate in Terraform:

| Risorsa | File | Modifica |
|---------|------|----------|
| IAM Trust Policy | `modules/eks/main.tf` | StringLike con lista service accounts |
| CloudWatch Add-on | `modules/eks/main.tf` | Già presente |
| X-Ray Permissions | `modules/eks/main.tf` | `AWSXRayDaemonWriteAccess` attached |

---

## Risultati X-Ray

**Traces Catturati:** 1700+

**Annotations Disponibili:**
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

## File Modificati/Creati

| File | Azione | Scopo |
|------|--------|-------|
| `apps/backend/src/utils/xray.ts` | Creato | X-Ray utility backend |
| `apps/backend/src/server.ts` | Modificato | Fastify hooks |
| `apps/frontend/src/lib/xray.ts` | Creato | X-Ray utility frontend |
| `apps/frontend/src/instrumentation.ts` | Creato | Next.js init hook |
| `apps/frontend/next.config.js` | Modificato | INTERNAL_API_URL |
| `apps/frontend/Dockerfile` | Modificato | Build arg |
| `docker-compose.full.yml` | Modificato | Environment vars |
| `helm/backend/values-demo.yaml` | Modificato | X-Ray env vars |
| `helm/frontend/values-demo.yaml` | Modificato | X-Ray env vars |
| `k8s/xray-daemon/xray-daemon.yaml` | Creato | DaemonSet manifest |
| `infra/terraform/modules/eks/main.tf` | Modificato | IRSA trust policy |

---

## Costi Stimati

| Servizio | Costo Stimato |
|----------|---------------|
| Container Insights | ~$0.30/pod/giorno |
| X-Ray | $5/milione di traces |
| **Totale (demo)** | ~$3-5/giorno |

---

## Screenshot

### X-Ray Traces in CloudWatch

![CloudWatch X-Ray Trace 001](https://res.cloudinary.com/ethzero/image/upload/v1735833696/ai/ai-ecom-demo/cloudwatch-trace-001.png)

![CloudWatch X-Ray Trace 002](https://res.cloudinary.com/ethzero/image/upload/v1735833696/ai/ai-ecom-demo/cloudwatch-trace-002.png)

### APM Performance Evaluation

![APM Performance Evaluation](https://res.cloudinary.com/ethzero/image/upload/v1735833696/ai/ai-ecom-demo/apm-performance-evaluation.png)

---

## Prossimi Passi (Day 9)

1. **OWASP Top 10 Review**
   - SQL Injection (Prisma già protegge)
   - XSS (React già protegge)
   - CSRF, Auth issues

2. **Network Policies**
   - Isolamento namespace
   - Ingress/egress rules
   - Default deny

3. **Container Hardening**
   - securityContext
   - readOnlyRootFilesystem
   - runAsNonRoot

4. **Pod Security Standards**
   - Baseline/Restricted profiles
   - Namespace labels
