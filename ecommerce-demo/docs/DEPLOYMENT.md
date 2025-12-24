# Deployment Guide

Guide for deploying the E-commerce Demo to AWS EKS.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    CloudFront CDN                         │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │                                     │
│  ┌─────────────────────────▼───────────────────────────────┐   │
│  │              Application Load Balancer                    │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            │                                     │
│  ┌─────────────────────────▼───────────────────────────────┐   │
│  │                      EKS Cluster                          │   │
│  │  ┌─────────────────┐  ┌─────────────────┐                │   │
│  │  │   Frontend      │  │    Backend      │                │   │
│  │  │   (Next.js)     │  │   (Fastify)     │                │   │
│  │  └─────────────────┘  └────────┬────────┘                │   │
│  └────────────────────────────────┼────────────────────────┘   │
│                                   │                             │
│  ┌────────────────────────────────▼────────────────────────┐   │
│  │                      Data Layer                          │   │
│  │  ┌─────────────────┐  ┌─────────────────┐               │   │
│  │  │   RDS           │  │   ElastiCache   │               │   │
│  │  │   (PostgreSQL)  │  │   (Redis)       │               │   │
│  │  └─────────────────┘  └─────────────────┘               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Prerequisites

1. AWS account with appropriate permissions
2. AWS CLI configured
3. Terraform installed
4. kubectl and Helm installed
5. Docker installed (for building images)

## Infrastructure Deployment

### Step 1: Create Terraform Backend

```bash
./scripts/setup-infra.sh backend
```

This creates:
- S3 bucket for state storage
- DynamoDB table for state locking

### Step 2: Configure Variables

```bash
cd infra/terraform/environments/demo
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
project_name = "ecommerce-demo"
environment  = "demo"
aws_region   = "us-east-1"

# Adjust instance sizes as needed
eks_node_instance_types = ["t3.medium"]
rds_instance_class      = "db.t3.small"
redis_node_type         = "cache.t3.micro"
```

### Step 3: Deploy Infrastructure

```bash
# Initialize Terraform
./scripts/setup-infra.sh init

# Plan changes
./scripts/setup-infra.sh plan

# Apply changes
./scripts/setup-infra.sh apply
```

### Step 4: Configure Kubernetes

```bash
# Update kubeconfig
./scripts/setup-infra.sh kubectl

# Install cluster components
./scripts/setup-infra.sh cluster-components
```

## Application Deployment

### Manual Deployment

```bash
# Build and push images
./scripts/deploy-all.sh build

# Deploy applications
./scripts/deploy-all.sh deploy

# Or do everything at once
./scripts/deploy-all.sh all
```

### CI/CD Deployment

The project includes GitHub Actions workflows for automated deployment:

1. **Configure GitHub Secrets**
   - `AWS_ROLE_ARN`: IAM role ARN for GitHub Actions

2. **Configure GitHub Variables**
   - `NEXT_PUBLIC_API_URL`: Backend API URL

3. **Trigger Deployment**
   - Push to `main` branch triggers automatic deployment

## Helm Configuration

### Frontend Values

```yaml
# helm/frontend/values-demo.yaml
image:
  repository: ${ECR_REGISTRY}/ecommerce-demo/frontend
  tag: latest

ingress:
  hosts:
    - host: demo.example.com
      paths:
        - path: /
          pathType: Prefix

env:
  NEXT_PUBLIC_API_URL: "https://api.demo.example.com"
```

### Backend Values

```yaml
# helm/backend/values-demo.yaml
image:
  repository: ${ECR_REGISTRY}/ecommerce-demo/backend
  tag: latest

ingress:
  hosts:
    - host: api.demo.example.com
      paths:
        - path: /
          pathType: Prefix

externalSecrets:
  enabled: true
  data:
    - secretKey: DATABASE_URL
      remoteRef:
        key: ecommerce-demo-demo-rds-password
        property: connection_string
```

## Secrets Management

### Using AWS Secrets Manager

1. **Create SecretStore**
   ```yaml
   apiVersion: external-secrets.io/v1beta1
   kind: ClusterSecretStore
   metadata:
     name: aws-secrets-manager
   spec:
     provider:
       aws:
         service: SecretsManager
         region: us-east-1
   ```

2. **Reference in Helm values**
   ```yaml
   externalSecrets:
     enabled: true
     secretStoreRef:
       name: aws-secrets-manager
       kind: ClusterSecretStore
   ```

## Database Migrations

### Running Migrations

```bash
# Locally
npm run db:migrate -w apps/backend

# In Kubernetes
kubectl exec -n ecommerce deployment/backend -- npm run db:migrate:prod
```

## Monitoring & Logging

### Viewing Logs

```bash
# Pod logs
kubectl logs -n ecommerce deployment/backend -f

# All pods in namespace
kubectl logs -n ecommerce -l app.kubernetes.io/name=backend -f
```

### Checking Health

```bash
# Pod status
kubectl get pods -n ecommerce

# Deployment status
kubectl rollout status deployment/backend -n ecommerce

# Service endpoints
kubectl get endpoints -n ecommerce
```

## Scaling

### Horizontal Pod Autoscaling

```bash
# Check HPA status
kubectl get hpa -n ecommerce

# Manual scaling
kubectl scale deployment/backend -n ecommerce --replicas=5
```

### Vertical Scaling

Edit Helm values:
```yaml
resources:
  limits:
    cpu: 2000m
    memory: 2Gi
  requests:
    cpu: 500m
    memory: 1Gi
```

## Rollback

### Application Rollback

```bash
# Check rollout history
kubectl rollout history deployment/backend -n ecommerce

# Rollback to previous version
kubectl rollout undo deployment/backend -n ecommerce

# Rollback to specific revision
kubectl rollout undo deployment/backend -n ecommerce --to-revision=2
```

### Infrastructure Rollback

```bash
# View state history
terraform state list

# Use previous state (careful!)
terraform apply -target=module.database
```

## Cleanup

### Remove Applications

```bash
helm uninstall frontend -n ecommerce
helm uninstall backend -n ecommerce
kubectl delete namespace ecommerce
```

### Remove Infrastructure

```bash
cd infra/terraform/environments/demo
terraform destroy
```

**Warning**: This will delete all resources including databases!

## Cost Optimization

### Demo Environment Recommendations

- Use `t3.medium` or `t3.small` for EKS nodes
- Use single NAT Gateway
- Use `db.t3.micro` for RDS (non-production)
- Use `cache.t3.micro` for ElastiCache
- Consider Spot instances for non-critical workloads

### Production Recommendations

- Use `t3.large` or larger for EKS nodes
- Use multiple NAT Gateways for HA
- Use `db.r6g.large` or larger for RDS
- Enable Multi-AZ for RDS and ElastiCache
- Use Reserved Instances for predictable workloads
