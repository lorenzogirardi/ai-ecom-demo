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

  project_name         = local.project_name
  environment          = local.environment
  vpc_id               = data.terraform_remote_state.platform.outputs.vpc_id
  db_subnet_group_name = data.terraform_remote_state.platform.outputs.db_subnet_group_name
  allowed_security_groups = [
    data.terraform_remote_state.platform.outputs.cluster_security_group_id,
    data.terraform_remote_state.platform.outputs.node_security_group_id
  ]
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

  project_name      = local.project_name
  environment       = local.environment
  vpc_id            = data.terraform_remote_state.platform.outputs.vpc_id
  subnet_group_name = data.terraform_remote_state.platform.outputs.elasticache_subnet_group_name
  allowed_security_groups = [
    data.terraform_remote_state.platform.outputs.cluster_security_group_id,
    data.terraform_remote_state.platform.outputs.node_security_group_id
  ]
  node_type       = var.redis_node_type
  num_cache_nodes = var.redis_num_cache_nodes

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

# ============================================
# External Secrets Operator IRSA
# ============================================
data "aws_caller_identity" "current" {}

# IAM Policy for External Secrets to read from Secrets Manager
resource "aws_iam_policy" "external_secrets" {
  name        = "${local.project_name}-external-secrets-policy"
  description = "Policy for External Secrets Operator to read secrets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetResourcePolicy",
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret",
          "secretsmanager:ListSecretVersionIds"
        ]
        Resource = "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:${local.project_name}-*"
      }
    ]
  })

  tags = local.common_tags
}

# IAM Role for External Secrets with IRSA
resource "aws_iam_role" "external_secrets" {
  name = "${local.project_name}-external-secrets-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = data.terraform_remote_state.platform.outputs.oidc_provider_arn
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "${replace(data.terraform_remote_state.platform.outputs.oidc_provider_url, "https://", "")}:sub" = "system:serviceaccount:external-secrets:external-secrets"
            "${replace(data.terraform_remote_state.platform.outputs.oidc_provider_url, "https://", "")}:aud" = "sts.amazonaws.com"
          }
        }
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_role_policy_attachment" "external_secrets" {
  role       = aws_iam_role.external_secrets.name
  policy_arn = aws_iam_policy.external_secrets.arn
}

# ============================================
# CloudFront for ALB (HTTPS Access)
# ============================================
# This CloudFront distribution provides HTTPS access to the ALB
# The ALB is created dynamically by AWS Load Balancer Controller
# Pass the ALB DNS name via var.alb_dns_name after ingress creation

resource "aws_cloudfront_cache_policy" "alb_no_cache" {
  count = var.alb_dns_name != null ? 1 : 0

  name        = "${local.project_name}-${local.environment}-alb-no-cache"
  comment     = "No caching policy for ALB dynamic content"
  default_ttl = 0
  max_ttl     = 0
  min_ttl     = 0

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "all"
    }
    headers_config {
      header_behavior = "whitelist"
      headers {
        items = ["Authorization", "Host", "Origin", "Accept", "Content-Type"]
      }
    }
    query_strings_config {
      query_string_behavior = "all"
    }
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
  }
}

resource "aws_cloudfront_origin_request_policy" "alb_all_viewer" {
  count = var.alb_dns_name != null ? 1 : 0

  name    = "${local.project_name}-${local.environment}-alb-all-viewer"
  comment = "Forward all viewer headers, cookies, and query strings to ALB"

  cookies_config {
    cookie_behavior = "all"
  }
  headers_config {
    header_behavior = "allViewer"
  }
  query_strings_config {
    query_string_behavior = "all"
  }
}

resource "aws_cloudfront_distribution" "alb" {
  count = var.alb_dns_name != null ? 1 : 0

  enabled         = true
  is_ipv6_enabled = true
  comment         = "${local.project_name} ${local.environment} ALB CDN"
  price_class     = var.cdn_price_class

  # ALB Origin
  origin {
    domain_name = var.alb_dns_name
    origin_id   = "ALB-${local.project_name}"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Default behavior - forward all to ALB
  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ALB-${local.project_name}"

    cache_policy_id          = aws_cloudfront_cache_policy.alb_no_cache[0].id
    origin_request_policy_id = aws_cloudfront_origin_request_policy.alb_all_viewer[0].id

    viewer_protocol_policy = "redirect-to-https"
    compress               = true
  }

  # SSL Certificate (CloudFront default)
  viewer_certificate {
    cloudfront_default_certificate = true
  }

  # No geo restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = merge(local.common_tags, {
    Name = "${local.project_name}-${local.environment}-alb-cdn"
  })
}
