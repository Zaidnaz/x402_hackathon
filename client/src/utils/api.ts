import {
  TaskRequirement,
  RoutingDecision,
  CandidateEvaluation,
  CompletedTask,
  CompletedPlan,
  ExecutionEvent,
  EventStepContext,
  SpendingPolicy,
  ApprovalRequiredInfo,
  ModelProvider,
  ComputeProvider,
  AlgorandAccountInfo,
  AlgorandTransactionRecord,
  GlobalStats
} from '../types';

const API_BASE = ((import.meta as any).env?.VITE_API_BASE as string) || '/api';

export const FALLBACK_MODELS: ModelProvider[] = [
  {
    id: 'gemini-3-7-flash-lite',
    name: 'Gemini 3.7 Flash-Lite',
    family: 'Google',
    contextWindow: 1048576,
    qualityBenchmark: 94.2,
    costPer1kInputTokensUsd: 0.00007,
    costPer1kOutputTokensUsd: 0.00030,
    typicalTps: 180,
    reliabilityScore: 0.999,
    supportedModalities: ['code', 'general', 'fast-chat', 'vision', 'batch-summary', 'reasoning'],
    providerOrg: 'Google DeepMind',
    status: 'online'
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3 (MoE 671B)',
    family: 'DeepSeek',
    contextWindow: 128000,
    qualityBenchmark: 91.8,
    costPer1kInputTokensUsd: 0.00014,
    costPer1kOutputTokensUsd: 0.00028,
    typicalTps: 72,
    reliabilityScore: 0.985,
    supportedModalities: ['code', 'reasoning', 'general', 'batch-summary'],
    providerOrg: 'DeepSeek AI',
    status: 'online'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    family: 'Anthropic',
    contextWindow: 200000,
    qualityBenchmark: 95.4,
    costPer1kInputTokensUsd: 0.00300,
    costPer1kOutputTokensUsd: 0.01500,
    typicalTps: 85,
    reliabilityScore: 0.998,
    supportedModalities: ['code', 'reasoning', 'general', 'vision'],
    providerOrg: 'Anthropic',
    status: 'online'
  },
  {
    id: 'llama-3-3-70b',
    name: 'Llama 3.3 (70B Instruct)',
    family: 'Meta',
    contextWindow: 128000,
    qualityBenchmark: 88.6,
    costPer1kInputTokensUsd: 0.00055,
    costPer1kOutputTokensUsd: 0.00085,
    typicalTps: 110,
    reliabilityScore: 0.992,
    supportedModalities: ['code', 'general', 'fast-chat', 'batch-summary'],
    providerOrg: 'Meta AI / Open Source',
    status: 'online'
  },
  {
    id: 'mistral-large-2',
    name: 'Mistral Large 2 (123B)',
    family: 'Mistral',
    contextWindow: 128000,
    qualityBenchmark: 92.1,
    costPer1kInputTokensUsd: 0.00200,
    costPer1kOutputTokensUsd: 0.00600,
    typicalTps: 65,
    reliabilityScore: 0.989,
    supportedModalities: ['code', 'reasoning', 'general'],
    providerOrg: 'Mistral AI',
    status: 'online'
  }
];

