# Terraform Backend Configuration
#
# Before using this backend, create the S3 bucket and DynamoDB table:
#
# aws s3api create-bucket \
#   --bucket ecommerce-demo-terraform-state \
#   --region us-east-1
#
# aws s3api put-bucket-versioning \
#   --bucket ecommerce-demo-terraform-state \
#   --versioning-configuration Status=Enabled
#
# aws s3api put-bucket-encryption \
#   --bucket ecommerce-demo-terraform-state \
#   --server-side-encryption-configuration '{
#     "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]
#   }'
#
# aws dynamodb create-table \
#   --table-name ecommerce-demo-terraform-locks \
#   --attribute-definitions AttributeName=LockID,AttributeType=S \
#   --key-schema AttributeName=LockID,KeyType=HASH \
#   --billing-mode PAY_PER_REQUEST \
#   --region us-east-1

terraform {
  backend "s3" {
    bucket         = "ecommerce-demo-terraform-state"
    key            = "demo/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "ecommerce-demo-terraform-locks"
  }
}

# Uncomment to use local backend for testing
# terraform {
#   backend "local" {
#     path = "terraform.tfstate"
#   }
# }
