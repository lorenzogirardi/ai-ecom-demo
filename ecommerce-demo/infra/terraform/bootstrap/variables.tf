# Bootstrap Variables

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "ecommerce-demo"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "github_repositories" {
  description = "GitHub repositories allowed to use the role"
  type        = list(string)
  default     = ["lorenzogirardi/ai-ecom-demo"]
}

variable "create_oidc_provider" {
  description = "Create OIDC provider (set false if already exists)"
  type        = bool
  default     = true
}

variable "enable_terraform_state_access" {
  description = "Enable Terraform state access"
  type        = bool
  default     = true
}

variable "terraform_state_bucket" {
  description = "S3 bucket for Terraform state"
  type        = string
  default     = "ecommerce-demo-terraform-state"
}

variable "terraform_lock_table" {
  description = "DynamoDB table for Terraform locks"
  type        = string
  default     = "ecommerce-demo-terraform-locks"
}
