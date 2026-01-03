---
layout: post
title: "Operational Portal: Self-Service for L1 Support"
date: 2026-01-11
category: Operations
reading_time: 10
tags: [github-actions, operations, devops, self-service, kubernetes]
excerpt: "Building a self-service operational portal using GitHub Actions. 14 workflows for L1 support with approval gates."
takeaway: "GitHub Actions as an operations interface. No cluster access required, full audit trail, bounded parameters."
---

## Day 10: Empowering L1 Support

Final day. Goal: **let L1 support handle common issues without escalating to DevOps**.

### The Problem

**Before:**
- L1 must contact DevOps for every diagnosis
- Long response times for simple issues
- No visibility into system state
- Risk of errors with direct cluster access

**After:**
- Self-service with guardrails
- Immediate diagnosis without escalation
- Controlled and approved operations
- Complete audit trail

## Architecture

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

## Implemented Workflows

### Diagnostics (Read-Only)

| Workflow | Function |
|----------|----------|
| Pod Health Check | Pod status and events |
| Service Health Check | Test health endpoints |
| View Pod Logs | Last N log lines |
| Database Test | Test DB connection |
| Redis Status | Verify cache |
| Deployment Info | Deploy/HPA info |
| Recent Errors | Search logs for errors |
| Performance Snapshot | Resources and API timing |

### Controlled Operations

| Workflow | Function | Safeguard |
|----------|----------|-----------|
| Pod Restart | Rolling restart | Rollout status |
| Scale Replicas | Scale 2-10 | Bounded choice |
| Clear Cache | Refresh cache | Rollout status |
| ArgoCD Sync | Trigger sync | Single app |
| CloudFront Invalidate | Invalidate CDN | Limited path |
| Export Logs | Download logs | Artifact 7 days |

## Security: Environment Protection

```yaml
jobs:
  operation:
    environment: production  # Requires approval

    permissions:
      id-token: write   # For OIDC
      contents: read    # For checkout
```

### Approval Flow

1. L1 triggers workflow
2. Job enters "waiting" state
3. Reviewer receives notification
4. Approves or Rejects
5. Workflow executes or terminates

## Security: Bounded Parameters

```yaml
# No free input, predefined choices only
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

**No arbitrary input = No injection risk**

## Security: AWS OIDC

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::xxx:role/github-actions
    aws-region: us-east-1
```

**Benefits:**
- No static secrets
- Temporary credentials (1h)
- Trust only from this repo
- Audit in CloudTrail

## Output: Job Summary

Every workflow generates a markdown report:

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

Visible directly on the workflow run page.

## Example: Complete Troubleshooting Flow

1. **L1 notices slowness** -> Triggers "Performance Snapshot"
2. **Sees pod with high CPU** -> Triggers "View Pod Logs"
3. **Finds Redis errors** -> Triggers "Redis Status"
4. **Confirms cache problem** -> Triggers "Clear Cache"
5. **Verifies fix** -> Triggers "Performance Snapshot"

All without contacting DevOps!

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

## Pattern: Before/After

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

## Audit Trail

### GitHub

- Who triggered
- Who approved
- When
- With which parameters
- Complete output

### AWS CloudTrail

- All API calls
- Timestamp
- Source IP (GitHub)
- Resources accessed

## Cost

| Component | Cost |
|-----------|------|
| GitHub Actions | Included (2000 min/month free) |
| AWS OIDC | Free |
| CloudTrail | ~$2/100k events |
| **Total** | **~$0/month** |

## Lessons Learned

1. **kubectl in container** - No curl/wget, use node fetch
2. **Label selectors** - Helm uses `app.kubernetes.io/name`
3. **EKS cluster name** - Verify exact name from Terraform
4. **Default namespace** - Always specify explicitly
5. **Bounded inputs** - Use `choice` instead of `string`

## Results

| Metric | Value |
|--------|-------|
| Workflows Created | 14 |
| Diagnostic Workflows | 8 |
| Operation Workflows | 6 |
| Security Layers | 3 (approval, OIDC, bounded inputs) |
| Cluster Access Required | No |

---

*Next: [Conclusions: ROI and Lessons Learned](/blog/conclusions/)*
