#!/bin/bash

echo "1) Verificando existencia de carpeta src/shared y archivos TS:"
if [ -d "backend/src/shared" ]; then
  echo "✅ backend/src/shared existe."
  echo "Archivos TS en backend/src/shared:"
  ls -l backend/src/shared/*.ts 2>/dev/null || echo "No hay archivos .ts"
else
  echo "❌ No existe backend/src/shared"
fi

echo ""
echo "2) Verificando que schema.ts esté en src/shared:"
if [ -f "backend/src/shared/schema.ts" ]; then
  echo "✅ backend/src/shared/schema.ts encontrado."
else
  echo "❌ backend/src/shared/schema.ts NO encontrado."
fi

echo ""
echo "3) Listando archivos que compila TypeScript:"
npx tsc --listFiles | grep "src/shared" || echo "No se están compilando archivos de shared"

echo ""
echo "4) Probando build con salida en pantalla:"
npx tsc --noEmit

echo ""
echo "5) Verificando existencia de carpeta dist/shared después de build:"
if [ -d "backend/dist/shared" ]; then
  echo "✅ backend/dist/shared existe."
  echo "Archivos en backend/dist/shared:"
  ls -l backend/dist/shared
else
  echo "❌ backend/dist/shared NO existe."
fi

