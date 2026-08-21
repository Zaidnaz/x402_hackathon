import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { tasksRouter } from './routes/tasks.js';
import { marketplaceRouter } from './routes/marketplace.js';
import { ledgerRouter } from './routes/ledger.js';
import { x402DemoRouter } from './routes/x402Demo.js';

const app = new Hono();

// Global CORS Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Payment-Token', 
    'X-402-Payment-Address', 
    'X-402-Amount', 
    'X-402-Currency', 
    'X-402-Network', 
    'X-402-Nonce'
  ],
  exposeHeaders: [
    'WWW-Authenticate', 
    'X-402-Payment-Address', 
    'X-402-Amount', 
    'X-402-Currency', 
    'X-402-Network', 
    'X-402-Nonce'
  ]
}));

// Root health check & API metadata
app.get('/', (c) => {
  return c.json({
    name: 'AgentGrid Autonomous AI Infrastructure Marketplace API',
    version: '1.0.0',
    protocol: 'x402-algorand-v1',
    status: 'online',
    timestamp: Date.now(),
    endpoints: {
      tasks: '/api/tasks',
      marketplace: '/api/marketplace',
      ledger: '/api/ledger',
      x402: '/api/x402/inference/direct-endpoint'
    }
  });
});

// Mount modular sub-routers
app.route('/api/tasks', tasksRouter);
app.route('/api/marketplace', marketplaceRouter);
app.route('/api/ledger', ledgerRouter);
app.route('/api/x402', x402DemoRouter);

const PORT = 3001;

console.log(`\n======================================================`);
console.log(`  ⚡ AgentGrid Autonomous Orchestrator Server Started`);
console.log(`  🌐 Port: http://localhost:${PORT}`);
console.log(`  ⛓️  Network: Algorand TestNet (algosdk v3.1)`);
console.log(`  💳 Protocol: x402 HTTP Payment Standard`);
console.log(`======================================================\n`);

serve({
  fetch: app.fetch,
  port: PORT
});
