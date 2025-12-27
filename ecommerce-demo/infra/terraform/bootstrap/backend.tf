terraform {
  backend "s3" {
    bucket         = "ecommerce-demo-terraform-state"
    key            = "bootstrap/github-oidc/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "ecommerce-demo-terraform-locks"
  }
}
