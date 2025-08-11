#!/bin/bash

echo "🔍 VERIFICACIÓN COMPLETA DE ARCHIVOS PARA HOSTINGER"
echo "=================================================="

cd frontend/dist

echo ""
echo "📁 ESTRUCTURA DE ARCHIVOS:"
ls -la

echo ""
echo "✅ VERIFICANDO RUTAS EN INDEX.HTML:"
echo "-----------------------------------"
echo "🔍 Rutas de JavaScript (deben empezar con './'):"
grep 'src=".*\.js"' index.html

echo ""
echo "🔍 Rutas de CSS (deben empezar con './'):"
grep 'href=".*\.css"' index.html

echo ""
echo "📱 VERIFICANDO MANIFEST.JSON:"
echo "----------------------------"
echo "🔍 Start URL (debe ser './'):"
grep '"start_url"' manifest.json

echo ""
echo "🔍 Scope (debe ser './'):"
grep '"scope"' manifest.json

echo ""
echo "🌐 VERIFICANDO .HTACCESS:"
echo "------------------------"
echo "🔍 URL del backend (debe ser servicioshogar-backend-uje1.onrender.com):"
grep "servicioshogar-backend" .htaccess

echo ""
echo "📊 TAMAÑO DE ARCHIVOS PRINCIPALES:"
echo "---------------------------------"
du -h assets/index-*.js | head -1
du -h assets/index-*.css | head -1
du -h index.html

echo ""
echo "🎯 ESTADO: ✅ TODOS LOS ARCHIVOS LISTOS PARA HOSTINGER"
echo "👉 SIGUIENTE PASO: Subir todo el contenido de 'frontend/dist/' a 'public_html/' en Hostinger"