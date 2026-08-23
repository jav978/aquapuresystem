#!/bin/bash

# AquaSystem - Startup Script
# This script sets up and starts the entire AquaSystem application

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"
ENV_FILE="$PROJECT_ROOT/.env"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 is not installed. Please install it first."
        exit 1
    fi
}

wait_for_service() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1

    log_info "Waiting for $service on port $port..."
    while ! nc -z localhost "$port" 2>/dev/null; do
        if [ $attempt -ge $max_attempts ]; then
            log_error "$service did not start in time"
            return 1
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    log_success "$service is ready!"
}

# Header
echo "=========================================="
echo "   AquaSystem - Startup Script"
echo "=========================================="
echo ""

# Check prerequisites
log_info "Checking prerequisites..."

check_command "docker"
check_command "pnpm"
check_command "node"
check_command "nc"  # netcat for port checking

# Check docker compose plugin
if ! docker compose version &> /dev/null; then
    log_error "docker compose plugin is not installed"
    exit 1
fi

# Use docker compose (plugin) instead of docker compose (standalone)
DOCKER_COMPOSE="docker compose"

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    log_error "Node.js 20+ is required (current: $(node -v))"
    exit 1
fi

log_success "All prerequisites met"

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    log_warning ".env file not found. Creating from .env.example..."
    cp "$PROJECT_ROOT/.env.example" "$ENV_FILE"
    log_warning "Please edit .env with your configuration before continuing"
    read -p "Press Enter to continue after editing .env..."
fi

# Load environment variables
set -a
source "$ENV_FILE"
set +a

# Parse arguments
COMMAND="${1:-start}"
SKIP_BUILD="${SKIP_BUILD:-false}"
SKIP_DB="${SKIP_DB:-false}"

case "$COMMAND" in
    start|up)
        log_info "Starting AquaSystem..."
        ;;

    stop|down)
        log_info "Stopping AquaSystem..."
        docker compose -f "$COMPOSE_FILE" down
        log_success "AquaSystem stopped"
        exit 0
        ;;

    restart)
        log_info "Restarting AquaSystem..."
        docker compose -f "$COMPOSE_FILE" restart
        log_success "AquaSystem restarted"
        exit 0
        ;;

    logs)
        docker compose -f "$COMPOSE_FILE" logs -f "${2:-}"
        exit 0
        ;;

    status)
        docker compose -f "$COMPOSE_FILE" ps
        exit 0
        ;;

    clean)
        log_warning "This will remove all containers, volumes, and images. Are you sure? (y/N)"
        read -r confirmation
        if [[ "$confirmation" =~ ^[Yy]$ ]]; then
            docker compose -f "$COMPOSE_FILE" down -v --rmi all
            docker system prune -f
            log_success "Cleanup complete"
        else
            log_info "Cleanup cancelled"
        fi
        exit 0
        ;;

    db:migrate)
        log_info "Running database migrations..."
        cd "$PROJECT_ROOT/apps/api" && pnpm run db:migrate
        log_success "Migrations complete"
        exit 0
        ;;

    db:seed)
        log_info "Seeding database..."
        cd "$PROJECT_ROOT/apps/api" && pnpm run db:seed
        log_success "Seeding complete"
        exit 0
        ;;

    db:studio)
        log_info "Opening Prisma Studio..."
        cd "$PROJECT_ROOT/apps/api" && pnpm run db:studio
        exit 0
        ;;

    build)
        log_info "Building all packages..."
        cd "$PROJECT_ROOT" && pnpm run build
        log_success "Build complete"
        exit 0
        ;;

    test)
        log_info "Running tests..."
        cd "$PROJECT_ROOT" && pnpm run test
        log_success "Tests complete"
        exit 0
        ;;

    lint)
        log_info "Running linter..."
        cd "$PROJECT_ROOT" && pnpm run lint
        log_success "Lint complete"
        exit 0
        ;;

    typecheck)
        log_info "Running type check..."
        cd "$PROJECT_ROOT" && pnpm run typecheck
        log_success "Type check complete"
        exit 0
        ;;

    *)
        log_error "Unknown command: $COMMAND"
        echo "Usage: $0 {start|stop|restart|logs|status|clean|db:migrate|db:seed|db:studio|build|test|lint|typecheck}"
        exit 1
        ;;
esac

# Main start sequence
if [ "$COMMAND" = "start" ] || [ "$COMMAND" = "up" ]; then

    # Install dependencies if node_modules doesn't exist
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        log_info "Installing dependencies..."
        cd "$PROJECT_ROOT" && pnpm install --frozen-lockfile
        log_success "Dependencies installed"
    fi

    # Build packages if needed
    if [ "$SKIP_BUILD" = "false" ]; then
        log_info "Building packages..."
        cd "$PROJECT_ROOT" && pnpm run build
        log_success "Build complete"
    fi

    # Start Docker services
    log_info "Starting Docker services (PostgreSQL, Redis)..."
    docker compose -f "$COMPOSE_FILE" up -d postgres redis

    # Wait for database
    wait_for_service "PostgreSQL" 5432

    # Wait for Redis
    wait_for_service "Redis" 6379

    # Run database migrations
    if [ "$SKIP_DB" = "false" ]; then
        log_info "Running database migrations..."
        cd "$PROJECT_ROOT/apps/api" && pnpm run db:migrate
        log_success "Migrations complete"

        # Seed database
        log_info "Seeding database..."
        cd "$PROJECT_ROOT/apps/api" && pnpm run db:seed
        log_success "Database seeded"
    fi

    # Start API and Web
    log_info "Starting API and Web applications..."
    docker compose -f "$COMPOSE_FILE" up -d api web

    # Wait for API
    wait_for_service "API" 3030

    # Wait for Web
    wait_for_service "Web" 3000

    # Success message
    echo ""
    echo "=========================================="
    log_success "AquaSystem is running!"
    echo "=========================================="
    echo ""
    echo "  Web Application:  http://localhost:3000"
    echo "  API Server:       http://localhost:3030"
    echo "  API Health:       http://localhost:3030/health"
    echo "  Prisma Studio:    Run '$0 db:studio'"
    echo ""
    echo "  Default Users:"
    echo "    Admin:    admin@aquasystem.com    / admin123"
    echo "    Manager:  manager@aquasystem.com  / admin123"
    echo "    Operator: operator@aquasystem.com / admin123"
    echo ""
    echo "  Commands:"
    echo "    View logs:    $0 logs [service]"
    echo "    Stop:         $0 stop"
    echo "    Restart:      $0 restart"
    echo "    Status:       $0 status"
    echo ""
    echo "=========================================="

    # Follow logs if requested
    if [ "${FOLLOW_LOGS:-false}" = "true" ]; then
        docker compose -f "$COMPOSE_FILE" logs -f
    fi
fi