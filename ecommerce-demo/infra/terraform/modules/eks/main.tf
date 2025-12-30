# EKS Module - Kubernetes Cluster

# IAM Role for EKS Cluster
resource "aws_iam_role" "cluster" {
  name = "${var.cluster_name}-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.cluster.name
}

resource "aws_iam_role_policy_attachment" "cluster_vpc_controller" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSVPCResourceController"
  role       = aws_iam_role.cluster.name
}

# ============================================
# Prefix Lists for IP Management
# ============================================

# Prefix List for Admin IPs (your IP, VPN, office, etc.)
resource "aws_ec2_managed_prefix_list" "admin" {
  name           = "${var.cluster_name}-admin-ips"
  address_family = "IPv4"
  max_entries    = 20

  dynamic "entry" {
    for_each = var.admin_access_cidrs
    content {
      cidr        = entry.value
      description = "Admin IP ${entry.key + 1}"
    }
  }

  tags = merge(var.tags, {
    Name = "${var.cluster_name}-admin-ips"
  })
}

# Prefix List for GitHub Actions IPs
resource "aws_ec2_managed_prefix_list" "github_actions" {
  name           = "${var.cluster_name}-github-actions-ips"
  address_family = "IPv4"
  max_entries    = 100 # AWS limit: 100 entries per request

  dynamic "entry" {
    for_each = var.github_actions_cidrs
    content {
      cidr        = entry.value
      description = "GitHub Actions ${entry.key + 1}"
    }
  }

  tags = merge(var.tags, {
    Name = "${var.cluster_name}-github-actions-ips"
  })
}

# Security Group for EKS Cluster Control Plane
resource "aws_security_group" "cluster" {
  name        = "${var.cluster_name}-cluster-sg"
  description = "Security group for EKS cluster control plane"
  vpc_id      = var.vpc_id

  # Egress: Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = merge(var.tags, {
    Name = "${var.cluster_name}-cluster-sg"
  })
}

# Security Group for EKS Node Group
resource "aws_security_group" "nodes" {
  name        = "${var.cluster_name}-nodes-sg"
  description = "Security group for EKS node group"
  vpc_id      = var.vpc_id

  # Egress: Allow all outbound traffic (nodes need to pull images, access AWS APIs)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = merge(var.tags, {
    Name = "${var.cluster_name}-nodes-sg"
  })
}

# ============================================
# Cluster Security Group Rules
# ============================================

# Allow nodes to communicate with control plane
resource "aws_security_group_rule" "cluster_ingress_nodes" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.nodes.id
  security_group_id        = aws_security_group.cluster.id
  description              = "Allow nodes to communicate with control plane"
}

# Allow admin access via prefix list
resource "aws_security_group_rule" "cluster_ingress_admin" {
  count             = length(var.admin_access_cidrs) > 0 ? 1 : 0
  type              = "ingress"
  from_port         = 443
  to_port           = 443
  protocol          = "tcp"
  prefix_list_ids   = [aws_ec2_managed_prefix_list.admin.id]
  security_group_id = aws_security_group.cluster.id
  description       = "Allow admin access to control plane (prefix list)"
}

# Note: GitHub Actions access is handled via public_access_cidrs at EKS level
# Security group rule for prefix list exceeds AWS limit (60 rules per SG)
# IAM authentication provides the primary security gate for the API

# ============================================
# Node Security Group Rules
# ============================================

# Allow control plane to communicate with nodes (kubelet)
resource "aws_security_group_rule" "nodes_ingress_cluster_kubelet" {
  type                     = "ingress"
  from_port                = 10250
  to_port                  = 10250
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.cluster.id
  security_group_id        = aws_security_group.nodes.id
  description              = "Allow control plane to communicate with kubelet"
}

# Allow control plane to communicate with nodes (HTTPS)
resource "aws_security_group_rule" "nodes_ingress_cluster_https" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.cluster.id
  security_group_id        = aws_security_group.nodes.id
  description              = "Allow control plane to communicate with nodes"
}

