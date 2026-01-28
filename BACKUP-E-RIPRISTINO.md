# Guida Backup e Ripristino - E-Commerce Demo

> **Data creazione:** 28 Gennaio 2026
> **Scopo:** Procedura completa per backup pre-destroy e ripristino infrastruttura

---

## 1. Panoramica Risorse

### Risorse AWS Create dal Progetto

| Risorsa | Modulo Terraform | Criticità Backup |
|---------|------------------|------------------|
| RDS PostgreSQL | `services/database` | **CRITICA** - Dati applicativi |
| ElastiCache Redis | `services/cache` | MEDIA - Cache rigenerabile |
| EKS Cluster | `platform/eks` | BASSA - Ricostruibile da Terraform |
| VPC/Subnets | `platform/network` | BASSA - Ricostruibile da Terraform |
| CloudFront + S3 | `services/cdn` | MEDIA - Assets ricostruibili |
| ECR Repositories | `bootstrap/ecr` | MEDIA - Immagini ricostruibili da CI |
| Secrets Manager | `services` | **CRITICA** - Password e secrets |
| Terraform State | `bootstrap/state-backend` | **CRITICA** - Stato infrastruttura |

---

## 2. Procedura di Backup PRE-DESTROY

### 2.1 Creare Directory di Backup

```bash
# Creare struttura backup
export BACKUP_DATE=$(date +%Y%m%d-%H%M%S)
export BACKUP_DIR="$HOME/ecommerce-demo-backup-$BACKUP_DATE"

mkdir -p "$BACKUP_DIR"/{terraform-state,secrets,database,ecr-info,configs}
cd "$BACKUP_DIR"

echo "Backup directory: $BACKUP_DIR"
```

### 2.2 Backup Terraform State Files (CRITICO)

```bash
# Sync completo del bucket S3 con gli state files
aws s3 sync s3://ecommerce-demo-terraform-state/ "$BACKUP_DIR/terraform-state/"

# Verifica contenuto
ls -la "$BACKUP_DIR/terraform-state/"
# Dovrebbe contenere:
# - demo/platform.tfstate
# - demo/services.tfstate
# - bootstrap/*.tfstate
```

### 2.3 Backup Secrets Manager (CRITICO)

```bash
# Esportare tutti i secrets
aws secretsmanager get-secret-value \
  --secret-id ecommerce-demo-demo-rds-password \
  --region us-east-1 \
  --query 'SecretString' \
  --output text > "$BACKUP_DIR/secrets/rds-password.json"

aws secretsmanager get-secret-value \
  --secret-id ecommerce-demo-demo-redis-auth \
  --region us-east-1 \
  --query 'SecretString' \
  --output text > "$BACKUP_DIR/secrets/redis-auth.json"

aws secretsmanager get-secret-value \
  --secret-id ecommerce-demo-demo-jwt \
  --region us-east-1 \
  --query 'SecretString' \
  --output text > "$BACKUP_DIR/secrets/jwt-secret.json"

# IMPORTANTE: Proteggere questa directory
chmod 600 "$BACKUP_DIR/secrets/"*
```

### 2.4 Backup Database RDS (CRITICO)

```bash
# Opzione A: Creare snapshot manuale AWS (consigliato)
aws rds create-db-snapshot \
  --db-instance-identifier ecommerce-demo-demo-postgres \
  --db-snapshot-identifier "ecommerce-demo-manual-backup-$BACKUP_DATE" \
  --region us-east-1

# Attendere completamento snapshot
aws rds wait db-snapshot-available \
  --db-snapshot-identifier "ecommerce-demo-manual-backup-$BACKUP_DATE" \
  --region us-east-1

echo "Snapshot RDS creato: ecommerce-demo-manual-backup-$BACKUP_DATE"
```

```bash
# Opzione B: Export SQL completo (alternativa se vuoi file locale)
# Recupera endpoint e credenziali
DB_HOST=$(aws secretsmanager get-secret-value \
  --secret-id ecommerce-demo-demo-rds-password \
  --region us-east-1 \
  --query 'SecretString' --output text | jq -r '.host')

DB_USER=$(aws secretsmanager get-secret-value \
  --secret-id ecommerce-demo-demo-rds-password \
  --region us-east-1 \
  --query 'SecretString' --output text | jq -r '.username')

DB_PASS=$(aws secretsmanager get-secret-value \
  --secret-id ecommerce-demo-demo-rds-password \
  --region us-east-1 \
  --query 'SecretString' --output text | jq -r '.password')

# Dump database (richiede accesso VPC o bastion host)
# PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -U "$DB_USER" -d ecommerce_db \
#   --format=custom --file="$BACKUP_DIR/database/ecommerce_db.dump"
```

### 2.5 Verificare Snapshot Automatici Esistenti

