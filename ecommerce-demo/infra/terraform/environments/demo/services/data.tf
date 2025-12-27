# Remote State Data Source
#
# Reads outputs from the platform layer to use in services layer.
# This creates a dependency: platform must be applied before services.

data "terraform_remote_state" "platform" {
  backend = "s3"

  config = {
    bucket = "ecommerce-demo-terraform-state"
    key    = "demo/platform.tfstate"
    region = "us-east-1"
  }
}

# Alternative: Use local backend for testing
# data "terraform_remote_state" "platform" {
#   backend = "local"
#
#   config = {
#     path = "../platform/platform.tfstate"
#   }
# }
