# Session 7 - Performance Fix: Autoscaling e Ottimizzazioni

## Panoramica

Questa sessione ha affrontato il bottleneck identificato nel Day 6 (singolo backend pod al 97% CPU) implementando:
- **Pod Anti-Affinity** per distribuire i pod su nodi diversi
- **HPA ottimizzato** con soglia CPU ridotta (70% → 45%)
- **Cluster Autoscaler** per scalare i nodi automaticamente

---

## Configurazioni Applicate

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

**Effetto:** I pod vengono distribuiti su nodi diversi invece di concentrarsi su un singolo nodo.

### 2. HPA Ottimizzato

| Parametro | Prima | Dopo |
|-----------|-------|------|
| `targetCPUUtilizationPercentage` | 70% | 45% |
| `maxReplicas` | 5 | 7 |
| `minReplicas` | 2 | 2 |

**Effetto:** Scaling più aggressivo e reattivo al carico.

### 3. Metrics Server

Installato `metrics-server` per EKS con patch `--kubelet-insecure-tls` per abilitare le metriche HPA.

---

## Risultati Stress Test

### Confronto k6 Metrics

| Metrica | Day 6 (1 pod) | Day 7 (7-9 pods) | Variazione |
|---------|---------------|------------------|------------|
| **Total Requests** | 183,203 | 291,480 | **+59.1%** |
| **Average RPS** | 234.8 | 373.4 | **+59.0%** |
| **p95 Latency** | 380ms | 206ms | **-45.8%** |
| **p90 Latency** | ~320ms | 174ms | **-45.6%** |
| **Error Rate** | 5.33% | 5.27% | -0.06% |
| **Requests <500ms** | 99.9% | 99.9% | = |
| **Requests <1s** | 100% | 100% | = |

### Analisi Miglioramenti

1. **Throughput +59%**: Capacità di gestire quasi il 60% di traffico in più
2. **Latenza p95 -46%**: Tempi di risposta quasi dimezzati
3. **Error Rate stabile**: Gli errori sono legati all'endpoint `/me` (auth), non a sovraccarico

---

## Comportamento Autoscaling

### HPA (Horizontal Pod Autoscaler)

```
Timeline durante stress test:
00:00 - 2 pods (CPU 0%)
02:00 - 3 pods (CPU >45%)
03:00 - 4 pods (scaling)
05:00 - 5 pods (scaling)
06:00 - 7 pods (scaling rapido)
08:00 - 9 pods (max raggiunto)
13:00 - Test completato
```

**Osservazioni:**
- HPA ha scalato da 2 a 9 pods in ~8 minuti
- CPU aggregata al picco: 221%/45% target
- 7 pods Running, 2 pods Pending (limite nodi)

### Cluster Autoscaler

```
Timeline:
00:00 - 3 nodi attivi
05:00 - 4 nodi (nuovo nodo aggiunto)
08:00 - 5 nodi (max node group raggiunto)
```

**Log Cluster Autoscaler:**
```
Skipping node group eks-ecommerce-demo-demo-eks-node-group - max size reached
```

**Limite raggiunto:** Node group configurato con max 5 nodi in Terraform.

---

## Metriche CloudWatch

### RDS PostgreSQL

| Metrica | Valore | Note |
|---------|--------|------|
| **CPU Peak** | 25.6% | Molto headroom disponibile |
| **CPU Media** | 18-22% | Stabile durante test |
| **Connessioni** | 6 → 21 | Scala con i pod (3 conn/pod) |

**Analisi:** RDS non è un bottleneck. Con 7 pod backend, le connessioni sono salite a 21 (3 per pod dal connection pool).

### ElastiCache Redis

| Metrica | Valore | Note |
|---------|--------|------|
| **CPU Peak** | 4.6% | Carico minimo |
| **Cache Hit Rate** | 99.9% | Eccellente efficienza |
| **Cache Miss** | <0.1% | Quasi nullo |

**Analisi:** Redis estremamente efficiente. Il caching funziona perfettamente.

### Confronto con Day 6

