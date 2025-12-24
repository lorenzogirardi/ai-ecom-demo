#!/bin/bash
set -euo pipefail

# ===========================================
# Deploy All Applications Script
# ===========================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
NAMESPACE="${NAMESPACE:-ecommerce}"
ENVIRONMENT="${ENVIRONMENT:-demo}"
AWS_REGION="${AWS_REGION:-us-east-1}"
AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-$(aws sts get-caller-identity --query Account --output text)}"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_TAG="${IMAGE_TAG:-latest}"

check_dependencies() {
    log_info "Checking dependencies..."

    local deps=("aws" "kubectl" "helm" "docker")

    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "$dep is not installed."
            exit 1
        fi
    done
}

login_ecr() {
    log_info "Logging into ECR..."
    aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"
}

build_and_push_frontend() {
    log_info "Building and pushing frontend image..."

    docker build \
        -f "$PROJECT_ROOT/apps/frontend/Dockerfile" \
        -t "$ECR_REGISTRY/ecommerce-demo/frontend:$IMAGE_TAG" \
        "$PROJECT_ROOT"

    docker push "$ECR_REGISTRY/ecommerce-demo/frontend:$IMAGE_TAG"

    log_info "Frontend image pushed successfully."
}

build_and_push_backend() {
    log_info "Building and pushing backend image..."

    docker build \
        -f "$PROJECT_ROOT/apps/backend/Dockerfile" \
        -t "$ECR_REGISTRY/ecommerce-demo/backend:$IMAGE_TAG" \
        "$PROJECT_ROOT"

    docker push "$ECR_REGISTRY/ecommerce-demo/backend:$IMAGE_TAG"

    log_info "Backend image pushed successfully."
}

deploy_backend() {
    log_info "Deploying backend..."

    helm upgrade --install backend "$PROJECT_ROOT/helm/backend" \
        --namespace "$NAMESPACE" \
        --create-namespace \
        --values "$PROJECT_ROOT/helm/backend/values-$ENVIRONMENT.yaml" \
        --set image.repository="$ECR_REGISTRY/ecommerce-demo/backend" \
        --set image.tag="$IMAGE_TAG" \
        --wait \
        --timeout 10m

    log_info "Backend deployed successfully."
}

deploy_frontend() {
    log_info "Deploying frontend..."

    helm upgrade --install frontend "$PROJECT_ROOT/helm/frontend" \
        --namespace "$NAMESPACE" \
        --create-namespace \
        --values "$PROJECT_ROOT/helm/frontend/values-$ENVIRONMENT.yaml" \
        --set image.repository="$ECR_REGISTRY/ecommerce-demo/frontend" \
        --set image.tag="$IMAGE_TAG" \
        --wait \
        --timeout 10m

    log_info "Frontend deployed successfully."
}

run_migrations() {
    log_info "Running database migrations..."

    kubectl exec -n "$NAMESPACE" deployment/backend -- npm run db:migrate:prod

    log_info "Migrations completed successfully."
}

verify_deployment() {
    log_info "Verifying deployments..."

    kubectl rollout status deployment/backend -n "$NAMESPACE" --timeout=5m
    kubectl rollout status deployment/frontend -n "$NAMESPACE" --timeout=5m

    log_info "All deployments are healthy."

    echo ""
    log_info "Deployed pods:"
    kubectl get pods -n "$NAMESPACE"

    echo ""
    log_info "Services:"
    kubectl get svc -n "$NAMESPACE"

    echo ""
    log_info "Ingresses:"
    kubectl get ingress -n "$NAMESPACE"
}

# Main
main() {
    local command="${1:-help}"

    case "$command" in
        build)
            check_dependencies
            login_ecr
            build_and_push_frontend
            build_and_push_backend
            ;;
        deploy)
            check_dependencies
            deploy_backend
            deploy_frontend
            ;;
        all)
            check_dependencies
            login_ecr
            build_and_push_frontend
            build_and_push_backend
            deploy_backend
            run_migrations
            deploy_frontend
            verify_deployment
            ;;
        verify)
            check_dependencies
            verify_deployment
            ;;
        help|*)
            echo "Usage: $0 <command>"
            echo ""
            echo "Commands:"
            echo "  build   - Build and push Docker images"
            echo "  deploy  - Deploy applications to Kubernetes"
            echo "  all     - Build, push, and deploy everything"
            echo "  verify  - Verify deployments"
            echo "  help    - Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  NAMESPACE    - Kubernetes namespace (default: ecommerce)"
            echo "  ENVIRONMENT  - Environment name (default: demo)"
            echo "  AWS_REGION   - AWS region (default: us-east-1)"
            echo "  IMAGE_TAG    - Docker image tag (default: latest)"
            ;;
    esac
}

main "$@"
