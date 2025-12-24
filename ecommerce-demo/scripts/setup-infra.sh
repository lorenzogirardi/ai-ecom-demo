#!/bin/bash
set -euo pipefail

# ===========================================
# Infrastructure Setup Script
# ===========================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TERRAFORM_DIR="$PROJECT_ROOT/infra/terraform/environments/demo"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_dependencies() {
    log_info "Checking dependencies..."

    local deps=("aws" "terraform" "kubectl" "helm")

    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "$dep is not installed. Please install it first."
            exit 1
        fi
    done

    log_info "All dependencies are installed."
}

check_aws_credentials() {
    log_info "Checking AWS credentials..."

    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials are not configured. Please run 'aws configure' first."
        exit 1
    fi

    local account_id=$(aws sts get-caller-identity --query Account --output text)
    local region=$(aws configure get region)

    log_info "AWS Account: $account_id"
    log_info "AWS Region: $region"
}

create_terraform_backend() {
    log_info "Creating Terraform backend resources..."

    local bucket_name="ecommerce-demo-terraform-state"
    local table_name="ecommerce-demo-terraform-locks"
    local region=$(aws configure get region)

    # Create S3 bucket if it doesn't exist
    if ! aws s3api head-bucket --bucket "$bucket_name" 2>/dev/null; then
        log_info "Creating S3 bucket: $bucket_name"

        if [ "$region" == "us-east-1" ]; then
            aws s3api create-bucket --bucket "$bucket_name" --region "$region"
        else
            aws s3api create-bucket --bucket "$bucket_name" --region "$region" \
                --create-bucket-configuration LocationConstraint="$region"
        fi

        # Enable versioning
        aws s3api put-bucket-versioning --bucket "$bucket_name" \
            --versioning-configuration Status=Enabled

        # Enable encryption
        aws s3api put-bucket-encryption --bucket "$bucket_name" \
            --server-side-encryption-configuration '{
                "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]
            }'

        log_info "S3 bucket created successfully."
    else
        log_info "S3 bucket already exists."
    fi

    # Create DynamoDB table if it doesn't exist
    if ! aws dynamodb describe-table --table-name "$table_name" &> /dev/null; then
        log_info "Creating DynamoDB table: $table_name"

        aws dynamodb create-table \
            --table-name "$table_name" \
            --attribute-definitions AttributeName=LockID,AttributeType=S \
            --key-schema AttributeName=LockID,KeyType=HASH \
            --billing-mode PAY_PER_REQUEST \
            --region "$region"

        log_info "DynamoDB table created successfully."
    else
        log_info "DynamoDB table already exists."
    fi
}

init_terraform() {
    log_info "Initializing Terraform..."

    cd "$TERRAFORM_DIR"
    terraform init

    log_info "Terraform initialized successfully."
}

plan_infrastructure() {
    log_info "Planning infrastructure changes..."

    cd "$TERRAFORM_DIR"

    if [ -f "terraform.tfvars" ]; then
        terraform plan -out=tfplan
    else
        log_warn "terraform.tfvars not found. Using default values."
        terraform plan -out=tfplan
    fi

    log_info "Terraform plan completed."
}

apply_infrastructure() {
    log_info "Applying infrastructure changes..."

    cd "$TERRAFORM_DIR"

    if [ ! -f "tfplan" ]; then
        log_error "No plan file found. Run 'plan' first."
        exit 1
    fi

    read -p "Do you want to apply the infrastructure changes? (y/N): " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        terraform apply tfplan
        log_info "Infrastructure applied successfully."
    else
        log_warn "Infrastructure apply cancelled."
    fi
}

configure_kubectl() {
    log_info "Configuring kubectl for EKS..."

    local cluster_name="ecommerce-demo-demo-eks"
    local region=$(aws configure get region)

    aws eks update-kubeconfig --name "$cluster_name" --region "$region"

    log_info "kubectl configured successfully."
    kubectl cluster-info
}

install_cluster_components() {
    log_info "Installing cluster components..."

    # Install AWS Load Balancer Controller
    log_info "Installing AWS Load Balancer Controller..."
    helm repo add eks https://aws.github.io/eks-charts
    helm repo update

    helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
        --namespace kube-system \
        --set clusterName="ecommerce-demo-demo-eks" \
        --set serviceAccount.create=true \
        --set serviceAccount.name=aws-load-balancer-controller

    # Install External Secrets Operator (optional)
    log_info "Installing External Secrets Operator..."
    helm repo add external-secrets https://charts.external-secrets.io
    helm repo update

    helm upgrade --install external-secrets external-secrets/external-secrets \
        --namespace external-secrets \
        --create-namespace \
        --set installCRDs=true

    log_info "Cluster components installed successfully."
}

# Main
main() {
    local command="${1:-help}"

    case "$command" in
        check)
            check_dependencies
            check_aws_credentials
            ;;
        backend)
            check_dependencies
            check_aws_credentials
            create_terraform_backend
            ;;
        init)
            check_dependencies
            init_terraform
            ;;
        plan)
            check_dependencies
            plan_infrastructure
            ;;
        apply)
            check_dependencies
            apply_infrastructure
            ;;
        kubectl)
            check_dependencies
            configure_kubectl
            ;;
        cluster-components)
            check_dependencies
            install_cluster_components
            ;;
        all)
            check_dependencies
            check_aws_credentials
            create_terraform_backend
            init_terraform
            plan_infrastructure
            apply_infrastructure
            configure_kubectl
            install_cluster_components
            ;;
        help|*)
            echo "Usage: $0 <command>"
            echo ""
            echo "Commands:"
            echo "  check              - Check dependencies and AWS credentials"
            echo "  backend            - Create Terraform backend resources (S3, DynamoDB)"
            echo "  init               - Initialize Terraform"
            echo "  plan               - Create Terraform plan"
            echo "  apply              - Apply Terraform plan"
            echo "  kubectl            - Configure kubectl for EKS"
            echo "  cluster-components - Install cluster components (ALB Controller, etc.)"
            echo "  all                - Run all setup steps"
            echo "  help               - Show this help message"
            ;;
    esac
}

main "$@"