```bash
# Lista tutti gli snapshot RDS esistenti
aws rds describe-db-snapshots \
  --region us-east-1 \
  --db-instance-identifier ecommerce-demo-demo-postgres \
  --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime,Status]' \
  --output table

# Salvare lista per riferimento
aws rds describe-db-snapshots \
  --region us-east-1 \
  --db-instance-identifier ecommerce-demo-demo-postgres \
  > "$BACKUP_DIR/database/existing-snapshots.json"
```

### 2.6 Backup Informazioni ECR

```bash
# Salvare lista immagini (per riferimento, le immagini sono ricostruibili da CI)
aws ecr describe-images \
  --repository-name ecommerce-demo/backend \
  --region us-east-1 \
  > "$BACKUP_DIR/ecr-info/backend-images.json"

aws ecr describe-images \
  --repository-name ecommerce-demo/frontend \
  --region us-east-1 \
  > "$BACKUP_DIR/ecr-info/frontend-images.json"
```

### 2.7 Backup Configurazioni Terraform

```bash
# Copiare file tfvars (se esistono)
TERRAFORM_DIR="/Users/lgirardi/Storage/home/ai/ai-ecom-demo/ecommerce-demo/infra/terraform"

# Platform tfvars
if [ -f "$TERRAFORM_DIR/environments/demo/platform/terraform.tfvars" ]; then
  cp "$TERRAFORM_DIR/environments/demo/platform/terraform.tfvars" \
     "$BACKUP_DIR/configs/platform-terraform.tfvars"
fi

# Services tfvars
if [ -f "$TERRAFORM_DIR/environments/demo/services/terraform.tfvars" ]; then
  cp "$TERRAFORM_DIR/environments/demo/services/terraform.tfvars" \
     "$BACKUP_DIR/configs/services-terraform.tfvars"
fi

# Copiare anche gli example per riferimento
cp "$TERRAFORM_DIR/environments/demo/platform/terraform.tfvars.example" \
   "$BACKUP_DIR/configs/platform-terraform.tfvars.example"

cp "$TERRAFORM_DIR/environments/demo/services/terraform.tfvars.example" \
   "$BACKUP_DIR/configs/services-terraform.tfvars.example"
```

### 2.8 Backup Informazioni CloudFront e S3

```bash
# Lista distribuzioni CloudFront
aws cloudfront list-distributions \
  --query 'DistributionList.Items[?contains(Origins.Items[0].DomainName, `ecommerce-demo`)]' \
  > "$BACKUP_DIR/configs/cloudfront-distributions.json"

# Lista bucket S3 assets
aws s3 ls | grep ecommerce-demo > "$BACKUP_DIR/configs/s3-buckets.txt"
```

### 2.9 Verifica Finale Backup

```bash
# Struttura finale backup
echo "=== Contenuto Backup ==="
find "$BACKUP_DIR" -type f -exec ls -lh {} \;

# Creare archivio compresso
cd "$(dirname $BACKUP_DIR)"
tar -czvf "ecommerce-demo-backup-$BACKUP_DATE.tar.gz" \
  "ecommerce-demo-backup-$BACKUP_DATE/"

echo ""
echo "=== BACKUP COMPLETATO ==="
echo "Directory: $BACKUP_DIR"
echo "Archivio: $(dirname $BACKUP_DIR)/ecommerce-demo-backup-$BACKUP_DATE.tar.gz"
echo ""
echo "IMPORTANTE: Conservare questo archivio in un luogo sicuro!"
```

---

## 3. Procedura di DESTROY

### 3.1 Pre-requisiti

- [ ] Backup completato (Sezione 2)
- [ ] Snapshot RDS verificato come "available"
- [ ] Archivio backup salvato in luogo sicuro

### 3.2 Ordine di Destroy (IMPORTANTE)

Il destroy deve seguire questo ordine per evitare errori di dipendenze:

```
1. Services (RDS, Redis, CDN)
2. Platform (EKS, VPC)
3. Bootstrap ECR
4. Bootstrap OIDC
5. State Backend (opzionale - ultimo)
```

### 3.3 Comandi Destroy

```bash
cd /Users/lgirardi/Storage/home/ai/ai-ecom-demo/ecommerce-demo/infra/terraform

# STEP 1: Destroy Services Layer
cd environments/demo/services
terraform init
terraform destroy

# STEP 2: Destroy Platform Layer
cd ../platform
terraform init
terraform destroy

# STEP 3: Destroy Bootstrap ECR
cd ../../bootstrap/ecr
terraform init
terraform destroy

# STEP 4: Destroy Bootstrap OIDC (main bootstrap)
cd ..
terraform init
terraform destroy

# STEP 5: (OPZIONALE) Destroy State Backend
# ATTENZIONE: Questo elimina il bucket S3 con gli state files!
# Eseguire solo se hai già fatto il backup degli state files
cd state-backend
terraform init
terraform destroy
```

