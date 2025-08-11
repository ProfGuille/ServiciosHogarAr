#!/bin/bash

# Script para rebuild y deploy del frontend con configuración correcta
# Usar este script para solucionar la página blanca en servicioshogar.com.ar

echo "🔧 REBUILD FRONTEND PARA HOSTINGER"
echo "=================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: Ejecutar desde el directorio raíz del proyecto"
    exit 1
fi

echo "📁 Cambiando al directorio frontend..."
cd frontend

echo "🔍 Verificando variables de entorno de producción..."
if [ ! -f ".env.production" ]; then
    echo "❌ Error: Archivo .env.production no encontrado"
    exit 1
fi

echo "📋 Variables de entorno de producción:"
cat .env.production

echo ""
echo "🏗️ Instalando dependencias..."
npm install

echo ""
echo "🔨 Compilando para producción..."
npm run build

echo ""
echo "✅ Build completado. Archivos en directorio 'dist/'"

echo ""
echo "🔍 Verificando configuración en el build..."
if grep -q "servicioshogar-backend-uje1.onrender.com" dist/assets/*.js 2>/dev/null; then
    echo "✅ URL del backend correcta en el build"
else
    echo "⚠️  Verificar manualmente que la URL del backend esté en los archivos de build"
fi

echo ""
echo "📤 PASOS PARA DEPLOY EN HOSTINGER:"
echo "1. Comprimir el contenido de la carpeta 'dist/'"
echo "2. Subir a Hostinger y extraer en public_html/"
echo "3. Verificar que servicioshogar.com.ar cargue correctamente"

echo ""
echo "🧪 VERIFICACIÓN POST-DEPLOY:"
echo "1. Abrir https://servicioshogar.com.ar"
echo "2. Abrir DevTools (F12) > Console"
echo "3. Verificar que no haya errores de conexión"
echo "4. Probar login/registro para confirmar conexión con backend"

echo ""
echo "✅ Script completado. Frontend listo para deploy."