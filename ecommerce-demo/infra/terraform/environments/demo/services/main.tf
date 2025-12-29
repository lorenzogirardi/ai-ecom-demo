# Services Layer - Database, Cache, CDN
#
# This layer contains application services that may change more frequently:
# - RDS PostgreSQL
# - ElastiCache Redis
# - CloudFront CDN
#
# Deploy this layer AFTER the platform layer.
# Uses terraform_remote_state to read platform outputs.

locals {
  project_name = data.terraform_remote_state.platform.outputs.project_name
  environment  = data.terraform_remote_state.platform.outputs.environment

  common_tags = {
    Project     = local.project_name
    Environment = local.environment
    ManagedBy   = "terraform"
    Layer       = "services"
  }
}

# ============================================
# Database Module
# ============================================
module "database" {
  source = "../../../modules/database"

  project_name            = local.project_name
  environment             = local.environment
  vpc_id                  = data.terraform_remote_state.platform.outputs.vpc_id
  db_subnet_group_name    = data.terraform_remote_state.platform.outputs.db_subnet_group_name
  allowed_security_groups = [data.terraform_remote_state.platform.outputs.cluster_security_group_id]
  instance_class          = var.rds_instance_class
  allocated_storage       = var.rds_allocated_storage
  max_allocated_storage   = var.rds_max_allocated_storage
  multi_az                = var.rds_multi_az
  backup_retention_period = var.rds_backup_retention_period

  tags = local.common_tags
}

# ============================================
# Cache Module
# ============================================
module "cache" {
  source = "../../../modules/cache"

  project_name            = local.project_name
  environment             = local.environment
  vpc_id                  = data.terraform_remote_state.platform.outputs.vpc_id
  subnet_group_name       = data.terraform_remote_state.platform.outputs.elasticache_subnet_group_name
  allowed_security_groups = [data.terraform_remote_state.platform.outputs.cluster_security_group_id]
  node_type               = var.redis_node_type
  num_cache_nodes         = var.redis_num_cache_nodes

  tags = local.common_tags
}

# ============================================
# CDN Module
# ============================================
module "cdn" {
  source = "../../../modules/cdn"

  project_name        = local.project_name
  environment         = local.environment
  domain_names        = var.cdn_domain_names
  acm_certificate_arn = var.cdn_acm_certificate_arn
  price_class         = var.cdn_price_class

  tags = local.common_tags
}

# ============================================
# JWT Secret
# ============================================
resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

resource "aws_secretsmanager_secret" "jwt" {
  name                    = "${local.project_name}-${local.environment}-jwt"
  description             = "JWT secret for ${local.project_name}"
  recovery_window_in_days = local.environment == "production" ? 30 : 0

  tags = local.common_tags
}

resource "aws_secretsmanager_secret_version" "jwt" {
  secret_id = aws_secretsmanager_secret.jwt.id
  secret_string = jsonencode({
    secret = random_password.jwt_secret.result
  })
}