### 3.4 Pulizia Risorse Residue (Post-Destroy)

```bash
# Verificare risorse orfane
aws rds describe-db-snapshots --region us-east-1 \
  --query 'DBSnapshots[?contains(DBSnapshotIdentifier, `ecommerce-demo`)]'

# Verificare S3 buckets
aws s3 ls | grep ecommerce-demo

# Verificare CloudWatch log groups
aws logs describe-log-groups --region us-east-1 \
  --log-group-name-prefix "/aws/eks/ecommerce-demo"

# Se necessario, eliminare manualmente:
# aws s3 rb s3://BUCKET-NAME --force
# aws logs delete-log-group --log-group-name LOG-GROUP-NAME
```

---

## 4. Procedura di RIPRISTINO

### 4.1 Pre-requisiti per Ripristino

- Archivio backup disponibile
- AWS CLI configurato con credenziali appropriate
- Terraform >= 1.0 installato
- kubectl installato
- Helm >= 3.0 installato

### 4.2 Estrarre Backup

```bash
# Estrarre archivio
tar -xzvf ecommerce-demo-backup-YYYYMMDD-HHMMSS.tar.gz
cd ecommerce-demo-backup-YYYYMMDD-HHMMSS
```

### 4.3 Step 1: Ricreare State Backend

```bash
cd /Users/lgirardi/Storage/home/ai/ai-ecom-demo/ecommerce-demo/infra/terraform/bootstrap/state-backend

# Verificare variables
cat variables.tf

# Inizializzare e applicare
terraform init
terraform apply

# Output atteso:
# - S3 bucket: ecommerce-demo-terraform-state
# - DynamoDB table: ecommerce-demo-terraform-locks
```

### 4.4 Step 2: (Opzionale) Ripristinare State Files

Se vuoi ripristinare lo stato precedente invece di ricreare da zero:

```bash
# Upload state files dal backup
aws s3 cp "$BACKUP_DIR/terraform-state/demo/platform.tfstate" \
  s3://ecommerce-demo-terraform-state/demo/platform.tfstate

aws s3 cp "$BACKUP_DIR/terraform-state/demo/services.tfstate" \
  s3://ecommerce-demo-terraform-state/demo/services.tfstate
```

### 4.5 Step 3: Ricreare Bootstrap (ECR, OIDC)

```bash
cd /Users/lgirardi/Storage/home/ai/ai-ecom-demo/ecommerce-demo/infra/terraform/bootstrap

# ECR Repositories
cd ecr
terraform init
terraform apply
cd ..

# GitHub OIDC (se usi GitHub Actions)
terraform init
terraform apply
```

### 4.6 Step 4: Ricreare Platform (VPC, EKS)

```bash
cd /Users/lgirardi/Storage/home/ai/ai-ecom-demo/ecommerce-demo/infra/terraform/environments/demo/platform

# Ripristinare terraform.tfvars dal backup
cp "$BACKUP_DIR/configs/platform-terraform.tfvars" ./terraform.tfvars

# Oppure creare da example
cp terraform.tfvars.example terraform.tfvars
# Editare con i valori desiderati

terraform init
terraform apply

# Attendere ~15-20 minuti per EKS cluster
```

### 4.7 Step 5: Configurare kubectl

```bash
# Aggiornare kubeconfig
aws eks update-kubeconfig \
  --region us-east-1 \
  --name ecommerce-demo-demo-eks

# Verificare connessione
kubectl get nodes
```

### 4.8 Step 6: Ricreare Services (RDS, Redis, CDN)

```bash
cd /Users/lgirardi/Storage/home/ai/ai-ecom-demo/ecommerce-demo/infra/terraform/environments/demo/services

# Ripristinare terraform.tfvars
cp "$BACKUP_DIR/configs/services-terraform.tfvars" ./terraform.tfvars

# Oppure creare da example
cp terraform.tfvars.example terraform.tfvars

terraform init
terraform apply
```

### 4.9 Step 7: Ripristinare Database da Snapshot

**IMPORTANTE:** Se hai dati da ripristinare, devi usare lo snapshot RDS.

```bash
# Opzione A: Ripristino diretto da snapshot (crea nuova istanza)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier ecommerce-demo-demo-postgres-restored \
  --db-snapshot-identifier "ecommerce-demo-manual-backup-YYYYMMDD-HHMMSS" \
  --db-instance-class db.t3.micro \
  --vpc-security-group-ids sg-xxxxxxxx \
  --db-subnet-group-name ecommerce-demo-demo-db-subnet-group \
  --region us-east-1

# Attendere che l'istanza sia disponibile
aws rds wait db-instance-available \
  --db-instance-identifier ecommerce-demo-demo-postgres-restored \
  --region us-east-1
```

