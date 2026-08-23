import { Hono } from 'hono';
import { z } from 'zod';
import { 
  createMerchantMiddleware, 
  MerchantWalletConfig,
  verifyAlgorandPayment 
} from '../services/x402MerchantAlgorand.js';
import { PaymentTerms, decodePaymentTerms } from '../middleware/x402Merchant.js';

const merchantRouter = new Hono();

interface ComputeWorkload {
  prompt: string;
  model?: string;
  maxTokens?: number;
}

const workloadSchema = z.object({
  prompt: z.string().min(1).max(4000),
  model: z.string().optional(),
  maxTokens: z.number().int().positive().max(8192).optional()
});

const MERCHANT_DEMO_CONFIG: MerchantWalletConfig = {
  address: process.env.MERCHANT_DEMO_ADDRESS || 'GYFODB2Y6V4D4OQYF7F7X6Q2J7K9P3M2L8V1T6R7Q5W4E9Z2Y7U8I1O3P5',
  mnemonic: process.env.MERCHANT_DEMO_MNEMONIC
};

const DEMO_PRICE_MICRO_ALGOS = 500000; // 0.5 ALGO

const executeComputeWorkload = async (workload: ComputeWorkload): Promise<any> => {
  const { prompt, model = 'qwen-2.5-7b', maxTokens = 1024 } = workload;
  
  console.log(`[Merchant] Executing workload: ${model} for prompt (${prompt.length} chars)`);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    model,
    prompt: prompt.slice(0, 100) + '...',
    output: `Generated response for: "${prompt.slice(0, 50)}..." using ${model} with max ${maxTokens} tokens. This is a demo execution from a P2P GPU node.`,
    tokensGenerated: Math.min(maxTokens, prompt.length + 200),
    completedAt: Date.now()
  };
};

const paymentTerms: PaymentTerms = {
  scheme: 'exact',
  network: 'algorand-testnet',
  price: DEMO_PRICE_MICRO_ALGOS,
  payee: MERCHANT_DEMO_CONFIG.address,
  memo: 'AgentGrid x402 demo compute'
};

merchantRouter.post('/compute/run', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = workloadSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ error: 'Invalid workload', details: parsed.error.issues }, 400);
  }

  return createMerchantMiddleware(
    MERCHANT_DEMO_CONFIG,
    DEMO_PRICE_MICRO_ALGOS,
    executeComputeWorkload,
    { memo: paymentTerms.memo, network: paymentTerms.network }
  )(c, async () => {});
});

merchantRouter.get('/compute/terms', (c) => {
  const encodedTerms = Buffer.from(JSON.stringify(paymentTerms)).toString('base64');
  c.header('PAYMENT-REQUIRED', encodedTerms);
  return c.json({
    terms: paymentTerms,
    encodedTerms,
    endpoint: '/api/merchant/compute/run',
    instructions: {
      step1: 'GET this endpoint to receive payment terms',
      step2: 'Sign transaction with Pera Wallet or agent key',
      step3: 'POST to /api/merchant/compute/run with PAYMENT-SIGNATURE header',
      step4: 'Receive 200 OK with execution result + PAYMENT-RESPONSE header'
    }
  });
});

merchantRouter.post('/compute/verify-payment', async (c) => {
  const paymentSignature = c.req.header('PAYMENT-SIGNATURE');
  
  if (!paymentSignature) {
    const encodedTerms = Buffer.from(JSON.stringify(paymentTerms)).toString('base64');
    c.header('PAYMENT-REQUIRED', encodedTerms);
    return c.text('Payment Required', 402);
  }

  const verification = await verifyAlgorandPayment(paymentSignature, paymentTerms, MERCHANT_DEMO_CONFIG);
  
  if (!verification.verified) {
    return c.json({ verified: false, error: verification.error }, 400);
  }
  
  return c.json({ 
    verified: true, 
    txId: verification.txId, 
    round: verification.round 
  });
});

export { merchantRouter };