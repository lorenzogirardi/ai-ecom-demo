# Cluster Autoscaler - EKS Node Scaling

## Overview

Cluster Autoscaler automatically adjusts the number of nodes in the EKS cluster based on pod demand. When pods cannot be scheduled due to insufficient resources, the autoscaler adds nodes. When nodes are underutilized, it removes them.

## Architecture

```
                                    +------------------+
                                    |  Cluster         |
                                    |  Autoscaler      |
                                    +--------+---------+
                                             |
                    +------------------------+------------------------+
                    |                        |                        |
                    v                        v                        v
            +-------+-------+        +-------+-------+        +-------+-------+
            |    Node 1     |        |    Node 2     |        |    Node 3     |
            |  (t3.medium)  |        |  (t3.medium)  |        |  (t3.medium)  |
            +---------------+        +---------------+        +---------------+
            | Pod A | Pod B |        | Pod C | Pod D |        |   (empty)     |
            +---------------+        +---------------+        +---------------+
                                                                     |
                                                              Scale Down
                                                              (if idle > 10m)
```

## Terraform Configuration

### Node Group with Discovery Tags

```hcl
# infra/terraform/modules/eks/main.tf

resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.cluster_name}-node-group"
  node_role_arn   = aws_iam_role.node_group.arn
  subnet_ids      = var.subnet_ids

  instance_types = var.node_instance_types  # ["t3.medium"]
  capacity_type  = var.capacity_type        # "ON_DEMAND"

  scaling_config {
    desired_size = var.node_desired_size    # 3
    max_size     = var.node_max_size        # 5
    min_size     = var.node_min_size        # 2
  }

  # Tags for Cluster Autoscaler discovery
  tags = merge(var.tags, {
    "k8s.io/cluster-autoscaler/enabled"             = "true"
    "k8s.io/cluster-autoscaler/${var.cluster_name}" = "owned"
  })
}
```

### IAM Role with IRSA

```hcl
# IAM Role for Cluster Autoscaler (IRSA)
resource "aws_iam_role" "cluster_autoscaler" {
  name = "${var.cluster_name}-cluster-autoscaler-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRoleWithWebIdentity"
      Effect = "Allow"
      Principal = {
        Federated = aws_iam_openid_connect_provider.cluster.arn
      }
      Condition = {
        StringEquals = {
          "${replace(aws_eks_cluster.main.identity[0].oidc[0].issuer, "https://", "")}:sub" =
            "system:serviceaccount:kube-system:cluster-autoscaler"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "cluster_autoscaler" {
  name = "${var.cluster_name}-cluster-autoscaler-policy"
  role = aws_iam_role.cluster_autoscaler.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "autoscaling:DescribeAutoScalingGroups",
          "autoscaling:DescribeAutoScalingInstances",
          "autoscaling:DescribeLaunchConfigurations",
          "autoscaling:DescribeScalingActivities",
          "autoscaling:DescribeTags",
          "ec2:DescribeInstanceTypes",
          "ec2:DescribeLaunchTemplateVersions",
          "ec2:DescribeImages",
          "ec2:GetInstanceTypesFromInstanceRequirements",
          "eks:DescribeNodegroup"
        ]
        Resource = ["*"]
      },
      {
        Effect = "Allow"
        Action = [
          "autoscaling:SetDesiredCapacity",
          "autoscaling:TerminateInstanceInAutoScalingGroup"
        ]
        Resource = ["*"]
        Condition = {
          StringEquals = {
            "aws:ResourceTag/k8s.io/cluster-autoscaler/enabled"             = "true"
            "aws:ResourceTag/k8s.io/cluster-autoscaler/${var.cluster_name}" = "owned"
          }
        }
      }
    ]
  })
}
```

## Kubernetes Manifest

