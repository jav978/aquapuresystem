#!/bin/bash

# AquaSystem - Development Mode Script
# Runs the application locally with hot reload (without Docker for apps)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"
ENV_FILE="$PROJECT_ROOT/.env"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

check_command() {
    if ! command -v "$1" &> /dev/null; then
        log_error "$1 is not installed"
        exit 1
    fi
}

wait_for_port() {
    local port=$1
    local service=$2
    local max=30
    local count=1
    log_info "Waiting for $service on port $port..."
    while ! nc -z localhost "$port" 2>/dev/null; do
        if [ $count -ge $max ]; then
            log_error "$service timeout"
            return 1
        fi
        sleep 1
        count=$((count + 1))
    done
    log_success "$service ready on port $port"
}

# Header
echo "=========================================="
echo "   AquaSystem - Development Mode"
echo "=========================================="
echo ""

# Check prerequisites
check_command "pnpm"
check_command "node"

# Load env
if [ -f "$ENV_FILE" ]; then
    set -a; source "$ENV_FILE"; set +a
else
    log_warning "No .env file found, using defaults"
fi

# Optional Docker infrastructure (only if explicitly enabled with USE_DOCKER=true)
if [ "${USE_DOCKER}" = "true" ] && command -v docker &> /dev/null; then
    log_info "Starting infrastructure with Docker (PostgreSQL, Redis)..."
    docker compose -f "$COMPOSE_FILE" up -d postgres redis
    if command -v nc &> /dev/null; then
        wait_for_port 5432 "PostgreSQL"
        wait_for_port 6379 "Redis"
    fi
else
    log_info "Running with direct environment variables (No Docker required)."
    log_info "Database: ${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/aquasystem}"
    log_info "Redis:    ${REDIS_URL:-redis://localhost:6379}"
fi

# Skip design-system build for now
log_info "Preparing workspace..."

# Install dependencies for all packages
log_info "Installing dependencies..."
cd "$PROJECT_ROOT" && pnpm install --no-frozen-lockfile

# Install dependencies for all packages except web
log_info "Installing dependencies (excluding web)..."
cd "$PROJECT_ROOT" && pnpm install --no-frozen-lockfile --filter="!@aquasystem/web"

# Now install web app (design-system is built)
log_info "Installing web app..."
cd "$PROJECT_ROOT/apps/web" && pnpm install --no-frozen-lockfile

# Skip build for now (TypeScript errors to fix incrementally)
# The goal is to get dev servers running
log_info "Skipping build (TypeScript errors to fix incrementally)..."

# Run migrations
log_info "Running database migrations..."
cd "$PROJECT_ROOT/apps/api" && pnpm run db:migrate

# Seed database
log_info "Seeding database..."
cd "$PROJECT_ROOT/apps/api" && pnpm run db:seed

# Function to cleanup on exit
cleanup() {
    log_info "Shutting down..."
    kill $(jobs -p) 2>/dev/null || true
    if [ "${USE_DOCKER}" = "true" ] && command -v docker &> /dev/null; then
        docker compose -f "$COMPOSE_FILE" stop postgres redis 2>/dev/null || true
    fi
    exit 0
}
trap cleanup INT TERM EXIT

# Start API in background
log_info "Starting API server (port 3030)..."
cd "$PROJECT_ROOT/apps/api" && pnpm run dev &
API_PID=$!

# Start Web in background
log_info "Starting Web server (port 3000)..."
cd "$PROJECT_ROOT/apps/web" && pnpm run dev &
WEB_PID=$!

# Wait for services
wait_for_port 3030 "API"
wait_for_port 3000 "Web"

echo ""
echo "=========================================="
log_success "AquaSystem running in development mode!"
echo "=========================================="
echo ""
echo "  Web (Nuxt 3):     http://localhost:3000"
echo "  API (Feathers):   http://localhost:3030"
echo "  API Health:       http://localhost:3030/health"
echo "  PostgreSQL:       localhost:5432"
echo "  Redis:            localhost:6379"
echo ""
echo "  Hot reload: ENABLED"
echo "  Press Ctrl+C to stop all services"
echo "=========================================="
echo ""

# Wait for background processes
wait $API_PID $WEB_PID