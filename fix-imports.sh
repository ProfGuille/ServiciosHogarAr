#!/bin/bash

echo "🔧 Corrigiendo imports con múltiples .js y index.js..."

find src -type f -name "*.ts" -exec sed -i -E '
  s|(["'"'"'])([^"'"'"']*?)(\.js)+\1|\1\2\1|g;       # Quita extensiones repetidas .js.js.js
  s|(["'"'"'])([^"'"'"']*/index)\.js\1|\1\2\1|g     # Quita extensión .js en index.js
' {} +

echo "✅ Imports corregidos."

