# Kubernetes Upgrade: EKS 1.29 → 1.32 + Amazon Linux 2023

## Overview

This document describes the EKS cluster upgrade from version 1.29 to 1.32, including the migration from Amazon Linux 2 to Amazon Linux 2023.

---

## Updated Components

| Component | Before | After |
|-----------|--------|-------|
| **EKS Control Plane** | 1.29 | 1.32 |
| **Node AMI** | Amazon Linux 2 | Amazon Linux 2023 |
| **Kernel** | 5.10.245 | 6.1.158 |
| **Containerd** | 1.7.29 | 2.1.5 |
| **Kubelet** | v1.29.15 | v1.32.9 |

---

## Upgrade Process

### Phase 1: Control Plane Upgrade (3 sequential steps)

EKS does not allow skipping minor versions. The control plane upgrade was executed in 3 steps:

```
1.29 → 1.30 (~7.5 min)
1.30 → 1.31 (~7.4 min)
1.31 → 1.32 (~7.7 min)
```

**Total control plane time:** ~23 minutes

**Terraform command for each step:**
```bash
terraform apply -var="eks_cluster_version=1.30" -auto-approve
terraform apply -var="eks_cluster_version=1.31" -auto-approve
terraform apply -var="eks_cluster_version=1.32" -auto-approve
```

### Phase 2: Node Group Upgrade (AL2 → AL2023)

Added `ami_type` variable to the EKS Terraform module:

```hcl
variable "eks_ami_type" {
  description = "AMI type for EKS nodes"
  type        = string
  default     = "AL2023_x86_64_STANDARD"
}
```

---

## Decision Analysis: Downtime vs Zero-Downtime

### Chosen Approach: Replace Node Group (WITH DOWNTIME)

```
Terraform Plan:
  # module.eks.aws_eks_node_group.main must be replaced
  ~ ami_type = "AL2_x86_64" -> "AL2023_x86_64_STANDARD" # forces replacement
```

**Result:**
- AL2 node group destroyed (~6 min)
- AL2023 node group created (~2 min)
- **Total downtime:** ~8 minutes

### Alternative Approach: Blue-Green (ZERO DOWNTIME)

```hcl
# Phase 1: Add new node group (keep old one)
resource "aws_eks_node_group" "al2023" {
  node_group_name = "${var.cluster_name}-al2023"
  ami_type        = "AL2023_x86_64_STANDARD"
}

# Phase 2: Cordon + Drain old nodes
kubectl cordon <old-nodes>
kubectl drain <old-nodes> --ignore-daemonsets --delete-emptydir-data

# Phase 3: Remove old node group from Terraform
# Phase 4: terraform apply
```

---

## Why I Chose the Downtime Approach

### Decision Context

1. **Demo/Dev Environment**
   - Not a production environment
   - No real users impacted
   - Cost of downtime = 0

2. **Operational Simplicity**
   - Single `terraform apply` vs multi-step manual process
   - No risk of inconsistent state between node groups
   - Cleaner Terraform configuration (single node group)

3. **AWS Cost**
   - Blue-green temporarily requires double the nodes
   - For t3.medium: ~$0.0416/hour × 3 nodes = $0.125/hour extra
   - Estimated blue-green duration: 30-60 minutes
   - Additional cost avoided: ~$0.06-0.12

4. **Execution Time**
   - Replace approach: ~8 minutes (automatic)
   - Blue-green approach: ~30-60 minutes (semi-manual)

### Decision Matrix

| Factor | Replace (Downtime) | Blue-Green (Zero DT) |
|--------|-------------------|----------------------|
| **Complexity** | Low | Medium-High |
| **Total time** | ~8 min | ~30-60 min |
| **Extra AWS cost** | $0 | ~$0.06-0.12 |
| **Error risk** | Low | Medium |
| **Suitable for PROD** | NO | YES |
| **Suitable for DEV/DEMO** | YES | Overkill |

### Conclusion

For a **demo environment** where:
- There are no SLAs to meet
- There are no real users
- Cost matters
- Execution speed is preferred

**The downtime approach is the correct choice.**

---

## Recommended Approach for Production

For production environments, the **blue-green** approach is mandatory:

### Terraform Configuration

```hcl
# variables.tf
variable "node_group_version" {
  description = "Version suffix for blue-green deployments"
  type        = string
  default     = "v2"  # Increment for each upgrade
}

# main.tf
resource "aws_eks_node_group" "main" {
  node_group_name = "${var.cluster_name}-${var.node_group_version}"
  ami_type        = var.eks_ami_type
  # ...
}
```

### Operational Procedure

```bash
# 1. Create new node group (v2) while keeping old (v1)
terraform apply -var="node_group_version=v2"

# 2. Wait for nodes to be Ready
kubectl get nodes -w

# 3. Cordon old nodes (v1)
kubectl cordon -l eks.amazonaws.com/nodegroup=cluster-v1

# 4. Drain old nodes
kubectl drain <node> --ignore-daemonsets --delete-emptydir-data

# 5. Verify application
curl https://app.example.com/health

# 6. Remove old node group
# (modify Terraform to remove v1, then apply)
```

### PodDisruptionBudget (Recommended)

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

## Modified Terraform Files

| File | Change |
|------|--------|
| `modules/eks/main.tf` | Added `ami_type = var.ami_type` |
| `modules/eks/variables.tf` | Added `ami_type` variable |
| `environments/demo/platform/main.tf` | Pass `ami_type` to module |
| `environments/demo/platform/variables.tf` | Added `eks_ami_type` |

---

## Final Result

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

## Lessons Learned

1. **Always consider context** - The "best" solution depends on the environment
2. **Downtime acceptable in dev/demo** - Don't over-engineer for non-critical environments
3. **Blue-green mandatory in prod** - Zero tolerance for downtime in production
4. **Document decisions** - Explain the "why" beyond the "how"

---

*Document generated: 2025-12-30*
*Upgrade executed: EKS 1.29 → 1.32 + AL2 → AL2023*
