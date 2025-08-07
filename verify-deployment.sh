#!/bin/bash

# Script de Verificación Post-Despliegue
# Verifica que todos los servicios estén funcionando correctamente

echo "🔍 Verificando conectividad de servicios..."

# Verificar backend
echo "📡 Verificando backend en Render..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://servicioshogar-backend.onrender.com/api/services || echo "000")

if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend: OK (HTTP $BACKEND_STATUS)"
else
    echo "❌ Backend: ERROR (HTTP $BACKEND_STATUS)"
fi

# Verificar que el frontend existe
echo "📁 Verificando archivos de frontend..."
if [ -f "frontend/dist/index.html" ]; then
    echo "✅ Frontend build: OK"
else
    echo "❌ Frontend build: FALTA - ejecuta ./deploy-hostinger.sh"
fi

if [ -f "frontend/dist/.htaccess" ]; then
    echo "✅ .htaccess: OK"
else
    echo "❌ .htaccess: FALTA"
fi

# Verificar configuración
echo "⚙️  Verificando configuración..."
if [ -f "frontend/.env.production" ]; then
    echo "✅ Variables de producción: OK"
else
    echo "❌ Variables de producción: FALTA"
fi

echo ""
echo "📋 Resumen de estado:"
echo "   Backend (Render): $([ "$BACKEND_STATUS" = "200" ] && echo "✅ Online" || echo "❌ Offline")"
echo "   Frontend (Build): $([ -f "frontend/dist/index.html" ] && echo "✅ Listo" || echo "❌ Falta build")"
echo "   Configuración: $([ -f "frontend/.env.production" ] && echo "✅ OK" || echo "❌ Falta config")"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Subir contenido de frontend/dist/ a Hostinger public_html/"
echo "   2. Verificar DNS apunta a Hostinger"
echo "   3. Activar SSL en Hostinger"
echo "   4. Probar https://servicioshogar.com.ar"