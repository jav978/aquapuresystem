#!/usr/bin/env bash
# =============================================================================
# AquaPure Pro - Script de Inicio en 1 Clic (Linux / macOS)
# =============================================================================

set -e

echo "💧 ========================================================="
echo "💧  Iniciando AquaPure Pro en Servidor Local / Intranet..."
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

echo ""
echo "✅ ========================================================="
echo "✅  AquaPure Pro está listo y operando de forma segura."
echo "✅  Acceso Local:    http://localhost:3000"
echo "✅  Acceso Intranet: http://$(hostname -I | awk '{print $1}'):3000"
echo "✅ ========================================================="
