#!/usr/bin/env node

/**
 * Comprehensive Diagnostic Script for servicioshogar.com.ar
 * 
 * This script tests all components of the system to identify exactly
 * what is failing and what information is needed to fix it.
 */

import fs from 'fs';
import path from 'path';

// Use built-in fetch for Node.js 18+ or import node-fetch for older versions
const fetch = globalThis.fetch || (await import('node-fetch')).default;

const URLS = {
  frontend: 'https://servicioshogar.com.ar',
  backend: 'https://servicioshogar-backend.onrender.com',
  backendHealth: 'https://servicioshogar-backend.onrender.com/api/health',
  backendPing: 'https://servicioshogar-backend.onrender.com/api/ping',
  backendServices: 'https://servicioshogar-backend.onrender.com/api/services'
};

const results = {
  timestamp: new Date().toISOString(),
  tests: {},
  summary: {
    workingServices: [],
    failingServices: [],
    unknownServices: []
  },
  recommendations: []
};

console.log('🔍 Diagnóstico Completo de servicioshogar.com.ar');
console.log('================================================\n');

/**
 * Test individual service endpoint
 */
async function testEndpoint(name, url, timeout = 10000) {
  console.log(`📡 Probando ${name}: ${url}`);
  
  const test = {
    url,
    startTime: Date.now(),
    status: 'unknown',
    error: null,
    response: null,
    headers: null,
    responseTime: null
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ServiciosHogar-Diagnostic/1.0'
      }
    });

    clearTimeout(timeoutId);
    test.responseTime = Date.now() - test.startTime;
    test.status = response.status;
    test.headers = Object.fromEntries(response.headers.entries());

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        test.response = await response.json();
      } else {
        const text = await response.text();
        test.response = text.substring(0, 500); // First 500 chars
      }
      
      console.log(`   ✅ ${name}: OK (${test.status}) - ${test.responseTime}ms`);
      results.summary.workingServices.push(name);
    } else {
      console.log(`   ❌ ${name}: HTTP ${test.status} - ${test.responseTime}ms`);
      results.summary.failingServices.push(name);
      test.error = `HTTP ${test.status}`;
    }

  } catch (error) {
    test.responseTime = Date.now() - test.startTime;
    test.error = error.message;
    
    if (error.name === 'AbortError') {
      console.log(`   ⏰ ${name}: Timeout después de ${timeout}ms`);
      test.error = `Timeout after ${timeout}ms`;
    } else if (error.code === 'ENOTFOUND' || error.code === 'EAI_NONAME') {
      console.log(`   🚫 ${name}: DNS no resuelve (${error.code})`);
      test.error = `DNS resolution failed: ${error.code}`;
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`   🔌 ${name}: Conexión rechazada`);
      test.error = 'Connection refused';
    } else if (error.code === 'ECONNRESET') {
      console.log(`   🔄 ${name}: Conexión reseteada`);
      test.error = 'Connection reset';
    } else {
      console.log(`   ❌ ${name}: ${error.message}`);
    }
    
    results.summary.failingServices.push(name);
  }

  results.tests[name] = test;
  return test;
}

/**
 * Check build status
 */
function checkBuildStatus() {
  console.log('🏗️  Verificando estado de builds locales...\n');
  
  const checks = [];
  
  // Frontend build
  const frontendDist = path.join(process.cwd(), 'frontend', 'dist');
  const frontendExists = fs.existsSync(frontendDist);
  const frontendIndexExists = fs.existsSync(path.join(frontendDist, 'index.html'));
  
  checks.push({
    name: 'Frontend Build',
    status: frontendExists && frontendIndexExists ? 'OK' : 'FALTA',
    details: `dist/ exists: ${frontendExists}, index.html exists: ${frontendIndexExists}`
  });

  // Backend build
  const backendDist = path.join(process.cwd(), 'backend', 'dist');
  const backendExists = fs.existsSync(backendDist);
  const backendIndexExists = fs.existsSync(path.join(backendDist, 'index.js'));
  
  checks.push({
    name: 'Backend Build',
    status: backendExists && backendIndexExists ? 'OK' : 'FALTA',
    details: `dist/ exists: ${backendExists}, index.js exists: ${backendIndexExists}`
  });

  // Package.json files
  const rootPackage = fs.existsSync(path.join(process.cwd(), 'package.json'));
  const frontendPackage = fs.existsSync(path.join(process.cwd(), 'frontend', 'package.json'));
  const backendPackage = fs.existsSync(path.join(process.cwd(), 'backend', 'package.json'));
  
  checks.push({
    name: 'Package.json Files',
    status: rootPackage && frontendPackage && backendPackage ? 'OK' : 'FALTA',
    details: `root: ${rootPackage}, frontend: ${frontendPackage}, backend: ${backendPackage}`
  });

  checks.forEach(check => {
    console.log(`   ${check.status === 'OK' ? '✅' : '❌'} ${check.name}: ${check.status}`);
    console.log(`      ${check.details}`);
  });

  results.buildStatus = checks;
  console.log('');
}

