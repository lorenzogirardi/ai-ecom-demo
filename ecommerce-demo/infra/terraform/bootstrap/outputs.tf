# Bootstrap Outputs

output "role_arn" {
  description = "IAM Role ARN for GitHub Actions - ADD THIS TO GITHUB SECRETS"
  value       = module.github_oidc.role_arn
}

output "role_name" {
  description = "IAM Role name"
  value       = module.github_oidc.role_name
}

output "oidc_provider_arn" {
  description = "OIDC Provider ARN"
  value       = module.github_oidc.oidc_provider_arn
}

output "next_steps" {
  description = "Instructions for next steps"
  value       = module.github_oidc.github_secret_instructions
}
