# Services Layer Outputs

# ============================================
# Database Outputs
# ============================================
output "database_endpoint" {
  description = "RDS endpoint"
  value       = module.database.db_endpoint
}

output "database_address" {
  description = "RDS address (hostname)"
  value       = module.database.db_address
}

output "database_port" {
  description = "RDS port"
  value       = module.database.db_port
}

output "database_name" {
  description = "Database name"
  value       = module.database.db_name
}

output "database_username" {
  description = "Database master username"
  value       = module.database.db_username
  sensitive   = true
}

output "database_secret_arn" {
  description = "Secrets Manager ARN for database credentials"
  value       = module.database.db_secret_arn
}

# ============================================
# Cache Outputs
# ============================================
output "redis_endpoint" {
  description = "Redis primary endpoint"
  value       = module.cache.redis_primary_endpoint
}

output "redis_port" {
  description = "Redis port"
  value       = module.cache.redis_port
}

output "redis_secret_arn" {
  description = "Secrets Manager ARN for Redis auth token"
  value       = module.cache.redis_secret_arn
}

# ============================================
# CDN Outputs
# ============================================
output "cdn_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.cdn.distribution_id
}

output "cdn_distribution_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.cdn.distribution_domain_name
}

output "cdn_s3_bucket_id" {
  description = "CDN origin S3 bucket ID"
  value       = module.cdn.assets_bucket_id
}

output "alb_cdn_distribution_id" {
  description = "CloudFront distribution ID for ALB (if configured)"
  value       = length(aws_cloudfront_distribution.alb) > 0 ? aws_cloudfront_distribution.alb[0].id : null
}

output "alb_cdn_domain_name" {
  description = "CloudFront domain name for ALB HTTPS access (if configured)"
  value       = length(aws_cloudfront_distribution.alb) > 0 ? aws_cloudfront_distribution.alb[0].domain_name : null
}

# ============================================
# JWT Secret Outputs
# ============================================
output "jwt_secret_arn" {
  description = "Secrets Manager ARN for JWT secret"
  value       = aws_secretsmanager_secret.jwt.arn
}

# ============================================
# External Secrets Outputs
# ============================================
output "external_secrets_role_arn" {
  description = "IAM role ARN for External Secrets Operator"
  value       = aws_iam_role.external_secrets.arn
}

# ============================================
# Re-export Platform Outputs (for convenience)
# ============================================
output "vpc_id" {
  description = "VPC ID (from platform layer)"
  value       = data.terraform_remote_state.platform.outputs.vpc_id
}

output "cluster_name" {
  description = "EKS cluster name (from platform layer)"
  value       = data.terraform_remote_state.platform.outputs.cluster_name
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint (from platform layer)"
  value       = data.terraform_remote_state.platform.outputs.cluster_endpoint
}

output "ecr_frontend_repository_url" {
  description = "Frontend ECR repository URL (from platform layer)"
  value       = data.terraform_remote_state.platform.outputs.ecr_frontend_repository_url
}

output "ecr_backend_repository_url" {
  description = "Backend ECR repository URL (from platform layer)"
  value       = data.terraform_remote_state.platform.outputs.ecr_backend_repository_url
}
