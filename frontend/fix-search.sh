#!/bin/bash

# Extraer las líneas ANTES de useQuery (1-132)
sed -n '1,132p' src/pages/search.tsx > /tmp/search-part1.txt

# Extraer fallbackCategories y fallbackProviders (148-232)
sed -n '148,232p' src/pages/search.tsx > /tmp/search-fallbacks.txt

# Extraer el useQuery y lo que sigue (133-147 + 233 hasta el final)
sed -n '133,147p' src/pages/search.tsx > /tmp/search-usequery.txt
sed -n '233,$p' src/pages/search.tsx > /tmp/search-rest.txt

# Combinar en el orden correcto
cat /tmp/search-part1.txt > src/pages/search.tsx.new
echo "" >> src/pages/search.tsx.new
cat /tmp/search-fallbacks.txt >> src/pages/search.tsx.new
echo "" >> src/pages/search.tsx.new
cat /tmp/search-usequery.txt >> src/pages/search.tsx.new
cat /tmp/search-rest.txt >> src/pages/search.tsx.new

# Reemplazar
mv src/pages/search.tsx.new src/pages/search.tsx

echo "✅ Fix aplicado"
