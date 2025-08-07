#!/bin/bash

OUTPUT="drizzle_debug_info.txt"

# Función para listar estructura de directorios recursivamente
list_structure() {
    local dir=$1
    local depth=$2
    local indent=$(printf "%${depth}s")
    
    echo "${indent}├── $(basename "$dir")/"
    for item in "$dir"/*; do
        if [ -d "$item" ]; then
            list_structure "$item" $((depth + 4))
        elif [ -f "$item" ]; then
            echo "${indent}│   ├── $(basename "$item")"
        fi
    done
}

# Encabezado
echo "=== DRIZZLE DEBUG INFORMATION ===" > $OUTPUT
echo "Generated on: $(date)" >> $OUTPUT
echo "" >> $OUTPUT

# 1. Estructura completa del proyecto (recursiva)
echo "=== COMPLETE PROJECT STRUCTURE ===" >> $OUTPUT
echo "Base directory: $(pwd)" >> $OUTPUT
echo "" >> $OUTPUT
list_structure "$(pwd)" 0 >> $OUTPUT
echo "" >> $OUTPUT
echo "----------------------------" >> $OUTPUT
echo "" >> $OUTPUT

# 2. Estructura específica de DB/Schemas
echo "=== DB/SCHEMAS STRUCTURE ===" >> $OUTPUT
find . \( -name "*db*" -o -name "*schema*" -o -name "*model*" \) -type d ! -path "*/node_modules/*" ! -path "*/dist/*" -print0 | while IFS= read -r -d $'\0' dir; do
    echo "Directory: $dir" >> $OUTPUT
    ls -lh "$dir" >> $OUTPUT
    echo "" >> $OUTPUT
done
echo "----------------------------" >> $OUTPUT
echo "" >> $OUTPUT

# 3. Archivos de configuración (se mantiene igual)
echo "=== DRIZZLE CONFIG ===" >> $OUTPUT
[ -f drizzle.config.ts ] && cat drizzle.config.ts >> $OUTPUT || echo "drizzle.config.ts not found" >> $OUTPUT
echo "" >> $OUTPUT
echo "----------------------------" >> $OUTPUT
echo "" >> $OUTPUT

# 4. Variables de entorno (se mantiene igual)
echo "=== ENV VARIABLES (SANITIZED) ===" >> $OUTPUT
if [ -f .env ]; then
    grep -E 'DATABASE_URL|DB_|POSTGRES_' .env | sed 's/=.*/=***/' >> $OUTPUT
else
    echo ".env file not found" >> $OUTPUT
fi
echo "----------------------------" >> $OUTPUT
echo "" >> $OUTPUT

# 5. Contenido de archivos de schema (se mantiene igual)
echo "=== SCHEMA FILES CONTENT ===" >> $OUTPUT
SCHEMA_FILES=$(find . -type f \( -name "*schema*.ts" -o -name "*model*.ts" -o -name "relations.ts" \) ! -path "*/node_modules/*" ! -path "*/dist/*")
for file in $SCHEMA_FILES; do
    echo "// FILE: $file" >> $OUTPUT
    cat "$file" >> $OUTPUT
    echo "" >> $OUTPUT
    echo "----------------------------" >> $OUTPUT
    echo "" >> $OUTPUT
done

# 6. Dependencias (se mantiene igual)
echo "=== RELEVANT DEPENDENCIES ===" >> $OUTPUT
if [ -f package.json ]; then
    grep -E '"drizzle|"pg|"dotenv|"mysql2' package.json >> $OUTPUT
else
    echo "package.json not found" >> $OUTPUT
fi
echo "----------------------------" >> $OUTPUT

echo "=== COLLECTION COMPLETE ===" >> $OUTPUT
echo "Please review the file $OUTPUT and remove any sensitive information before sharing"
