# Observability Architecture - E-commerce Demo

Diagrammi dell'architettura di observability: logs, traces e metriche.

---

## Panoramica Stack Observability

| Categoria | Servizio | Scopo |
|-----------|----------|-------|
| **Logs** | CloudWatch Logs | Aggregazione log container |
| **Metrics** | Container Insights | Metriche pod/node/cluster |
| **Tracing** | AWS X-Ray | Distributed tracing |
| **Agent** | CloudWatch Agent | Raccolta metriche Container Insights |
| **Daemon** | X-Ray Daemon | Raccolta e invio traces |
| **IAM** | IRSA | Autenticazione service account |

---

## 1. Architettura Generale Observability

```mermaid
flowchart TB
    subgraph EKS["EKS Cluster"]
        subgraph Nodes["Worker Nodes"]
            subgraph Pod1["Backend Pod"]
                App1[Backend App]
                XRay_SDK1[X-Ray SDK]
            end
            subgraph Pod2["Frontend Pod"]
                App2[Frontend App]
                XRay_SDK2[X-Ray SDK]
            end

            subgraph DaemonSets["DaemonSets (per node)"]
                CW_Agent[CloudWatch Agent]
                XRay_Daemon[X-Ray Daemon]
            end
        end

        subgraph SystemPods["System Pods"]
            Fluent[Fluent Bit<br/>Log Router]
        end
    end

    subgraph CloudWatch["Amazon CloudWatch"]
        CW_Logs[(CloudWatch<br/>Logs)]
        CW_Metrics[(CloudWatch<br/>Metrics)]
        Container_Insights[Container<br/>Insights]
    end

    subgraph XRay["AWS X-Ray"]
        XRay_Service[X-Ray<br/>Service]
        Service_Map[Service<br/>Map]
        Traces[(Traces)]
    end

    App1 --> XRay_SDK1
    App2 --> XRay_SDK2
    XRay_SDK1 -->|UDP :2000| XRay_Daemon
    XRay_SDK2 -->|UDP :2000| XRay_Daemon

    App1 -->|stdout/stderr| Fluent
    App2 -->|stdout/stderr| Fluent
    Fluent -->|HTTPS| CW_Logs

    CW_Agent -->|Container metrics| CW_Metrics
    CW_Agent -->|Node metrics| Container_Insights

    XRay_Daemon -->|HTTPS| XRay_Service
    XRay_Service --> Service_Map
    XRay_Service --> Traces
```

---

## 2. Flusso Raccolta Logs

```mermaid
sequenceDiagram
    autonumber
    participant App as Application Pod
    participant Kubelet as Kubelet
    participant Fluent as Fluent Bit
    participant CW as CloudWatch Logs
    participant User as DevOps Engineer

    Note over App,Kubelet: Runtime Logging
    App->>App: console.log() / logger.info()
    App->>Kubelet: stdout/stderr stream
    Kubelet->>Kubelet: Write to /var/log/containers/*.log

    Note over Fluent,CW: Log Collection
    Fluent->>Kubelet: Tail log files
    Fluent->>Fluent: Parse JSON logs
    Fluent->>Fluent: Add K8s metadata<br/>(pod, namespace, container)
    Fluent->>CW: BatchPutLogEvents

    Note over CW,User: Log Consumption
    CW->>CW: Store in Log Group<br/>/aws/containerinsights/cluster/application
    User->>CW: CloudWatch Logs Insights query
    CW-->>User: Query results
```

---

## 3. Flusso X-Ray Distributed Tracing

