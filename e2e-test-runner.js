#!/usr/bin/env node

/**
 * End-to-End Payment System Test Runner
 * ServiciosHogar.com.ar
 */

const scenarios = ['bank_transfer', 'cash', 'mercadopago'];
const baseUrl = 'http://localhost:5000';

async function runTest(scenario) {
  console.log(`\n🧪 Testing ${scenario.toUpperCase()}...`);
  
  try {
    const response = await fetch(`${baseUrl}/api/test-e2e-payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scenario })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log(`✅ ${scenario} - SUCCESS`);
      result.results.tests.forEach(test => {
        const emoji = test.status === 'PASSED' ? '✅' : test.status === 'FAILED' ? '❌' : '⏭️';
        console.log(`  ${emoji} ${test.test}: ${test.status}`);
        if (test.details) {
          console.log(`     💰 Amount: $${test.details.amount} ARS`);
          console.log(`     🏦 Platform Fee: $${test.details.platformFee} ARS`);
          console.log(`     👷 Provider Amount: $${test.details.providerAmount} ARS`);
        }
        if (test.initPoint) {
          console.log(`     🔗 Mercado Pago URL: ${test.initPoint}`);
        }
      });
    } else {
      console.log(`❌ ${scenario} - FAILED: ${result.message}`);
    }
    
    return result;
  } catch (error) {
    console.log(`❌ ${scenario} - ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 ServiciosHogar.com.ar - Payment System E2E Tests');
  console.log('=====================================================');
  
  const results = {};
  
  for (const scenario of scenarios) {
    results[scenario] = await runTest(scenario);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
  }
  
  console.log('\n📊 SUMMARY');
  console.log('===========');
  
  let passed = 0;
  let failed = 0;
  
  scenarios.forEach(scenario => {
    const result = results[scenario];
    if (result.success) {
      passed++;
      console.log(`✅ ${scenario}`);
    } else {
      failed++;
      console.log(`❌ ${scenario}`);
    }
  });
  
  console.log(`\nTotal: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('\n🎉 All payment systems working correctly!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the details above.');
  }
}

// Run if called directly
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests, runTest };