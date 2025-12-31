# AWS Architecture - E-commerce Demo

Diagrams of AWS architecture and service interactions.

---

## AWS Services Overview

| Category | Service | Purpose |
|----------|---------|---------|
| **Compute** | EKS | Kubernetes cluster |
| **Compute** | EC2 (Node Group) | Worker nodes |
| **Network** | VPC | Isolated network |
| **Network** | ALB | Application load balancer |
| **Network** | NAT Gateway | Internet access for private subnets |
| **Network** | CloudFront | Global CDN |
| **Database** | RDS PostgreSQL | Relational database |
| **Cache** | ElastiCache Redis | In-memory cache |
| **Storage** | S3 | Static assets + Terraform state |
| **Storage** | ECR | Container registry |
| **Security** | Secrets Manager | Database/cache credentials |
| **Security** | IAM | Roles and policies |
| **Monitoring** | CloudWatch | Logs and metrics |

---

## 1. Network Architecture

```mermaid
flowchart TB
    subgraph Internet
        Users[Users]
        GitHub[GitHub Actions]
    end

    subgraph AWS["AWS Region (us-east-1)"]
        subgraph Edge["Edge Services"]
            CF[CloudFront<br/>CDN]
        end

        subgraph VPC["VPC (10.0.0.0/16)"]
            subgraph PublicSubnets["Public Subnets"]
                IGW[Internet<br/>Gateway]
                NAT[NAT<br/>Gateway]
                ALB[Application<br/>Load Balancer]
            end

            subgraph PrivateSubnets["Private Subnets"]
                subgraph EKS["EKS Cluster"]
                    Node1[Node 1<br/>t3.medium]
                    Node2[Node 2<br/>t3.medium]
                end
                Redis[(ElastiCache<br/>Redis)]
            end

            subgraph DatabaseSubnets["Database Subnets"]
                RDS[(RDS<br/>PostgreSQL)]
            end
        end
    end

    Users --> CF
    CF --> ALB
    GitHub --> IGW
    IGW --> ALB
    ALB --> Node1
    ALB --> Node2
    Node1 --> NAT
    Node2 --> NAT
    NAT --> IGW
    Node1 --> Redis
    Node2 --> Redis
    Node1 --> RDS
    Node2 --> RDS
```

---

## 2. User Traffic Flow

```mermaid
sequenceDiagram
    autonumber
    participant User as User
    participant CF as CloudFront
    participant ALB as ALB
    participant FE as Frontend Pod
    participant BE as Backend Pod
    participant Redis as ElastiCache
    participant RDS as RDS PostgreSQL

    User->>CF: HTTPS Request<br/>dls03qes9fc77.cloudfront.net

    alt Static Asset (/, /products, etc.)
        CF->>ALB: Forward to origin
        ALB->>FE: Route to Frontend
        FE-->>ALB: HTML/JS/CSS
        ALB-->>CF: Response
        CF->>CF: Cache response
        CF-->>User: Cached content
    else API Request (/api/*)
        CF->>ALB: Forward (no cache)
        ALB->>FE: Route to Frontend
        FE->>BE: Proxy /api/* → Backend

        BE->>Redis: Check cache
        alt Cache HIT
            Redis-->>BE: Cached data
        else Cache MISS
            BE->>RDS: Query database
            RDS-->>BE: Data
            BE->>Redis: Store in cache
        end

        BE-->>FE: JSON response
        FE-->>ALB: Response
        ALB-->>CF: Response
        CF-->>User: API response
    end
```

---

## 3. EKS Architecture

```mermaid
flowchart TB
    subgraph ControlPlane["EKS Control Plane (AWS Managed)"]
        API[Kubernetes API Server]
        ETCD[(etcd)]
        Scheduler[Scheduler]
        CM[Controller Manager]
    end

    subgraph NodeGroup["EKS Node Group"]
        subgraph Node1["Node 1 (t3.medium)"]
            Kubelet1[Kubelet]
            FE1[Frontend Pod]
            BE1[Backend Pod]
        end
        subgraph Node2["Node 2 (t3.medium)"]
            Kubelet2[Kubelet]
            FE2[Frontend Pod]
            BE2[Backend Pod]
        end
    end

    subgraph AddOns["Kubernetes Add-ons"]
        LBC[AWS Load Balancer<br/>Controller]
        ESO[External Secrets<br/>Operator]
        CA[Cluster<br/>Autoscaler]
        ArgoCD[ArgoCD]
    end

    API --> Kubelet1
    API --> Kubelet2
    LBC --> API
    ESO --> API
    CA --> API
    ArgoCD --> API

    LBC -.-> ALB[ALB]
    ESO -.-> SM[(Secrets Manager)]
    CA -.-> ASG[Auto Scaling Group]
```

