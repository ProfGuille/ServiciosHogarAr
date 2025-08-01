#!/bin/bash

echo "🧹 Iniciando limpieza del proyecto..."

# Borrar node_modules en todos los niveles
echo "🔸 Borrando node_modules/"
find . -type d -name "node_modules" -exec rm -rf {} +

# Borrar dist/ en todos los niveles
echo "🔸 Borrando dist/"
find . -type d -name "dist" -exec rm -rf {} +

# Borrar archivos .js y .d.ts generados por TypeScript
echo "🔸 Borrando archivos .js y .d.ts en shared/"
find ./shared -type f \( -name "*.js" -o -name "*.d.ts" \) -delete

# Borrar cachés y archivos innecesarios
echo "🔸 Borrando archivos de caché y logs..."
rm -rf .turbo .next .cache .eslintcache yarn.lock

echo "✅ Limpieza completada."

