---
layout: post
title: "AWS Production Deploy: Terraform Layers"
date: 2026-01-06
category: Infrastructure
reading_time: 12
tags: [terraform, aws, eks, rds, cloudfront, argocd]
excerpt: "Deploying to AWS with layered Terraform: EKS, RDS, ElastiCache, CloudFront. GitOps with ArgoCD and External Secrets."
takeaway: "Layer separation in Terraform reduces blast radius. AI debugging cuts infrastructure issues from hours to minutes."
---

## Day 5: Production Infrastructure

With CI/CD pipelines ready, it was time to deploy real infrastructure. Goal: **complete AWS environment with GitOps**.

### What We Deployed

- Terraform Layer 1: VPC, EKS, ECR
- Terraform Layer 2: RDS, ElastiCache, CloudFront
- External Secrets Operator with IRSA
- ArgoCD for GitOps deployments
- CloudFront HTTPS distribution

## Layered Terraform Architecture

### Why Layer Separation?

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1: PLATFORM (core)           platform.tfstate           │
│  ├── Network (VPC, Subnets, NAT)                               │
│  ├── EKS (Cluster, Node Groups, IAM)                           │
│  └── ECR Repositories                                          │
│      Change frequency: Rare (months)                           │
│      Risk: High                                                 │
│      Team: Platform/SRE                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2: SERVICES (application)    services.tfstate           │
│  ├── Database (RDS PostgreSQL)                                 │
│  ├── Cache (ElastiCache Redis)                                 │
│  ├── CDN (CloudFront)                                          │
│  └── Secrets Manager                                           │
│      Change frequency: Often (weeks)                           │
│      Risk: Medium                                              │
│      Team: DevOps/App                                          │
└─────────────────────────────────────────────────────────────────┘
```

### Benefits

| Aspect | Monolithic | Layered |
|--------|-----------|---------|
| Apply time | ~15-20 min | ~2-5 min per layer |
| Blast radius | Everything | Isolated |
| Rollback | Complex | Per-layer |
| Team work | Blocking | Parallel |

## Deployed Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              ┌────────────┴────────────┐
              │       CloudFront        │
              │   dls03qes9fc77.cf.net  │
              └────────────┬────────────┘
                           │ HTTPS
              ┌────────────┴────────────┐
              │    Application LB       │
              │   (AWS LB Controller)   │
              └────────────┬────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────┴───────┐  ┌───────┴───────┐  ┌──────┴──────┐
│   Frontend    │  │    Backend    │  │   ArgoCD    │
│   (Next.js)   │  │   (Fastify)   │  │     UI      │
│    :3000      │  │    :4000      │  │    :8080    │
└───────────────┘  └───────┬───────┘  └─────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────┴───────┐  ┌───────┴───────┐  ┌──────┴──────┐
│  PostgreSQL   │  │     Redis     │  │   Secrets   │
│    (RDS)      │  │ (ElastiCache) │  │   Manager   │
└───────────────┘  └───────────────┘  └─────────────┘
```

## External Secrets Operator

No secrets in Git. Ever.

```
┌─────────────────────────────────────────────────────────────────┐
│                EXTERNAL SECRETS OPERATOR                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │ ExternalSecret│ ──→ │ SecretStore  │ ──→ │ AWS Secrets  │  │
│  │  (K8s CRD)   │      │   (IRSA)     │      │   Manager    │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         │                                            │          │
│         ▼                                            │          │
│  ┌──────────────┐                                    │          │
│  │ K8s Secret   │ ◀──────────────────────────────────┘          │
│  │ (auto-sync)  │                                               │
│  └──────────────┘                                               │
│                                                                  │
│  Synced Secrets:                                                │
│  ├── DATABASE_URL (complete connection string)                  │
│  ├── REDIS_HOST + REDIS_PASSWORD                                │
│  └── JWT_SECRET                                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### IRSA Configuration

```hcl
# IAM Role for External Secrets
resource "aws_iam_role" "external_secrets" {
  name = "external-secrets-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.eks.arn
      }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${aws_iam_openid_connect_provider.eks.url}:sub" =
            "system:serviceaccount:external-secrets:external-secrets"
        }
      }
    }]
  })
}
```

## Issues Resolved

### 1. ArgoCD Application Path

```yaml
# BEFORE (error: app path does not exist)
source:
  path: helm/backend

# AFTER (correct)
source:
  path: ecommerce-demo/helm/backend
```

### 2. External Secrets Operator Version

```bash
# Issue: CRD compatibility with K8s 1.29
# v1.2.0 and v0.20.4: selectableFields error

# Solution: Downgrade to v0.9.20
helm install external-secrets external-secrets/external-secrets \
  --version 0.9.20 \
  --namespace external-secrets
```

### 3. Security Groups

```hcl
# BEFORE: Only cluster security group
allowed_security_groups = [
  data.terraform_remote_state.platform.outputs.cluster_security_group_id
]

# AFTER: Added node security group
allowed_security_groups = [
  data.terraform_remote_state.platform.outputs.cluster_security_group_id,
  data.terraform_remote_state.platform.outputs.node_security_group_id
]
```

### 4. Frontend API URL for CloudFront

```typescript
// BEFORE: Absolute URL (CORS issues)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// AFTER: Relative URL (CloudFront routing)
const API_URL = process.env.NEXT_PUBLIC_API_URL || "";
baseURL: API_URL ? `${API_URL}/api` : "/api"
```

## Cost Optimization Scripts

```bash
#!/bin/bash
# shutdown-resources.sh
# Scale EKS nodes to 0 and stop RDS

# EKS: Scale to 0 (instances terminate)
aws eks update-nodegroup-config \
  --cluster-name ecommerce-demo-demo-eks \
  --nodegroup-name ecommerce-demo-demo-eks-node-group \
  --scaling-config minSize=0,maxSize=3,desiredSize=0

# RDS: Stop instance
aws rds stop-db-instance \
  --db-instance-identifier ecommerce-demo-demo-postgres
```

### Overnight Costs

| Resource | Status | Cost/Night |
|----------|--------|------------|
| EKS Nodes (2x t3.small) | Terminated | $0 |
| RDS (db.t3.micro) | Stopped | ~$0.02 |
| ElastiCache (cache.t3.micro) | Running | ~$0.40 |
| CloudFront | Active | $0 |
| NAT Gateway | Active | ~$0.50 |
| **Total** | | **~$1/night** |

## Results

After Day 5:

| Metric | Value |
|--------|-------|
| AWS Resources | 15+ |
| Bugs Fixed | 8 |
| Scripts Created | 2 |
| Claude Code Time | ~3-4 hours |
| Equivalent Time | ~14 hours |

### Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://dls03qes9fc77.cloudfront.net |
| API Health | https://dls03qes9fc77.cloudfront.net/api/health |

---

*Next: [Load Testing with k6: Finding Bottlenecks](/blog/load-testing/)*
