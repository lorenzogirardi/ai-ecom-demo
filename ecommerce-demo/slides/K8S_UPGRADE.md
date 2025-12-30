# Kubernetes Upgrade: EKS 1.29 → 1.32 + Amazon Linux 2023

## Panoramica

Questo documento descrive l'upgrade del cluster EKS dalla versione 1.29 alla 1.32, inclusa la migrazione da Amazon Linux 2 ad Amazon Linux 2023.

---

## Componenti Aggiornati

| Componente | Prima | Dopo |
|------------|-------|------|
| **EKS Control Plane** | 1.29 | 1.32 |
| **Node AMI** | Amazon Linux 2 | Amazon Linux 2023 |
| **Kernel** | 5.10.245 | 6.1.158 |
| **Containerd** | 1.7.29 | 2.1.5 |
| **Kubelet** | v1.29.15 | v1.32.9 |

---

## Processo di Upgrade

### Fase 1: Upgrade Control Plane (3 step sequenziali)

EKS non permette di saltare versioni minor. L'upgrade del control plane è stato eseguito in 3 step:

```
1.29 → 1.30 (~7.5 min)
1.30 → 1.31 (~7.4 min)
1.31 → 1.32 (~7.7 min)
```

**Tempo totale control plane:** ~23 minuti

**Comando Terraform per ogni step:**
```bash
terraform apply -var="eks_cluster_version=1.30" -auto-approve
terraform apply -var="eks_cluster_version=1.31" -auto-approve
terraform apply -var="eks_cluster_version=1.32" -auto-approve
```

### Fase 2: Upgrade Node Group (AL2 → AL2023)

Aggiunta variabile `ami_type` al modulo EKS Terraform:

```hcl
variable "eks_ami_type" {
  description = "AMI type for EKS nodes"
  type        = string
  default     = "AL2023_x86_64_STANDARD"
}
```

---

## Analisi della Decisione: Downtime vs Zero-Downtime

### Approccio Scelto: Replace Node Group (CON DOWNTIME)

```
Terraform Plan:
  # module.eks.aws_eks_node_group.main must be replaced
  ~ ami_type = "AL2_x86_64" -> "AL2023_x86_64_STANDARD" # forces replacement
```

**Risultato:**
- Node group AL2 distrutto (~6 min)
- Node group AL2023 creato (~2 min)
- **Downtime totale:** ~8 minuti

### Approccio Alternativo: Blue-Green (ZERO DOWNTIME)

```hcl
# Fase 1: Aggiungi nuovo node group (mantieni vecchio)
resource "aws_eks_node_group" "al2023" {
  node_group_name = "${var.cluster_name}-al2023"
  ami_type        = "AL2023_x86_64_STANDARD"
}

# Fase 2: Cordon + Drain vecchi nodi
kubectl cordon <old-nodes>
kubectl drain <old-nodes> --ignore-daemonsets --delete-emptydir-data

# Fase 3: Rimuovi vecchio node group da Terraform
# Fase 4: terraform apply
```

---

## Perché Ho Scelto l'Approccio con Downtime

### Contesto della Decisione

1. **Ambiente Demo/Dev**
   - Non è un ambiente di produzione
   - Nessun utente reale impattato
   - Costo di downtime = 0

2. **Semplicità Operativa**
   - Un singolo `terraform apply` vs processo multi-step manuale
   - Nessun rischio di stato inconsistente tra node groups
   - Configurazione Terraform più pulita (un solo node group)

3. **Costo AWS**
   - Blue-green richiede temporaneamente il doppio dei nodi
   - Per t3.medium: ~$0.0416/ora × 3 nodi = $0.125/ora extra
   - Durata stimata blue-green: 30-60 minuti
   - Costo aggiuntivo evitato: ~$0.06-0.12

4. **Tempo di Esecuzione**
   - Approccio replace: ~8 minuti (automatico)
   - Approccio blue-green: ~30-60 minuti (semi-manuale)

### Matrice Decisionale

| Fattore | Replace (Downtime) | Blue-Green (Zero DT) |
|---------|-------------------|----------------------|
| **Complessità** | Bassa | Media-Alta |
| **Tempo totale** | ~8 min | ~30-60 min |
| **Costo extra AWS** | $0 | ~$0.06-0.12 |
| **Rischio errori** | Basso | Medio |
| **Adatto per PROD** | NO | SI |
| **Adatto per DEV/DEMO** | SI | Overkill |

### Conclusione

Per un **ambiente demo** dove:
- Non ci sono SLA da rispettare
- Non ci sono utenti reali
- Il costo conta
- La velocità di esecuzione è preferibile

**L'approccio con downtime è la scelta corretta.**

---

## Approccio Consigliato per Produzione

Per ambienti di produzione, l'approccio **blue-green** è obbligatorio:

### Terraform Configuration

