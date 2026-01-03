# Operational Portal Architecture

## Overview

The Operational Portal provides L1 Support teams with self-service capabilities through GitHub Actions workflows. All operations are non-destructive, require approval, and generate detailed audit trails.

## Architecture Diagram

```mermaid
graph TB
    subgraph "L1 Support"
        L1[L1 Operator]
    end

    subgraph "GitHub"
        GHA[GitHub Actions]
        ENV[Environment: production]
        APPROVAL[Required Reviewers]
        SUMMARY[Job Summary]
        ARTIFACTS[Artifacts Storage]
    end

    subgraph "AWS"
        OIDC[OIDC Provider]
        IAM[IAM Role]
        EKS[EKS Cluster]
        CF[CloudFront]
        RDS[(RDS PostgreSQL)]
        REDIS[(ElastiCache Redis)]
    end

    subgraph "Kubernetes"
        KUBECTL[kubectl]
        PODS[Application Pods]
        HPA[HPA Controller]
        ARGO[ArgoCD]
    end

    L1 -->|1. Trigger workflow| GHA
    GHA -->|2. Request approval| ENV
    ENV -->|3. Reviewer approves| APPROVAL
    APPROVAL -->|4. Workflow runs| GHA
    GHA -->|5. Assume role| OIDC
    OIDC -->|6. Temporary credentials| IAM
    IAM -->|7. Access granted| EKS
    GHA -->|8. Execute commands| KUBECTL
    KUBECTL -->|9. Query/Modify| PODS
    KUBECTL -->|9. Query/Modify| HPA
    KUBECTL -->|9. Query/Modify| ARGO
    GHA -->|10. Test endpoints| CF
    CF -->|11. Route requests| PODS
    PODS -->|12. Query| RDS
    PODS -->|12. Query| REDIS
    GHA -->|13. Generate report| SUMMARY
    GHA -->|14. Upload logs| ARTIFACTS
```

## Security Model

```mermaid
graph LR
    subgraph "Authentication"
        A1[GitHub OIDC Token]
        A2[AWS STS AssumeRole]
        A3[Temporary Credentials]
    end

    subgraph "Authorization"
        B1[Environment Protection]
        B2[Required Reviewers]
        B3[IAM Role Permissions]
    end

    subgraph "Audit"
        C1[GitHub Audit Log]
        C2[AWS CloudTrail]
        C3[Job Summaries]
    end

    A1 --> A2 --> A3
    B1 --> B2 --> B3
    A3 --> B3
    B3 --> C1
    B3 --> C2
    B3 --> C3
```

## Workflow Categories

### Read-Only Operations

```mermaid
flowchart LR
    subgraph "Diagnostics"
        D1[Pod Health Check]
        D2[Service Health Check]
        D3[View Pod Logs]
        D4[Database Test]
        D5[Redis Status]
        D6[Deployment Info]
        D7[Recent Errors]
        D8[Performance Snapshot]
    end

    subgraph "Output"
        O1[Job Summary]
        O2[Log Artifacts]
    end

    D1 --> O1
    D2 --> O1
    D3 --> O1
    D4 --> O1
    D5 --> O1
    D6 --> O1
    D7 --> O1
    D8 --> O1
    D3 --> O2
```

### Controlled Modifications

```mermaid
flowchart LR
    subgraph "Operations"
        M1[Pod Restart]
        M2[Scale Replicas]
        M3[Clear Cache]
        M4[ArgoCD Sync]
        M5[CloudFront Invalidate]
        M6[Export Logs]
    end

    subgraph "Safeguards"
        S1[Environment Approval]
        S2[Bounded Parameters]
        S3[Rollout Status Check]
    end

    subgraph "Output"
        O1[Before/After Status]
        O2[Success Confirmation]
    end

    M1 --> S1 --> S3 --> O1
    M2 --> S1 --> S2 --> O1
    M3 --> S1 --> S3 --> O1
    M4 --> S1 --> O2
    M5 --> S1 --> O2
    M6 --> S1 --> O2
```

## Sequence Diagrams

### Workflow Execution Flow

```mermaid
sequenceDiagram
    autonumber
    participant L1 as L1 Operator
    participant GH as GitHub Actions
    participant REV as Reviewer
    participant AWS as AWS OIDC
    participant EKS as EKS Cluster

    L1->>GH: Trigger workflow_dispatch
    GH->>GH: Queue job (waiting)
    GH->>REV: Request approval

    alt Approved
        REV->>GH: Approve deployment
        GH->>AWS: Request OIDC token
        AWS->>GH: Return temporary credentials
        GH->>EKS: Update kubeconfig
        EKS->>GH: Kubeconfig ready
        GH->>EKS: Execute kubectl commands
        EKS->>GH: Return results
        GH->>GH: Generate Job Summary
        GH->>L1: Workflow complete (success)
    else Rejected
        REV->>GH: Reject deployment
        GH->>L1: Workflow cancelled
    end
```

### Pod Health Check Sequence

```mermaid
sequenceDiagram
    autonumber
    participant GH as GitHub Actions
    participant EKS as EKS Cluster
    participant POD as Backend Pod
    participant CF as CloudFront

    GH->>EKS: kubectl get pods -n ecommerce
    EKS->>GH: Pod list with status

    loop For each pod
        GH->>EKS: kubectl describe pod
        EKS->>GH: Pod details (events, conditions)
    end

    GH->>CF: curl /api/catalog/products
    CF->>POD: Forward request
    POD->>CF: Response (200 OK)
    CF->>GH: Response with timing

    GH->>GH: Generate health report
    GH->>GH: Write to GITHUB_STEP_SUMMARY
```

