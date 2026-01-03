---
layout: post
title: "Operational Portal"
date: 2026-01-10
category: sessions
order: 10
session: 10
reading_time: 12
tags: [github-actions,l1-support,ops]
---


## Session Objective

Build a self-service operational portal for L1 Support team using GitHub Actions as the interface.

---

## Problem Solved

### Before
- L1 must contact DevOps for every diagnosis
- Long response times for simple issues
- No visibility into system state
- Risk of errors with direct cluster access

### After
- Self-service with guardrails
- Immediate diagnosis without escalation
- Controlled and approved operations
- Complete audit trail

---

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

---

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

---

## Implemented Workflows

### Controlled Operations

| Workflow | Function | Safeguard |
|----------|----------|-----------|
| Pod Restart | Rolling restart | Rollout status |
| Scale Replicas | Scale 2-10 | Bounded choice |
| Clear Cache | Refresh cache | Rollout status |
| ArgoCD Sync | Trigger sync | Single app |
| CloudFront Invalidate | Invalidate CDN | Limited path |
| Export Logs | Download logs | Artifact 7 days |

---

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
4. Approves/Rejects
5. Workflow executes or terminates

---

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

---

## Security: AWS OIDC

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::xxx:role/github-actions
    aws-region: us-east-1
```

### Benefits
- No static secrets
- Temporary credentials (1h)
- Trust only from this repo
- Audit in CloudTrail

---

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

---

## Output: Artifacts

Export Logs saves downloadable files:

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: logs-backend-${{ github.run_id }}
    path: logs/
    retention-days: 7
```

Download available for 7 days.

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

For modifying operations, always show state before and after:

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

## Demo: Complete Flow

1. **L1 notices slowness** -> Triggers "Performance Snapshot"
2. **Sees pod with high CPU** -> Triggers "View Pod Logs"
3. **Finds Redis errors** -> Triggers "Redis Status"
4. **Confirms cache problem** -> Triggers "Clear Cache"
5. **Verifies fix** -> Triggers "Performance Snapshot"

All without contacting DevOps!

---

## Screenshots: Workflows in Action

### GitHub Actions Interface

| Workflow | Screenshot |
|----------|------------|
| Pod Health Check | ![Health Check](https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/github-action-ops-health-check.png) |
| View Logs | ![Logs](https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/github-action-ops-logs.png) |
| Deployment Info | ![Deployment](https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/github-action-ops-deployment-info.png) |
| Pod Restart | ![Restart](https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/github-action-ops-pod-restart.png) |
| Performance Snapshot | ![Performance](https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/github-action-ops-performance-snapshot.png) |
| Export Logs | ![Export](https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/github-action-ops-export-logs.png) |

---

## Screenshots: Approval Flow

### Environment Protection in Action

| Step | Screenshot |
|------|------------|
| 1. Approval request | ![Approve 1](https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/github-action-ops-approve-001.png) |
| 2. Parameter review | ![Approve 2](https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/github-action-ops-approve-002.png) |
| 3. Approval granted | ![Approve 3](https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/github-action-ops-approve-003.png) |
| 4. Result in Job Summary | ![Result](https://res.cloudinary.com/ethzero/image/upload/ai/ai-ecom-demo/github-action-ops-pod-restart-001.png) |

---

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

---

## Costs

| Component | Cost |
|-----------|------|
| GitHub Actions | Included (2000 min/month free) |
| AWS OIDC | Free |
| CloudTrail | ~$2/100k events |
| **Total** | **~$0/month** |

---

## Lessons Learned

1. **kubectl in container** - No curl/wget, use node fetch
2. **Label selectors** - Helm uses `app.kubernetes.io/name`
3. **EKS cluster name** - Verify exact name
4. **Default namespace** - Always specify explicitly
5. **Bounded inputs** - Use `choice` instead of `string`

---

## Next Steps

1. Slack notification of results
2. Scheduled daily health check
3. Runbook links in Job Summary
4. Aggregated dashboard with recent workflows
5. Incident templates from found errors

---

## Resources

- [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments)
- [AWS OIDC with GitHub](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [OPERATIONAL_PORTAL_ARCHITECTURE.md](./OPERATIONAL_PORTAL_ARCHITECTURE.md)

---

## Q&A

Questions?
