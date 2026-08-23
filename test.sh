#!/bin/bash

# AquaSystem - Test Runner Script

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

cd "$PROJECT_ROOT"

case "${1:-all}" in
    unit)
        log_info "Running unit tests..."
        pnpm run test
        ;;

    unit:watch)
        log_info "Running unit tests in watch mode..."
        pnpm run test:watch
        ;;

    unit:coverage)
        log_info "Running unit tests with coverage..."
        pnpm run test -- --coverage
        ;;

    e2e)
        log_info "Running E2E tests..."
        pnpm run test:e2e
        ;;

    e2e:ui)
        log_info "Running E2E tests with UI..."
        pnpm run test:e2e -- --ui
        ;;

    e2e:headed)
        log_info "Running E2E tests in headed mode..."
        pnpm run test:e2e -- --headed
        ;;

    lint)
        log_info "Running linter..."
        pnpm run lint
        ;;

    lint:fix)
        log_info "Running linter with auto-fix..."
        pnpm run lint -- --fix
        ;;

    typecheck)
        log_info "Running type check..."
        pnpm run typecheck
        ;;

    format)
        log_info "Formatting code..."
        pnpm run format
        ;;

    all)
        log_info "Running full test suite..."
        log_info "1/4: Type check"
        pnpm run typecheck
        log_info "2/4: Lint"
        pnpm run lint
        log_info "3/4: Unit tests"
        pnpm run test
        log_info "4/4: E2E tests"
        pnpm run test:e2e
        log_success "All tests passed!"
        ;;

    ci)
        log_info "Running CI pipeline..."
        pnpm run typecheck
        pnpm run lint
        pnpm run test
        pnpm run build
        log_success "CI pipeline complete!"
        ;;

    *)
        echo "AquaSystem Test Runner"
        echo ""
        echo "Usage: $0 {unit|unit:watch|unit:coverage|e2e|e2e:ui|e2e:headed|lint|lint:fix|typecheck|format|all|ci}"
        echo ""
        echo "Commands:"
        echo "  unit              - Run unit tests"
        echo "  unit:watch        - Run unit tests in watch mode"
        echo "  unit:coverage     - Run unit tests with coverage report"
        echo "  e2e               - Run E2E tests"
        echo "  e2e:ui            - Run E2E tests with Playwright UI"
        echo "  e2e:headed        - Run E2E tests in headed mode"
        echo "  lint              - Run linter"
        echo "  lint:fix          - Run linter with auto-fix"
        echo "  typecheck         - Run TypeScript type check"
        echo "  format            - Format code with Prettier"
        echo "  all               - Run full test suite"
        echo "  ci                - Run CI pipeline (typecheck + lint + test + build)"
        ;;
esac