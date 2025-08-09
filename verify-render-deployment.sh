#!/bin/bash

# ServiciosHogarAr - Render Deployment Verification Script
# This script verifies that the application can build and start correctly
# Run this before deploying to catch issues early

set -e  # Exit on any error

echo "🔍 Verificando deployment de ServiciosHogarAr..."
echo "================================================"

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: No se encontró render.yaml. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

echo "✅ Directorio correcto detectado"

# Check for required files
echo "📁 Verificando estructura de archivos..."
required_files=("package.json" "frontend/package.json" "backend/package.json" "render.yaml")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: Archivo faltante: $file"
        exit 1
    fi
    echo "✅ $file encontrado"
done

# Simulate Render build process
echo ""
echo "🏗️  Simulando proceso de build de Render..."
echo "============================================"

echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install --silent

echo "🏗️  Construyendo frontend..."
npm run build

echo "📦 Instalando dependencias del backend..."
cd ../backend
npm install --silent

echo "🏗️  Construyendo backend..."
npm run build

echo "✅ Build completado exitosamente"

# Check if dist directories exist
echo ""
echo "📋 Verificando artefactos de build..."
if [ ! -d "dist" ]; then
    echo "❌ Error: No se generó el directorio dist del backend"
    exit 1
fi

if [ ! -f "dist/index.js" ]; then
    echo "❌ Error: No se generó dist/index.js"
    exit 1
fi

if [ ! -d "../frontend/dist" ]; then
    echo "❌ Error: No se generó el directorio dist del frontend"
    exit 1
fi

echo "✅ Todos los artefactos de build están presentes"

# Test that the application can start (briefly)
echo ""
echo "🚀 Probando startup del servidor..."
echo "=================================="

cd ..  # Back to root
timeout 10s node backend/dist/index.js > /tmp/startup-test.log 2>&1 &
SERVER_PID=$!

sleep 5

if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Servidor iniciado correctamente"
    kill $SERVER_PID 2>/dev/null || true
else
    echo "❌ Error: El servidor no pudo iniciar correctamente"
    echo "Logs del servidor:"
    cat /tmp/startup-test.log
    exit 1
fi

# Clean up
rm -f /tmp/startup-test.log

echo ""
echo "🎉 ¡Verificación completada exitosamente!"
echo "========================================"
echo "✅ El proyecto está listo para deployment en Render"
echo "✅ Ambos builds (frontend y backend) funcionan correctamente"
echo "✅ El servidor puede iniciar sin errores"
echo ""
echo "📝 Notas:"
echo "   - Asegúrate de configurar las variables de entorno en Render"
echo "   - DATABASE_URL, SESSION_SECRET, VAPID_* keys son necesarias para funcionalidad completa"
echo "   - El servidor puede ejecutar en modo limitado sin base de datos para testing"