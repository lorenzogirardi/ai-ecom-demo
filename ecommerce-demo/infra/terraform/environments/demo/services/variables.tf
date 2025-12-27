# Services Layer Variables
#
# Note: project_name, environment, and vpc_id are read from platform layer
# via terraform_remote_state, so they don't need to be defined here.

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

# RDS
variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "rds_allocated_storage" {
  description = "Allocated storage in GB"
  type        = number
  default     = 20
}

variable "rds_max_allocated_storage" {
  description = "Maximum allocated storage for autoscaling"
  type        = number
  default     = 100
}

variable "rds_multi_az" {
  description = "Enable Multi-AZ"
  type        = bool
  default     = false
}

variable "rds_backup_retention_period" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

# ElastiCache
variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}

variable "redis_num_cache_nodes" {
  description = "Number of cache nodes"
  type        = number
  default     = 1
}

# CDN
variable "cdn_domain_names" {
  description = "Custom domain names for CloudFront"
  type        = list(string)
  default     = []
}

variable "cdn_acm_certificate_arn" {
  description = "ACM certificate ARN for CloudFront (must be in us-east-1)"
  type        = string
  default     = null
}

variable "cdn_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
}
