# Demo Environment - Main Configuration

locals {
  project_name = var.project_name
  environment  = var.environment
  cluster_name = "${local.project_name}-${local.environment}-eks"

  common_tags = {
    Project     = local.project_name
    Environment = local.environment
    ManagedBy   = "terraform"
  }
}

# Network Module
module "network" {
  source = "../../modules/network"

  project_name       = local.project_name
  environment        = local.environment
  vpc_cidr           = var.vpc_cidr
  az_count           = var.az_count
  single_nat_gateway = var.single_nat_gateway
  cluster_name       = local.cluster_name

  tags = local.common_tags
}

# EKS Module
module "eks" {
  source = "../../modules/eks"

  cluster_name           = local.cluster_name
  cluster_version        = var.eks_cluster_version
  vpc_id                 = module.network.vpc_id
  subnet_ids             = module.network.private_subnet_ids
  environment            = local.environment
  endpoint_public_access = var.eks_endpoint_public_access
  node_instance_types    = var.eks_node_instance_types
  capacity_type          = var.eks_capacity_type
  node_desired_size      = var.eks_node_desired_size
  node_min_size          = var.eks_node_min_size
  node_max_size          = var.eks_node_max_size

  tags = local.common_tags
}

# Database Module
module "database" {
  source = "../../modules/database"

  project_name            = local.project_name
  environment             = local.environment
  vpc_id                  = module.network.vpc_id
  db_subnet_group_name    = module.network.db_subnet_group_name
  allowed_security_groups = [module.eks.cluster_security_group_id]
  instance_class          = var.rds_instance_class
  allocated_storage       = var.rds_allocated_storage
  max_allocated_storage   = var.rds_max_allocated_storage
  multi_az                = var.rds_multi_az
  backup_retention_period = var.rds_backup_retention_period

  tags = local.common_tags
}

# Cache Module
module "cache" {
  source = "../../modules/cache"

  project_name            = local.project_name
  environment             = local.environment
  vpc_id                  = module.network.vpc_id
  subnet_group_name       = module.network.elasticache_subnet_group_name
  allowed_security_groups = [module.eks.cluster_security_group_id]
  node_type               = var.redis_node_type
  num_cache_nodes         = var.redis_num_cache_nodes

  tags = local.common_tags
}

# CDN Module
module "cdn" {
  source = "../../modules/cdn"

  project_name        = local.project_name
  environment         = local.environment
  domain_names        = var.cdn_domain_names
  acm_certificate_arn = var.cdn_acm_certificate_arn
  price_class         = var.cdn_price_class

  tags = local.common_tags
}

# ECR Repositories
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
