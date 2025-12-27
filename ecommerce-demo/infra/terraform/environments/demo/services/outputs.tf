# Services Layer Outputs

# ============================================
# Database Outputs
# ============================================
output "database_endpoint" {
  description = "RDS endpoint"
  value       = module.database.endpoint
}

output "database_port" {
  description = "RDS port"
  value       = module.database.port
}

output "database_name" {
  description = "Database name"
  value       = module.database.database_name
}

output "database_username" {
  description = "Database master username"
  value       = module.database.username
  sensitive   = true
}

output "database_secret_arn" {
  description = "Secrets Manager ARN for database credentials"
  value       = module.database.secret_arn
}

# ============================================
# Cache Outputs
# ============================================
output "redis_endpoint" {
  description = "Redis endpoint"
  value       = module.cache.endpoint
}

output "redis_port" {
  description = "Redis port"
  value       = module.cache.port
}

output "redis_auth_token_secret_arn" {
  description = "Secrets Manager ARN for Redis auth token"
  value       = module.cache.auth_token_secret_arn
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

output "cdn_s3_bucket_name" {
  description = "CDN origin S3 bucket name"
  value       = module.cdn.s3_bucket_name
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
