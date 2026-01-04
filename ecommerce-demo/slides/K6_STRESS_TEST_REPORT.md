# Report Stress Test k6

> **Data Test:** 2026-01-02
> **Stato:** SUPERATO
> **Sessione:** Giorno 8 - Post Ottimizzazioni Codice

## Riepilogo

| Metrica | Valore |
|---------|--------|
| Richieste Totali | 216.375 |
| Richieste/sec | 277,2 |
| Tempo di Risposta (p95) | 190 ms |
| Tasso di Errore | 0,00% |
| Utenti Virtuali | 100 max |
| Durata | 780,6 secondi (~13 min) |
| Iterazioni | 56.957 |

## Distribuzione Tempi di Risposta

| Percentile | Tempo di Risposta |
|------------|-------------------|
| Minimo | 109,50 ms |
| Media | 130,34 ms |
| Mediana (p50) | 117,87 ms |
| p90 | 166,29 ms |
| p95 | 189,62 ms |
| Massimo | 2105,21 ms |

## Soglie

Tutte le soglie superate (4/4):

| Metrica | Condizione | Stato |
|---------|------------|-------|
| requests_under_1s | rate > 0.8 | PASS |
| http_req_duration | p(95) < 2000 | PASS |
| http_req_failed | rate < 0.10 | PASS |
| requests_under_500ms | rate > 0.5 | PASS |

## Controlli

Tutti i controlli superati con tasso di successo 100%:

### Test Stress Autenticazione

| Controllo | Successi | Fallimenti | Tasso Successo |
|-----------|----------|------------|----------------|
| login riuscito | 11.453 | 0 | 100% |
| ha token | 11.453 | 0 | 100% |
| ordini ok | 11.453 | 0 | 100% |
| me ok | 11.453 | 0 | 100% |

### Test Stress API

| Controllo | Successi | Fallimenti | Tasso Successo |
|-----------|----------|------------|----------------|
| health ok | 45.504 | 0 | 100% |
| products ok | 45.504 | 0 | 100% |
| categories ok | 45.504 | 0 | 100% |
| search ok | 45.504 | 0 | 100% |

## Rete

| Metrica | Valore |
|---------|--------|
| Dati Ricevuti | 1,22 GB |
| Dati Inviati | 16,5 MB |

## Miglioramenti Prestazioni

Questo test è stato eseguito dopo le ottimizzazioni del codice del Giorno 8:

| Ottimizzazione | Impatto |
|----------------|---------|
| Redis pipeline (mget/mset) | Operazioni batch per prodotti |
| Cache utente per /me | Riduzione query DB |
| Tasso hit cache | 99,95% (33.845 hit, 18 miss) |

### Confronto con Test Precedenti

| Metrica | Giorno 6 | Giorno 7 | Giorno 8 | Miglioramento |
|---------|----------|----------|----------|---------------|
| Richieste Totali | 183.203 | 291.480 | 216.375 | - |
| RPS | 234,8 | 373,4 | 277,2 | +18% vs Giorno 6 |
| Latenza p95 | 380 ms | 206 ms | 190 ms | -50% vs Giorno 6 |
| Tasso Errore | 5,33% | 5,27% | 0,00% | -100% |

## Infrastruttura Durante il Test

| Componente | Stato |
|------------|-------|
| Pod Backend | 6/7 attivi (HPA scalato) |
| Pod Frontend | 3 attivi |
| Nodi Cluster | Autoscalati secondo necessità |
| Tasso Hit Cache | 99,95% |

---

*Generato da k6 Load Testing*