export const FALLBACK_COMPUTES: ComputeProvider[] = [
  {
    id: 'runpod-h100-us',
    name: 'RunPod Cloud Cluster',
    gpuType: 'NVIDIA H100 80GB SXM5',
    vramGb: 80,
    region: 'US-East (N. Virginia)',
    costPerHourUsd: 2.89,
    latencyBaseMs: 42,
    bandwidthGbps: 100,
    interconnect: 'NVLink 900 GB/s',
    reliabilityUptime: 99.95,
    currentLoad: 48,
    algorandPayoutAddress: 'A3R6WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6HVQ',
    endpointUrl: 'https://api.runpod.ai/v2/x402-node-us/inference',
    x402Supported: true,
    status: 'active'
  },
  {
    id: 'lambda-a100-eu',
    name: 'Lambda Labs Dedicated',
    gpuType: 'NVIDIA A100 80GB SXM4',
    vramGb: 80,
    region: 'EU-West (Frankfurt)',
    costPerHourUsd: 1.65,
    latencyBaseMs: 78,
    bandwidthGbps: 50,
    interconnect: 'NVLink 600 GB/s',
    reliabilityUptime: 99.88,
    currentLoad: 62,
    algorandPayoutAddress: 'B2X9WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6XYZ',
    endpointUrl: 'https://cloud.lambdalabs.com/api/v1/x402-a100/run',
    x402Supported: true,
    status: 'active'
  },
  {
    id: 'together-serverless',
    name: 'Together AI Serverless',
    gpuType: 'Dynamic Tensor Fleet (L40S / A100)',
    vramGb: 48,
    region: 'Global Multi-Region',
    costPerHourUsd: 0.95,
    latencyBaseMs: 115,
    bandwidthGbps: 40,
    interconnect: 'PCIe 4.0 / Mesh',
    reliabilityUptime: 99.75,
    currentLoad: 35,
    algorandPayoutAddress: 'C1Z4WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6ABC',
    endpointUrl: 'https://api.together.xyz/v1/x402/completions',
    x402Supported: true,
    status: 'active'
  },
  {
    id: 'coreweave-h200-us',
    name: 'CoreWeave Tensor Hub',
    gpuType: 'NVIDIA H200 141GB SXM',
    vramGb: 141,
    region: 'US-West (Oregon)',
    costPerHourUsd: 3.45,
    latencyBaseMs: 38,
    bandwidthGbps: 200,
    interconnect: 'NVLink 900 GB/s + InfiniBand',
    reliabilityUptime: 99.98,
    currentLoad: 75,
    algorandPayoutAddress: 'D8M2WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6DEF',
    endpointUrl: 'https://api.coreweave.com/v1/x402-h200/inference',
    x402Supported: true,
    status: 'active'
  },
  {
    id: 'fluidstack-rtx4090-asia',
    name: 'FluidStack Community Node',
    gpuType: 'NVIDIA RTX 4090 24GB',
    vramGb: 24,
    region: 'Asia-East (Tokyo)',
    costPerHourUsd: 0.45,
    latencyBaseMs: 140,
    bandwidthGbps: 25,
    interconnect: 'PCIe 4.0',
    reliabilityUptime: 99.20,
    currentLoad: 20,
    algorandPayoutAddress: 'E5K7WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6GHI',
    endpointUrl: 'https://node-jp.fluidstack.io/x402/stream',
    x402Supported: true,
    status: 'active'
  },
  {
    id: 'nebius-blackwell-preview',
    name: 'Nebius AI Blackwell Lab',
    gpuType: 'NVIDIA B200 192GB (Preview)',
    vramGb: 192,
    region: 'EU-North (Helsinki)',
    costPerHourUsd: 4.80,
    latencyBaseMs: 35,
    bandwidthGbps: 400,
    interconnect: 'NVLink 1.8 TB/s',
    reliabilityUptime: 99.99,
    currentLoad: 90,
    algorandPayoutAddress: 'F9P3WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6JKL',
    endpointUrl: 'https://nebius.ai/api/v1/x402-blackwell/eval',
    x402Supported: true,
    status: 'active'
  }
];

export async function fetchCatalog(): Promise<{ models: ModelProvider[]; computes: ComputeProvider[] }> {
  try {
    const res = await fetch(`${API_BASE}/marketplace/catalog`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.data?.models?.length && data?.data?.computes?.length) {
      return data.data;
    }
    return { models: FALLBACK_MODELS, computes: FALLBACK_COMPUTES };
  } catch (err) {
    console.warn('Backend catalog offline or unreachable, using fallback seed catalog:', err);
    return { models: FALLBACK_MODELS, computes: FALLBACK_COMPUTES };
  }
}

const ALGO_USD_RATE = 0.1904;