```yaml
# k8s/cluster-autoscaler/cluster-autoscaler.yaml

apiVersion: v1
kind: ServiceAccount
metadata:
  name: cluster-autoscaler
  namespace: kube-system
  annotations:
    # IRSA - uses IAM role created by Terraform
    eks.amazonaws.com/role-arn: arn:aws:iam::ACCOUNT_ID:role/ecommerce-demo-demo-eks-cluster-autoscaler-role

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cluster-autoscaler
  namespace: kube-system
spec:
  replicas: 1
  template:
    spec:
      serviceAccountName: cluster-autoscaler
      priorityClassName: system-cluster-critical
      containers:
        - name: cluster-autoscaler
          image: registry.k8s.io/autoscaling/cluster-autoscaler:v1.29.0
          command:
            - ./cluster-autoscaler
            - --v=4
            - --cloud-provider=aws
            - --skip-nodes-with-local-storage=false
            - --expander=least-waste
            - --node-group-auto-discovery=asg:tag=k8s.io/cluster-autoscaler/enabled,k8s.io/cluster-autoscaler/ecommerce-demo-demo-eks
            - --balance-similar-node-groups
            - --skip-nodes-with-system-pods=false
            - --scale-down-enabled=true
            - --scale-down-delay-after-add=10m
            - --scale-down-unneeded-time=10m
            - --scale-down-utilization-threshold=0.5
          env:
            - name: AWS_REGION
              value: us-east-1
            - name: AWS_STS_REGIONAL_ENDPOINTS
              value: regional
```

## Key Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `node_min_size` | 2 | Minimum number of nodes (HA) |
| `node_max_size` | 5 | Maximum number of nodes |
| `node_desired_size` | 3 | Initial number of nodes |
| `scale-down-delay-after-add` | 10m | Wait time after adding node before scale down |
| `scale-down-unneeded-time` | 10m | Idle time before removing a node |
| `scale-down-utilization-threshold` | 0.5 | Utilization below which node is candidate for removal |

## Scale Up Flow

```
1. Pod Pending
   |
   v
2. Scheduler cannot find node with sufficient resources
   |
   v
3. Cluster Autoscaler detects unschedulable pod
   |
   v
4. CA calculates required nodes (expander: least-waste)
   |
   v
5. CA calls AWS API: SetDesiredCapacity
   |
   v
6. ASG launches new EC2 instance
   |
   v
7. Node registers with cluster (~2-3 min)
   |
   v
8. Pod is scheduled on new node
```

## Scale Down Flow

```
1. Continuous utilization monitoring
   |
   v
2. Node with utilization < 50% for 10 min
   |
   v
3. CA verifies if pods can be moved
   |
   v
4. CA drains node (evicts pods)
   |
   v
5. CA calls AWS API: TerminateInstanceInAutoScalingGroup
   |
   v
6. ASG terminates the instance
```

## Useful Commands

```bash
# View autoscaler status
kubectl -n kube-system logs -f deployment/cluster-autoscaler

# Check nodes and capacity
kubectl get nodes -o wide
kubectl describe nodes | grep -A5 "Allocated resources"

# Simulate scaling (create high-demand pods)
kubectl run stress --image=nginx --requests=cpu=1,memory=1Gi --replicas=10

# Check ASG
aws autoscaling describe-auto-scaling-groups \
  --query 'AutoScalingGroups[?contains(Tags[?Key==`k8s.io/cluster-autoscaler/enabled`].Value, `true`)]'
```

## Best Practices

1. **Pod Disruption Budgets**: Define PDBs for critical applications
2. **Resource Requests**: Always specify CPU and memory requests
3. **Node Affinity**: Use affinity to control pod placement
4. **Spot Instances**: Consider ON_DEMAND + SPOT mix for cost savings
5. **Multi-AZ**: Distribute nodes across availability zones

## Limitations

- Scale up: ~2-3 minutes for new node
- Scale down: respects drain and PDBs
- Cannot scale below `min_size`
- Cannot scale above `max_size`
