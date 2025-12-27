# Bootstrap - GitHub OIDC Setup

Questa configurazione crea l'integrazione OIDC tra GitHub Actions e AWS.

## Cosa viene creato

1. **OIDC Provider** - Permette a GitHub Actions di autenticarsi con AWS
2. **IAM Role** - Role assumibile da GitHub Actions con policy per:
   - ECR (push/pull immagini)
   - EKS (deploy applicazioni)
   - S3/DynamoDB (Terraform state)
   - Secrets Manager (lettura secrets)

## Prerequisiti

- AWS CLI configurato con credenziali valide
- Terraform >= 1.5.0

## Utilizzo

```bash
# 1. Vai nella directory bootstrap
cd ecommerce-demo/infra/terraform/bootstrap

# 2. Inizializza Terraform
terraform init

# 3. Verifica il piano
terraform plan

# 4. Applica la configurazione
terraform apply

# 5. Copia l'ARN del role dall'output
```

## Configurazione GitHub

Dopo `terraform apply`, aggiungi il secret su GitHub:

1. Vai su: https://github.com/lorenzogirardi/ai-ecom-demo/settings/secrets/actions
2. Clicca **"New repository secret"**
3. Nome: `AWS_ROLE_ARN`
4. Valore: L'ARN del role dall'output di Terraform

## Output

```
role_arn = "arn:aws:iam::ACCOUNT_ID:role/ecommerce-demo-github-actions"
```

## Variabili

| Variabile | Default | Descrizione |
|-----------|---------|-------------|
| `project_name` | `ecommerce-demo` | Nome del progetto |
| `aws_region` | `us-east-1` | Regione AWS |
| `github_repositories` | `["lorenzogirardi/ai-ecom-demo"]` | Repository autorizzati |
| `create_oidc_provider` | `true` | Crea OIDC provider (false se esiste) |

## Troubleshooting

### OIDC Provider già esiste

Se ricevi errore "EntityAlreadyExists", imposta:

```hcl
create_oidc_provider = false
```

### Permessi insufficienti

Il tuo utente AWS deve avere permessi per:
- `iam:CreateOpenIDConnectProvider`
- `iam:CreateRole`
- `iam:PutRolePolicy`
