# GitHub OIDC Module Variables

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
}

variable "role_name" {
  description = "Name of the IAM role for GitHub Actions"
  type        = string
  default     = "github-actions-role"
}

variable "github_repositories" {
  description = "List of GitHub repositories allowed to assume the role (format: owner/repo)"
  type        = list(string)
}

variable "create_oidc_provider" {
  description = "Whether to create the OIDC provider (set to false if already exists)"
  type        = bool
  default     = true
}

variable "enable_terraform_state_access" {
  description = "Enable access to Terraform state S3 bucket and DynamoDB lock table"
  type        = bool
  default     = false
}

variable "terraform_state_bucket" {
  description = "S3 bucket name for Terraform state"
  type        = string
  default     = ""
}

variable "terraform_lock_table" {
  description = "DynamoDB table name for Terraform locks"
  type        = string
  default     = ""
}

variable "enable_secrets_access" {
  description = "Enable access to Secrets Manager"
  type        = bool
  default     = true
}

variable "enable_cloudfront_access" {
  description = "Enable access to CloudFront for cache invalidation"
  type        = bool
  default     = false
}

variable "cloudfront_distribution_ids" {
  description = "List of CloudFront distribution IDs to allow invalidation"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}
