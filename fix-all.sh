#!/bin/bash
set -e

echo "1) Corrigiendo imports relativos agregando .js..."
find backend/src -type f -name '*.ts' -exec sed -i -E '
  s|(from ["'\''])(\.\.?/[^"'\''\n]+)(["'\''])|\1\2.js\3|g;
' {} +

echo "2) Creando archivo global.d.ts para módulos sin tipos..."
cat > backend/src/global.d.ts <<EOF
declare module 'memoizee';
declare module 'connect-pg-simple';
declare module 'nodemailer';
EOF

echo "3) Instalando tipos faltantes con npm..."
npm install --save-dev @types/memoizee @types/connect-pg-simple @types/nodemailer || true

echo "4) Listo! Ahora corre 'npm run build' para ver si los errores bajaron."

