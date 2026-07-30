#!/bin/bash

# Script para crear archivos de deployment listos para subir

echo "🚀 Creando archivos de deployment para ServiciosHogar.com.ar..."

# Crear directorio de output
mkdir -p deployment-files

# Crear ZIP de la aplicación completa
echo "📦 Creando servicioshogar-complete.zip..."
cd deployment-solution/complete-app
zip -r ../../deployment-files/servicioshogar-complete.zip . -x "*.DS_Store" "*.git*"
cd ../..

# Crear ZIP de la versión simple
echo "📦 Creando servicioshogar-simple.zip..."
cd deployment-solution
zip -r ../deployment-files/servicioshogar-simple.zip simple-index.html .htaccess
cd ..

# Renombrar el archivo en el ZIP simple
cd deployment-files
mkdir temp-simple
cd temp-simple
unzip -q ../servicioshogar-simple.zip
mv simple-index.html index.html
zip -r ../servicioshogar-simple.zip . -x "*.DS_Store"
cd ..
rm -rf temp-simple

echo "✅ Archivos creados:"
echo "   📁 deployment-files/servicioshogar-complete.zip (Aplicación completa)"
echo "   📁 deployment-files/servicioshogar-simple.zip (Versión simple)"
echo ""
echo "📋 INSTRUCCIONES:"
echo "1. Descargar el ZIP que prefieras"
echo "2. Ir a panel Hostinger → Administrador de Archivos → public_html/"
echo "3. BORRAR todo el contenido"
echo "4. Subir y extraer el ZIP"
echo "5. Verificar que index.html esté en la raíz"
echo ""
echo "🌐 Verificar en: https://servicioshogar.com.ar"