#!/usr/bin/env bash
# =============================================================================
# AquaPure Pro - Script de Inicio en 1 Clic (Linux / macOS)
# =============================================================================

set -e

# Asegurar que el script siempre se ejecute desde la raíz del proyecto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "💧 ========================================================="
echo "💧  Iniciando AquaPure Pro en Servidor Local / Intranet..."
echo "💧  Directorio raíz: $PROJECT_ROOT"
echo "💧 ========================================================="

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Error: Docker no está instalado en este equipo."
    echo "Por favor instale Docker Engine o Docker Desktop para continuar."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: Docker Compose no está disponible."
    exit 1
fi

# Copiar .env si no existe
if [ ! -f .env ]; then
    echo "📋 Creando archivo de configuración .env desde plantilla segura..."
    cp .env.example .env
fi

echo "🚀 Levantando contenedores (Web App + PostgreSQL Aislado)..."
docker compose up -d --build

# Obtener IP local de la máquina de forma segura
LOCAL_IP="localhost"
if command -v hostname &> /dev/null; then
    DETECTED_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
    if [ -n "$DETECTED_IP" ]; then
        LOCAL_IP="$DETECTED_IP"
    fi
fi

echo ""
echo "✅ ========================================================="
echo "✅  AquaPure Pro está listo y operando de forma segura."
echo "✅  Acceso Local:    http://localhost:3000"
echo "✅  Acceso Intranet: http://${LOCAL_IP}:3000"
echo "✅ ========================================================="