```mermaid
sequenceDiagram
    autonumber
    participant User as User Browser
    participant CF as CloudFront
    participant FE as Frontend Pod
    participant BE as Backend Pod
    participant Redis as Redis
    participant RDS as RDS
    participant XRay as X-Ray Daemon
    participant Service as X-Ray Service

    User->>CF: HTTPS Request
    CF->>FE: Forward request

    Note over FE: Start Segment (Frontend)
    FE->>FE: AWSXRay.beginSegment('frontend')
    FE->>FE: Add annotation: http.url

    FE->>BE: API call /api/products<br/>X-Amzn-Trace-Id header

    Note over BE: Start Segment (Backend)
    BE->>BE: AWSXRay.beginSegment('backend')
    BE->>BE: Parse trace header
    BE->>BE: Link to parent segment

    Note over BE,Redis: Subsegment: Redis
    BE->>BE: beginSubsegment('Redis.get')
    BE->>Redis: GET products:all
    Redis-->>BE: Cached data
    BE->>BE: closeSubsegment()

    alt Cache MISS
        Note over BE,RDS: Subsegment: Prisma
        BE->>BE: beginSubsegment('Prisma.Product.findMany')
        BE->>RDS: SELECT * FROM products
        RDS-->>BE: Query results
        BE->>BE: closeSubsegment()
    end

    BE->>BE: closeSegment()
    BE->>XRay: Send segment (UDP :2000)
    BE-->>FE: JSON Response

    FE->>FE: closeSegment()
    FE->>XRay: Send segment (UDP :2000)
    FE-->>CF: HTML Response
    CF-->>User: Response

    Note over XRay,Service: Batch Upload
    XRay->>Service: PutTraceSegments (HTTPS)
    Service->>Service: Correlate segments
    Service->>Service: Build service map
```

---

## 4. Container Insights - Flusso Metriche

```mermaid
sequenceDiagram
    autonumber
    participant Pod as Application Pod
    participant CAdv as cAdvisor
    participant Kubelet as Kubelet
    participant CW_Agent as CloudWatch Agent
    participant CW as CloudWatch Metrics
    participant Dashboard as CloudWatch Dashboard

    Note over Pod,Kubelet: Container Runtime Metrics
    Pod->>Pod: Run workload
    CAdv->>Pod: Collect container stats
    CAdv->>Kubelet: Expose /metrics/cadvisor

    Note over CW_Agent,CW: CloudWatch Agent Collection
    CW_Agent->>Kubelet: Query /metrics/cadvisor<br/>Query /metrics/probes
    CW_Agent->>CW_Agent: Aggregate metrics<br/>Add dimensions
    CW_Agent->>CW: PutMetricData

    Note over CW,Dashboard: Metrics Consumption
    CW->>CW: Store in ContainerInsights namespace
    Dashboard->>CW: Query pod_cpu_utilization
    CW-->>Dashboard: Time series data
```

---

## 5. Architettura X-Ray DaemonSet

```mermaid
flowchart TB
    subgraph Node1["Worker Node 1"]
        subgraph Pod1a["Backend Pod"]
            App1a[App Container]
            SDK1a[X-Ray SDK]
        end
        subgraph Pod1b["Frontend Pod"]
            App1b[App Container]
            SDK1b[X-Ray SDK]
        end
        Daemon1[X-Ray Daemon<br/>DaemonSet Pod]
    end

    subgraph Node2["Worker Node 2"]
        subgraph Pod2a["Backend Pod"]
            App2a[App Container]
            SDK2a[X-Ray SDK]
        end
        subgraph Pod2b["Frontend Pod"]
            App2b[App Container]
            SDK2b[X-Ray SDK]
        end
        Daemon2[X-Ray Daemon<br/>DaemonSet Pod]
    end

    subgraph AWS["AWS"]
        XRay[X-Ray Service]
        IAM[IAM Role<br/>xray-daemon-role]
        OIDC[EKS OIDC Provider]
    end

    SDK1a -->|UDP :2000<br/>localhost| Daemon1
    SDK1b -->|UDP :2000<br/>localhost| Daemon1
    SDK2a -->|UDP :2000<br/>localhost| Daemon2
    SDK2b -->|UDP :2000<br/>localhost| Daemon2

    Daemon1 -->|HTTPS| XRay
    Daemon2 -->|HTTPS| XRay

    Daemon1 -.->|IRSA| OIDC
    Daemon2 -.->|IRSA| OIDC
    OIDC --> IAM
    IAM -->|AWSXRayDaemonWriteAccess| XRay
```

