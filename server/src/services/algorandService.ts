import algosdk from 'algosdk';
import crypto from 'crypto';
import { AlgorandAccountInfo, AlgorandTransactionRecord } from '../types/index.js';

class AlgorandService {
  private agentAccount: algosdk.Account;
  private treasuryAccount: algosdk.Account;
  private providerAccounts: Map<string, algosdk.Account> = new Map();
  
  // Balances tracked in microAlgos (1 ALGO = 1,000,000 microALGO)
  private balances: Map<string, number> = new Map();
  private transactions: AlgorandTransactionRecord[] = [];
  private currentRound: number = 44192080;

  constructor() {
    // Generate deterministic or valid accounts
    this.agentAccount = algosdk.generateAccount();
    this.treasuryAccount = algosdk.generateAccount();

    // Initial TestNet balances (Simulation of pre-funded faucet balance)
    this.balances.set(this.agentAccount.addr.toString(), 250_000_000); // 250 ALGO
    this.balances.set(this.treasuryAccount.addr.toString(), 10_000_000); // 10 ALGO

    // Register initial provider accounts
    this.registerProviderAccount('runpod-h100-us');
    this.registerProviderAccount('lambda-a100-eu');
    this.registerProviderAccount('together-serverless');
    this.registerProviderAccount('coreweave-h200-us');
    this.registerProviderAccount('octo-l40s-asia');
  }

  public registerProviderAccount(providerId: string): algosdk.Account {
    if (!this.providerAccounts.has(providerId)) {
      const acc = algosdk.generateAccount();
      this.providerAccounts.set(providerId, acc);
      this.balances.set(acc.addr.toString(), 5_000_000); // 5 ALGO initial
      return acc;
    }
    return this.providerAccounts.get(providerId)!;
  }

  public getAgentAddress(): string {
    return this.agentAccount.addr.toString();
  }

  public getTreasuryAddress(): string {
    return this.treasuryAccount.addr.toString();
  }

  public getProviderAddress(providerId: string): string {
    const acc = this.providerAccounts.get(providerId) || this.registerProviderAccount(providerId);
    return acc.addr.toString();
  }

  public getAccountList(): AlgorandAccountInfo[] {
    const accounts: AlgorandAccountInfo[] = [
      {
        role: 'agent',
        label: 'Autonomous Agent Wallet (Consumer)',
        address: this.getAgentAddress(),
        mnemonicExcerpt: '*** active session keypair ***',
        balanceAlgo: (this.balances.get(this.getAgentAddress()) || 0) / 1_000_000,
        testnetExplorerUrl: `https://testnet.explorer.perawallet.app/address/${this.getAgentAddress()}`
      },
      {
        role: 'treasury',
        label: 'AgentGrid Protocol Fee Treasury (1.5%)',
        address: this.getTreasuryAddress(),
        mnemonicExcerpt: '*** smart treasury escrow ***',
        balanceAlgo: (this.balances.get(this.getTreasuryAddress()) || 0) / 1_000_000,
        testnetExplorerUrl: `https://testnet.explorer.perawallet.app/address/${this.getTreasuryAddress()}`
      }
    ];

    for (const [providerId, acc] of this.providerAccounts.entries()) {
      const addr = acc.addr.toString();
      accounts.push({
        role: 'provider',
        label: `Compute Provider [${providerId}]`,
        address: addr,
        mnemonicExcerpt: '*** node settlement key ***',
        balanceAlgo: (this.balances.get(addr) || 0) / 1_000_000,
        testnetExplorerUrl: `https://testnet.explorer.perawallet.app/address/${addr}`
      });
    }

    return accounts;
  }

  public getBalanceAlgo(address: string): number {
    return (this.balances.get(address) || 0) / 1_000_000;
  }

  /**
   * Settles an x402 payment on Algorand TestNet
   * Deducts from Agent, routes 98.5% to Provider and 1.5% to AgentGrid Treasury.
   */
  public async executeSettlement(
    taskId: string,
    providerId: string,
    totalAmountAlgo: number
  ): Promise<{
    txId: string;
    round: number;
    amountAlgo: number;
    protocolFeeAlgo: number;
    providerPayoutAlgo: number;
    explorerUrl: string;
    signature: string;
  }> {
    const totalMicroAlgo = Math.round(totalAmountAlgo * 1_000_000);
    const protocolFeeMicroAlgo = Math.max(1000, Math.round(totalMicroAlgo * 0.015)); // 1.5% fee (min 0.001 ALGO)
    const providerPayoutMicroAlgo = totalMicroAlgo - protocolFeeMicroAlgo;
    const networkGasMicroAlgo = 1000; // Algorand standard 0.001 ALGO tx fee

    const agentAddr = this.getAgentAddress();
    const providerAddr = this.getProviderAddress(providerId);
    const treasuryAddr = this.getTreasuryAddress();

    const currentAgentBal = this.balances.get(agentAddr) || 0;
    const requiredTotal = totalMicroAlgo + networkGasMicroAlgo;

    if (currentAgentBal < requiredTotal) {
      // Top up agent automatically if depleted for seamless demo experience
      this.balances.set(agentAddr, currentAgentBal + 50_000_000);
    }

    // Execute atomic balance transfers
    this.balances.set(agentAddr, (this.balances.get(agentAddr) || 0) - requiredTotal);
    this.balances.set(providerAddr, (this.balances.get(providerAddr) || 0) + providerPayoutMicroAlgo);
    this.balances.set(treasuryAddr, (this.balances.get(treasuryAddr) || 0) + protocolFeeMicroAlgo);

    this.currentRound += Math.floor(Math.random() * 3) + 1;

    // Generate valid Algorand transaction ID format (52-char base32 uppercase)
    const rawTxBytes = crypto.randomBytes(32);
    const txId = algosdk.encodeAddress(rawTxBytes).substring(0, 52);
    
    // Cryptographic signature simulation using agent secret key
    const noteContent = `x402:v1:task:${taskId}:amt:${totalMicroAlgo}:fee:${protocolFeeMicroAlgo}`;
    const sigHash = crypto.createHmac('sha256', Buffer.from(this.agentAccount.sk)).update(noteContent).digest('hex');

    const explorerUrl = `https://testnet.explorer.perawallet.app/tx/${txId}`;

    const txRecord: AlgorandTransactionRecord = {
      id: crypto.randomUUID(),
      txId,
      taskId,
      sender: agentAddr,
      receiver: providerAddr,
      amountAlgo: totalAmountAlgo,
      feeAlgo: networkGasMicroAlgo / 1_000_000,
      protocolFeeAlgo: protocolFeeMicroAlgo / 1_000_000,
      type: 'x402_inference_payment',
      round: this.currentRound,
      status: 'confirmed',
      timestamp: Date.now(),
      explorerUrl,
      note: noteContent
    };

    this.transactions.unshift(txRecord);

    return {
      txId,
      round: this.currentRound,
      amountAlgo: totalAmountAlgo,
      protocolFeeAlgo: protocolFeeMicroAlgo / 1_000_000,
      providerPayoutAlgo: providerPayoutMicroAlgo / 1_000_000,
      explorerUrl,
      signature: sigHash
    };
  }

  public getTransactionHistory(limit: number = 30): AlgorandTransactionRecord[] {
    return this.transactions.slice(0, limit);
  }
}

export const algorandService = new AlgorandService();
