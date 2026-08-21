export type TaskModality = 'code' | 'reasoning' | 'general' | 'fast-chat' | 'batch-summary' | 'vision' | 'embeddings';

export interface TaskRequirement {
  id: string;
  rawPrompt: string;
  modality: TaskModality;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  maxBudgetAlgo: number;
  maxBudgetUsd: number;
  deadlineMs: number;
  minQualityScore: number;
  priority: 'cost' | 'speed' | 'quality' | 'balanced';
  customWeights?: {
    cost: number;
    latency: number;
    quality: number;
    reliability: number;
  };
}

export interface ModelProvider {
  id: string;
  name: string;
  family: string;
  contextWindow: number;
  qualityBenchmark: number;
  costPer1kInputTokensUsd: number;
  costPer1kOutputTokensUsd: number;
  typicalTps: number;
  reliabilityScore: number;
  supportedModalities: TaskModality[];
  providerOrg: string;
  status: 'online' | 'degraded' | 'offline';
}

export interface ComputeProvider {
  id: string;
  name: string;
  gpuType: string;
  vramGb: number;
  region: string;
  costPerHourUsd: number;
  latencyBaseMs: number;
  bandwidthGbps: number;
  interconnect: string;
  reliabilityUptime: number;
  currentLoad: number;
  algorandPayoutAddress: string;
  endpointUrl: string;
  x402Supported: boolean;
  status: 'active' | 'busy' | 'offline' | 'degraded';
}

export interface CandidateEvaluation {
  modelId: string;
  modelName: string;
  computeId: string;
  computeName: string;
  gpuType: string;
  estimatedCostUsd: number;
  estimatedCostAlgo: number;
  estimatedLatencyMs: number;
  projectedQualityScore: number;
  slaAdherent: boolean;
  budgetAdherent: boolean;
  paretoOptimal: boolean;
  compositeScore: number;
  scoreBreakdown: {
    costScore: number;
    latencyScore: number;
    qualityScore: number;
    reliabilityScore: number;
    penalty: number;
  };
  rank: number;
}

export interface RoutingDecision {
  taskId: string;
  selectedCandidate: CandidateEvaluation;
  fallbackCandidate: CandidateEvaluation;
  evaluatedCandidatesCount: number;
  decisionReasoning: string[];
  paretoFrontier: CandidateEvaluation[];
  timestamp: number;
}

export interface X402PaymentChallenge {
  challengeId: string;
  taskId: string;
  resourceUri: string;
  status: 402;
  amountAlgo: number;
  amountMicroAlgo: number;
  amountUsd: number;
  agentGridFeeAlgo: number;
  providerPayoutAlgo: number;
  destinationAddress: string;
  treasuryAddress: string;
  tokenNonce: string;
  expiresAt: number;
  headers: {
    'WWW-Authenticate': string;
    'X-402-Payment-Address': string;
    'X-402-Amount': string;
    'X-402-Currency': string;
    'X-402-Network': string;
    'X-402-Nonce': string;
  };
}

export interface X402PaymentProof {
  challengeId: string;
  txId: string;
  senderAddress: string;
  destinationAddress: string;
  amountMicroAlgo: number;
  round: number;
  signature: string;
  paymentToken: string;
  verified: boolean;
  verifiedAt: number;
}

export interface AlgorandAccountInfo {
  role: 'agent' | 'provider' | 'treasury';
  label: string;
  address: string;
  mnemonicExcerpt: string;
  balanceAlgo: number;
  testnetExplorerUrl: string;
}

export interface AlgorandTransactionRecord {
  id: string;
  txId: string;
  taskId: string;
  sender: string;
  receiver: string;
  amountAlgo: number;
  feeAlgo: number;
  protocolFeeAlgo: number;
  type: 'x402_inference_payment' | 'agentgrid_protocol_fee' | 'reroute_refund';
  round: number;
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: number;
  explorerUrl: string;
  note: string;
}

export type ExecutionStage = 
  | 'idle'
  | 'analyzing_intent'
  | 'discovering_grid'
  | 'optimizing_pareto'
  | 'x402_challenging'
  | 'settling_algorand'
  | 'executing_workload'
  | 'verifying_telemetry'
  | 'rerouting_failover'
  | 'completed'
  | 'failed';

export interface ExecutionEvent {
  stage: ExecutionStage;
  message: string;
  timestamp: number;
  data?: any;
}

export interface CompletedTask {
  id: string;
  prompt: string;
  requirement: TaskRequirement;
  routing: RoutingDecision;
  x402Challenge: X402PaymentChallenge;
  paymentProof: X402PaymentProof;
  algorandTx: AlgorandTransactionRecord;
  executionOutput: string;
  actualDurationMs: number;
  actualCostAlgo: number;
  tokensGenerated: number;
  status: 'completed' | 'failed' | 'rerouted';
  failoverOccurred: boolean;
  failoverDetails?: {
    originalProvider: string;
    reason: string;
    newProvider: string;
    rerouteLatencyOverheadMs: number;
  };
  completedAt: number;
}

export interface GlobalStats {
  totalTasks: number;
  totalAlgoSpent: number;
  totalTokens: number;
  avgLatencyMs: number;
  failoverCount: number;
  algoSaved: number;
  costSavingsPercentage: number;
  slaAdherenceRate: number;
  failovers: Array<{
    taskId: string;
    fromProvider: string;
    toProvider: string;
    reason: string;
    timestamp: number;
  }>;
}
