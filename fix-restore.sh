#!/bin/bash

set -e

echo "Verificando carpeta shared..."

if [ ! -d "./backend/src/shared" ]; then
  echo "Carpeta shared no encontrada en backend/src. Buscando carpeta shared..."
  SHARED_PATH=$(find ./backend -type d -name shared | head -n 1)
  if [ -z "$SHARED_PATH" ]; then
    echo "No se encontró carpeta shared. Por favor, verifica manualmente."
    exit 1
  else
    echo "Moviendo $SHARED_PATH a backend/src/shared"
    mv "$SHARED_PATH" ./backend/src/shared
  fi
else
  echo "Carpeta shared está en backend/src/ (correcto)"
fi

echo "Creando archivo backend/src/shared/schema/index.ts..."

mkdir -p ./backend/src/shared/schema

cat > ./backend/src/shared/schema/index.ts <<EOL
export * from './users';
export * from './serviceProviders';
export * from './serviceCategories';
// Agrega aquí más exports si tienes otras tablas schema
EOL

echo "Creando tsconfig.json correcto en backend/..."

cat > ./backend/tsconfig.json <<EOL
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "dist",
    "rootDir": "src",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "noImplicitAny": true,
    "sourceMap": true,
    "lib": ["ES2020"],
    "types": ["node"],
    "incremental": true,
    "baseUrl": "./src",
    "paths": {
      "@shared/schema": ["shared/schema/index.ts"]
    }
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
EOL

echo "Instalando dependencias necesarias..."

npm install

echo "¡Listo! Para correr el backend usa este comando desde la raíz del proyecto:"

echo "npx tsx -r tsconfig-paths/register backend/src/index.ts --watch"

