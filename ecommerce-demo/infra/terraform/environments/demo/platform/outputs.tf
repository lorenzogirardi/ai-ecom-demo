# Platform Layer Outputs
# These outputs are consumed by the services layer via terraform_remote_state

# ============================================
# Network Outputs
# ============================================
output "vpc_id" {
  description = "VPC ID"
  value       = module.network.vpc_id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.network.private_subnet_ids
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.network.public_subnet_ids
}

output "db_subnet_group_name" {
  description = "Database subnet group name"
  value       = module.network.db_subnet_group_name
}

output "elasticache_subnet_group_name" {
  description = "ElastiCache subnet group name"
  value       = module.network.elasticache_subnet_group_name
}

# ============================================
# EKS Outputs
# ============================================
output "cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS cluster endpoint"
  value       = module.eks.cluster_endpoint
}

output "cluster_certificate_authority_data" {
  description = "EKS cluster CA data"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "cluster_security_group_id" {
  description = "EKS cluster security group ID"
  value       = module.eks.cluster_security_group_id
}

output "node_security_group_id" {
  description = "EKS node security group ID"
  value       = module.eks.node_security_group_id
}

output "oidc_provider_arn" {
  description = "OIDC provider ARN for IRSA"
  value       = module.eks.oidc_provider_arn
}

output "oidc_provider_url" {
  description = "OIDC provider URL for IRSA"
  value       = module.eks.oidc_provider_url
}

# ============================================
# ECR Outputs
# ============================================
output "ecr_frontend_repository_url" {
  description = "Frontend ECR repository URL"
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_backend_repository_url" {
  description = "Backend ECR repository URL"
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_repository_arn" {
  description = "Frontend ECR repository ARN"
  value       = aws_ecr_repository.frontend.arn
}

output "ecr_backend_repository_arn" {
  description = "Backend ECR repository ARN"
  value       = aws_ecr_repository.backend.arn
}

# ============================================
# Common Outputs
# ============================================
output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "project_name" {
  description = "Project name"
  value       = var.project_name
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}
