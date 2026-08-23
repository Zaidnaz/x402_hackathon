export type TaskModality = 'code' | 'reasoning' | 'general' | 'fast-chat' | 'batch-summary' | 'vision' | 'embeddings';

export interface TaskRequirement {
  id: string;
  rawPrompt: string;
  modality: TaskModality;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  maxBudgetAlgo: number; // in ALGO (e.g. 0.05 ALGO)
  maxBudgetUsd: number;
  deadlineMs: number; // SLA limit
  minQualityScore: number; // 0 - 100
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
  qualityBenchmark: number; // 0 - 100 (MMLU / HumanEval composite)
  costPer1kInputTokensUsd: number;
  costPer1kOutputTokensUsd: number;
  typicalTps: number; // Tokens per sec
  reliabilityScore: number; // 0.00 - 1.00
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
  interconnect: string; // NVLink, SXM4, PCIe, etc.
  reliabilityUptime: number; // 99.98%
  currentLoad: number; // 0 - 100%
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
  facilitatorUrl: string;
  scheme: string;
  expiresAt: number;
  headers: {
    'WWW-Authenticate': string;
    'X-402-Payment-Address': string;
    'X-402-Amount': string;
    'X-402-Currency': string;
    'X-402-Network': string;
    'X-402-Nonce': string;
    'X-402-Facilitator': string;
    'X-402-Scheme': string;
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
  facilitator: string;
}

export interface AlgorandAccountInfo {
  role: 'agent' | 'provider' | 'treasury';
  label: string;
  address: string;
  mnemonicExcerpt: string;
  balanceAlgo: number;
  testnetExplorerUrl: string;
  loraExplorerUrl: string;
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
  loraUrl: string;
  facilitator: string;
  note: string;
}

export type ExecutionStage =
  | 'idle'
  | 'planning'
  | 'analyzing_intent'
  | 'discovering_grid'
  | 'optimizing_pareto'
  | 'x402_challenging'
  | 'settling_algorand'
  | 'executing_workload'
  | 'verifying_telemetry'
  | 'rerouting_failover'
  | 'completed'
  | 'plan_completed'
  | 'awaiting_approval'
  | 'failed';

export interface SpendingPolicy {
  /** Hard cap — a task that would push today's total spend past this is rejected outright, not held. */
  dailyBudgetAlgo: number;
  /** A task costing at or above this needs explicit human sign-off before it pays. */
  autoApproveThresholdAlgo: number;
}

export interface ApprovalRequiredInfo {
  estimatedCostAlgo: number;
  thresholdAlgo: number;
  modelName: string;
  computeName: string;
  prompt: string;
}

export interface EventStepContext {
  index: number;
  total: number;
  title: string;
}

export interface ExecutionEvent {
  stage: ExecutionStage;
  message: string;
  timestamp: number;
  data?: any;
  /** Present when this event belongs to one step of a decomposed multi-step plan. */
  step?: EventStepContext;
}

export interface PlanStep {
  title: string;
  prompt: string;
}

export interface TaskPlan {
  steps: PlanStep[];
  reasoning: string;
  /** True when a real LLM decomposed the prompt; false when it fell back to a single step. */
  planned: boolean;
}

export interface CompletedPlan {
  id: string;
  prompt: string;
  plan: TaskPlan;
  steps: CompletedTask[];
  totalCostAlgo: number;
  totalDurationMs: number;
  status: 'completed' | 'failed';
  completedAt: number;
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
