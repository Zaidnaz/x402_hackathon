import 'dotenv/config';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load from server/.env, server/src/.env, and root .env if present
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server/.env is this project's explicit, canonical config — a value placed
// there should win over a stray OS-level environment variable of the same
// name (dotenv does NOT override existing process.env vars by default,
// which is exactly how a leftover Windows GEMINI_API_KEY placeholder from
// an unrelated project could silently shadow a real key added here).
dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, './.env'), override: true });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * @google/genai silently prefers an ambient GOOGLE_API_KEY environment
 * variable over whatever apiKey is explicitly passed to its constructor. On
 * a machine where both GEMINI_API_KEY and GOOGLE_API_KEY happen to be set
 * (e.g. from an unrelated project), the real GEMINI_API_KEY gets shadowed
 * with zero warning — task output silently falls back to canned text. This
 * runs once at boot, before anything constructs a GoogleGenAI client.
 */
function resolveGeminiEnv(): { active: boolean; reason: string } {
  const isPlaceholder = (v?: string) => {
    if (!v || !v.trim()) return true;
    return /^(your[_-]?api[_-]?key|changeme|xxx+|placeholder|todo)/i.test(v.trim());
  };

  const geminiKey = process.env.GEMINI_API_KEY;
  const googleKey = process.env.GOOGLE_API_KEY;

  if (googleKey && isPlaceholder(googleKey)) {
    delete process.env.GOOGLE_API_KEY;
  } else if (googleKey && !isPlaceholder(geminiKey) && googleKey !== geminiKey) {
    console.warn('[AgentGrid] GEMINI_API_KEY and GOOGLE_API_KEY are both set to different values.');
    console.warn('[AgentGrid] @google/genai would silently prefer GOOGLE_API_KEY — unsetting it for this process so GEMINI_API_KEY (the one this app documents) wins.');
    delete process.env.GOOGLE_API_KEY;
  }

  if (isPlaceholder(process.env.GEMINI_API_KEY)) {
    return {
      active: false,
      reason: process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY is still a placeholder value' : 'GEMINI_API_KEY is not set'
    };
  }
  return { active: true, reason: 'ok' };
}

const geminiStatus = resolveGeminiEnv();

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { tasksRouter } from './routes/tasks.js';
import { marketplaceRouter } from './routes/marketplace.js';
import { ledgerRouter } from './routes/ledger.js';
import { x402DemoRouter } from './routes/x402Demo.js';
import { warehouseRouter } from './routes/warehouse.js';
import { merchantRouter } from './routes/merchant.js';
import { providerRegistry } from './services/providerRegistry.js';

const app = new Hono();

// Explicit origin allowlist + automatic Vercel / Render / localhost support
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use('*', cors({
  origin: (origin) => {
    if (!origin) return '*';
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return origin;
    if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com')) return origin;
    return origin;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'X-Payment-Token',
    'X-402-Payment-Address',
    'X-402-Amount',
    'X-402-Currency',
    'X-402-Network',
    'X-402-Nonce',
    'X-402-Facilitator',
    'X-402-Scheme',
    'PAYMENT-SIGNATURE',
    'PAYMENT-REQUIRED',
    'PAYMENT-RESPONSE'
  ],
  exposeHeaders: [
    'WWW-Authenticate',
    'X-402-Payment-Address',
    'X-402-Amount',
    'X-402-Currency',
    'X-402-Network',
    'X-402-Nonce',
    'X-402-Facilitator',
    'X-402-Scheme',
    'PAYMENT-SIGNATURE',
    'PAYMENT-REQUIRED',
    'PAYMENT-RESPONSE'
  ]
}));

/**
 * Minimal in-process rate limiter. This is a single global sliding window
 * (not per-IP, not distributed) — deliberately simple, but it directly
 * protects the one thing that matters here: the agent wallet's real ALGO
 * balance can't be drained by someone hammering /execute in a loop. A
 * multi-instance production deployment would move this to Redis.
 */
function createRateLimiter(opts: { windowMs: number; max: number }) {
  const hits: number[] = [];
  return async (c: any, next: any) => {
    const now = Date.now();
    while (hits.length && now - hits[0] > opts.windowMs) hits.shift();
    if (hits.length >= opts.max) {
      return c.json({
        success: false,
        error: `Rate limit exceeded (${opts.max} task dispatches per ${opts.windowMs / 1000}s). Please slow down.`
      }, 429);
    }
    hits.push(now);
    await next();
  };
}

const taskRateLimiter = createRateLimiter({ windowMs: 60_000, max: 20 });
app.use('/api/tasks/execute', taskRateLimiter);
app.use('/api/tasks/stream', taskRateLimiter);

// providerRegistry.init() is also awaited in main() below for the normal
// persistent-server case, but that await can't run before a serverless
// platform (Vercel) invokes this module's exported `app` on a cold start.
// init() is memoized, so this is a cheap no-op once warm.
app.use('*', async (c, next) => {
  await providerRegistry.init();
  await next();
});

// Root health check & API metadata
app.get('/', (c) => {
  return c.json({
    name: 'AgentGrid Autonomous AI Infrastructure Marketplace API',
    version: '1.0.0',
    protocol: 'x402-algorand-v1',
    status: 'online',
    geminiLiveEnabled: geminiStatus.active,
    timestamp: Date.now(),
    endpoints: {
      tasks: '/api/tasks',
      marketplace: '/api/marketplace',
      warehouse: '/api/warehouse',
      merchant: '/api/merchant',
      ledger: '/api/ledger',
      x402: '/api/x402/inference/direct-endpoint'
    }
  });
});

// Mount modular sub-routers
app.route('/api/tasks', tasksRouter);
app.route('/api/marketplace', marketplaceRouter);
app.route('/api/warehouse', warehouseRouter);
app.route('/api/merchant', merchantRouter);
app.route('/api/ledger', ledgerRouter);
app.route('/api/x402', x402DemoRouter);

const PORT = Number(process.env.PORT) || 3001;

async function main() {
  await providerRegistry.init();

  console.log(`\n======================================================`);
  console.log(`  ⚡ AgentGrid Autonomous Orchestrator Server Started`);
  console.log(`  🌐 Port: http://localhost:${PORT}`);
  console.log(`  🌍 Allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`  ⛓️  Network: Algorand TestNet (algosdk v3.7)`);
  console.log(`  💳 Protocol: x402 HTTP Payment Standard`);
  console.log(`  🗄️  Persistence: Postgres (Supabase)`);
  console.log(`  🤖 Gemini AI: ${geminiStatus.active ? 'ACTIVE ✅' : `INACTIVE (${geminiStatus.reason}) — falling back to deterministic output`}`);
  console.log(`======================================================\n`);

  if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    serve({
      fetch: app.fetch,
      port: PORT
    });
  }
}

main().catch((err) => {
  console.error('[AgentGrid] Fatal startup error:', err);
  process.exit(1);
});

export { app };
export default app;
