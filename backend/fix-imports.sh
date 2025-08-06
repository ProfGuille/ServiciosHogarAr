#!/bin/bash

echo "🔧 Corrigiendo imports con múltiples .js..."

# Recorre todos los archivos .ts y reemplaza './archivo.js.js.js' por './archivo'
find src -type f -name "*.ts" -exec sed -i -E 's|(["'\''])((\./|\../)[^"\']*?)((\.js)+)\1|\1\2\1|g' {} +

echo "✅ Imports corregidos."

