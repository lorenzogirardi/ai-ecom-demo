# Platform Layer - Network, EKS, ECR
#
# This layer contains core infrastructure that rarely changes:
# - VPC and networking
# - EKS cluster
# - ECR repositories (needed by CI before services exist)
#
# Deploy this layer FIRST, before the services layer.

locals {
  project_name = var.project_name
  environment  = var.environment
  cluster_name = "${local.project_name}-${local.environment}-eks"

  common_tags = {
    Project     = local.project_name
    Environment = local.environment
    ManagedBy   = "terraform"
    Layer       = "platform"
  }
}

# ============================================
# Network Module
# ============================================
module "network" {
  source = "../../../modules/network"

  project_name       = local.project_name
  environment        = local.environment
  vpc_cidr           = var.vpc_cidr
  az_count           = var.az_count
  single_nat_gateway = var.single_nat_gateway
  cluster_name       = local.cluster_name

  tags = local.common_tags
}

# ============================================
# EKS Module
# ============================================
module "eks" {
  source = "../../../modules/eks"

  cluster_name           = local.cluster_name
  cluster_version        = var.eks_cluster_version
  vpc_id                 = module.network.vpc_id
  subnet_ids             = module.network.private_subnet_ids
  environment            = local.environment
  endpoint_public_access = var.eks_endpoint_public_access
  public_access_cidrs    = var.eks_public_access_cidrs
  admin_access_cidrs     = var.eks_admin_access_cidrs
  github_actions_cidrs   = var.eks_github_actions_cidrs
  node_instance_types    = var.eks_node_instance_types
  capacity_type          = var.eks_capacity_type
  node_desired_size      = var.eks_node_desired_size
  node_min_size          = var.eks_node_min_size
  node_max_size          = var.eks_node_max_size

  tags = local.common_tags
}

# ============================================
# ECR Repositories
# ============================================
# ECR is in Platform layer because CI needs to push images
# before services (RDS, Redis) are provisioned

resource "aws_ecr_repository" "frontend" {
  name                 = "${local.project_name}/frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = local.common_tags
}

resource "aws_ecr_repository" "backend" {
  name                 = "${local.project_name}/backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = local.common_tags
}

# ECR Lifecycle Policies
resource "aws_ecr_lifecycle_policy" "frontend" {
  repository = aws_ecr_repository.frontend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
