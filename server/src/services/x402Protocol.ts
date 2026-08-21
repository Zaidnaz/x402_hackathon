import crypto from 'crypto';
import { 
  X402PaymentChallenge, 
  X402PaymentProof, 
  CandidateEvaluation 
} from '../types/index.js';
import { algorandService } from './algorandService.js';
import { providerRegistry } from './providerRegistry.js';

export const GOPLAUSIBLE_FACILITATOR_URL = 'https://facilitator.goplausible.xyz';

export class X402ProtocolService {
  private activeChallenges: Map<string, X402PaymentChallenge> = new Map();
  private verifiedTokens: Map<string, X402PaymentProof> = new Map();

  /**
   * Generates a standard HTTP 402 Payment Challenge for an inferenced resource
   * compliant with GoPlausible x402 AVM exact scheme.
   */
  public generatePaymentChallenge(
    taskId: string,
    candidate: CandidateEvaluation
  ): X402PaymentChallenge {
    const compute = providerRegistry.getCompute(candidate.computeId);
    const destinationAddress = compute?.algorandPayoutAddress || algorandService.getProviderAddress(candidate.computeId);
    const treasuryAddress = algorandService.getTreasuryAddress();
    
    const amountAlgo = candidate.estimatedCostAlgo;
    const amountMicroAlgo = Math.round(amountAlgo * 1_000_000);
    const agentGridFeeAlgo = Number((amountAlgo * 0.015).toFixed(6));
    const providerPayoutAlgo = Number((amountAlgo - agentGridFeeAlgo).toFixed(6));

    const challengeId = `x402_chal_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const tokenNonce = crypto.randomBytes(16).toString('hex');
    const resourceUri = `/api/v1/workload/execute/${taskId}`;
    const scheme = 'avm:exact';

    const challenge: X402PaymentChallenge = {
      challengeId,
      taskId,
      resourceUri,
      status: 402,
      amountAlgo,
      amountMicroAlgo,
      amountUsd: candidate.estimatedCostUsd,
      agentGridFeeAlgo,
      providerPayoutAlgo,
      destinationAddress,
      treasuryAddress,
      tokenNonce,
      facilitatorUrl: GOPLAUSIBLE_FACILITATOR_URL,
      scheme,
      expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes TTL
      headers: {
        'WWW-Authenticate': `x402-algorand realm="AgentGrid-Marketplace", resource="${resourceUri}", nonce="${tokenNonce}", facilitator="${GOPLAUSIBLE_FACILITATOR_URL}", scheme="${scheme}"`,
        'X-402-Payment-Address': destinationAddress,
        'X-402-Amount': amountMicroAlgo.toString(),
        'X-402-Currency': 'ALGO-micro',
        'X-402-Network': 'Algorand-TestNet',
        'X-402-Nonce': tokenNonce,
        'X-402-Facilitator': GOPLAUSIBLE_FACILITATOR_URL,
        'X-402-Scheme': scheme
      }
    };

    this.activeChallenges.set(challengeId, challenge);
    return challenge;
  }

  /**
   * Validates and verifies an incoming payment token / proof
   */
  public verifyPaymentProof(
    challengeId: string,
    txId: string,
    signature: string,
    round: number
  ): X402PaymentProof {
    const challenge = this.activeChallenges.get(challengeId);
    if (!challenge) {
      throw new Error(`Invalid or expired x402 payment challenge [${challengeId}]`);
    }

    const paymentToken = `x402_tok_${Buffer.from(`${challengeId}:${txId}:${signature.slice(0, 16)}`).toString('base64url')}`;

    const proof: X402PaymentProof = {
      challengeId,
      txId,
      senderAddress: algorandService.getAgentAddress(),
      destinationAddress: challenge.destinationAddress,
      amountMicroAlgo: challenge.amountMicroAlgo,
      round,
      signature,
      paymentToken,
      verified: true,
      verifiedAt: Date.now(),
      facilitator: GOPLAUSIBLE_FACILITATOR_URL
    };

    this.verifiedTokens.set(paymentToken, proof);
    return proof;
  }

  public getChallenge(challengeId: string): X402PaymentChallenge | undefined {
    return this.activeChallenges.get(challengeId);
  }

  public getPaymentProof(token: string): X402PaymentProof | undefined {
    return this.verifiedTokens.get(token);
  }
}

export const x402Protocol = new X402ProtocolService();
