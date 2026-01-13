#!/bin/bash
# setup.sh - Full installation script for Claude Enterprise MCP

set -e

echo "======================================"
echo "Claude Enterprise MCP Setup"
echo "======================================"
echo ""

# Configuration
INSTALL_DIR="${INSTALL_DIR:-$HOME/.claude-enterprise}"
REPO_URL="${REPO_URL:-git@github.company.com:devtools/claude-enterprise-mcp.git}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js is required but not installed."
        log_error "Install from: https://nodejs.org/"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        log_error "Node.js 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    log_info "Node.js $(node -v) ✓"

    # Check npm
    if ! command -v npm &> /dev/null; then
        log_error "npm is required but not installed."
        exit 1
    fi
    log_info "npm $(npm -v) ✓"

    # Check git
    if ! command -v git &> /dev/null; then
        log_error "git is required but not installed."
        exit 1
    fi
    log_info "git $(git --version | cut -d ' ' -f 3) ✓"

    echo ""
}

# Clone or update repository
clone_repo() {
    if [ -d "$INSTALL_DIR" ]; then
        log_info "Installation directory exists, updating..."
        cd "$INSTALL_DIR"
        git pull origin main
    else
        log_info "Cloning repository..."
        git clone "$REPO_URL" "$INSTALL_DIR"
        cd "$INSTALL_DIR"
    fi
    echo ""
}

# Install dependencies
install_deps() {
    log_info "Installing dependencies..."
    npm install
    echo ""
}

# Build all packages
build_packages() {
    log_info "Building packages..."
    npm run build
    echo ""
}

# Configure Claude Code
configure_claude() {
    log_info "Configuring Claude Code..."
    ./scripts/configure-claude.sh
    echo ""
}

# Setup authentication
setup_auth() {
    log_info "Setting up authentication..."
    echo ""
    echo "Authentication setup is interactive."
    echo "You will be prompted to authenticate with each service."
    echo ""
    read -p "Do you want to setup authentication now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./scripts/auth-setup.sh
    else
        log_warn "Skipping authentication setup."
        log_warn "Run './scripts/auth-setup.sh' later to configure."
    fi
    echo ""
}

# Print summary
print_summary() {
    echo ""
    echo "======================================"
    echo "Setup Complete!"
    echo "======================================"
    echo ""
    echo "Installation directory: $INSTALL_DIR"
    echo ""
    echo "Available MCP Servers:"
    echo "  - github-mcp"
    echo "  - jira-mcp"
    echo "  - confluence-mcp"
    echo "  - aws-mcp"
    echo ""
    echo "Available Skills:"
    echo "  - /security-review"
    echo "  - /delivery-review"
    echo "  - /platform-review"
    echo "  - /portfolio-insights"
    echo ""
    echo "Next steps:"
    echo "  1. Configure your credentials in .env"
    echo "  2. Run 'claude' to start using the tools"
    echo ""
}

# Main
main() {
    check_prerequisites
    clone_repo
    install_deps
    build_packages
    configure_claude
    setup_auth
    print_summary
}

main "$@"