| Risorsa | Day 6 | Day 7 | Note |
|---------|-------|-------|------|
| RDS CPU | 18% | 25% | +7% (più pod = più query) |
| RDS Connections | 6 | 21 | +15 (scaling pod) |
| Redis CPU | 3% | 4.6% | +1.6% |
| Redis Hit Rate | 99.9% | 99.9% | Invariato |

---

## Utilizzo Risorse Nodi

### Distribuzione Pod sui Nodi

| Nodo | Backend Pods | Frontend Pods | Altro |
|------|--------------|---------------|-------|
| ip-10-0-35-133 | 2 | 1 | ArgoCD, ESO |
| ip-10-0-42-242 | 2 | 0 | - |
| ip-10-0-43-73 | 2 | 0 | - |
| ip-10-0-60-72 | 0 | 1 | Cluster Autoscaler |
| ip-10-0-63-155 | 1 | 0 | CoreDNS, metrics-server |

### Utilizzo Risorse Post-Test

| Nodo | CPU | Memory | CPU Requests | Memory Requests |
|------|-----|--------|--------------|-----------------|
| ip-10-0-35-133 | 2% | 55% | 44% | 97% |
| ip-10-0-42-242 | 1% | 44% | 28% | 70% |
| ip-10-0-43-73 | 1% | 46% | 28% | 70% |
| ip-10-0-60-72 | 2% | 61% | 31% | 80% |
| ip-10-0-63-155 | 1% | 55% | 28% | 66% |

**Osservazioni:**
- Memory è il constraint principale (70-97% requests)
- CPU ha molto headroom disponibile
- Pod Anti-Affinity funziona: backend distribuiti su 4 nodi

### Utilizzo Durante Stress Test (Picco)

| Nodo | CPU Durante Test | Note |
|------|------------------|------|
| ip-10-0-35-133 | ~45% | 2 backend pods |
| ip-10-0-42-242 | ~35% | 2 backend pods |
| ip-10-0-43-73 | ~35% | 2 backend pods |
| ip-10-0-63-155 | ~25% | 1 backend pod |

---

## Pod Pending Analysis

Due pod sono rimasti in stato Pending durante il test:

```
backend-5bc467bfc6-69g2n   0/1   Pending
backend-5bc467bfc6-kc5wf   0/1   Pending
```

**Causa:** Node group al limite massimo (5 nodi)

**Soluzione:** Aumentare `max_size` nel Terraform module EKS:
```hcl
# infra/terraform/modules/eks/variables.tf
variable "node_max_size" {
  default = 5  # Aumentare a 7-10
}
```

---

## Diagramma Architettura Scaling

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

## Conclusioni

### Successi

1. **HPA Funziona Correttamente**
   - Scaling reattivo da 2 a 7 pod
   - Soglia 45% efficace per anticipare il carico

2. **Cluster Autoscaler Operativo**
   - Aggiunta automatica di 2 nodi
   - Risposta al backlog di pod pending

3. **Pod Anti-Affinity Efficace**
   - Distribuzione uniforme sui nodi
   - Nessun single point of failure

4. **Performance Migliorate**
   - +59% throughput
   - -46% latency p95

### Limiti Identificati

1. **Node Group Max Size**
   - 5 nodi non sufficienti per 9 pod
   - 2 pod rimasti Pending

2. **Backend CPU-Bound**
   - Ancora il bottleneck principale
   - Considerare ottimizzazioni codice o risorse maggiori

### Raccomandazioni

| Priorità | Azione | Impatto |
|----------|--------|---------|
| Alta | Aumentare node group max a 7-10 | Permette scaling completo |
| Media | Aumentare CPU limits backend | Più capacità per pod |
| Bassa | Valutare caching aggiuntivo | Ridurre carico CPU |

---

## Prossimi Passi

1. **Terraform Update**: Aumentare `node_max_size` a 7-10
2. **Test di Validazione**: Ripetere stress test dopo modifica
3. **Monitoring Setup**: Configurare Datadog per APM dettagliato
4. **Cost Analysis**: Valutare costo incrementale nodi aggiuntivi

