#!/bin/bash

# Environment Validation Script for ServiciosHogar Backend
# This script checks if all required and optional environment variables are configured

echo "🔍 Validando configuración de variables de entorno..."
echo "=================================================="

# Required variables
REQUIRED_VARS=("DATABASE_URL" "SESSION_SECRET")
MISSING_REQUIRED=()

# Optional variables for full functionality
OPTIONAL_VARS=("SMTP_HOST" "SMTP_USER" "SMTP_PASS" "EMAIL_FROM" "VAPID_PUBLIC_KEY" "VAPID_PRIVATE_KEY" "VAPID_EMAIL")
MISSING_OPTIONAL=()

# Check required variables
echo "🔐 Variables Requeridas:"
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "  ❌ $var - NO CONFIGURADA"
        MISSING_REQUIRED+=("$var")
    else
        echo "  ✅ $var - Configurada"
    fi
done

echo ""

# Check optional variables
echo "📧 Variables Opcionales (para funcionalidad completa):"
for var in "${OPTIONAL_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "  ⚠️  $var - No configurada"
        MISSING_OPTIONAL+=("$var")
    else
        echo "  ✅ $var - Configurada"
    fi
done

echo ""
echo "=================================================="

# Summary
if [ ${#MISSING_REQUIRED[@]} -eq 0 ]; then
    echo "✅ TODAS LAS VARIABLES REQUERIDAS CONFIGURADAS"
    echo "   El servidor funcionará correctamente"
else
    echo "❌ FALTAN VARIABLES REQUERIDAS: ${MISSING_REQUIRED[*]}"
    echo "   El servidor funcionará en modo limitado"
    echo ""
    echo "Para configurar en Render:"
    echo "1. Ve a tu servicio en Render Dashboard"
    echo "2. Click en 'Environment'"
    echo "3. Agrega las variables faltantes"
    echo "4. Redeploy el servicio"
fi

if [ ${#MISSING_OPTIONAL[@]} -eq 0 ]; then
    echo "✅ TODAS LAS VARIABLES OPCIONALES CONFIGURADAS"
    echo "   Funcionalidad completa disponible (email + push notifications)"
else
    echo "📧 Variables opcionales no configuradas: ${MISSING_OPTIONAL[*]}"
    echo "   Email y notificaciones push funcionarán en modo limitado"
fi

echo ""

# Node environment info
if [ -n "$NODE_ENV" ]; then
    echo "🌍 Entorno: $NODE_ENV"
else
    echo "🌍 Entorno: development (por defecto)"
fi

if [ -n "$PORT" ]; then
    echo "🚪 Puerto: $PORT"
else
    echo "🚪 Puerto: 3000 (por defecto)"
fi

echo "=================================================="

# Exit code based on required variables
if [ ${#MISSING_REQUIRED[@]} -eq 0 ]; then
    exit 0
else
    exit 1
fi