# Bootstrap Configuration
#
# This configuration sets up the GitHub OIDC integration for CI/CD.
# Run this ONCE before using GitHub Actions workflows.
#
# Usage:
#   cd infra/terraform/bootstrap
#   terraform init
#   terraform plan
#   terraform apply

module "github_oidc" {
  source = "../modules/github-oidc"

  project_name        = var.project_name
  role_name           = "${var.project_name}-github-actions"
  github_repositories = var.github_repositories

  create_oidc_provider = var.create_oidc_provider

  enable_terraform_state_access = var.enable_terraform_state_access
  terraform_state_bucket        = var.terraform_state_bucket
  terraform_lock_table          = var.terraform_lock_table

  enable_secrets_access = true

  # CloudFront cache invalidation
  enable_cloudfront_access    = true
  cloudfront_distribution_ids = ["E1UREM48VZYPQA"]

  tags = {
    Project     = var.project_name
    Environment = "bootstrap"
    ManagedBy   = "terraform"
    Purpose     = "github-actions-oidc"
  }
}