---

## 4. Security Groups and Network Flow

```mermaid
flowchart LR
    subgraph Internet
        Users[Users]
    end

    subgraph SG_ALB["SG: ALB"]
        ALB[ALB<br/>:80, :443]
    end

    subgraph SG_Nodes["SG: EKS Nodes"]
        Nodes[Nodes<br/>:10250, :443<br/>all internal]
    end

    subgraph SG_RDS["SG: RDS"]
        RDS[RDS<br/>:5432]
    end

    subgraph SG_Redis["SG: Redis"]
        Redis[Redis<br/>:6379]
    end

    Users -->|HTTPS :443| ALB
    ALB -->|HTTP :80/:443| Nodes
    Nodes -->|TCP :5432| RDS
    Nodes -->|TCP :6379| Redis
    Nodes <-->|All traffic| Nodes
```

---

## 5. IAM Roles and IRSA

```mermaid
flowchart TB
    subgraph GitHub["GitHub Actions"]
        GHA[Workflow]
    end

    subgraph IAM["IAM"]
        subgraph OIDC["OIDC Providers"]
            GH_OIDC[GitHub OIDC]
            EKS_OIDC[EKS OIDC]
        end

        subgraph Roles["IAM Roles"]
            GH_Role[github-actions-role]
            LBC_Role[lb-controller-role]
            ESO_Role[external-secrets-role]
            CA_Role[cluster-autoscaler-role]
            Node_Role[node-group-role]
        end
    end

    subgraph EKS["EKS"]
        LBC_SA[ServiceAccount<br/>aws-load-balancer-controller]
        ESO_SA[ServiceAccount<br/>external-secrets]
        CA_SA[ServiceAccount<br/>cluster-autoscaler]
        Nodes[EC2 Nodes]
    end

    subgraph AWS["AWS Services"]
        EC2[EC2]
        ECR[ECR]
        ELB[ELB]
        SM[Secrets Manager]
        ASG[Auto Scaling]
    end

    GHA -->|AssumeRoleWithWebIdentity| GH_OIDC
    GH_OIDC --> GH_Role
    GH_Role -->|Push images| ECR
    GH_Role -->|Update kubeconfig| EKS

    LBC_SA -->|AssumeRoleWithWebIdentity| EKS_OIDC
    EKS_OIDC --> LBC_Role
    LBC_Role -->|Manage| ELB

    ESO_SA -->|AssumeRoleWithWebIdentity| EKS_OIDC
    EKS_OIDC --> ESO_Role
    ESO_Role -->|Read secrets| SM

    CA_SA -->|AssumeRoleWithWebIdentity| EKS_OIDC
    EKS_OIDC --> CA_Role
    CA_Role -->|Scale| ASG

    Nodes --> Node_Role
    Node_Role -->|Pull images| ECR
    Node_Role -->|EC2 operations| EC2
```

---

## 6. Storage and Registry

```mermaid
flowchart TB
    subgraph GitHub["GitHub Actions"]
        Build[Docker Build]
    end

    subgraph ECR["Amazon ECR"]
        BE_Repo[ecommerce-demo/backend]
        FE_Repo[ecommerce-demo/frontend]
    end

    subgraph EKS["EKS"]
        BE_Pod[Backend Pod]
        FE_Pod[Frontend Pod]
    end

    subgraph S3["Amazon S3"]
        TF_State[Terraform State<br/>ecommerce-demo-terraform-state]
        Assets[Static Assets<br/>ecommerce-demo-assets]
    end

    subgraph DynamoDB["DynamoDB"]
        TF_Locks[Terraform Locks<br/>ecommerce-demo-terraform-locks]
    end

    subgraph CloudFront
        CDN[CloudFront Distribution]
    end

    Build -->|Push| BE_Repo
    Build -->|Push| FE_Repo
    BE_Pod -->|Pull| BE_Repo
    FE_Pod -->|Pull| FE_Repo

    CDN -->|Origin| Assets

    Terraform[Terraform] -->|Read/Write State| TF_State
    Terraform -->|Lock/Unlock| TF_Locks
```

---

## 7. Secrets Management

