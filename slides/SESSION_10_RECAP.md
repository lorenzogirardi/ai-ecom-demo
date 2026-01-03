# Day 10: Operational Portal

## Obiettivo della Giornata

Costruire un portale operativo self-service per il team L1 Support utilizzando GitHub Actions come interfaccia.

---

## Problema Risolto

### Prima
- L1 deve contattare DevOps per ogni diagnosi
- Tempi di risposta lunghi per problemi semplici
- Nessuna visibilità sullo stato del sistema
- Rischio di errori con accesso diretto al cluster

### Dopo
- Self-service con guardrails
- Diagnosi immediata senza escalation
- Operazioni controllate e approvate
- Audit trail completo

---

## Architettura

```
L1 Operator
    |
    v
GitHub Actions (workflow_dispatch)
    |
    v
Environment Protection (approval required)
    |
    v
AWS OIDC Authentication
    |
    v
EKS Cluster (kubectl)
    |
    v
Job Summary (report)
```

---

## Workflow Implementati

### Diagnostica (Read-Only)

| Workflow | Funzione |
|----------|----------|
| Pod Health Check | Stato pods e eventi |
| Service Health Check | Test endpoint health |
| View Pod Logs | Ultimi N log lines |
| Database Test | Test connessione DB |
| Redis Status | Verifica cache |
| Deployment Info | Info deploy/HPA |
| Recent Errors | Cerca errori nei log |
| Performance Snapshot | Risorse e tempi API |

---

## Workflow Implementati

### Operazioni Controllate

| Workflow | Funzione | Safeguard |
|----------|----------|-----------|
| Pod Restart | Rolling restart | Rollout status |
| Scale Replicas | Scala 2-10 | Bounded choice |
| Clear Cache | Refresh cache | Rollout status |
| ArgoCD Sync | Trigger sync | Single app |
| CloudFront Invalidate | Invalida CDN | Path limitato |
| Export Logs | Download logs | Artifact 7 days |

---

## Sicurezza: Environment Protection

```yaml
jobs:
  operation:
    environment: production  # Richiede approvazione

    permissions:
      id-token: write   # Per OIDC
      contents: read    # Per checkout
```

### Flusso Approvazione
1. L1 triggera workflow
2. Job in stato "waiting"
3. Reviewer riceve notifica
4. Approva/Rifiuta
5. Workflow esegue o termina

---

## Sicurezza: Parametri Bounded

```yaml
# Non input libero, ma scelte predefinite
replicas:
  type: choice
  options: ['2', '3', '4', '5', '6', '7', '8', '9', '10']

namespace:
  type: choice
  options: ['ecommerce']  # Locked

app:
  type: choice
  options: ['backend', 'frontend']
```

**Nessun input arbitrario = Nessun rischio injection**

---

## Sicurezza: AWS OIDC

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::xxx:role/github-actions
    aws-region: us-east-1
```

### Vantaggi
- No secrets statici
- Credenziali temporanee (1h)
- Trust solo da questo repo
- Audit in CloudTrail

---

## Output: Job Summary

Ogni workflow genera un report markdown:

```markdown
## Pod Health Check

**Namespace:** `ecommerce`
**Timestamp:** 2026-01-03T13:00:00Z

### Pod Status
| Pod | Status | Restarts |
|-----|--------|----------|
| backend-abc | Running | 0 |

### API Health: 200 OK (45ms)
```

Visibile direttamente nella pagina del workflow run.

---

## Output: Artifacts

Export Logs salva file scaricabili:

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: logs-backend-${{ github.run_id }}
    path: logs/
    retention-days: 7
```

Download disponibile per 7 giorni.

---

## Pattern: Error Handling

```bash
# Graceful degradation
kubectl get pods 2>/dev/null || echo "Unable to fetch"

# Timeout protection
kubectl rollout status --timeout=300s

# Null checks
if [ -z "$POD" ]; then
  echo "No pods found"
  exit 1
fi
```

---

## Pattern: Before/After

Per operazioni modificanti, sempre mostrare stato prima e dopo:

```bash
# Pre-operation
echo "### Before" >> $GITHUB_STEP_SUMMARY
kubectl get pods >> $GITHUB_STEP_SUMMARY

# Operation
kubectl rollout restart deployment/backend

# Post-operation
echo "### After" >> $GITHUB_STEP_SUMMARY
kubectl get pods >> $GITHUB_STEP_SUMMARY
```

---

## Demo: Flusso Completo

1. **L1 nota lentezza** -> Triggera "Performance Snapshot"
2. **Vede pod con high CPU** -> Triggera "View Pod Logs"
3. **Trova errori Redis** -> Triggera "Redis Status"
4. **Conferma problema cache** -> Triggera "Clear Cache"
5. **Verifica fix** -> Triggera "Performance Snapshot"

Tutto senza contattare DevOps!

---

## Audit Trail

### GitHub
- Chi ha triggerato
- Chi ha approvato
- Quando
- Con quali parametri
- Output completo

### AWS CloudTrail
- Tutte le API call
- Timestamp
- Source IP (GitHub)
- Risorse accedute

---

## Costi

| Componente | Costo |
|------------|-------|
| GitHub Actions | Incluso (2000 min/mese free) |
| AWS OIDC | Gratuito |
| CloudTrail | ~$2/100k eventi |
| **Totale** | **~$0/mese** |

---

## Lezioni Apprese

1. **kubectl in container** - No curl/wget, usare node fetch
2. **Label selectors** - Helm usa `app.kubernetes.io/name`
3. **EKS cluster name** - Verificare nome esatto
4. **Namespace default** - Specificare sempre esplicitamente
5. **Bounded inputs** - Usare `choice` invece di `string`

---

## Prossimi Passi

1. Slack notification dei risultati
2. Scheduled health check giornaliero
3. Link a runbook nei Job Summary
4. Dashboard aggregata con workflow recenti
5. Template incident da errori trovati

---

## Risorse

- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments)
- [AWS OIDC with GitHub](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [OPERATIONAL_PORTAL_ARCHITECTURE.md](../docs/OPERATIONAL_PORTAL_ARCHITECTURE.md)

---

## Q&A

Domande?