```hcl
# variables.tf
variable "node_group_version" {
  description = "Version suffix for blue-green deployments"
  type        = string
  default     = "v2"  # Incrementare per ogni upgrade
}

# main.tf
resource "aws_eks_node_group" "main" {
  node_group_name = "${var.cluster_name}-${var.node_group_version}"
  ami_type        = var.eks_ami_type
  # ...
}
```

### Procedura Operativa

```bash
# 1. Crea nuovo node group (v2) mantenendo vecchio (v1)
terraform apply -var="node_group_version=v2"

# 2. Attendi nodi Ready
kubectl get nodes -w

# 3. Cordon vecchi nodi (v1)
kubectl cordon -l eks.amazonaws.com/nodegroup=cluster-v1

# 4. Drain vecchi nodi
kubectl drain <node> --ignore-daemonsets --delete-emptydir-data

# 5. Verifica applicazione
curl https://app.example.com/health

# 6. Rimuovi vecchio node group
# (modifica Terraform per rimuovere v1, poi apply)
```

### PodDisruptionBudget (Consigliato)

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: backend-pdb
spec:
  minAvailable: 1
  selector:
    matchLabels:
      app: backend
```

---

## File Terraform Modificati

| File | Modifica |
|------|----------|
| `modules/eks/main.tf` | Aggiunto `ami_type = var.ami_type` |
| `modules/eks/variables.tf` | Aggiunta variabile `ami_type` |
| `environments/demo/platform/main.tf` | Passaggio `ami_type` al modulo |
| `environments/demo/platform/variables.tf` | Aggiunta `eks_ami_type` |

---

## Risultato Finale

```bash
$ kubectl get nodes -o wide
NAME                         STATUS   ROLES    AGE   VERSION
ip-10-0-35-64.ec2.internal   Ready    <none>   60s   v1.32.9-eks-ecaa3a6
ip-10-0-55-93.ec2.internal   Ready    <none>   60s   v1.32.9-eks-ecaa3a6

OS-IMAGE: Amazon Linux 2023.9.20251208
KERNEL:   6.1.158-180.294.amzn2023.x86_64
RUNTIME:  containerd://2.1.5
```

---

## Validazione Post-Upgrade: Smoke Test

Dopo l'upgrade, è stato eseguito uno smoke test k6 per validare il corretto funzionamento dell'applicazione.

### Comando Eseguito

```bash
k6 run k6/scenarios/smoke.js
```

### Risultati Smoke Test

| Metrica | Valore |
|---------|--------|
| **Checks Passati** | 100% (525/525) |
| **HTTP Errors** | 0% |
| **Requests Totali** | 175 |
| **p95 Latency** | 250ms |
| **p90 Latency** | 221ms |
| **Media Latency** | 150ms |

### Endpoint Testati

| Endpoint | Stato |
|----------|-------|
| Health Check (`/api/health`) | ✅ OK |
| Browse Products (`/api/products`) | ✅ OK |
| Browse Categories (`/api/categories`) | ✅ OK |
| Search Products (`/api/search`) | ✅ OK |
| Authentication (`/api/auth/login`) | ✅ OK |

### Output Test

```
     █ Health Check
       ✓ status is 200
       ✓ response time < 500ms
       ✓ health status ok

     █ Browse Products
       ✓ status is 200
       ✓ response time < 500ms
       ✓ products returned

     █ Browse Categories
       ✓ status is 200
       ✓ response time < 500ms
       ✓ categories returned

     █ Search Products
       ✓ status is 200
       ✓ response time < 500ms
       ✓ search results

     █ Authentication
       ✓ login successful
       ✓ has token

     checks.........................: 100.00% ✓ 525 ✗ 0
     http_req_failed................: 0.00%   ✓ 0   ✗ 175
```

**Conclusione:** Applicazione completamente operativa su EKS 1.32 + Amazon Linux 2023.

---

## Riepilogo Tempi Upgrade

| Fase | Durata | Note |
|------|--------|------|
| Control Plane 1.29→1.30 | ~7.5 min | Automatico |
| Control Plane 1.30→1.31 | ~7.4 min | Automatico |
| Control Plane 1.31→1.32 | ~7.7 min | Automatico |
| Node Group Replace | ~8 min | Downtime |
| Smoke Test Validation | ~34 sec | Automatico |
| **Totale** | **~31 min** | |

---

## Lezioni Apprese

1. **Sempre considerare il contesto** - La soluzione "migliore" dipende dall'ambiente
2. **Downtime accettabile in dev/demo** - Non over-engineering per ambienti non critici
3. **Blue-green obbligatorio in prod** - Zero tolerance per downtime in produzione
4. **Documentare le decisioni** - Spiegare il "perché" oltre al "come"
5. **Validare sempre post-upgrade** - Smoke test immediato per confermare funzionalità

---

*Documento generato: 2025-12-30*
*Upgrade eseguito: EKS 1.29 → 1.32 + AL2 → AL2023*
*Validazione: Smoke test 100% passed*
