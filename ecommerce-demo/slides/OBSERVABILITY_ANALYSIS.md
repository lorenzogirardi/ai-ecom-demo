# Analisi Observability - Load Test con X-Ray e Container Insights

**Data**: 2 Gennaio 2026
**Test Type**: Stress Test 50 VUs (metà capacità)
**Durata**: 13 minuti

---

## Executive Summary

Il load test con observability attiva ha rivelato **criticità infrastrutturali** che limitano la capacità di scaling dell'applicazione. Nonostante i risultati del test siano positivi (0% errori), l'infrastruttura non ha potuto scalare come previsto.

```
┌─────────────────────────────────────────────────────────────────┐
│                    RISULTATI CHIAVE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✅ POSITIVI                    ❌ CRITICI                       │
│  ─────────────────              ─────────────────                │
│  0% error rate                  4/7 pods Pending                │
│  99.97% requests < 1s           Max node group raggiunto        │
│  p95 = 363ms                    Backend anti-affinity fallito   │
│  1.3 GB data transferred        Nodo terminato occupa slot      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Risultati Load Test

### Metriche k6

| Metrica | Valore | Status |
|---------|--------|--------|
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

### Confronto con Test Precedenti

| Metrica | Day 6 (100 VUs) | Day 7 (100 VUs) | Day 8 (50 VUs) |
|---------|-----------------|-----------------|----------------|
| Total Requests | 183,203 | 291,480 | 217,804 |
| Average RPS | 234.8 | 373.4 | ~280* |
| p95 Latency | 380ms | 206ms | 363ms |
| Error Rate | 5.33% | 5.27% | 0% |
| Active Pods | 2→? | 2→7 | 3 (7 requested) |

*Normalizzato per 100 VUs

---

## 2. Evidenze Infrastrutturali

### 2.1 Pod Distribution Problem

```
┌─────────────────────────────────────────────────────────────────┐
│                    POD DISTRIBUTION                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BACKEND PODS (anti-affinity FALLITA)                           │
│  ─────────────────────────────────────                          │
│  ip-10-0-36-88.ec2.internal:                                    │
│    ├── backend-5bbdcd5f98-4qv5b  (Running)                     │
│    └── backend-5bbdcd5f98-n6846  (Running)  ❌ STESSO NODO!    │
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
│    └── frontend-5b8df7fdbd-xgcdm  (Running)  ✅ NODI DIVERSI   │
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
│  ⚠️ PROBLEMA: L'istanza terminata occupa ancora uno slot       │
│     nel node group, impedendo lo scaling a 5 nodi attivi        │
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
│  Cluster Autoscaler messaggio:                                  │
│  "0/4 nodes are available: 2 Too many pods, 3 Insufficient     │
│   memory. preemption: 0/4 nodes are available"                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 HPA Behavior