/**
 * Test all services
 */
async function runDiagnostics() {
  checkBuildStatus();

  console.log('🌐 Probando conectividad de servicios...\n');

  // Test all endpoints
  await testEndpoint('Frontend Principal', URLS.frontend);
  await testEndpoint('Backend Principal', URLS.backend);
  await testEndpoint('Backend Health', URLS.backendHealth);
  await testEndpoint('Backend Ping', URLS.backendPing);
  await testEndpoint('Backend Services API', URLS.backendServices);

  console.log('\n📊 Resumen de Resultados');
  console.log('========================\n');

  console.log(`✅ Servicios funcionando: ${results.summary.workingServices.length}`);
  results.summary.workingServices.forEach(service => {
    const test = results.tests[service];
    console.log(`   - ${service} (${test.responseTime}ms)`);
  });

  console.log(`\n❌ Servicios con problemas: ${results.summary.failingServices.length}`);
  results.summary.failingServices.forEach(service => {
    const test = results.tests[service];
    console.log(`   - ${service}: ${test.error}`);
  });

  // Generate recommendations
  generateRecommendations();

  console.log('\n💡 Recomendaciones');
  console.log('==================\n');
  results.recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`);
  });

  // Save results to file
  const reportFile = 'diagnostic-report.json';
  fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
  console.log(`\n📋 Reporte completo guardado en: ${reportFile}`);

  return results;
}

/**
 * Generate specific recommendations based on test results
 */
function generateRecommendations() {
  const failing = results.summary.failingServices;
  const working = results.summary.workingServices;

  if (failing.length === 0) {
    results.recommendations.push('🎉 ¡Todos los servicios están funcionando correctamente!');
    return;
  }

  // DNS issues
  const dnsIssues = Object.values(results.tests).filter(test => 
    test.error && (test.error.includes('DNS') || test.error.includes('ENOTFOUND'))
  );

  if (dnsIssues.length > 0) {
    results.recommendations.push(
      '🌐 Problema de DNS detectado. Verificar:\n' +
      '   - ¿Está configurado correctamente el dominio en Hostinger?\n' +
      '   - ¿Están los DNS apuntando a los servidores correctos?\n' +
      '   - ¿Está activo el certificado SSL?'
    );
  }

  // Connection issues
  const connectionIssues = Object.values(results.tests).filter(test =>
    test.error && (test.error.includes('Connection') || test.error.includes('ECONNREFUSED'))
  );

  if (connectionIssues.length > 0) {
    results.recommendations.push(
      '🔌 Problemas de conexión detectados. Verificar:\n' +
      '   - ¿Está el servicio de Render activo y desplegado?\n' +
      '   - ¿Están las variables de entorno configuradas?\n' +
      '   - ¿Está la base de datos de Neon funcionando?'
    );
  }

  // HTTP errors
  const httpErrors = Object.values(results.tests).filter(test =>
    test.status && test.status >= 400
  );

  if (httpErrors.length > 0) {
    results.recommendations.push(
      '⚠️  Errores HTTP detectados. Verificar:\n' +
      '   - Logs de la aplicación en Render\n' +
      '   - Configuración de variables de entorno\n' +
      '   - Estado de la base de datos'
    );
  }

  // Specific service recommendations
  if (failing.includes('Frontend Principal')) {
    results.recommendations.push(
      '🖥️  Frontend no accesible. Verificar:\n' +
      '   - Panel de Hostinger: ¿están subidos los archivos?\n' +
      '   - ¿Está el dominio apuntando correctamente?\n' +
      '   - ¿Está el .htaccess configurado?'
    );
  }

  if (failing.includes('Backend Principal') || failing.includes('Backend Health')) {
    results.recommendations.push(
      '⚙️  Backend no accesible. Verificar:\n' +
      '   - Dashboard de Render: ¿está el servicio activo?\n' +
      '   - ¿Hay errores en los logs de Render?\n' +
      '   - ¿Están configuradas las variables de entorno?'
    );
  }

  // Information needed
  results.recommendations.push(
    '📋 Información específica necesaria:\n' +
    '   1. Acceso al panel de Hostinger para verificar archivos\n' +
    '   2. Acceso al dashboard de Render para ver logs\n' +
    '   3. Acceso a Neon para verificar la base de datos\n' +
    '   4. Configuración actual de DNS del dominio'
  );
}

// Run diagnostics if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDiagnostics().catch(console.error);
}

export { runDiagnostics, testEndpoint };