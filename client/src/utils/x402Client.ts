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

function base64Decode(encoded: string): string {
  return atob(encoded);
}

function base64Encode(str: string): string {
  return btoa(str);
}

export function decodePaymentTerms(encoded: string): PaymentTerms {
  return JSON.parse(base64Decode(encoded));
}

export function decodePaymentResponse(encoded: string): PaymentResponse {
  return JSON.parse(base64Decode(encoded));
}

export interface X402ClientOptions {
  signTransaction: (terms: PaymentTerms) => Promise<string>;
  maxRetries?: number;
}

export interface X402FetchOptions extends RequestInit {
  x402?: X402ClientOptions;
}

export async function signWithAgentWallet(terms: PaymentTerms): Promise<string> {
  const res = await fetch('/api/x402/agent-sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(terms)
  });
  if (!res.ok) throw new Error('Agent wallet signing failed');
  const data = await res.json();
  return data.signature;
}

export async function fetchWithX402(
  url: string,
  options: X402FetchOptions = {}
): Promise<Response> {
  const { x402, ...fetchOptions } = options;
  const signFn = x402?.signTransaction || signWithAgentWallet;
  const maxRetries = x402?.maxRetries ?? 1;
  
  let attempt = 0;
  let lastResponse: Response;

  while (attempt <= maxRetries) {
    const headers = new Headers(fetchOptions.headers);
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers
    });

    lastResponse = response;

    if (response.status !== 402) {
      return response;
    }

    const paymentRequiredHeader = response.headers.get(PAYMENT_REQUIRED_HEADER);
    if (!paymentRequiredHeader) {
      return response;
    }

    try {
      const terms = decodePaymentTerms(paymentRequiredHeader);
      const signature = await signFn(terms);
      
      headers.set(PAYMENT_SIGNATURE_HEADER, signature);
      
      fetchOptions.headers = headers;
      attempt++;
    } catch (error) {
      console.error('[x402 Client] Signing failed:', error);
      return response;
    }
  }

  return lastResponse!;
}

export async function executeX402Payment(
  terms: PaymentTerms,
  signFn: (terms: PaymentTerms) => Promise<string>
): Promise<PaymentResponse> {
  const signature = await signFn(terms);
  
  const response = await fetch(terms.payee, {
    method: 'POST',
    headers: {
      [PAYMENT_SIGNATURE_HEADER]: signature
    }
  });
  
  const paymentResponseHeader = response.headers.get(PAYMENT_RESPONSE_HEADER);
  if (paymentResponseHeader) {
    return decodePaymentResponse(paymentResponseHeader);
  }
  
  return { status: 'REJECTED', error: 'No payment response from merchant' };
}

export { PAYMENT_REQUIRED_HEADER, PAYMENT_SIGNATURE_HEADER, PAYMENT_RESPONSE_HEADER };