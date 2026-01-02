# Platform Layer Variables

# Project
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "ecommerce-demo"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "demo"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

# Network
variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "az_count" {
  description = "Number of availability zones"
  type        = number
  default     = 2
}

variable "single_nat_gateway" {
  description = "Use single NAT gateway (cost savings)"
  type        = bool
  default     = true
}

# EKS
variable "eks_cluster_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.32"
}

variable "eks_endpoint_public_access" {
  description = "Enable public access to EKS API"
  type        = bool
  default     = true
}

variable "eks_public_access_cidrs" {
  description = "CIDR blocks allowed to access EKS public API endpoint"
  type        = list(string)
  default     = ["0.0.0.0/0"] # Restrict this in production!
}

variable "eks_admin_access_cidrs" {
  description = "CIDR blocks for admin access (kubectl) - your IP"
  type        = list(string)
  default     = [] # Set your IP here: ["1.2.3.4/32"]
}

variable "eks_github_actions_cidrs" {
  description = "GitHub Actions IP ranges for CI/CD access"
  type        = list(string)
  default     = [] # Populated from https://api.github.com/meta
}

variable "eks_node_instance_types" {
  description = "Instance types for EKS nodes"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "eks_capacity_type" {
  description = "Capacity type (ON_DEMAND or SPOT)"
  type        = string
  default     = "ON_DEMAND"
}

variable "eks_ami_type" {
  description = "AMI type for EKS nodes (AL2023_x86_64_STANDARD, AL2_x86_64, etc.)"
  type        = string
  default     = "AL2023_x86_64_STANDARD"
}

variable "eks_node_desired_size" {
  description = "Desired number of nodes"
  type        = number
  default     = 3 # Increased from 2 for load testing capacity
}

variable "eks_node_min_size" {
  description = "Minimum number of nodes"
  type        = number
  default     = 2 # Increased from 1 for HA
}

variable "eks_node_max_size" {
  description = "Maximum number of nodes (Cluster Autoscaler limit)"
  type        = number
  default     = 5 # Increased from 4 for autoscaling headroom
}

# Observability
variable "enable_cloudwatch_observability" {
  description = "Enable CloudWatch Observability add-on (Container Insights + X-Ray)"
  type        = bool
  default     = true # Enable by default for monitoring
}