export function generateFallbackRoute(requirement?: Partial<TaskRequirement>): RoutingDecision {
  const models = FALLBACK_MODELS.filter(m => m.status !== 'offline');
  const computes = FALLBACK_COMPUTES.filter(c => c.status !== 'offline');

  const modality = requirement?.modality || 'code';
  const inputTokens = requirement?.estimatedInputTokens || 320;
  const outputTokens = requirement?.estimatedOutputTokens || 600;
  const deadlineMs = requirement?.deadlineMs || 3500;
  const maxBudgetAlgo = requirement?.maxBudgetAlgo || 0.85;
  const minQualityScore = requirement?.minQualityScore || 85;

  const candidates: CandidateEvaluation[] = [];

  for (const model of models) {
    if (!model.supportedModalities.includes(modality) && !model.supportedModalities.includes('general')) {
      continue;
    }

    for (const compute of computes) {
      let gpuBoost = 1.0;
      if (compute.gpuType.includes('H200')) gpuBoost = 1.65;
      else if (compute.gpuType.includes('H100')) gpuBoost = 1.45;
      else if (compute.gpuType.includes('A100')) gpuBoost = 1.15;
      else if (compute.gpuType.includes('L40S')) gpuBoost = 0.95;

      const netTps = model.typicalTps * gpuBoost;
      const processingTimeSec = outputTokens / Math.max(1, netTps);
      const processingLatencyMs = Math.round(processingTimeSec * 1000);
      const totalEstimatedLatencyMs = compute.latencyBaseMs + processingLatencyMs;

      const tokenCostUsd = (
        (inputTokens * model.costPer1kInputTokensUsd) +
        (outputTokens * model.costPer1kOutputTokensUsd)
      ) / 1000;

      const computeCostUsd = (processingTimeSec / 3600) * compute.costPerHourUsd;
      const totalCostUsd = tokenCostUsd + computeCostUsd;
      const totalCostAlgo = Number((totalCostUsd / ALGO_USD_RATE).toFixed(6));

      const loadPenalty = (compute.currentLoad > 85 ? (compute.currentLoad - 85) * 0.2 : 0);
      const projectedQuality = Number(Math.max(0, model.qualityBenchmark - loadPenalty).toFixed(1));

      const slaAdherent = totalEstimatedLatencyMs <= deadlineMs;
      const budgetAdherent = totalCostAlgo <= maxBudgetAlgo;

      candidates.push({
        modelId: model.id,
        modelName: model.name,
        computeId: compute.id,
        computeName: compute.name,
        gpuType: compute.gpuType,
        estimatedCostUsd: Number(totalCostUsd.toFixed(6)),
        estimatedCostAlgo: totalCostAlgo,
        estimatedLatencyMs: totalEstimatedLatencyMs,
        projectedQualityScore: projectedQuality,
        slaAdherent,
        budgetAdherent,
        paretoOptimal: false,
        compositeScore: 0,
        scoreBreakdown: {
          costScore: 0,
          latencyScore: 0,
          qualityScore: 0,
          reliabilityScore: 0,
          penalty: 0
        },
        rank: 0
      });
    }
  }

  if (candidates.length === 0) {
    return {
      taskId: requirement?.id || 'task_fallback',
      selectedCandidate: {} as any,
      fallbackCandidate: {} as any,
      evaluatedCandidatesCount: 0,
      decisionReasoning: ['No matching providers found.'],
      paretoFrontier: [],
      timestamp: Date.now()
    };
  }

  const minCost = Math.min(...candidates.map(c => c.estimatedCostUsd));
  const maxCost = Math.max(...candidates.map(c => c.estimatedCostUsd)) || 1;
  const minLat = Math.min(...candidates.map(c => c.estimatedLatencyMs));
  const maxLat = Math.max(...candidates.map(c => c.estimatedLatencyMs)) || 1;

  let wCost = 0.30;
  let wLat = 0.30;
  let wQual = 0.30;
  let wRel = 0.10;

  if (requirement?.priority === 'cost') {
    wCost = 0.55; wLat = 0.15; wQual = 0.20; wRel = 0.10;
  } else if (requirement?.priority === 'speed') {
    wCost = 0.15; wLat = 0.55; wQual = 0.20; wRel = 0.10;
  } else if (requirement?.priority === 'quality') {
    wCost = 0.15; wLat = 0.15; wQual = 0.60; wRel = 0.10;
  }

  if (requirement?.customWeights) {
    wCost = requirement.customWeights.cost;
    wLat = requirement.customWeights.latency;
    wQual = requirement.customWeights.quality;
    wRel = requirement.customWeights.reliability;
  }

  for (const c of candidates) {
    const model = FALLBACK_MODELS.find(m => m.id === c.modelId)!;
    const compute = FALLBACK_COMPUTES.find(cp => cp.id === c.computeId)!;

    const costNorm = 1 - ((c.estimatedCostUsd - minCost) / Math.max(0.00001, maxCost - minCost));
    const latNorm = 1 - ((c.estimatedLatencyMs - minLat) / Math.max(1, maxLat - minLat));
    const qualNorm = c.projectedQualityScore / 100;
    const relNorm = (model.reliabilityScore * (compute.reliabilityUptime / 100));

    const costScore = Number((costNorm * 100 * wCost).toFixed(2));
    const latencyScore = Number((latNorm * 100 * wLat).toFixed(2));
    const qualityScore = Number((qualNorm * 100 * wQual).toFixed(2));
    const reliabilityScore = Number((relNorm * 100 * wRel).toFixed(2));

    let penalty = 0;
    if (!c.slaAdherent) penalty += 35;
    if (!c.budgetAdherent) penalty += 40;
    if (c.projectedQualityScore < minQualityScore) penalty += 25;

    const compositeScore = Number((costScore + latencyScore + qualityScore + reliabilityScore - penalty).toFixed(2));

    c.compositeScore = compositeScore;
    c.scoreBreakdown = {
      costScore,
      latencyScore,
      qualityScore,
      reliabilityScore,
      penalty
    };
  }

  // Calculate Pareto non-dominated frontier
  for (let i = 0; i < candidates.length; i++) {
    const a = candidates[i];
    let isDominated = false;

    for (let j = 0; j < candidates.length; j++) {
      if (i === j) continue;
      const b = candidates[j];

      if (
        b.estimatedCostUsd <= a.estimatedCostUsd &&
        b.estimatedLatencyMs <= a.estimatedLatencyMs &&
        b.projectedQualityScore >= a.projectedQualityScore &&
        (b.estimatedCostUsd < a.estimatedCostUsd || b.estimatedLatencyMs < a.estimatedLatencyMs || b.projectedQualityScore > a.projectedQualityScore)
      ) {
        isDominated = true;
        break;
      }
    }
    a.paretoOptimal = !isDominated;
  }

  // Sort by composite score descending
  candidates.sort((a, b) => b.compositeScore - a.compositeScore);
  candidates.forEach((c, idx) => { c.rank = idx + 1; });

  const paretoFrontier = candidates.filter(c => c.paretoOptimal);
  const selected = candidates[0];
  const fallback = candidates.length > 1 ? candidates[1] : candidates[0];

  return {
    taskId: requirement?.id || 'task_matrix_eval',
    selectedCandidate: selected,
    fallbackCandidate: fallback,
    evaluatedCandidatesCount: candidates.length,
    decisionReasoning: [
      `Optimal match: ${selected.modelName} on ${selected.computeName} (${selected.gpuType}) with composite score ${selected.compositeScore}.`,
      `Pareto frontier contains ${paretoFrontier.length} non-dominated combinations across ${candidates.length} total active permutations.`
    ],
    paretoFrontier: candidates,
    timestamp: Date.now()
  };
}

