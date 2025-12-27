terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = data.terraform_remote_state.platform.outputs.project_name
      Environment = data.terraform_remote_state.platform.outputs.environment
      ManagedBy   = "terraform"
      Layer       = "services"
    }
  }
}

# Provider for ACM certificates (CloudFront requires us-east-1)
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = data.terraform_remote_state.platform.outputs.project_name
      Environment = data.terraform_remote_state.platform.outputs.environment
      ManagedBy   = "terraform"
      Layer       = "services"
    }
  }
}
