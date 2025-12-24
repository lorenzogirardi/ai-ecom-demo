#!/bin/bash
set -euo pipefail

# ===========================================
# Database Seed Script
# ===========================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Check if running locally or in Kubernetes
if [ -n "${KUBERNETES_SERVICE_HOST:-}" ]; then
    log_info "Running in Kubernetes environment"
    cd /app
    npm run db:seed
else
    log_info "Running in local environment"
    cd "$PROJECT_ROOT/apps/backend"

    # Check if .env exists
    if [ ! -f ".env" ]; then
        log_warn ".env file not found. Copying from .env.example..."
        cp .env.example .env
    fi

    # Run seed
    npm run db:seed
fi

log_info "Database seeding completed!"