export async function analyzePrompt(prompt: string, overrides?: Partial<TaskRequirement>): Promise<TaskRequirement> {
  try {
    const res = await fetch(`${API_BASE}/tasks/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, overrides })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.requirement;
  } catch (err) {
    const wordCount = prompt.split(/\s+/).length;
    const maxBudgetAlgo = overrides?.maxBudgetAlgo || 0.85;
    return {
      id: `task_${Date.now()}`,
      rawPrompt: prompt,
      modality: overrides?.modality || 'code',
      estimatedInputTokens: Math.round(wordCount * 1.35),
      estimatedOutputTokens: 600,
      maxBudgetAlgo: maxBudgetAlgo,
      maxBudgetUsd: maxBudgetAlgo * 0.20,
      deadlineMs: overrides?.deadlineMs || 3500,
      minQualityScore: overrides?.minQualityScore || 85,
      priority: overrides?.priority || 'quality'
    };
  }
}

export async function evaluateRoute(requirement: TaskRequirement): Promise<RoutingDecision> {
  try {
    const res = await fetch(`${API_BASE}/tasks/evaluate-route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requirement })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.routing?.paretoFrontier?.length) {
      return data.routing;
    }
    return generateFallbackRoute(requirement);
  } catch (err) {
    console.warn('Using client-side Pareto evaluation fallback:', err);
    return generateFallbackRoute(requirement);
  }
}

