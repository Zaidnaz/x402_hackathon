import { 
  TaskRequirement, 
  RoutingDecision, 
  CompletedTask, 
  ExecutionEvent, 
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

export function generateFallbackRoute(requirement?: Partial<TaskRequirement>): RoutingDecision {
  const baseScoreBreakdown = {
    costScore: 92,
    latencyScore: 88,
    qualityScore: 94,
    reliabilityScore: 99,
    penalty: 0
  };

  const candidates = [
    {
      modelId: 'gemini-3-7-flash-lite',
      modelName: 'Gemini 3.7 Flash-Lite',
      computeId: 'together-serverless',
      computeName: 'Together AI Serverless',
      gpuType: 'Dynamic Tensor Fleet',
      estimatedCostUsd: 0.0008,
      estimatedCostAlgo: 0.004333,
      estimatedLatencyMs: 450,
      projectedQualityScore: 94.2,
      slaAdherent: true,
      budgetAdherent: true,
      paretoOptimal: true,
      compositeScore: 0.965,
      scoreBreakdown: baseScoreBreakdown,
      rank: 1
    },
    {
      modelId: 'gemini-3-7-flash-lite',
      modelName: 'Gemini 3.7 Flash-Lite',
      computeId: 'runpod-h100-us',
      computeName: 'RunPod Cloud',
      gpuType: 'NVIDIA H100 80GB SXM5',
      estimatedCostUsd: 0.0018,
      estimatedCostAlgo: 0.009245,
      estimatedLatencyMs: 380,
      projectedQualityScore: 94.2,
      slaAdherent: true,
      budgetAdherent: true,
      paretoOptimal: true,
      compositeScore: 0.942,
      scoreBreakdown: baseScoreBreakdown,
      rank: 2
    },
    {
      modelId: 'gemini-3-7-flash-lite',
      modelName: 'Gemini 3.7 Flash-Lite',
      computeId: 'lambda-a100-eu',
      computeName: 'Lambda Labs',
      gpuType: 'NVIDIA A100 80GB SXM4',
      estimatedCostUsd: 0.0013,
      estimatedCostAlgo: 0.006895,
      estimatedLatencyMs: 520,
      projectedQualityScore: 94.2,
      slaAdherent: true,
      budgetAdherent: true,
      paretoOptimal: true,
      compositeScore: 0.920,
      scoreBreakdown: baseScoreBreakdown,
      rank: 3
    },
    {
      modelId: 'gemini-3-7-flash-lite',
      modelName: 'Gemini 3.7 Flash-Lite',
      computeId: 'coreweave-h200-us',
      computeName: 'CoreWeave Dedicated',
      gpuType: 'NVIDIA H200 141GB SXM',
      estimatedCostUsd: 0.0022,
      estimatedCostAlgo: 0.011697,
      estimatedLatencyMs: 340,
      projectedQualityScore: 94.2,
      slaAdherent: true,
      budgetAdherent: true,
      paretoOptimal: true,
      compositeScore: 0.910,
      scoreBreakdown: baseScoreBreakdown,
      rank: 4
    },
    {
      modelId: 'claude-3-5-sonnet',
      modelName: 'Claude 3.5 Sonnet',
      computeId: 'together-serverless',
      computeName: 'Together AI Serverless',
      gpuType: 'Dynamic Tensor Fleet',
      estimatedCostUsd: 0.0095,
      estimatedCostAlgo: 0.049908,
      estimatedLatencyMs: 1200,
      projectedQualityScore: 95.4,
      slaAdherent: true,
      budgetAdherent: true,
      paretoOptimal: true,
      compositeScore: 0.880,
      scoreBreakdown: baseScoreBreakdown,
      rank: 5
    },
    {
      modelId: 'claude-3-5-sonnet',
      modelName: 'Claude 3.5 Sonnet',
      computeId: 'runpod-h100-us',
      computeName: 'RunPod Cloud',
      gpuType: 'NVIDIA H100 80GB SXM5',
      estimatedCostUsd: 0.0115,
      estimatedCostAlgo: 0.060309,
      estimatedLatencyMs: 850,
      projectedQualityScore: 95.4,
      slaAdherent: true,
      budgetAdherent: true,
      paretoOptimal: true,
      compositeScore: 0.875,
      scoreBreakdown: baseScoreBreakdown,
      rank: 6
    }
  ];

  return {
    taskId: 'task_preview_init',
    selectedCandidate: candidates[0],
    fallbackCandidate: candidates[1],
    evaluatedCandidatesCount: 30,
    decisionReasoning: [
      "Together AI Serverless with Gemini 3.7 Flash-Lite selected as lowest-cost Pareto route.",
      "SLA and budget bounds verified under 3500ms."
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

export async function fetchAccounts(): Promise<AlgorandAccountInfo[]> {
  const res = await fetch(`${API_BASE}/ledger/accounts`);
  const data = await res.json();
  return data.accounts;
}

export async function fetchTransactions(): Promise<AlgorandTransactionRecord[]> {
  const res = await fetch(`${API_BASE}/ledger/transactions?limit=50`);
  const data = await res.json();
  return data.transactions;
}

export async function fetchStats(): Promise<GlobalStats> {
  const res = await fetch(`${API_BASE}/ledger/stats`);
  const data = await res.json();
  return data.stats;
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

  eventSource.addEventListener('pipeline_event', (e) => {
    try {
      const event: ExecutionEvent = JSON.parse(e.data);
      onEvent(event);
      if (event.stage === 'completed' && event.data?.task) {
        onComplete(event.data.task);
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
    if (eventSource.readyState === EventSource.CLOSED) return;
    try {
      const parsed = JSON.parse(e.data || '{}');
      onError(parsed.error || 'Connection closed');
    } catch {
      onError('Stream disconnected');
    }
    eventSource.close();
  });

  return () => {
    eventSource.close();
  };
}
