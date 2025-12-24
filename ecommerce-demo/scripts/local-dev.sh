#!/bin/bash
set -euo pipefail

# ===========================================
# Local Development Script
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

check_dependencies() {
    log_info "Checking dependencies..."

    local deps=("node" "npm" "docker")

    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            log_error "$dep is not installed."
            exit 1
        fi
    done

    # Check Node version
    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 20 ]; then
        log_error "Node.js 20+ is required. Current version: $(node -v)"
        exit 1
    fi

    log_info "All dependencies are installed."
}

setup_env_files() {
    log_info "Setting up environment files..."

    # Backend
    if [ ! -f "$PROJECT_ROOT/apps/backend/.env" ]; then
        log_info "Creating backend .env file..."
        cp "$PROJECT_ROOT/apps/backend/.env.example" "$PROJECT_ROOT/apps/backend/.env"
    else
        log_info "Backend .env file already exists."
    fi

    # Frontend
    if [ ! -f "$PROJECT_ROOT/apps/frontend/.env" ]; then
        log_info "Creating frontend .env file..."
        cp "$PROJECT_ROOT/apps/frontend/.env.example" "$PROJECT_ROOT/apps/frontend/.env"
    else
        log_info "Frontend .env file already exists."
    fi
}

start_docker_services() {
    log_info "Starting Docker services..."

    cd "$PROJECT_ROOT"
    docker-compose up -d

    log_info "Waiting for services to be ready..."
    sleep 5

    # Check PostgreSQL
    until docker-compose exec -T postgres pg_isready -U ecommerce -d ecommerce_db &> /dev/null; do
        log_info "Waiting for PostgreSQL..."
        sleep 2
    done
    log_info "PostgreSQL is ready."

    # Check Redis
    until docker-compose exec -T redis redis-cli -a redis_secret ping &> /dev/null; do
        log_info "Waiting for Redis..."
        sleep 2
    done
    log_info "Redis is ready."
}

stop_docker_services() {
    log_info "Stopping Docker services..."
    cd "$PROJECT_ROOT"
    docker-compose down
    log_info "Docker services stopped."
}

install_dependencies() {
    log_info "Installing npm dependencies..."
    cd "$PROJECT_ROOT"
    npm install
    log_info "Dependencies installed."
}

run_migrations() {
    log_info "Running database migrations..."
    cd "$PROJECT_ROOT"
    npm run db:migrate
    log_info "Migrations completed."
}

generate_prisma_client() {
    log_info "Generating Prisma client..."
    cd "$PROJECT_ROOT/apps/backend"
    npm run db:generate
    log_info "Prisma client generated."
}

seed_database() {
    log_info "Seeding database..."
    cd "$PROJECT_ROOT"
    npm run db:seed
    log_info "Database seeded."
}

start_dev_servers() {
    log_info "Starting development servers..."
    cd "$PROJECT_ROOT"
    npm run dev
}

open_services() {
    log_info "Opening services in browser..."

    # Detect OS and open browser
    case "$(uname -s)" in
        Darwin)
            open "http://localhost:3000" &
            open "http://localhost:4000/docs" &
            open "http://localhost:8080" &
            ;;
        Linux)
            xdg-open "http://localhost:3000" &
            xdg-open "http://localhost:4000/docs" &
            xdg-open "http://localhost:8080" &
            ;;
        *)
            log_info "Please open the following URLs manually:"
            log_info "  Frontend: http://localhost:3000"
            log_info "  API Docs: http://localhost:4000/docs"
            log_info "  Adminer:  http://localhost:8080"
            ;;
    esac
}

show_status() {
    log_info "Service Status:"
    echo ""
    echo "Docker Services:"
    cd "$PROJECT_ROOT"
    docker-compose ps
    echo ""
    echo "URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:4000"
    echo "  API Docs: http://localhost:4000/docs"
    echo "  Adminer:  http://localhost:8080 (DB: postgres, User: ecommerce, Pass: ecommerce_secret)"
}

full_setup() {
    check_dependencies
    setup_env_files
    start_docker_services
    install_dependencies
    generate_prisma_client
    run_migrations
    seed_database
    show_status
    log_info "Setup complete! Run '$0 dev' to start development servers."
}

# Main
main() {
    local command="${1:-help}"

    case "$command" in
        check)
            check_dependencies
            ;;
        setup)
            full_setup
            ;;
        docker-up)
            start_docker_services
            ;;
        docker-down)
            stop_docker_services
            ;;
        install)
            install_dependencies
            ;;
        migrate)
            run_migrations
            ;;
        seed)
            seed_database
            ;;
        dev)
            start_dev_servers
            ;;
        open)
            open_services
            ;;
        status)
            show_status
            ;;
        reset)
            log_warn "This will reset the database!"
            read -p "Are you sure? (y/N): " confirm
            if [[ "$confirm" =~ ^[Yy]$ ]]; then
                cd "$PROJECT_ROOT/apps/backend"
                npm run db:reset
                log_info "Database reset complete."
            fi
            ;;
        help|*)
            echo "Usage: $0 <command>"
            echo ""
            echo "Commands:"
            echo "  check       - Check dependencies"
            echo "  setup       - Full setup (docker, install, migrate, seed)"
            echo "  docker-up   - Start Docker services"
            echo "  docker-down - Stop Docker services"
            echo "  install     - Install npm dependencies"
            echo "  migrate     - Run database migrations"
            echo "  seed        - Seed the database"
            echo "  dev         - Start development servers"
            echo "  open        - Open services in browser"
            echo "  status      - Show service status"
            echo "  reset       - Reset the database"
            echo "  help        - Show this help message"
            ;;
    esac
}

main "$@"