**Opzione B: Usare pg_restore se hai il dump SQL:**

```bash
# Connessione al nuovo database e restore
PGPASSWORD="$DB_PASS" pg_restore \
  -h "$NEW_DB_HOST" \
  -U "$DB_USER" \
  -d ecommerce_db \
  --format=custom \
  "$BACKUP_DIR/database/ecommerce_db.dump"
```

### 4.10 Step 8: Installare Componenti Kubernetes

```bash
# Usare lo script di setup esistente
cd /Users/lgirardi/Storage/home/ai/ai-ecom-demo/ecommerce-demo

./scripts/setup-infra.sh cluster-components

# Questo installa:
# - AWS Load Balancer Controller
# - External Secrets Operator
# - Cluster Autoscaler
```

### 4.11 Step 9: Deploy Applicazione

```bash
# Build e push immagini (se necessario)
# Le immagini verranno ricostruite dalla CI/CD GitHub Actions

# Deploy manuale con Helm
cd /Users/lgirardi/Storage/home/ai/ai-ecom-demo/ecommerce-demo

# Backend
helm upgrade --install backend ./helm/backend \
  -f ./helm/values-demo.yaml \
  --namespace default

# Frontend
helm upgrade --install frontend ./helm/frontend \
  -f ./helm/values-demo.yaml \
  --namespace default

# Verificare pods
kubectl get pods -w
```

### 4.12 Step 10: Verifiche Finali

```bash
# Verificare tutti i servizi
kubectl get all

# Verificare External Secrets (secrets sincronizzati)
kubectl get externalsecrets

# Verificare Ingress/Load Balancer
kubectl get ingress

# Test endpoint
curl -I http://$(kubectl get ingress -o jsonpath='{.items[0].status.loadBalancer.ingress[0].hostname}')/health
```

---

## 5. Riferimenti Rapidi

### 5.1 Risorse Terraform

| Componente | Percorso | State Key |
|------------|----------|-----------|
| State Backend | `bootstrap/state-backend/` | local |
| ECR | `bootstrap/ecr/` | `bootstrap/ecr.tfstate` |
| GitHub OIDC | `bootstrap/` | `bootstrap/github-oidc.tfstate` |
| Platform | `environments/demo/platform/` | `demo/platform.tfstate` |
| Services | `environments/demo/services/` | `demo/services.tfstate` |

### 5.2 Variabili Principali

**Platform (`platform/terraform.tfvars`):**
```hcl
project_name               = "ecommerce-demo"
environment                = "demo"
aws_region                 = "us-east-1"
vpc_cidr                   = "10.0.0.0/16"
az_count                   = 2
eks_cluster_version        = "1.32"
eks_node_instance_types    = ["t3.medium"]
eks_node_desired_size      = 2
```

**Services (`services/terraform.tfvars`):**
```hcl
project_name                = "ecommerce-demo"
environment                 = "demo"
aws_region                  = "us-east-1"
rds_instance_class          = "db.t3.micro"
rds_allocated_storage       = 20
rds_backup_retention_period = 7
redis_node_type             = "cache.t3.micro"
```

### 5.3 Comandi Utili

```bash
# Stato cluster EKS
aws eks describe-cluster --name ecommerce-demo-demo-eks --region us-east-1

# Stato RDS
aws rds describe-db-instances --db-instance-identifier ecommerce-demo-demo-postgres

# Lista snapshots
aws rds describe-db-snapshots --db-instance-identifier ecommerce-demo-demo-postgres

# Logs Terraform
terraform show
terraform state list
```

---

## 6. Checklist Finale

### Prima del Destroy
- [ ] Backup Terraform state files completato
- [ ] Backup secrets completato
- [ ] Snapshot RDS creato e verificato "available"
- [ ] Archivio backup creato e salvato
- [ ] Annotato ID snapshot RDS per ripristino

### Dopo il Destroy
- [ ] Verificato che non ci siano risorse orfane
- [ ] Snapshot RDS ancora disponibile (se necessario)
- [ ] Archivio backup conservato in luogo sicuro

### Per il Ripristino
- [ ] Archivio backup disponibile
- [ ] AWS CLI configurato
- [ ] Terraform installato
- [ ] Seguire ordine: State Backend → Bootstrap → Platform → Services
- [ ] Ripristinare database da snapshot se necessario

---

## 7. Contatti e Supporto

- **Repository:** `/Users/lgirardi/Storage/home/ai/ai-ecom-demo/ecommerce-demo`
- **Documentazione:** `docs/DEPLOYMENT.md`
- **Script Setup:** `scripts/setup-infra.sh`
