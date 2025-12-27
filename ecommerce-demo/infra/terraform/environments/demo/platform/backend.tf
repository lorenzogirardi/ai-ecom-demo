# Terraform Backend Configuration - Platform Layer
#
# This layer uses a separate state file from the services layer.
# State file: demo/platform.tfstate

terraform {
  backend "s3" {
    bucket         = "ecommerce-demo-terraform-state"
    key            = "demo/platform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "ecommerce-demo-terraform-locks"
  }
}

# Uncomment to use local backend for testing
# terraform {
#   backend "local" {
#     path = "platform.tfstate"
#   }
# }
