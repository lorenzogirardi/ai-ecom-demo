# Remote backend configuration
# This file should be uncommented AFTER the initial apply with local state
# Then run: terraform init -migrate-state

terraform {
  backend "s3" {
    bucket         = "ecommerce-demo-terraform-state"
    key            = "bootstrap/state-backend/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "ecommerce-demo-terraform-locks"
  }
}