```mermaid
sequenceDiagram
    autonumber
    participant TF as Terraform
    participant SM as Secrets Manager
    participant ESO as External Secrets<br/>Operator
    participant K8s as Kubernetes
    participant Pod as Backend Pod

    Note over TF,SM: Provisioning (Terraform apply)
    TF->>SM: Create secret<br/>rds-password
    TF->>SM: Create secret<br/>redis-auth

    Note over ESO,Pod: Runtime (EKS)
    ESO->>SM: Poll for secrets<br/>(every 1h)
    SM-->>ESO: Secret values
    ESO->>K8s: Create/Update<br/>Kubernetes Secret

    Pod->>K8s: Mount secret<br/>as env vars
    K8s-->>Pod: DATABASE_URL<br/>REDIS_PASSWORD
    Pod->>RDS: Connect with credentials
    Pod->>Redis: Connect with auth token
```

---

## 8. Terraform Layer Architecture

```mermaid
flowchart TB
    subgraph Bootstrap["Bootstrap Layer"]
        S3_State[S3 Bucket<br/>Terraform State]
        DDB_Lock[DynamoDB<br/>State Locks]
        ECR_Repos[ECR Repositories]
        GH_OIDC[GitHub OIDC<br/>Provider]
    end

    subgraph Platform["Platform Layer (Layer 1)"]
        Network[Network Module<br/>VPC, Subnets, NAT]
        EKS_Module[EKS Module<br/>Cluster, Nodes, IAM]
    end

    subgraph Services["Services Layer (Layer 2)"]
        Database[Database Module<br/>RDS PostgreSQL]
        Cache[Cache Module<br/>ElastiCache Redis]
        CDN[CDN Module<br/>CloudFront, S3]
    end

    Bootstrap --> Platform
    Platform --> Services
    Network --> EKS_Module
    Network --> Database
    Network --> Cache
    EKS_Module --> CDN
```

---

## 9. Estimated Costs (Demo Environment)

| Service | Configuration | Cost/month (USD) |
|---------|---------------|------------------|
| **EKS Control Plane** | 1 cluster | $73 |
| **EC2 (Nodes)** | 2× t3.medium | ~$60 |
| **RDS PostgreSQL** | db.t3.micro | ~$15 |
| **ElastiCache Redis** | cache.t3.micro | ~$12 |
| **NAT Gateway** | 1 gateway | ~$32 |
| **CloudFront** | Pay per use | ~$1-5 |
| **ALB** | 1 load balancer | ~$16 |
| **S3** | < 1 GB | < $1 |
| **ECR** | < 1 GB | < $1 |
| **Secrets Manager** | 2 secrets | < $1 |
| **CloudWatch** | Basic | ~$3 |
| **Data Transfer** | Variable | ~$5-10 |
| **TOTAL** | | **~$220-230/month** |

> **Note:** Costs based on us-east-1, demo environment with minimal resources.
> Production costs increase significantly (Multi-AZ RDS, larger nodes, etc.)

---

## 10. Complete Architecture

```mermaid
flowchart TB
    subgraph Internet
        Users[Users]
        GitHub[GitHub]
    end

    subgraph AWS["AWS Cloud"]
        subgraph Global["Global Services"]
            CF[CloudFront]
            R53[Route 53]
            IAM[IAM]
        end

        subgraph Regional["us-east-1"]
            subgraph Edge
                ECR[(ECR)]
            end

            subgraph VPC["VPC"]
                subgraph Public["Public Subnets"]
                    IGW[IGW]
                    NAT[NAT]
                    ALB[ALB]
                end

                subgraph Private["Private Subnets"]
                    subgraph EKS["EKS Cluster"]
                        FE[Frontend Pods]
                        BE[Backend Pods]
                        ArgoCD[ArgoCD]
                        ESO[External Secrets]
                        LBC[LB Controller]
                        CA[Cluster Autoscaler]
                    end
                    Redis[(Redis)]
                end

                subgraph Database["Database Subnets"]
                    RDS[(PostgreSQL)]
                end
            end

            SM[(Secrets<br/>Manager)]
            CW[CloudWatch]
            S3[(S3)]
        end
    end

    Users --> CF
    CF --> ALB
    GitHub --> IAM
    IAM --> ECR
    IAM --> EKS

    ALB --> FE
    FE --> BE
    BE --> Redis
    BE --> RDS

    ESO --> SM
    LBC --> ALB
    CA --> EKS

    BE --> CW
    FE --> CW
```

---

## References

| Resource | Value |
|----------|-------|
| **VPC CIDR** | 10.0.0.0/16 |
| **Region** | us-east-1 |
| **AZs** | us-east-1a, us-east-1b |
| **EKS Version** | 1.32 |
| **Node AMI** | Amazon Linux 2023 |
| **RDS Engine** | PostgreSQL 15 |
| **Redis Engine** | Redis 7 |

---

*Document generated: 2025-12-31*