export const FALLBACK_ACCOUNTS: AlgorandAccountInfo[] = [
  {
    address: 'GYFODB2Y6V4D4OQYF7F7X6Q2J7K9P3M2L8V1T6R7Q5W4E9Z2Y7U8I1O3P5',
    role: 'agent',
    label: 'Primary Autonomous Agent Wallet',
    mnemonicExcerpt: 'orbit galaxy ... legal asset',
    balanceAlgo: 9.85,
    testnetExplorerUrl: 'https://lora.algokit.io/testnet/account/GYFODB2Y6V4D4OQYF7F7X6Q2J7K9P3M2L8V1T6R7Q5W4E9Z2Y7U8I1O3P5'
  },
  {
    address: 'A3R6WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6HVQ',
    role: 'provider',
    label: 'RunPod H100 Node Settlement Account',
    mnemonicExcerpt: 'tensor cloud ... render matrix',
    balanceAlgo: 142.35,
    testnetExplorerUrl: 'https://lora.algokit.io/testnet/account/A3R6WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6HVQ'
  },
  {
    address: 'TRSRY77VLE4J6R7K2P9M3N8Q5W4E9Z2Y7U8I1O3P5A6S7D8F9G0H1J2K3L',
    role: 'treasury',
    label: 'AgentGrid Protocol Treasury (1.5% Fee)',
    mnemonicExcerpt: 'treasury vault ... escrow secure',
    balanceAlgo: 28.62,
    testnetExplorerUrl: 'https://lora.algokit.io/testnet/account/TRSRY77VLE4J6R7K2P9M3N8Q5W4E9Z2Y7U8I1O3P5A6S7D8F9G0H1J2K3L'
  },
  {
    address: 'C1Z4WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6ABC',
    role: 'provider',
    label: 'Together AI Serverless Payout Account',
    mnemonicExcerpt: 'cluster fleet ... serverless node',
    balanceAlgo: 64.12,
    testnetExplorerUrl: 'https://lora.algokit.io/testnet/account/C1Z4WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6ABC'
  },
  {
    address: 'B2X9WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6XYZ',
    role: 'provider',
    label: 'Lambda Labs A100 Node Payout Account',
    mnemonicExcerpt: 'frankfurt datacenter ... nvlink bus',
    balanceAlgo: 89.45,
    testnetExplorerUrl: 'https://lora.algokit.io/testnet/account/B2X9WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6XYZ'
  }
];

