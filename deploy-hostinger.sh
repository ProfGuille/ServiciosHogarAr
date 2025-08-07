#!/bin/bash

# Script de Despliegue para Hostinger
# Uso: ./deploy-hostinger.sh

set -e  # Salir si hay errores

echo "🚀 Iniciando proceso de despliegue para Hostinger..."

# Cambiar al directorio del frontend
cd frontend

echo "📦 Instalando dependencias..."
npm install

echo "🔨 Construyendo aplicación para producción..."
npm run build

echo "📋 Verificando archivos generados..."
if [ ! -d "dist" ]; then
    echo "❌ Error: No se encontró la carpeta dist/"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "❌ Error: No se encontró index.html en dist/"
    exit 1
fi

if [ ! -f "dist/.htaccess" ]; then
    echo "⚠️  Copiando .htaccess a dist/"
    cp .htaccess dist/
fi

echo "✅ Build completado exitosamente"
echo ""
echo "📁 Archivos listos para subir a Hostinger:"
echo "   - Subir TODO el contenido de frontend/dist/ a public_html/"
echo "   - Asegurarse de que .htaccess esté incluido"
echo ""
echo "🌐 URLs post-despliegue:"
echo "   - Frontend: https://servicioshogar.com.ar"
echo "   - API Test: https://servicioshogar.com.ar/api/services"
echo ""
echo "🎉 ¡Listo para despliegue en Hostinger!"