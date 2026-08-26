#!/usr/bin/env bash
# =============================================================================
# AquaPure Pro - Script de Inicio en 1 Clic (Linux / macOS)
# =============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

"$PROJECT_ROOT/scripts/start-local.sh"
