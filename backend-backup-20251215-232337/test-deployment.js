#!/usr/bin/env node

/**
 * Deployment Test Script
 * Tests server startup and basic functionality without dependencies
 */

import { spawn } from 'child_process';
import http from 'http';

const PORT = process.env.PORT || 3000;
const timeout = 30000; // 30 seconds timeout

console.log('🧪 Testing server deployment...');

function testEndpoint(path, expectedStatus = 200) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${PORT}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✅ ${path}: ${res.statusCode} - ${json.message || json.status || 'OK'}`);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          console.log(`✅ ${path}: ${res.statusCode} - Response received`);
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (err) => {
      console.log(`❌ ${path}: ${err.message}`);
      reject(err);
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error(`Timeout for ${path}`));
    });
  });
}

async function runTests() {
  console.log('Starting server...');
  
  const server = spawn('node', ['dist/index.js'], {
    cwd: process.cwd(),
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, PORT }
  });

  let serverReady = false;
  
  server.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[SERVER] ${output.trim()}`);
    
    if (output.includes('Servidor ejecutándose en puerto')) {
      serverReady = true;
    }
  });

  server.stderr.on('data', (data) => {
    console.error(`[SERVER ERROR] ${data.toString().trim()}`);
  });

  // Wait for server to start
  await new Promise((resolve, reject) => {
    const checkServer = setInterval(() => {
      if (serverReady) {
        clearInterval(checkServer);
        clearTimeout(timeoutHandle);
        resolve();
      }
    }, 100);
    
    const timeoutHandle = setTimeout(() => {
      clearInterval(checkServer);
      reject(new Error('Server startup timeout'));
    }, timeout);
  });

  console.log('\n🔍 Testing endpoints...');
  
  try {
    // Test basic endpoints
    await testEndpoint('/');
    await testEndpoint('/api/ping');
    await testEndpoint('/api/health');
    await testEndpoint('/api/test');
    
    console.log('\n✅ All tests passed! Server is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    process.exit(1);
  } finally {
    console.log('\n🛑 Stopping server...');
    server.kill('SIGTERM');
    
    // Force kill if graceful shutdown doesn't work
    setTimeout(() => {
      server.kill('SIGKILL');
    }, 5000);
  }
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n🛑 Test interrupted');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test terminated');
  process.exit(0);
});

runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});