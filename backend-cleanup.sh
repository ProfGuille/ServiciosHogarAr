#!/bin/bash

echo "=============================================="
echo "  🧹 Limpieza automática del backend"
echo "  🔒 Modo seguro con backup completo"
echo "=============================================="

# Crear carpeta de backup con fecha y hora
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR="backend-backup-$TIMESTAMP"

echo "📦 Creando backup completo del backend en: $BACKUP_DIR"
cp -r backend "$BACKUP_DIR"

echo "✅ Backup creado con éxito"
echo ""

# Carpetas a eliminar
REMOVE_DIRS=(
  "backend/src-clean"
  "backend/src-backup"
)

# Archivos a eliminar
REMOVE_FILES=(
  "backend/test-schema.ts"
  "backend/testInsert.ts"
  "backend/test-db.ts"
  "backend/src/shared/Documento sin título"
  "backend/src/shared/schema_RECUPERADO.ts"
  "backend/serviceProviders_snippet.ts"
  "backend/eventType_snippet.ts"
)

echo "🗑️ Eliminando carpetas duplicadas y legacy..."
for DIR in "${REMOVE_DIRS[@]}"; do
  if [ -d "$DIR" ]; then
    rm -rf "$DIR"
    echo "  ✔ Eliminado: $DIR"
  fi
done

echo ""
echo "🗑️ Eliminando archivos obsoletos..."
for FILE in "${REMOVE_FILES[@]}"; do
  if [ -f "$FILE" ]; then
    rm "$FILE"
    echo "  ✔ Eliminado: $FILE"
  fi
done

echo ""
echo "🧩 Consolidando servicios duplicados..."
if [ -f "backend/src/services/searchService.ts" ] && [ -f "backend/src/services/search.ts" ]; then
  echo "  ⚠️ Atención: existen dos servicios de búsqueda."
  echo "  👉 Revisá manualmente cuál querés conservar:"
  echo "     - backend/src/services/search.ts"
  echo "     - backend/src/services/searchService.ts"
fi

echo ""
echo "🧽 Limpieza de código comentado en index.ts (manual)"
echo "  ⚠️ Este paso requiere revisión humana."
echo "  👉 Abrí backend/src/index.ts y eliminá:"
echo "     - Bloque gigante de frontend serving"
echo "     - Diagnósticos de Render"
echo "     - Código legacy comentado"
echo ""

echo "=============================================="
echo "  🎉 Limpieza completada"
echo "  🔄 Si algo salió mal, restaurá desde:"
echo "     $BACKUP_DIR"
echo "=============================================="