---

## 6. IAM Roles per Observability (IRSA)

```mermaid
flowchart TB
    subgraph IAM["IAM Roles"]
        subgraph Observability["Observability Roles"]
            CW_Role[cloudwatch-agent-role]
            XRay_Role[xray-daemon-role]
        end

        subgraph Policies["Managed Policies"]
            CW_Policy[CloudWatchAgentServerPolicy]
            XRay_Policy[AWSXRayDaemonWriteAccess]
        end
    end

    subgraph EKS["EKS Cluster"]
        OIDC[OIDC Provider]

        subgraph ServiceAccounts["Service Accounts"]
            CW_SA[cloudwatch-agent<br/>namespace: amazon-cloudwatch]
            XRay_SA[xray-daemon<br/>namespace: default]
        end
    end

    subgraph AWS_Services["AWS Services"]
        CloudWatch[(CloudWatch)]
        XRay[(X-Ray)]
    end

    CW_SA -->|AssumeRoleWithWebIdentity| OIDC
    XRay_SA -->|AssumeRoleWithWebIdentity| OIDC

    OIDC --> CW_Role
    OIDC --> XRay_Role

    CW_Role --> CW_Policy
    XRay_Role --> XRay_Policy

    CW_Policy -->|Write metrics| CloudWatch
    XRay_Policy -->|Write traces| XRay
```

---

## 7. Struttura Log Groups

```mermaid
flowchart TB
    subgraph CloudWatch["CloudWatch Log Groups"]
        subgraph CI["/aws/containerinsights/ecommerce-demo-demo-eks"]
            App_Logs["/application"]
            Host_Logs["/host"]
            Dataplane_Logs["/dataplane"]
            Perf_Logs["/performance"]
        end

        subgraph EKS_Logs["/aws/eks/ecommerce-demo-demo-eks"]
            API_Server["/cluster"]
            Audit["/audit"]
            Auth["/authenticator"]
        end
    end

    subgraph Sources["Log Sources"]
        Backend[Backend Pods]
        Frontend[Frontend Pods]
        System[System Pods]
        Control[Control Plane]
    end

    Backend --> App_Logs
    Frontend --> App_Logs
    System --> Dataplane_Logs
    Control --> EKS_Logs
```

---

## 8. Metriche Container Insights

```mermaid
flowchart LR
    subgraph Namespace["ContainerInsights Namespace"]
        subgraph Pod_Metrics["Pod Metrics"]
            pod_cpu[pod_cpu_utilization]
            pod_mem[pod_memory_utilization]
            pod_net_rx[pod_network_rx_bytes]
            pod_net_tx[pod_network_tx_bytes]
        end

        subgraph Node_Metrics["Node Metrics"]
            node_cpu[node_cpu_utilization]
            node_mem[node_memory_utilization]
            node_fs[node_filesystem_utilization]
        end

        subgraph Cluster_Metrics["Cluster Metrics"]
            cluster_pods[cluster_running_pod_count]
            cluster_nodes[cluster_node_count]
            cluster_failed[cluster_failed_node_count]
        end
    end

    subgraph Dimensions["Dimensions"]
        D1[ClusterName]
        D2[Namespace]
        D3[PodName]
        D4[NodeName]
        D5[Service]
    end

    Pod_Metrics --- D1
    Pod_Metrics --- D2
    Pod_Metrics --- D3
    Node_Metrics --- D1
    Node_Metrics --- D4
    Cluster_Metrics --- D1
```

---

## 9. X-Ray Service Map