export const FALLBACK_TRANSACTIONS: AlgorandTransactionRecord[] = [
  {
    id: 'tx_rec_1',
    txId: 'BHENZ3BKEPP3B5DQUA6OLUAVPQNLCVIP6IE7MFQKENJKPO4JEFEY',
    taskId: 'task_demo_1',
    sender: 'GYFODB2Y6V4D4OQYF7F7X6Q2J7K9P3M2L8V1T6R7Q5W4E9Z2Y7U8I1O3P5',
    receiver: 'A3R6WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6HVQ',
    amountAlgo: 0.009245,
    feeAlgo: 0.001,
    protocolFeeAlgo: 0.000138,
    type: 'x402_inference_payment',
    round: 44192082,
    status: 'confirmed',
    timestamp: Date.now() - 1000 * 60 * 12,
    explorerUrl: 'https://lora.algokit.io/testnet/transaction/BHENZ3BKEPP3B5DQUA6OLUAVPQNLCVIP6IE7MFQKENJKPO4JEFEY',
    loraUrl: 'https://lora.algokit.io/testnet/transaction/BHENZ3BKEPP3B5DQUA6OLUAVPQNLCVIP6IE7MFQKENJKPO4JEFEY',
    facilitator: 'https://facilitator.goplausible.xyz',
    note: 'x402:task:task_demo_1:runpod-h100-us'
  },
  {
    id: 'tx_rec_2',
    txId: 'THRT56HG7JPFKUL352YKJBHHRNYI7ICCU7YLVLINHJJ2K647P44Q',
    taskId: 'task_demo_2',
    sender: 'GYFODB2Y6V4D4OQYF7F7X6Q2J7K9P3M2L8V1T6R7Q5W4E9Z2Y7U8I1O3P5',
    receiver: 'C1Z4WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6ABC',
    amountAlgo: 0.004333,
    feeAlgo: 0.001,
    protocolFeeAlgo: 0.000065,
    type: 'x402_inference_payment',
    round: 44191850,
    status: 'confirmed',
    timestamp: Date.now() - 1000 * 60 * 35,
    explorerUrl: 'https://lora.algokit.io/testnet/transaction/THRT56HG7JPFKUL352YKJBHHRNYI7ICCU7YLVLINHJJ2K647P44Q',
    loraUrl: 'https://lora.algokit.io/testnet/transaction/THRT56HG7JPFKUL352YKJBHHRNYI7ICCU7YLVLINHJJ2K647P44Q',
    facilitator: 'https://facilitator.goplausible.xyz',
    note: 'x402:task:task_demo_2:together-serverless'
  },
  {
    id: 'tx_rec_3',
    txId: 'K9N4XP3M2L8V1T6R7Q5W4E9Z2Y7U8I1O3P5A6S7D8F9G0H1J',
    taskId: 'task_demo_3',
    sender: 'GYFODB2Y6V4D4OQYF7F7X6Q2J7K9P3M2L8V1T6R7Q5W4E9Z2Y7U8I1O3P5',
    receiver: 'D8M2WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6DEF',
    amountAlgo: 0.011697,
    feeAlgo: 0.001,
    protocolFeeAlgo: 0.000175,
    type: 'x402_inference_payment',
    round: 44191420,
    status: 'confirmed',
    timestamp: Date.now() - 1000 * 60 * 78,
    explorerUrl: 'https://lora.algokit.io/testnet/transaction/K9N4XP3M2L8V1T6R7Q5W4E9Z2Y7U8I1O3P5A6S7D8F9G0H1J',
    loraUrl: 'https://lora.algokit.io/testnet/transaction/K9N4XP3M2L8V1T6R7Q5W4E9Z2Y7U8I1O3P5A6S7D8F9G0H1J',
    facilitator: 'https://facilitator.goplausible.xyz',
    note: 'x402:task:task_demo_3:coreweave-h200-us'
  }
];

export const FALLBACK_STATS: GlobalStats = {
  totalTasks: 148,
  totalAlgoSpent: 1.8452,
  totalTokens: 1824000,
  avgLatencyMs: 462,
  failoverCount: 3,
  algoSaved: 4.62,
  costSavingsPercentage: 71.4,
  slaAdherenceRate: 99.8,
  failovers: [
    {
      taskId: 'task_failover_1',
      fromProvider: 'FluidStack Community Node',
      toProvider: 'RunPod Cloud',
      reason: 'HTTP 503 Out of VRAM / OOM',
      timestamp: Date.now() - 1000 * 60 * 45
    }
  ]
};

export async function fetchAccounts(): Promise<AlgorandAccountInfo[]> {
  try {
    const res = await fetch(`${API_BASE}/ledger/accounts`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.accounts?.length) return data.accounts;
    return FALLBACK_ACCOUNTS;
  } catch (err) {
    console.warn('Using fallback Algorand accounts:', err);
    return FALLBACK_ACCOUNTS;
  }
}

