import { Router } from 'express';
import net from 'net';

const router = Router();

function testPort(host: string, port: number): Promise<{ success: boolean; time: number; error?: string }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    
    socket.setTimeout(5000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve({ success: true, time: Date.now() - start });
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve({ success: false, time: Date.now() - start, error: 'TIMEOUT' });
    });
    
    socket.on('error', (err: any) => {
      socket.destroy();
      resolve({ success: false, time: Date.now() - start, error: err.code || err.message });
    });
    
    socket.connect(port, host);
  });
}

router.get('/test-ports', async (req, res) => {
  console.log('🔍 Testeando conectividad de puertos...');
  
  const tests = [
    { name: 'SMTP Zoho 587', host: 'smtp.zoho.com', port: 587 },
    { name: 'SMTP Zoho 465', host: 'smtp.zoho.com', port: 465 },
    { name: 'SMTP Zoho 25', host: 'smtp.zoho.com', port: 25 },
    { name: 'HTTPS Google', host: 'google.com', port: 443 },
    { name: 'HTTP Google', host: 'google.com', port: 80 },
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await testPort(test.host, test.port);
    results.push({
      name: test.name,
      host: test.host,
      port: test.port,
      ...result,
    });
    console.log(`${result.success ? '✅' : '❌'} ${test.name}: ${result.success ? 'OK' : result.error} (${result.time}ms)`);
  }
  
  res.json({ results });
});

export default router;
