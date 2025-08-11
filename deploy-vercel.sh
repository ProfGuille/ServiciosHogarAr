#!/bin/bash

# Deploy to Vercel - Servicios Hogar
# Este script automatiza el deploy a Vercel

set -e

echo "🚀 Iniciando deploy a Vercel..."

# Verificar que estamos en el directorio correcto
if [[ ! -f "vercel.json" ]]; then
    echo "❌ Error: vercel.json no encontrado. Ejecutar desde la raíz del proyecto."
    exit 1
fi

# Verificar que Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# Build del frontend
echo "🔨 Building frontend..."
cd frontend
npm ci
npm run build
cd ..

# Verificar que el build fue exitoso
if [[ ! -d "frontend/dist" ]]; then
    echo "❌ Error: Build del frontend falló"
    exit 1
fi

echo "✅ Build completado exitosamente"

# Deploy a Vercel
echo "🚀 Desplegando a Vercel..."
vercel --prod

echo "✅ Deploy completado!"
echo ""
echo "🔗 URLs importantes:"
echo "Frontend: https://servicioshogar.com.ar"
echo "Backend: https://servicioshogar-backend-uje1.onrender.com"
echo ""
echo "📊 Monitoreo:"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- Cloudflare Dashboard: https://dash.cloudflare.com"
echo "- Render Dashboard: https://dashboard.render.com"
echo ""
echo "🎉 ¡Deploy exitoso!"