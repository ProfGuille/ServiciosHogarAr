#!/usr/bin/env node

/**
 * Deployment Validation Script
 * This script validates that the deployment is working correctly
 */

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

console.log('🔍 Starting deployment validation...\n');

// Check if required files exist
const requiredFiles = [
  'frontend/package.json',
  'backend/package.json',
  'render.yaml'
];

console.log('📁 Checking required files...');
for (const file of requiredFiles) {
  if (!existsSync(file)) {
    console.error(`❌ Missing required file: ${file}`);
    process.exit(1);
  }
  console.log(`✅ ${file}`);
}

// Function to run command and capture output
function runCommand(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const proc = spawn(cmd, args, { 
      cwd, 
      stdio: ['pipe', 'pipe', 'pipe'] 
    });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      }
    });
  });
}

async function validateDeployment() {
  try {
    console.log('\n🔧 Testing build process...');
    
    // Test frontend build
    console.log('📦 Building frontend...');
    await runCommand('npm ci', 'frontend');
    await runCommand('npm run build', 'frontend');
    console.log('✅ Frontend build successful');
    
    // Test backend build  
    console.log('📦 Building backend...');
    await runCommand('npm ci', 'backend');
    await runCommand('npm run build', 'backend');
    console.log('✅ Backend build successful');
    
    // Copy frontend to backend
    console.log('📋 Copying frontend to backend...');
    await runCommand('cp -r ../frontend/dist ./frontend-dist', 'backend');
    console.log('✅ Frontend copied to backend');
    
    // Check if built files exist
    const builtFiles = [
      'frontend/dist/index.html',
      'backend/dist/index.js',
      'backend/frontend-dist/index.html'
    ];
    
    console.log('\n📂 Checking built files...');
    for (const file of builtFiles) {
      if (!existsSync(file)) {
        throw new Error(`Built file missing: ${file}`);
      }
      console.log(`✅ ${file}`);
    }
    
    console.log('\n🚀 Testing server startup...');
    
    // Start server in background for testing
    const serverProc = spawn('node', ['dist/index.js'], {
      cwd: 'backend',
      env: { ...process.env, NODE_ENV: 'production', PORT: '3001' },
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Give server time to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Test health endpoint
    try {
      const { stdout } = await runCommand('curl -s http://localhost:3001/api/health');
      const health = JSON.parse(stdout);
      
      if (health.status === 'ok') {
        console.log('✅ Health endpoint working');
      } else {
        throw new Error('Health endpoint returned non-ok status');
      }
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
    
    // Test frontend serving
    try {
      await runCommand('curl -s -f http://localhost:3001/');
      console.log('✅ Frontend serving working');
    } catch (error) {
      throw new Error('Frontend serving failed');
    }
    
    // Kill server
    serverProc.kill();
    
    console.log('\n🎉 All validation checks passed!');
    console.log('✨ Deployment should work correctly on Render');
    
  } catch (error) {
    console.error(`\n❌ Validation failed: ${error.message}`);
    process.exit(1);
  }
}

validateDeployment();