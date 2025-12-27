# Terraform Backend Configuration - Services Layer
#
# This layer uses a separate state file from the platform layer.
# State file: demo/services.tfstate

terraform {
  backend "s3" {
    bucket         = "ecommerce-demo-terraform-state"
    key            = "demo/services.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "ecommerce-demo-terraform-locks"
  }
}

# Uncomment to use local backend for testing
# terraform {
#   backend "local" {
#     path = "services.tfstate"
#   }
# }