---

## Bug Fix Identificati

### k6 Stress Test - Endpoint /me

Durante l'analisi dei risultati, è stato identificato un bug nel test k6:

```javascript
// PRIMA (sbagliato) - 15,356 errori
const meRes = authGet('/auth/me', token, {...})

// DOPO (corretto)
const meRes = authGet(endpoints.me, token, {...})  // = '/api/auth/me'
```

**Problema:** Il path `/auth/me` non esiste, l'endpoint corretto è `/api/auth/me`.

**Impatto:** Tutti i check `me ok` fallivano (0% success rate, 15,356 errori).

**Fix:** Commit `6b9291e` - Uso di `endpoints.me` invece del path hardcoded.

---

## File Modificati

| File | Modifica |
|------|----------|
| `helm/backend/values-demo.yaml` | Pod Anti-Affinity, HPA 45%, maxReplicas 7 |
| `helm/frontend/values-demo.yaml` | Pod Anti-Affinity |
| `k6/scenarios/stress.js` | Fix endpoint /me path |

---

## Test di Validazione Post-Fix (200 VUs)

Dopo il fix dell'endpoint `/me`, è stato eseguito un nuovo stress test per validare le correzioni.

### k6 Metrics - Test Finale

| Metrica | Valore |
|---------|--------|
| **Total Requests** | 428,677 |
| **Average RPS** | 549.6 |
| **p95 Latency** | 222ms |
| **Error Rate** | **0.00%** |
| **Requests <500ms** | 99.68% |
| **Requests <1s** | 99.96% |
| **All Checks** | ✅ 100% (451,328 passed) |

### Autoscaling Durante Test

| Component | Prima | Durante | Note |
|-----------|-------|---------|------|
| **Backend Pods** | 2 | 7 | HPA max raggiunto |
| **Nodi EKS** | 3 | 5 | Cluster Autoscaler attivo |
| **Node CPU Peak** | 2% | 89% | Carico elevato gestito |

### CloudWatch Metrics

| Risorsa | Metrica | Peak | Note |
|---------|---------|------|------|
| **RDS PostgreSQL** | CPU | 37.5% | Stabile, headroom disponibile |
| **RDS PostgreSQL** | Connections | 6 → 21 | 3 connessioni per pod |
| **ElastiCache Redis** | CPU | 5.5% | Carico minimo |

### Confronto Progressivo

| Metrica | Day 6 (1 pod) | Day 7 (7 pods) | Post-Fix (7 pods) |
|---------|---------------|----------------|-------------------|
| Total Requests | 183,203 | 291,480 | **428,677** |
| RPS | 234.8 | 373.4 | **549.6** |
| p95 Latency | 380ms | 206ms | **222ms** |
| Error Rate | 5.33% | 5.27% | **0.00%** |

### Miglioramenti Totali vs Day 6

| Metrica | Variazione |
|---------|------------|
| **Throughput** | +134% (234 → 549 RPS) |
| **Latency p95** | -42% (380 → 222ms) |
| **Error Rate** | -100% (5.33% → 0%) |
| **Capacità Pod** | +250% (2 → 7 pods) |
| **Capacità Nodi** | +67% (3 → 5 nodi) |

### Validazione Bug Fix

```
Prima del fix:
  ✗ me ok: 0% — ✓ 0 / ✗ 15,356

Dopo il fix:
  ✓ me ok: 100% — ✓ 22,651 / ✗ 0
```

---

## Screenshots

### Issue: Pods sullo Stesso Nodo
![Issue Pods Same Node](https://res.cloudinary.com/ethzero/image/upload/v1767107555/ai/ai-ecom-demo/issue-pods-same-node-001.png)

### Video: Stress Test con Autoscaling (3x speed)
[▶️ Guarda il video dello stress test](https://res.cloudinary.com/ethzero/video/upload/v1767120353/ai/ai-ecom-demo/stress-test-final-3x.mp4)

---

*Documento generato: 2025-12-30*
*Test eseguiti: Stress Test 100 VUs + Validation Test 200 VUs*
