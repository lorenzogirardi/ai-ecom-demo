# Terraform State Backend

Manages the S3 bucket and DynamoDB table used for Terraform remote state storage.

## Resources Created

- **S3 Bucket** (`ecommerce-demo-terraform-state`)
  - Versioning enabled
  - Server-side encryption (AES256)
  - Public access blocked
  - Lifecycle policy (90 days for old versions)

- **DynamoDB Table** (`ecommerce-demo-terraform-locks`)
  - Pay-per-request billing
  - Point-in-time recovery enabled

## Bootstrap Procedure (New Setup)

For a fresh setup where resources don't exist yet:

```bash
# 1. Comment out backend.tf content temporarily
# 2. Initialize and apply with local state
terraform init
terraform apply

# 3. Uncomment backend.tf
# 4. Migrate state to S3
terraform init -migrate-state

# 5. Verify state is on S3
terraform state list
```

## Import Existing Resources

If resources were created via CLI and need to be imported:

```bash
# Initialize with remote backend
terraform init

# Import existing S3 bucket
terraform import aws_s3_bucket.terraform_state ecommerce-demo-terraform-state

# Import bucket versioning
terraform import aws_s3_bucket_versioning.terraform_state ecommerce-demo-terraform-state

# Import bucket encryption
terraform import aws_s3_bucket_server_side_encryption_configuration.terraform_state ecommerce-demo-terraform-state

# Import public access block
terraform import aws_s3_bucket_public_access_block.terraform_state ecommerce-demo-terraform-state

# Import DynamoDB table
terraform import aws_dynamodb_table.terraform_locks ecommerce-demo-terraform-locks

# Verify imports
terraform plan
```

## State File Locations

All project state files are stored in the same S3 bucket with different keys:

| Component | State Key |
|-----------|-----------|
| State Backend | `bootstrap/state-backend/terraform.tfstate` |
| GitHub OIDC | `bootstrap/github-oidc/terraform.tfstate` |
| ECR Repos | `bootstrap/ecr/terraform.tfstate` |
| Platform | `demo/platform.tfstate` |
| Services | `demo/services.tfstate` |

## Security

- State files are encrypted at rest (AES256)
- Versioning allows recovery from accidental changes
- DynamoDB locking prevents concurrent modifications
- Public access is completely blocked
