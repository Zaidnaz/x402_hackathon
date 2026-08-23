import { ModelProvider, ComputeProvider, TaskRequirement, TaskModality } from '../types';

const ALGO_USD_RATE = 0.1904;

export interface CostEstimate {
  minAlgo: number;
  maxAlgo: number;
  minUsd: number;
  maxUsd: number;
  estimatedLatencyMs: number;
  breakdown: {
    tokenCostUsd: number;
    computeCostUsd: number;
    totalCostUsd: number;
    protocolFeeAlgo: number;
    providerPayoutAlgo: number;
  };
  gpuBoost: number;
  netTps: number;
}

export function estimateTaskCost(
  prompt: string,
  model: ModelProvider,
  compute: ComputeProvider,
  overrides?: Partial<TaskRequirement>
): CostEstimate {
  const wordCount = prompt.split(/\s+/).length;
  const estimatedInputTokens = overrides?.estimatedInputTokens || Math.round(wordCount * 1.35);
  const estimatedOutputTokens = overrides?.estimatedOutputTokens || 600;
  const deadlineMs = overrides?.deadlineMs || 3500;

  let gpuBoost = 1.0;
  if (compute.gpuType.includes('H200')) gpuBoost = 1.65;
  else if (compute.gpuType.includes('H100')) gpuBoost = 1.45;
  else if (compute.gpuType.includes('A100')) gpuBoost = 1.15;
  else if (compute.gpuType.includes('L40S')) gpuBoost = 0.95;

  const netTps = model.typicalTps * gpuBoost;
  const processingTimeSec = estimatedOutputTokens / Math.max(1, netTps);
  const processingLatencyMs = Math.round(processingTimeSec * 1000);
  const totalEstimatedLatencyMs = compute.latencyBaseMs + processingLatencyMs;

  const tokenCostUsd = (
    (estimatedInputTokens * model.costPer1kInputTokensUsd) +
    (estimatedOutputTokens * model.costPer1kOutputTokensUsd)
  ) / 1000;

  const computeCostUsd = (processingTimeSec / 3600) * compute.costPerHourUsd;
  const totalCostUsd = tokenCostUsd + computeCostUsd;
  const totalCostAlgo = totalCostUsd / ALGO_USD_RATE;

  const protocolFeeAlgo = Number((totalCostAlgo * 0.015).toFixed(6));
  const providerPayoutAlgo = Number((totalCostAlgo - protocolFeeAlgo).toFixed(6));

  const minAlgo = Number((totalCostAlgo * 0.8).toFixed(6));
  const maxAlgo = Number((totalCostAlgo * 1.3).toFixed(6));
  const minUsd = Number((totalCostUsd * 0.8).toFixed(4));
  const maxUsd = Number((totalCostUsd * 1.3).toFixed(4));

  return {
    minAlgo,
    maxAlgo,
    minUsd,
    maxUsd,
    estimatedLatencyMs: totalEstimatedLatencyMs,
    breakdown: {
      tokenCostUsd: Number(tokenCostUsd.toFixed(6)),
      computeCostUsd: Number(computeCostUsd.toFixed(6)),
      totalCostUsd: Number(totalCostUsd.toFixed(6)),
      protocolFeeAlgo,
      providerPayoutAlgo,
    },
    gpuBoost,
    netTps: Math.round(netTps),
  };
}

export function formatCostRange(estimate: CostEstimate): string {
  if (estimate.minAlgo === estimate.maxAlgo) {
    return `${estimate.minAlgo.toFixed(6)} ALGO (~$${estimate.minUsd.toFixed(4)})`;
  }
  return `${estimate.minAlgo.toFixed(6)}–${estimate.maxAlgo.toFixed(6)} ALGO (~$${estimate.minUsd.toFixed(4)}–$${estimate.maxUsd.toFixed(4)})`;
}

export function getModelModalityLabel(modality: TaskModality): string {
  const labels: Record<TaskModality, string> = {
    code: 'Code Generation',
    reasoning: 'Complex Reasoning',
    general: 'General Chat',
    'fast-chat': 'Fast Chat',
    'batch-summary': 'Batch Summarization',
    vision: 'Vision / Multimodal',
    embeddings: 'Embeddings',
  };
  return labels[modality] || modality;
}

export function getSupportedModalitiesDisplay(model: ModelProvider): string[] {
  return model.supportedModalities.map(getModelModalityLabel);
}