export async function fetchTransactions(): Promise<AlgorandTransactionRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/ledger/transactions?limit=50`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.transactions?.length) return data.transactions;
    return FALLBACK_TRANSACTIONS;
  } catch (err) {
    console.warn('Using fallback Algorand transactions:', err);
    return FALLBACK_TRANSACTIONS;
  }
}

export async function fetchStats(): Promise<GlobalStats> {
  try {
    const res = await fetch(`${API_BASE}/ledger/stats`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data?.stats) return data.stats;
    return FALLBACK_STATS;
  } catch (err) {
    console.warn('Using fallback global stats:', err);
    return FALLBACK_STATS;
  }
}

export async function fetchFundingStatus(): Promise<{ isFunded: boolean; balanceAlgo: number; fundUrl: string; agentAddress: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/ledger/funding`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data?.success) return null;
    return {
      isFunded: data.isFunded,
      balanceAlgo: data.balanceAlgo,
      fundUrl: data.fundUrl,
      agentAddress: data.agentAddress
    };
  } catch (err) {
    console.warn('Could not fetch agent funding status:', err);
    return null;
  }
}

export async function fetchPolicy(): Promise<{ policy: SpendingPolicy; todaySpendAlgo: number; remainingTodayAlgo: number } | null> {
  try {
    const res = await fetch(`${API_BASE}/policy`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data?.success) return null;
    return { policy: data.policy, todaySpendAlgo: data.todaySpendAlgo, remainingTodayAlgo: data.remainingTodayAlgo };
  } catch (err) {
    console.warn('Could not fetch spending policy:', err);
    return null;
  }
}

export async function updatePolicy(patch: Partial<SpendingPolicy>): Promise<SpendingPolicy | null> {
  try {
    const res = await fetch(`${API_BASE}/policy`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch)
    });
    const data = await res.json();
    if (!data?.success) throw new Error(data?.error || `HTTP ${res.status}`);
    return data.policy;
  } catch (err) {
    console.warn('Could not update spending policy:', err);
    return null;
  }
}

export async function fetchTaskHistory(): Promise<CompletedTask[]> {
  const res = await fetch(`${API_BASE}/tasks/history`);
  const data = await res.json();
  return data.tasks;
}

export async function registerModel(model: Partial<ModelProvider>) {
  const res = await fetch(`${API_BASE}/marketplace/register-model`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(model)
  });
  return res.json();
}

export async function registerCompute(compute: Partial<ComputeProvider>) {
  const res = await fetch(`${API_BASE}/marketplace/register-compute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(compute)
  });
  return res.json();
}

export async function toggleComputeStatus(computeId: string, status: string) {
  const res = await fetch(`${API_BASE}/marketplace/toggle-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ computeId, status })
  });
  return res.json();
}

export async function testDirectX402(token?: string) {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `x402 ${token}`;
  }
  const res = await fetch(`${API_BASE}/x402/inference/direct-endpoint`, {
    headers
  });
  const rawHeaders: Record<string, string> = {};
  res.headers.forEach((val, key) => {
    rawHeaders[key] = val;
  });
  const body = await res.json();
  return {
    status: res.status,
    headers: rawHeaders,
    body
  };
}