```mermaid
flowchart LR
    subgraph Client["Client"]
        Browser[Browser]
    end

    subgraph AWS["AWS Services"]
        CloudFront[CloudFront]
    end

    subgraph EKS["EKS Cluster"]
        Frontend[Frontend<br/>Node.js]
        Backend[Backend<br/>Fastify]
    end

    subgraph Data["Data Layer"]
        Redis[(ElastiCache<br/>Redis)]
        RDS[(RDS<br/>PostgreSQL)]
    end

    Browser -->|"avg: 150ms<br/>p95: 350ms"| CloudFront
    CloudFront -->|"avg: 80ms<br/>p95: 200ms"| Frontend
    Frontend -->|"avg: 45ms<br/>p95: 120ms"| Backend
    Backend -->|"avg: 5ms<br/>p95: 15ms<br/>99.95% hit"| Redis
    Backend -->|"avg: 25ms<br/>p95: 60ms<br/>0.05% miss"| RDS

    style Redis fill:#90EE90
    style RDS fill:#FFB6C1
```

---

## 10. Flusso Completo Request con Observability

```mermaid
sequenceDiagram
    autonumber
    participant User as User
    participant FE as Frontend
    participant BE as Backend
    participant Redis as Redis
    participant RDS as RDS
    participant XRay as X-Ray
    participant CW as CloudWatch

    Note over User,CW: Request con Full Observability

    User->>FE: GET /products

    Note over FE: LOG: Incoming request
    FE->>CW: log.info("GET /products")

    Note over FE: TRACE: Start segment
    FE->>XRay: beginSegment("frontend")

    FE->>BE: GET /api/products

    Note over BE: LOG: API call received
    BE->>CW: log.info("GET /api/catalog/products")

    Note over BE: TRACE: Backend segment
    BE->>XRay: beginSegment("backend")

    BE->>Redis: GET products:all

    alt Cache HIT
        Note over BE: METRIC: Cache hit
        BE->>CW: cacheMetrics.hits++
        Redis-->>BE: Products JSON
    else Cache MISS
        Note over BE: METRIC: Cache miss
        BE->>CW: cacheMetrics.misses++
        BE->>RDS: SELECT * FROM products
        RDS-->>BE: Products data
        BE->>Redis: SET products:all
    end

    Note over BE: LOG: Response sent
    BE->>CW: log.info("200 OK, 45ms")

    Note over BE: TRACE: Close segment
    BE->>XRay: closeSegment()

    BE-->>FE: JSON Response

    Note over FE: LOG: Response received
    FE->>CW: log.info("Backend response: 200")

    Note over FE: TRACE: Close segment
    FE->>XRay: closeSegment()

    FE-->>User: HTML Page

    Note over XRay,CW: Async Processing
    XRay->>XRay: Correlate traces
    CW->>CW: Aggregate metrics
```

---

## 11. Alert e Monitoring

```mermaid
flowchart TB
    subgraph Sources["Metric Sources"]
        CI[Container Insights]
        XRay[X-Ray]
        App[Application Metrics]
    end

    subgraph CloudWatch["CloudWatch"]
        Metrics[(Metrics)]
        Alarms[CloudWatch Alarms]
        Dashboard[Dashboard]
    end

    subgraph Notifications["Notifications"]
        SNS[SNS Topic]
        Email[Email]
        Slack[Slack]
        PagerDuty[PagerDuty]
    end

    CI --> Metrics
    XRay --> Metrics
    App --> Metrics

    Metrics --> Alarms
    Metrics --> Dashboard

    Alarms -->|Alarm state| SNS
    SNS --> Email
    SNS --> Slack
    SNS --> PagerDuty
```

---

## 12. Architettura Completa Observability

