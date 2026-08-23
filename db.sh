#!/bin/bash

# AquaSystem - Database Management Script

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_DIR="$PROJECT_ROOT/apps/api"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

cd "$API_DIR"

case "${1:-help}" in
    migrate)
        log_info "Running migrations..."
        pnpm run db:migrate
        log_success "Migrations complete"
        ;;

    migrate:prod)
        log_warning "Running PRODUCTION migrations..."
        read -p "Are you sure? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            pnpm run db:migrate deploy
            log_success "Production migrations complete"
        else
            log_info "Cancelled"
        fi
        ;;

    generate)
        log_info "Generating Prisma Client..."
        pnpm run db:generate
        log_success "Client generated"
        ;;

    seed)
        log_info "Seeding database..."
        pnpm run db:seed
        log_success "Seeding complete"
        ;;

    studio)
        log_info "Opening Prisma Studio..."
        pnpm run db:studio
        ;;

    reset)
        log_warning "This will DELETE all data! Are you sure? (y/N)"
        read -r confirm
        if [[ "$confirm" =~ ^[Yy]$ ]]; then
            log_info "Resetting database..."
            pnpm run db:migrate reset --force
            pnpm run db:seed
            log_success "Database reset complete"
        else
            log_info "Cancelled"
        fi
        ;;

    status)
        log_info "Checking migration status..."
        pnpm run db:migrate status
        ;;

    diff)
        log_info "Showing schema diff..."
        npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script
        ;;

    pull)
        log_info "Pulling schema from database..."
        npx prisma db pull
        log_success "Schema pulled"
        ;;

    push)
        log_info "Pushing schema to database..."
        npx prisma db push
        log_success "Schema pushed"
        ;;

    backup)
        BACKUP_FILE="$PROJECT_ROOT/backups/aquasystem_$(date +%Y%m%d_%H%M%S).sql"
        mkdir -p "$(dirname "$BACKUP_FILE")"
        log_info "Creating backup: $BACKUP_FILE"
        docker compose -f "$PROJECT_ROOT/docker-compose.yml" exec -T postgres pg_dump -U aqua aquasystem > "$BACKUP_FILE"
        log_success "Backup saved to $BACKUP_FILE"
        ;;

    restore)
        if [ -z "$2" ]; then
            log_error "Usage: $0 restore <backup_file>"
            exit 1
        fi
        log_warning "This will OVERWRITE current data! Continue? (y/N)"
        read -r confirm
        if [[ "$confirm" =~ ^[Yy]$ ]]; then
            log_info "Restoring from $2..."
            docker compose -f "$PROJECT_ROOT/docker-compose.yml" exec -T postgres psql -U aqua -d aquasystem < "$2"
            log_success "Restore complete"
        else
            log_info "Cancelled"
        fi
        ;;

    *)
        echo "AquaSystem Database Management"
        echo ""
        echo "Usage: $0 {migrate|migrate:prod|generate|seed|studio|reset|status|diff|pull|push|backup|restore}"
        echo ""
        echo "Commands:"
        echo "  migrate       - Run pending migrations"
        echo "  migrate:prod  - Run migrations in production mode"
        echo "  generate      - Generate Prisma Client"
        echo "  seed          - Seed database with initial data"
        echo "  studio        - Open Prisma Studio"
        echo "  reset         - Reset database (DELETES ALL DATA)"
        echo "  status        - Show migration status"
        echo "  diff          - Show schema diff"
        echo "  pull          - Pull schema from database"
        echo "  push          - Push schema to database"
        echo "  backup        - Create SQL backup"
        echo "  restore <file> - Restore from backup"
        ;;
esac