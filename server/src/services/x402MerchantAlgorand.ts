import algosdk from 'algosdk';
import { PaymentTerms, PaymentResponse, encodePaymentResponse } from '../middleware/x402Merchant.js';

const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';

export interface MerchantWalletConfig {
  address: string;
  privateKey?: Uint8Array;
  mnemonic?: string;
}

interface DecodedSignedTransaction {
  txn: {
    type: string;
    receiver?: { toString: () => string };
    amount?: bigint | number;
    fee?: bigint | number;
    genesisID?: string;
    [key: string]: any;
  };
}

function getAmountValue(amount: bigint | number | undefined): number {
  if (amount === undefined) return 0;
  return typeof amount === 'bigint' ? Number(amount) : amount;
}

function getFeeValue(fee: bigint | number | undefined): number {
  if (fee === undefined) return 0;
  return typeof fee === 'bigint' ? Number(fee) : fee;
}

export async function verifyAlgorandPayment(
  signedTxnBase64: string,
  expectedTerms: PaymentTerms,
  merchantConfig: MerchantWalletConfig
): Promise<{ verified: boolean; txId?: string; round?: number; error?: string }> {
  try {
    const algod = new algosdk.Algodv2('', ALGOD_SERVER, '');
    
    const signedTxnBytes = Buffer.from(signedTxnBase64, 'base64');
    const decodedTxn = algosdk.decodeSignedTransaction(signedTxnBytes) as DecodedSignedTransaction;
    const txn = decodedTxn.txn;

    if (txn.type !== 'pay') {
      return { verified: false, error: 'Transaction must be a payment transaction' };
    }

    const receiverAddr = txn.receiver?.toString();
    if (receiverAddr !== expectedTerms.payee) {
      return { verified: false, error: `Payment receiver mismatch. Expected ${expectedTerms.payee}, got ${receiverAddr || 'unknown'}` };
    }

    const amount = getAmountValue(txn.amount);
    if (amount !== expectedTerms.price) {
      return { verified: false, error: `Payment amount mismatch. Expected ${expectedTerms.price} µALGO, got ${amount}` };
    }

    if (expectedTerms.network === 'algorand-testnet' && txn.genesisID !== 'testnet-v1.0') {
      return { verified: false, error: 'Transaction must be for Algorand TestNet' };
    }

    const suggestedParams = await algod.getTransactionParams().do();
    const maxFee = (suggestedParams as any).maxFee ?? (suggestedParams as any).fee ?? 10000;
    const txnFee = getFeeValue(txn.fee);
    if (txnFee > maxFee * 2) {
      return { verified: false, error: 'Transaction fee exceeds reasonable maximum' };
    }

    const sendResult = await algod.sendRawTransaction(signedTxnBytes).do();
    const txId = (sendResult as any).txId ?? (sendResult as any).txid ?? '';
    
    if (!txId) {
      return { verified: false, error: 'Transaction submitted but no txId returned' };
    }
    
    const confirmed = await algosdk.waitForConfirmation(algod, txId, 4);
    
    return { 
      verified: true, 
      txId, 
      round: Number(confirmed.confirmedRound) 
    };
  } catch (error: any) {
    return { verified: false, error: error.message || 'Verification failed' };
  }
}

export async function merchantSettleAndExecute(
  c: any,
  merchantConfig: MerchantWalletConfig,
  expectedTerms: PaymentTerms,
  executeWorkload: (body: any) => Promise<any>
) {
  const paymentSignature = c.req.header('PAYMENT-SIGNATURE');

  if (!paymentSignature) {
    const encodedTerms = Buffer.from(JSON.stringify(expectedTerms)).toString('base64');
    c.header('PAYMENT-REQUIRED', encodedTerms);
    return c.text('Payment Required', 402);
  }

  const verification = await verifyAlgorandPayment(paymentSignature, expectedTerms, merchantConfig);

  if (!verification.verified) {
    const response: PaymentResponse = { 
      status: 'REJECTED', 
      error: verification.error 
    };
    c.header('PAYMENT-RESPONSE', encodePaymentResponse(response));
    return c.json({ error: verification.error }, 400);
  }

  const response: PaymentResponse = { 
    status: 'CONFIRMED', 
    txId: verification.txId,
    round: verification.round
  };
  c.header('PAYMENT-RESPONSE', encodePaymentResponse(response));

  try {
    const body = await c.req.json();
    const result = await executeWorkload(body);
    return c.json({ status: 'SUCCESS', output: result, txId: verification.txId, round: verification.round });
  } catch (error: any) {
    return c.json({ error: 'Workload execution failed', details: error.message }, 500);
  }
}

export function createMerchantMiddleware(
  merchantConfig: MerchantWalletConfig,
  priceMicroAlgos: number,
  executeWorkload: (body: any) => Promise<any>,
  options?: { memo?: string; network?: 'algorand-testnet' | 'algorand-mainnet' }
) {
  const { memo, network = 'algorand-testnet' } = options || {};

  const terms: PaymentTerms = {
    scheme: 'exact',
    network,
    price: priceMicroAlgos,
    payee: merchantConfig.address,
    memo
  };

  return async (c: any, next: any) => {
    return merchantSettleAndExecute(c, merchantConfig, terms, executeWorkload);
  };
}