```
┌─────────────────────────────────────────────────────────────────┐
│                    HPA DURANTE LOAD TEST                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BACKEND HPA                                                     │
│  ─────────────                                                   │
│  Target CPU: 45%                                                 │
│  Current CPU: 356% (peak durante test)                          │
│  Min Replicas: 2                                                 │
│  Max Replicas: 7                                                 │
│  Current Replicas: 7 (ma solo 3 Running, 4 Pending)            │
│                                                                  │
│  FRONTEND HPA                                                    │
│  ─────────────                                                   │
│  Target CPU: 70%                                                 │
│  Current CPU: 5%                                                 │
│  Current Replicas: 2                                             │
│                                                                  │
│  ⚠️ HPA ha scalato correttamente a 7, ma l'infrastruttura      │
│     non ha potuto supportare i nuovi pod                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. CPU Usage per Pod

Durante il picco del test (con solo 3 backend pods attivi):

| Pod | CPU (cores) | CPU % of Request | Memory |
|-----|-------------|------------------|--------|
| backend-4qv5b | 895m | ~895% | 53Mi |
| backend-n6846 | 864m | ~864% | 52Mi |
| backend-kkdtv | 843m | ~843% | 57Mi |
| frontend-jgsj6 | 3m | ~0.6% | 46Mi |
| frontend-xgcdm | 7m | ~1.4% | 60Mi |

**Osservazione**: I backend pods hanno usato 8-9x più CPU del loro request (100m), indicando che i resource requests sono sottodimensionati.

---

## 4. Raccomandazioni

### 4.1 Critiche (Alta Priorità)

| # | Issue | Raccomandazione | Impatto |
|---|-------|-----------------|---------|
| 1 | **Node group max size** | Aumentare da 5 a 8 | Permette scaling orizzontale |
| 2 | **Terminated instance** | Rimuovere manualmente o attendere cleanup ASG | Libera 1 slot per nuovo nodo |
| 3 | **Backend anti-affinity** | Verificare configurazione `podAntiAffinity` in values-demo.yaml | Distribuisce carico su più nodi |

### 4.2 Medie (Ottimizzazione)

| # | Issue | Raccomandazione | Impatto |
|---|-------|-----------------|---------|
| 4 | **CPU requests sottodimensionati** | Aumentare backend CPU request da 100m a 250m | Scheduling più accurato |
| 5 | **Memory pressure** | Considerare t3.large invece di t3.medium | Più headroom per scaling |
| 6 | **Instance type** | Mix di on-demand + spot per cost optimization | Risparmio 50-70% |

### 4.3 Future (Bassa Priorità)

| # | Issue | Raccomandazione | Impatto |
|---|-------|-----------------|---------|
| 7 | **PodDisruptionBudget** | Aggiungere PDB per backend (minAvailable: 2) | Alta disponibilità durante rolling updates |
| 8 | **Vertical Pod Autoscaler** | Considerare VPA per auto-tuning resources | Ottimizzazione automatica |

---

## 5. Modifiche Terraform Proposte

### 5.1 Node Group Max Size

```hcl
# infra/terraform/modules/eks/variables.tf

variable "node_max_size" {
  description = "Maximum number of nodes"
  type        = number
  default     = 8  # Era 5
}
```

### 5.2 Backend Resources (Helm)

```yaml
# helm/backend/values-demo.yaml

resources:
  requests:
    cpu: 250m      # Era 100m
    memory: 128Mi  # Era 64Mi
  limits:
    cpu: 1000m     # Era 500m
    memory: 256Mi  # Era 128Mi
```

### 5.3 Anti-Affinity Fix

```yaml
# helm/backend/values-demo.yaml

affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:  # Era preferred
      - labelSelector:
          matchExpressions:
            - key: app
              operator: In
              values:
                - backend
        topologyKey: kubernetes.io/hostname
```

---

## 6. Costi Impatto

| Modifica | Costo Attuale | Costo Nuovo | Delta |
|----------|---------------|-------------|-------|
| t3.medium × 5 | $0.0416/hr × 5 = $0.208/hr | - | - |
| t3.medium × 8 | - | $0.0416/hr × 8 = $0.333/hr | +$0.125/hr |
| t3.large × 5 | - | $0.0832/hr × 5 = $0.416/hr | +$0.208/hr |

**Nota**: Con Cluster Autoscaler, i nodi extra vengono aggiunti solo durante i picchi di carico.

---

## 7. X-Ray Traces

### Trace Count

Durante il test sono state generate traces X-Ray per ogni richiesta al backend.

**Annotations catturate:**
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

## 8. Conclusioni

### Test Outcome: ✅ PASSED (con riserve)

Il test ha dimostrato che l'applicazione può gestire 50 VUs con 0% errori, ma ha anche rivelato **limitazioni infrastrutturali significative**:

1. **L'autoscaling funziona** - HPA ha correttamente scalato a 7 replicas
2. **L'infrastruttura non supporta lo scaling** - Solo 3/7 pods sono stati schedulati
3. **Il node group è saturo** - Max size raggiunto + nodo terminato che occupa slot
4. **Memory è il collo di bottiglia** - Tutti i nodi sopra 60% memory

### Next Actions

1. **Immediato**: Verificare e rimuovere l'istanza terminata
2. **Oggi**: Aumentare node_max_size a 8
3. **Prossima sessione**: Implementare le raccomandazioni di resources tuning
4. **Futuro**: Considerare instance types più grandi o mix spot/on-demand

---

*Documento generato durante Session 8 - Deep Observability - 2 Gennaio 2026*
