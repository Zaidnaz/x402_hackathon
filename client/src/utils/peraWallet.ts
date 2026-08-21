import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';
import { Buffer } from 'buffer';

if (typeof window !== 'undefined' && !(window as any).Buffer) {
  (window as any).Buffer = Buffer;
}

// Algorand TestNet Public Node (Algonode)
export const TESTNET_ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
export const TESTNET_INDEXER_SERVER = 'https://testnet-idx.algonode.cloud';
export const TESTNET_DISPENSER_URL = 'https://bank.testnet.algorand.network/';
export const GOPLAUSIBLE_FACILITATOR_URL = 'https://facilitator.goplausible.xyz';

export const algodClient = new algosdk.Algodv2('', TESTNET_ALGOD_SERVER, '');

// Initialize Pera Wallet Connect instance (ChainId 416002 = TestNet)
export const peraWallet = new PeraWalletConnect({
  chainId: 416002, // TestNet
  shouldShowSignTxnToast: true,
  compactMode: false
});

/**
 * Connect to Pera Wallet (QR Code or Web/Extension)
 */
export async function connectPeraWallet(): Promise<string> {
  try {
    if (peraWallet.isConnected) {
      await peraWallet.disconnect().catch(() => {});
    }

    const accounts = await peraWallet.connect();
    
    peraWallet.connector?.on('disconnect', () => {
      console.log('Pera wallet disconnected');
    });

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts selected in Pera Wallet');
    }

    return accounts[0];
  } catch (error: any) {
    if (error?.data?.type === 'CONNECT_MODAL_CLOSED') {
      console.log('User closed Pera connection modal');
      throw new Error('Pera connection modal closed');
    }
    console.error('Pera Wallet connection error:', error);
    throw error;
  }
}

/**
 * Reconnect to existing session on reload
 */
export async function reconnectPeraSession(): Promise<string | null> {
  try {
    const accounts = await peraWallet.reconnectSession();
    if (accounts && accounts.length > 0) {
      peraWallet.connector?.on('disconnect', () => {
        console.log('Pera wallet disconnected');
      });
      return accounts[0];
    }
    return null;
  } catch (error) {
    console.warn('Reconnect session notice:', error);
    return null;
  }
}

/**
 * Disconnect current Pera session
 */
export async function disconnectPeraWallet(): Promise<void> {
  try {
    await peraWallet.disconnect();
  } catch (error) {
    console.error('Disconnect error:', error);
  }
}

/**
 * Fetch live account balance in ALGO from TestNet
 */
export async function fetchLiveTestnetBalance(address: string): Promise<number> {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    const microAlgos = Number(accountInfo.amount || 0);
    return microAlgos / 1_000_000;
  } catch (error) {
    console.warn(`Could not fetch live balance for ${address}:`, error);
    return 0;
  }
}

/**
 * Signs and submits a real on-chain transaction on Algorand TestNet via Pera Wallet!
 * Provides direct verification URLs for both Lora Explorer (lora.algokit.io) and Pera Explorer.
 */
export async function sendPeraTestnetPayment({
  senderAddress,
  receiverAddress,
  amountAlgo,
  noteText
}: {
  senderAddress: string;
  receiverAddress: string;
  amountAlgo: number;
  noteText: string;
}): Promise<{ txId: string; round: number; explorerUrl: string; loraUrl: string }> {
  try {
    // 1. Get live suggested parameters from TestNet Algod node
    const suggestedParams = await algodClient.getTransactionParams().do();

    const microAlgos = Math.max(1000, Math.round(amountAlgo * 1_000_000));
    const enc = new TextEncoder();
    const note = enc.encode(noteText);

    // 2. Construct payment transaction object using algosdk
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: senderAddress,
      receiver: receiverAddress,
      amount: microAlgos,
      note,
      suggestedParams
    });

    // 3. Request Pera Wallet signature (opens modal / triggers mobile push)
    const singleTxnGroup = [{ txn, signers: [senderAddress] }];
    const signedTxns = await peraWallet.signTransaction([singleTxnGroup]);

    // 4. Send raw signed transaction to Algorand TestNet
    const sendResponse = await algodClient.sendRawTransaction(signedTxns).do();
    const txId = sendResponse.txid || txn.txID();

    // 5. Wait for confirmation on Algorand TestNet (usually ~2.8s)
    const confirmedTxn: any = await algosdk.waitForConfirmation(algodClient, txId, 4);
    const confirmedRound = Number(confirmedTxn.confirmedRound || confirmedTxn['confirmed-round'] || 0);

    const explorerUrl = `https://testnet.explorer.perawallet.app/tx/${txId}`;
    const loraUrl = `https://lora.algokit.io/testnet/transaction/${txId}`;

    return {
      txId,
      round: confirmedRound,
      explorerUrl,
      loraUrl
    };
  } catch (error: any) {
    console.error('Pera transaction error:', error);
    throw error;
  }
}
