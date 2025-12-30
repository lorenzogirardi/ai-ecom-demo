# Cluster Autoscaler - EKS Node Scaling

## Panoramica

Il Cluster Autoscaler scala automaticamente il numero di nodi nel cluster EKS in base alla domanda dei pod. Quando i pod non possono essere schedulati per mancanza di risorse, l'autoscaler aggiunge nodi. Quando i nodi sono sottoutilizzati, li rimuove.

## Architettura

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
                                                              (se idle > 10m)
```

## Configurazione Terraform

### Node Group con Tag per Discovery

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

  # Tag per Cluster Autoscaler discovery
  tags = merge(var.tags, {
    "k8s.io/cluster-autoscaler/enabled"             = "true"
    "k8s.io/cluster-autoscaler/${var.cluster_name}" = "owned"
  })
}
```

### IAM Role con IRSA

```hcl
# IAM Role per Cluster Autoscaler (IRSA)
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

## Manifest Kubernetes

```yaml
# k8s/cluster-autoscaler/cluster-autoscaler.yaml

apiVersion: v1
kind: ServiceAccount
metadata:
  name: cluster-autoscaler
  namespace: kube-system
  annotations:
    # IRSA - usa il ruolo IAM creato da Terraform
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

## Parametri Chiave

| Parametro | Valore | Descrizione |
|-----------|--------|-------------|
| `node_min_size` | 2 | Numero minimo di nodi (HA) |
| `node_max_size` | 5 | Numero massimo di nodi |
| `node_desired_size` | 3 | Numero iniziale di nodi |
| `scale-down-delay-after-add` | 10m | Attesa dopo aggiunta nodo prima di scale down |
| `scale-down-unneeded-time` | 10m | Tempo di idle prima di rimuovere un nodo |
| `scale-down-utilization-threshold` | 0.5 | Utilization sotto cui un nodo e' candidato per removal |

## Flusso di Scale Up

```
1. Pod Pending
   |
   v
2. Scheduler non trova nodo con risorse sufficienti
   |
   v
3. Cluster Autoscaler rileva pod unschedulable
   |
   v
4. CA calcola nodi necessari (expander: least-waste)
   |
   v
5. CA chiama AWS API: SetDesiredCapacity
   |
   v
6. ASG lancia nuova EC2 instance
   |
   v
7. Node si registra con cluster (~2-3 min)
   |
   v
8. Pod viene schedulato sul nuovo nodo
```

## Flusso di Scale Down

```
1. Monitoraggio continuo utilization
   |
   v
2. Nodo con utilization < 50% per 10 min
   |
   v
3. CA verifica se pod possono essere spostati
   |
   v
4. CA fa drain del nodo (evict pod)
   |
   v
5. CA chiama AWS API: TerminateInstanceInAutoScalingGroup
   |
   v
6. ASG termina l'istanza
```

## Comandi Utili

```bash
# Visualizza stato autoscaler
kubectl -n kube-system logs -f deployment/cluster-autoscaler

# Verifica nodi e capacita'
kubectl get nodes -o wide
kubectl describe nodes | grep -A5 "Allocated resources"

# Simula scaling (crea pod con alta richiesta)
kubectl run stress --image=nginx --requests=cpu=1,memory=1Gi --replicas=10

# Verifica ASG
aws autoscaling describe-auto-scaling-groups \
  --query 'AutoScalingGroups[?contains(Tags[?Key==`k8s.io/cluster-autoscaler/enabled`].Value, `true`)]'
```

## Best Practices

1. **Pod Disruption Budgets**: Definire PDB per applicazioni critiche
2. **Resource Requests**: Sempre specificare requests per CPU e memory
3. **Node Affinity**: Usare affinity per controllare placement
4. **Spot Instances**: Considerare mix ON_DEMAND + SPOT per costi
5. **Multi-AZ**: Distribuire nodi su piu' availability zones

## Limitazioni

- Scale up: ~2-3 minuti per nuovo nodo
- Scale down: rispetta drain e PDB
- Non scala sotto `min_size`
- Non scala sopra `max_size`