```mermaid
flowchart TB
    subgraph Internet
        User[User]
    end

    subgraph AWS["AWS Cloud"]
        subgraph Edge
            CF[CloudFront]
        end

        subgraph VPC["VPC"]
            ALB[ALB]

            subgraph EKS["EKS Cluster"]
                subgraph AppPods["Application Pods"]
                    FE[Frontend]
                    BE[Backend]
                end

                subgraph ObsPods["Observability Pods"]
                    CW_Agent[CloudWatch<br/>Agent]
                    XRay_Daemon[X-Ray<br/>Daemon]
                    Fluent[Fluent Bit]
                end
            end

            Redis[(Redis)]
            RDS[(PostgreSQL)]
        end

        subgraph Observability["Observability Services"]
            CW_Logs[(CloudWatch<br/>Logs)]
            CW_Metrics[(CloudWatch<br/>Metrics)]
            XRay_Service[X-Ray]
            CI[Container<br/>Insights]
        end

        subgraph Analysis["Analysis"]
            Dashboard[CloudWatch<br/>Dashboard]
            ServiceMap[X-Ray<br/>Service Map]
            Insights[Logs<br/>Insights]
        end
    end

    User --> CF
    CF --> ALB
    ALB --> FE
    FE --> BE
    BE --> Redis
    BE --> RDS

    FE & BE -->|logs| Fluent
    Fluent --> CW_Logs

    FE & BE -->|traces| XRay_Daemon
    XRay_Daemon --> XRay_Service

    CW_Agent --> CW_Metrics
    CW_Agent --> CI

    CW_Logs --> Insights
    CW_Metrics --> Dashboard
    XRay_Service --> ServiceMap
```

---

## Configurazione Terraform

### Container Insights Add-on

```hcl
resource "aws_eks_addon" "cloudwatch_observability" {
  cluster_name  = aws_eks_cluster.main.name
  addon_name    = "amazon-cloudwatch-observability"
  addon_version = "v2.1.0-eksbuild.1"

  service_account_role_arn = aws_iam_role.cloudwatch_agent.arn
}
```

### IRSA Role per CloudWatch Agent

```hcl
resource "aws_iam_role" "cloudwatch_agent" {
  name = "${var.cluster_name}-cloudwatch-agent-role"

  assume_role_policy = jsonencode({
    Statement = [{
      Action = "sts:AssumeRoleWithWebIdentity"
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.cluster.arn
      }
      Condition = {
        StringEquals = {
          "${local.oidc_issuer}:aud" = "sts.amazonaws.com"
        }
        StringLike = {
          "${local.oidc_issuer}:sub" = "system:serviceaccount:amazon-cloudwatch:cloudwatch-agent"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "cloudwatch_agent" {
  role       = aws_iam_role.cloudwatch_agent.name
  policy_arn = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

resource "aws_iam_role_policy_attachment" "cloudwatch_xray" {
  role       = aws_iam_role.cloudwatch_agent.name
  policy_arn = "arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess"
}
```

---

## Costi Stimati Observability

| Servizio | Configurazione | Costo/mese (USD) |
|----------|----------------|------------------|
| **Container Insights** | 6 pods × 30 days | ~$5-10 |
| **CloudWatch Logs** | ~5 GB/month | ~$2.50 |
| **CloudWatch Metrics** | Custom metrics | ~$3 |
| **X-Ray** | ~1M traces/month | ~$5 |
| **CloudWatch Alarms** | 5 alarms | ~$0.50 |
| **TOTALE** | | **~$15-20/mese** |

> **Nota:** Costi basati su ambiente demo. In produzione con più traffico, i costi X-Ray possono aumentare significativamente.

---

## Riferimenti

| Risorsa | Valore |
|---------|--------|
| **EKS Add-on** | amazon-cloudwatch-observability v2.1.0 |
| **X-Ray SDK** | aws-xray-sdk-core ^3.10.0 |
| **X-Ray Daemon Image** | amazon/aws-xray-daemon:3.x |
| **Log Group** | /aws/containerinsights/{cluster}/application |
| **Metrics Namespace** | ContainerInsights |
| **X-Ray Daemon Port** | UDP 2000 |
| **Service Account (CW)** | amazon-cloudwatch:cloudwatch-agent |
| **Service Account (X-Ray)** | default:xray-daemon |

---

*Documento generato: 2026-01-02*