export function subscribeTaskStream(
  prompt: string,
  overrides: Partial<TaskRequirement>,
  simulateFailover: boolean,
  onEvent: (event: ExecutionEvent) => void,
  onTokenChunk: (chunk: string) => void,
  onComplete: (task: CompletedTask) => void,
  onError: (error: string) => void
): () => void {
  const params = new URLSearchParams({
    prompt,
    simulateFailover: String(simulateFailover)
  });

  if (overrides.priority) params.append('priority', overrides.priority);
  if (overrides.maxBudgetAlgo) params.append('maxBudgetAlgo', String(overrides.maxBudgetAlgo));
  if (overrides.deadlineMs) params.append('deadlineMs', String(overrides.deadlineMs));
  if (overrides.minQualityScore) params.append('minQualityScore', String(overrides.minQualityScore));

  const eventSource = new EventSource(`${API_BASE}/tasks/stream?${params.toString()}`);
  // The stream ends by the server closing the HTTP response after 'completed'
  // (or 'error'). Native EventSource treats any connection drop it didn't
  // initiate itself as reconnect-worthy and fires a generic 'error' event —
  // including right after a perfectly successful completion. Without this
  // flag, that spurious event would overwrite a successful result with a
  // false "task failed" state.
  let finished = false;

  eventSource.addEventListener('pipeline_event', (e) => {
    try {
      const event: ExecutionEvent = JSON.parse(e.data);
      onEvent(event);
      if (event.stage === 'completed' && event.data?.task) {
        finished = true;
        onComplete(event.data.task);
        eventSource.close();
      }
    } catch (err) {
      console.error('SSE parse error', err);
    }
  });

  eventSource.addEventListener('token_chunk', (e) => {
    try {
      const data = JSON.parse(e.data);
      onTokenChunk(data.chunk);
    } catch (err) {
      console.error('SSE token parse error', err);
    }
  });

  eventSource.addEventListener('error', (e: any) => {
    if (finished || eventSource.readyState === EventSource.CLOSED) return;
    finished = true;
    try {
      const parsed = JSON.parse(e.data || '{}');
      onError(parsed.error || 'Connection closed');
    } catch {
      onError('Stream disconnected');
    }
    eventSource.close();
  });

  return () => {
    finished = true;
    eventSource.close();
  };
}

/**
 * Same real-time contract as subscribeTaskStream, but the agent first
 * decides whether the prompt is one deliverable or several genuinely
 * distinct ones — each step then runs the full route→pay→execute pipeline
 * independently, so a single prompt can produce multiple real on-chain
 * settlements. A prompt that isn't multi-part behaves identically to a
 * single subscribeTaskStream call.
 */
export function subscribeTaskPlanStream(
  prompt: string,
  overrides: Partial<TaskRequirement>,
  simulateFailover: boolean,
  humanApproved: boolean,
  onEvent: (event: ExecutionEvent) => void,
  onTokenChunk: (chunk: string, step?: EventStepContext) => void,
  onComplete: (plan: CompletedPlan) => void,
  onError: (error: string) => void,
  onApprovalRequired: (info: ApprovalRequiredInfo) => void
): () => void {
  const params = new URLSearchParams({
    prompt,
    simulateFailover: String(simulateFailover),
    humanApproved: String(humanApproved)
  });

  if (overrides.priority) params.append('priority', overrides.priority);
  if (overrides.maxBudgetAlgo) params.append('maxBudgetAlgo', String(overrides.maxBudgetAlgo));
  if (overrides.deadlineMs) params.append('deadlineMs', String(overrides.deadlineMs));
  if (overrides.minQualityScore) params.append('minQualityScore', String(overrides.minQualityScore));

  const eventSource = new EventSource(`${API_BASE}/tasks/plan-stream?${params.toString()}`);
  let finished = false;

  eventSource.addEventListener('pipeline_event', (e) => {
    try {
      const event: ExecutionEvent = JSON.parse(e.data);
      onEvent(event);
      if (event.stage === 'plan_completed' && event.data?.completedPlan) {
        finished = true;
        onComplete(event.data.completedPlan);
        eventSource.close();
      } else if (event.stage === 'awaiting_approval') {
        finished = true;
        onApprovalRequired({
          estimatedCostAlgo: event.data?.estimatedCostAlgo,
          thresholdAlgo: event.data?.thresholdAlgo,
          modelName: event.data?.modelName,
          computeName: event.data?.computeName,
          prompt: event.data?.prompt ?? prompt
        });
        eventSource.close();
      }
    } catch (err) {
      console.error('SSE parse error', err);
    }
  });

  eventSource.addEventListener('token_chunk', (e) => {
    try {
      const data = JSON.parse(e.data);
      onTokenChunk(data.chunk, data.step);
    } catch (err) {
      console.error('SSE token parse error', err);
    }
  });

  eventSource.addEventListener('error', (e: any) => {
    if (finished || eventSource.readyState === EventSource.CLOSED) return;
    finished = true;
    try {
      const parsed = JSON.parse(e.data || '{}');
      onError(parsed.error || 'Connection closed');
    } catch {
      onError('Stream disconnected');
    }
    eventSource.close();
  });

  return () => {
    finished = true;
    eventSource.close();
  };
}
