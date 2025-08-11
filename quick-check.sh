#!/bin/bash

# Quick Deployment Status Check for servicioshogar.com.ar
# Usage: ./quick-check.sh

echo "🔍 Verificación Rápida de servicioshogar.com.ar"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test URL
test_url() {
    local name="$1"
    local url="$2"
    echo -n "📡 Probando $name... "
    
    if command -v curl &> /dev/null; then
        response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 10 "$url" 2>/dev/null)
        if [ "$response" = "200" ]; then
            echo -e "${GREEN}✅ OK (HTTP $response)${NC}"
            return 0
        elif [ "$response" = "000" ]; then
            echo -e "${RED}❌ No se puede conectar${NC}"
            return 1
        else
            echo -e "${YELLOW}⚠️  HTTP $response${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  curl no disponible${NC}"
        return 1
    fi
}

# Function to check local files
check_local_files() {
    echo "🏗️  Verificando archivos locales..."
    
    # Frontend build
    if [ -f "frontend/dist/index.html" ]; then
        echo -e "   ${GREEN}✅ Frontend build existe${NC}"
    else
        echo -e "   ${RED}❌ Frontend build faltante${NC}"
        echo "   💡 Ejecutar: cd frontend && npm run build"
    fi
    
    # Backend build
    if [ -f "backend/dist/index.js" ]; then
        echo -e "   ${GREEN}✅ Backend build existe${NC}"
    else
        echo -e "   ${RED}❌ Backend build faltante${NC}"
        echo "   💡 Ejecutar: cd backend && npm run build"
    fi
    
    # Package files
    if [ -f "package.json" ] && [ -f "frontend/package.json" ] && [ -f "backend/package.json" ]; then
        echo -e "   ${GREEN}✅ Archivos package.json OK${NC}"
    else
        echo -e "   ${RED}❌ Falta algún package.json${NC}"
    fi
    
    echo ""
}

# Function to check environment files
check_env_files() {
    echo "🔧 Verificando configuración..."
    
    if [ -f "frontend/.env.production" ]; then
        echo -e "   ${GREEN}✅ Frontend .env.production existe${NC}"
        api_url=$(grep VITE_API_URL frontend/.env.production | cut -d'=' -f2)
        echo "   📝 API URL configurada: $api_url"
    else
        echo -e "   ${YELLOW}⚠️  Frontend .env.production faltante${NC}"
    fi
    
    if [ -f "render.yaml" ]; then
        echo -e "   ${GREEN}✅ render.yaml existe${NC}"
    else
        echo -e "   ${RED}❌ render.yaml faltante${NC}"
    fi
    
    echo ""
}

# Main execution
echo "Timestamp: $(date)"
echo ""

check_local_files
check_env_files

echo "🌐 Probando conectividad (puede fallar en entornos restringidos)..."
test_url "Frontend" "https://servicioshogar.com.ar"
test_url "Backend Health" "https://servicioshogar-backend.onrender.com/api/health"
test_url "Backend Ping" "https://servicioshogar-backend.onrender.com/api/ping"

echo ""
echo "📋 Próximos pasos recomendados:"
echo ""
echo "1. 📁 Verificar archivos en Hostinger (panel de control)"
echo "2. 🚀 Verificar servicio en Render (dashboard)"  
echo "3. 🗄️  Verificar base de datos en Neon (console)"
echo "4. 📊 Ejecutar diagnóstico completo: node diagnostic-script.js"
echo ""
echo "📖 Para información detallada, ver: INFORMACION_REQUERIDA.md"