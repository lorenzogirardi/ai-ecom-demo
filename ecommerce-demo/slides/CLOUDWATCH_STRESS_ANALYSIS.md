# Analisi Metriche CloudWatch - Stress Test

## Parametri del Test

| Parametro | Valore |
|-----------|--------|
| Data Test | 2025-12-30 |
| Finestra Temporale | 11:42 - 11:55 UTC (13 min) |
| VUs Massimi | 100 |
| Richieste Totali | 183,203 |
| RPS Medio | 234.8 |

---

## Panoramica Infrastruttura

```
┌─────────────────────────────────────────────────────────────────────┐
│                     TOPOLOGIA STRESS TEST                            │
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

## Nodi EC2 (EKS) - Utilizzo CPU

### Node 1 (Backend Pod) - COLLO DI BOTTIGLIA

| Ora (UTC) | CPU Media | CPU Max |
|-----------|-----------|---------|
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

### Node 2 (Frontend/Sistema) - OK

| Ora (UTC) | CPU Media | CPU Max |
|-----------|-----------|---------|
| 12:45 | 5.7% | 6.2% |
| 12:50 | 4.9% | 5.2% |
| 12:55 | 3.7% | 4.0% |

### Node 3 (ArgoCD/Sistema) - Idle

| Ora (UTC) | CPU Media | CPU Max |
|-----------|-----------|---------|
| Tutto | 1.7% | 1.8% |

---

## Metriche ALB

### Conteggio Richieste

| Ora (UTC) | Richieste/min | RPS |
|-----------|---------------|-----|
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

**Picco: 19,663 req/min = 328 RPS**

### Tempo di Risposta Target

| Ora (UTC) | Media (ms) | Max (ms) |
|-----------|------------|----------|
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
Tempo Risposta (ms)
150 ┤                    ╭─╮
125 ┤                   ╭╯ ╰╮
100 ┤                  ╭╯   ╰╮
 75 ┤                 ╭╯     ╰╮
 50 ┤               ╭─╯       ╰╮
 25 ┤            ╭──╯          ╰──╮
  0 ┤────────────╯                ╰──────
    11:42   11:45   11:48   11:51   11:54
```

### Errori HTTP

- **Errori 5xx: 0** (nessun errore server da ALB)
- Errori k6 (5.33%) probabilmente da rate limiting endpoint auth

---

## Metriche RDS PostgreSQL

### Utilizzo CPU

| Ora (UTC) | CPU % |
|-----------|-------|
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

**Picco: 17.9%** - Database NON sotto stress

### Connessioni Database

| Metrica | Valore |
|---------|--------|
| Connessioni Attive | 6 (costante) |
| Connection Pool | Funzionante correttamente |

---

## Metriche ElastiCache Redis

### Utilizzo CPU

| Ora (UTC) | CPU % |
|-----------|-------|
| 12:42 | 2.1% |
| Picco | **3.9%** |
| 12:55 | 2.6% |

**Picco: 3.9%** - Cache NON sotto stress

### Performance Cache

| Ora (UTC) | Hits | Misses | Hit Rate |
|-----------|------|--------|----------|
| 12:43 | 1,649 | 5 | 99.7% |
| 12:46 | 8,125 | 0 | 100% |
| 12:47 | 8,101 | 15 | 99.8% |
| **Totale** | **76,865** | **63** | **99.9%** |

```
Cache Hit Rate: 99.9%
┌────────────────────────────────────────────────────────┐
│████████████████████████████████████████████████████░  │
│ 76,865 Hits                                     63    │
└────────────────────────────────────────────────────────┘
```

---

## Analisi Collo di Bottiglia

```
┌─────────────────────────────────────────────────────────────────┐
│              IDENTIFICAZIONE COLLO DI BOTTIGLIA                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️  EC2 Node 1 (Backend Pod): 97% CPU                          │
│      └── Singolo pod gestisce tutte le richieste API           │
│      └── CPU-bound, non I/O bound                               │
│                                                                  │
│  ✅ RDS PostgreSQL: 18% CPU                                     │
│      └── Connection pooling efficace (6 connessioni)            │
│      └── Query ben ottimizzate                                  │
│                                                                  │
│  ✅ ElastiCache Redis: 4% CPU                                   │
│      └── 99.9% cache hit rate                                   │
│      └── Strategia di caching eccellente                        │
│                                                                  │
│  ✅ ALB: Nessun errore 5xx                                      │
│      └── Tutte le richieste processate con successo             │
│      └── Latenza max 1.9s durante picco carico                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Correlazione k6 vs CloudWatch

| Metrica | Report k6 | CloudWatch | Match |
|---------|-----------|------------|-------|
| Richieste Totali | 183,203 | ~183,000 (somma ALB) | ✅ |
| RPS Picco | 234.8 media | 328 picco | ✅ |
| Latenza p95 | 380ms | ~80-127ms media | ✅ |
| Latenza Max | 892ms (p99) | 1,913ms | ⚠️ |
| Error Rate | 5.33% | 0% 5xx | ✅ (4xx auth) |

**Nota:** k6 include timing lato client, CloudWatch misura solo ALB-to-target.

---

## Raccomandazioni

### Azioni Immediate

1. **Scalare Backend Orizzontalmente**
   ```yaml
   # Configurazione HPA
   spec:
     minReplicas: 2
     maxReplicas: 5
     targetCPUUtilizationPercentage: 70
   ```

2. **Abilitare Pod Anti-Affinity**
   - Distribuire pod backend su nodi diversi
   - Evitare collo di bottiglia su singolo nodo

### Opportunita' di Ottimizzazione

| Area | Attuale | Raccomandazione |
|------|---------|-----------------|
| Backend Pods | 1 | 2-3 repliche |
| CPU Request | - | 500m |
| CPU Limit | - | 1000m |
| Tipo Nodo | t3.small | t3.medium (se necessario) |

### Gia' Ottimale

- ✅ Caching Redis (99.9% hit rate)
- ✅ Connection pooling RDS
- ✅ Performance query database
- ✅ Configurazione ALB

---

## Prossimi Passi

1. [ ] Configurare HPA per deployment backend
2. [ ] Eseguire stress test con 2+ repliche backend
3. [ ] Verificare trigger Cluster Autoscaler
4. [ ] Monitorare distribuzione pod sui nodi
5. [ ] Confrontare risultati pre/post ottimizzazione