### Rolling Restart Sequence

```mermaid
sequenceDiagram
    autonumber
    participant GH as GitHub Actions
    participant EKS as EKS Cluster
    participant DEP as Deployment
    participant RS as ReplicaSet
    participant POD as Pods

    GH->>EKS: kubectl get pods (before)
    EKS->>GH: Current pod status

    GH->>DEP: kubectl rollout restart
    DEP->>RS: Create new ReplicaSet
    RS->>POD: Start new pods

    GH->>DEP: kubectl rollout status --timeout=300s

    loop Until complete
        DEP->>GH: Rollout progress
        Note over DEP,POD: New pods ready, old pods terminating
    end

    DEP->>GH: Rollout complete
    GH->>EKS: kubectl get pods (after)
    EKS->>GH: New pod status
    GH->>GH: Generate before/after report
```

### Scale Replicas Sequence

```mermaid
sequenceDiagram
    autonumber
    participant GH as GitHub Actions
    participant EKS as EKS Cluster
    participant DEP as Deployment
    participant HPA as HPA Controller

    GH->>DEP: kubectl get deployment (current replicas)
    DEP->>GH: replicas: 2

    GH->>DEP: kubectl scale --replicas=4
    DEP->>EKS: Update desired replicas

    GH->>DEP: kubectl rollout status

    loop Until scaled
        DEP->>GH: Scaling progress (2/4 ready)
    end

    DEP->>GH: All 4 replicas ready

    GH->>HPA: kubectl get hpa
    HPA->>GH: HPA status (min/max/current)

    GH->>GH: Generate scaling report
```

## Workflow Matrix

| Workflow | Type | kubectl | curl | Artifacts | Approval |
|----------|------|---------|------|-----------|----------|
| Pod Health Check | Read | `get pods`, `describe` | - | - | Required |
| Service Health Check | Read | `get pods` | endpoints | - | Required |
| View Pod Logs | Read | `logs` | - | - | Required |
| Database Test | Read | `exec` | - | - | Required |
| Redis Status | Read | `logs` | catalog API | - | Required |
| Deployment Info | Read | `get deploy,rs,hpa` | - | - | Required |
| Recent Errors | Read | `logs` | - | - | Required |
| Performance Snapshot | Read | `top nodes,pods` | API timing | - | Required |
| Export Logs | Read | `logs` | - | log files | Required |
| Pod Restart | Write | `rollout restart` | - | - | Required |
| Scale Replicas | Write | `scale` | - | - | Required |
| Clear Cache | Write | `rollout restart` | - | - | Required |
| ArgoCD Sync | Write | `patch application` | - | - | Required |
| CloudFront Invalidate | Write | - | - | - | Required |

## Parameter Constraints

All workflows use bounded parameters to prevent misuse:

```yaml
# Scale Replicas - bounded to 2-10
replicas:
  type: choice
  options: ['2', '3', '4', '5', '6', '7', '8', '9', '10']

# Log Lines - bounded options
lines:
  type: choice
  options: ['500', '1000', '2000', '5000']

# Application - predefined list
app:
  type: choice
  options: ['backend', 'frontend']

# Namespace - locked to ecommerce
namespace:
  type: choice
  options: ['ecommerce']
```

## Job Summary Examples

### Health Check Output

```markdown
## Pod Health Check

**Namespace:** `ecommerce`
**Timestamp:** 2026-01-03T13:00:00Z

### Pod Status
| Pod | Status | Restarts | Age |
|-----|--------|----------|-----|
| backend-abc123 | Running | 0 | 2d |
| backend-def456 | Running | 0 | 2d |

### Recent Events
No warning events found.

### API Health
| Endpoint | Status | Response Time |
|----------|--------|---------------|
| /api/catalog/products | 200 | 45ms |
```

### Scaling Output

```markdown
## Scale Replicas

**Application:** `backend`
**Target Replicas:** 4
**Namespace:** `ecommerce`

### Before Scaling
| Pod | Status |
|-----|--------|
| backend-abc123 | Running |
| backend-def456 | Running |

### Scaling to 4 replicas...
Waiting for scale to complete...

### After Scaling
| Pod | Status |
|-----|--------|
| backend-abc123 | Running |
| backend-def456 | Running |
| backend-ghi789 | Running |
| backend-jkl012 | Running |
```

## Error Handling

All workflows include error handling patterns:

```bash
# Graceful degradation
kubectl get pods 2>/dev/null || echo "Unable to fetch pods"

# Timeout protection
kubectl rollout status --timeout=300s

# Null checks
if [ -z "$POD" ]; then
  echo "### No pods found" >> $GITHUB_STEP_SUMMARY
  exit 1
fi
```

## Monitoring Integration

```mermaid
graph TB
    subgraph "Operational Portal"
        WF[GitHub Actions Workflows]
    end

    subgraph "Observability"
        CW[CloudWatch Logs]
        XR[X-Ray Traces]
        CT[CloudTrail]
    end

    subgraph "Alerting"
        AL[CloudWatch Alarms]
        SNS[SNS Notifications]
    end

    WF -->|API calls logged| CW
    WF -->|AWS API calls| CT
    WF -->|Request traces| XR
    CW -->|Metric filters| AL
    AL -->|Alert| SNS
```

## Future Enhancements

1. **Slack Integration**: Post workflow results to ops channel
2. **Runbook Links**: Add documentation links in Job Summaries
3. **Scheduled Health Checks**: Automated daily health reports
4. **Cost Visibility**: Add AWS cost metrics to Performance Snapshot
5. **Incident Templates**: Pre-filled issue templates from error searches