# Allow nodes to communicate with each other (all traffic for pod networking)
resource "aws_security_group_rule" "nodes_ingress_self" {
  type                     = "ingress"
  from_port                = 0
  to_port                  = 0
  protocol                 = "-1"
  source_security_group_id = aws_security_group.nodes.id
  security_group_id        = aws_security_group.nodes.id
  description              = "Allow nodes to communicate with each other"
}

# Allow CoreDNS UDP
resource "aws_security_group_rule" "nodes_ingress_coredns_udp" {
  type                     = "ingress"
  from_port                = 53
  to_port                  = 53
  protocol                 = "udp"
  source_security_group_id = aws_security_group.nodes.id
  security_group_id        = aws_security_group.nodes.id
  description              = "Allow CoreDNS UDP"
}

# Allow CoreDNS TCP
resource "aws_security_group_rule" "nodes_ingress_coredns_tcp" {
  type                     = "ingress"
  from_port                = 53
  to_port                  = 53
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.nodes.id
  security_group_id        = aws_security_group.nodes.id
  description              = "Allow CoreDNS TCP"
}

# EKS Cluster
resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  version  = var.cluster_version
  role_arn = aws_iam_role.cluster.arn

  vpc_config {
    subnet_ids              = var.subnet_ids
    endpoint_private_access = true
    endpoint_public_access  = var.endpoint_public_access
    public_access_cidrs     = var.endpoint_public_access ? var.public_access_cidrs : null
    security_group_ids      = [aws_security_group.cluster.id]
  }

  enabled_cluster_log_types = var.enabled_cluster_log_types

  tags = var.tags

  depends_on = [
    aws_iam_role_policy_attachment.cluster_policy,
    aws_iam_role_policy_attachment.cluster_vpc_controller,
  ]
}

# IAM Role for Node Group
resource "aws_iam_role" "node_group" {
  name = "${var.cluster_name}-node-group-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "node_group_worker" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.node_group.name
}

resource "aws_iam_role_policy_attachment" "node_group_cni" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.node_group.name
}

resource "aws_iam_role_policy_attachment" "node_group_ecr" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.node_group.name
}

# EKS Node Group
resource "aws_eks_node_group" "main" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.cluster_name}-node-group"
  node_role_arn   = aws_iam_role.node_group.arn
  subnet_ids      = var.subnet_ids

  ami_type       = var.ami_type
  instance_types = var.node_instance_types
  capacity_type  = var.capacity_type

  scaling_config {
    desired_size = var.node_desired_size
    max_size     = var.node_max_size
    min_size     = var.node_min_size
  }

  update_config {
    max_unavailable = 1
  }

  labels = {
    Environment = var.environment
  }

  # Tags for Cluster Autoscaler discovery
  tags = merge(var.tags, {
    "k8s.io/cluster-autoscaler/enabled"             = "true"
    "k8s.io/cluster-autoscaler/${var.cluster_name}" = "owned"
  })

  depends_on = [
    aws_iam_role_policy_attachment.node_group_worker,
    aws_iam_role_policy_attachment.node_group_cni,
    aws_iam_role_policy_attachment.node_group_ecr,
  ]
}

# OIDC Provider for IRSA
data "tls_certificate" "cluster" {
  url = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "cluster" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.cluster.certificates[0].sha1_fingerprint]
  url             = aws_eks_cluster.main.identity[0].oidc[0].issuer

  tags = var.tags
}

# AWS Load Balancer Controller IAM Role
resource "aws_iam_role" "lb_controller" {
  name = "${var.cluster_name}-lb-controller-role"

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
          "${replace(aws_eks_cluster.main.identity[0].oidc[0].issuer, "https://", "")}:sub" = "system:serviceaccount:kube-system:aws-load-balancer-controller"
        }
      }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy" "lb_controller" {
  name = "${var.cluster_name}-lb-controller-policy"
  role = aws_iam_role.lb_controller.id

  policy = file("${path.module}/policies/lb-controller-policy.json")
}

# ============================================
# Cluster Autoscaler IAM Role (IRSA)
# ============================================
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
          "${replace(aws_eks_cluster.main.identity[0].oidc[0].issuer, "https://", "")}:sub" = "system:serviceaccount:kube-system:cluster-autoscaler"
        }
      }
    }]
  })

  tags = var.tags
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
