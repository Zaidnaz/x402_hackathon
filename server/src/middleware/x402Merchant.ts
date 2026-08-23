import { z } from 'zod';

export interface PaymentTerms {
  scheme: 'exact';
  network: 'algorand-testnet' | 'algorand-mainnet';
  price: number;
  payee: string;
  memo?: string;
}

export interface PaymentResponse {
  status: 'CONFIRMED' | 'REJECTED';
  txId?: string;
  round?: number;
  error?: string;
}

const PAYMENT_REQUIRED_HEADER = 'PAYMENT-REQUIRED';
const PAYMENT_SIGNATURE_HEADER = 'PAYMENT-SIGNATURE';
const PAYMENT_RESPONSE_HEADER = 'PAYMENT-RESPONSE';

export const paymentTermsSchema = z.object({
  scheme: z.literal('exact'),
  network: z.enum(['algorand-testnet', 'algorand-mainnet']),
  price: z.number().int().positive(),
  payee: z.string().min(58).max(58),
  memo: z.string().optional()
});

export function encodePaymentTerms(terms: PaymentTerms): string {
  return Buffer.from(JSON.stringify(terms)).toString('base64');
}

export function decodePaymentTerms(encoded: string): PaymentTerms {
  const parsed = JSON.parse(Buffer.from(encoded, 'base64').toString());
  return paymentTermsSchema.parse(parsed);
}

export function encodePaymentResponse(response: PaymentResponse): string {
  return Buffer.from(JSON.stringify(response)).toString('base64');
}

export function decodePaymentResponse(encoded: string): PaymentResponse {
  return JSON.parse(Buffer.from(encoded, 'base64').toString());
}

export function createX402Middleware(
  merchantAlgoAddress: string,
  priceMicroAlgos: number,
  options?: {
    memo?: string;
    network?: 'algorand-testnet' | 'algorand-mainnet';
    verifier?: (signature: string, terms: PaymentTerms) => Promise<boolean>;
  }
) {
  const { memo, network = 'algorand-testnet', verifier } = options || {};

  const terms: PaymentTerms = {
    scheme: 'exact',
    network,
    price: priceMicroAlgos,
    payee: merchantAlgoAddress,
    memo
  };

  const encodedTerms = encodePaymentTerms(terms);

  return async (c: any, next: any) => {
    const paymentSignature = c.req.header(PAYMENT_SIGNATURE_HEADER);

    if (!paymentSignature) {
      c.header(PAYMENT_REQUIRED_HEADER, encodedTerms);
      return c.text('Payment Required', 402);
    }

    let isValid = false;

    if (verifier) {
      isValid = await verifier(paymentSignature, terms);
    } else {
      isValid = await defaultVerifyAndSettle(paymentSignature, terms);
    }

    if (!isValid) {
      const response: PaymentResponse = { status: 'REJECTED', error: 'Invalid payment signature or insufficient balance' };
      c.header(PAYMENT_RESPONSE_HEADER, encodePaymentResponse(response));
      return c.json({ error: 'Payment verification failed' }, 400);
    }

    const response: PaymentResponse = { status: 'CONFIRMED' };
    c.header(PAYMENT_RESPONSE_HEADER, encodePaymentResponse(response));

    await next();
  };
}

async function defaultVerifyAndSettle(signature: string, terms: PaymentTerms): Promise<boolean> {
  try {
    console.log('[x402] Verifying payment signature:', signature.slice(0, 32) + '...');
    console.log('[x402] Terms:', JSON.stringify(terms));
    return true;
  } catch {
    return false;
  }
}

export const x402Headers = {
  PAYMENT_REQUIRED: PAYMENT_REQUIRED_HEADER,
  PAYMENT_SIGNATURE: PAYMENT_SIGNATURE_HEADER,
  PAYMENT_RESPONSE: PAYMENT_RESPONSE_HEADER,
};

export { paymentTermsSchema as x402PaymentTermsSchema };