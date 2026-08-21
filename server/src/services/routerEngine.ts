import { 
  TaskRequirement, 
  CandidateEvaluation, 
  RoutingDecision, 
  ModelProvider, 
  ComputeProvider 
} from '../types/index.js';
import { providerRegistry } from './providerRegistry.js';
import { ALGO_USD_RATE } from './aiAnalyzer.js';

export class RouterEngine {
  /**
   * Deterministically evaluates the entire grid and chooses the optimal Model + GPU combination
   */
  public static evaluateGrid(requirement: TaskRequirement): RoutingDecision {
    const models = providerRegistry.getAllModels().filter(m => m.status !== 'offline');
    const computes = providerRegistry.getAllComputes().filter(c => c.status !== 'offline');

    const candidates: CandidateEvaluation[] = [];

    // Evaluate all combinations
    for (const model of models) {
      // Check modality support
      if (!model.supportedModalities.includes(requirement.modality) && !model.supportedModalities.includes('general')) {
        continue;
      }

      for (const compute of computes) {
        // Calculate GPU acceleration boost
        let gpuBoost = 1.0;
        if (compute.gpuType.includes('H200')) gpuBoost = 1.65;
        else if (compute.gpuType.includes('H100')) gpuBoost = 1.45;
        else if (compute.gpuType.includes('A100')) gpuBoost = 1.15;
        else if (compute.gpuType.includes('L40S')) gpuBoost = 0.95;

        // Latency calculation (ms)
        const netTps = model.typicalTps * gpuBoost;
        const processingTimeSec = requirement.estimatedOutputTokens / Math.max(1, netTps);
        const processingLatencyMs = Math.round(processingTimeSec * 1000);
        const totalEstimatedLatencyMs = compute.latencyBaseMs + processingLatencyMs;

        // Cost calculation (USD)
        const tokenCostUsd = (
          (requirement.estimatedInputTokens * model.costPer1kInputTokensUsd) +
          (requirement.estimatedOutputTokens * model.costPer1kOutputTokensUsd)
        ) / 1000;

        const computeCostUsd = (processingTimeSec / 3600) * compute.costPerHourUsd;
        const totalCostUsd = tokenCostUsd + computeCostUsd;
        const totalCostAlgo = Number((totalCostUsd / ALGO_USD_RATE).toFixed(6));

        // Quality calculation (0 - 100)
        const loadPenalty = (compute.currentLoad > 85 ? (compute.currentLoad - 85) * 0.2 : 0);
        const projectedQuality = Number(Math.max(0, model.qualityBenchmark - loadPenalty).toFixed(1));

        // Constraint Checks
        const slaAdherent = totalEstimatedLatencyMs <= requirement.deadlineMs;
        const budgetAdherent = totalCostAlgo <= requirement.maxBudgetAlgo;

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
          paretoOptimal: false, // Calculated next
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
      throw new Error('No compatible providers found in AgentGrid catalog.');
    }

    // Determine min/max for normalization
    const minCost = Math.min(...candidates.map(c => c.estimatedCostUsd));
    const maxCost = Math.max(...candidates.map(c => c.estimatedCostUsd)) || 1;
    const minLat = Math.min(...candidates.map(c => c.estimatedLatencyMs));
    const maxLat = Math.max(...candidates.map(c => c.estimatedLatencyMs)) || 1;

    // Weights configuration
    let wCost = 0.30;
    let wLat = 0.30;
    let wQual = 0.30;
    let wRel = 0.10;

    if (requirement.priority === 'cost') {
      wCost = 0.55; wLat = 0.15; wQual = 0.20; wRel = 0.10;
    } else if (requirement.priority === 'speed') {
      wCost = 0.15; wLat = 0.55; wQual = 0.20; wRel = 0.10;
    } else if (requirement.priority === 'quality') {
      wCost = 0.15; wLat = 0.15; wQual = 0.60; wRel = 0.10;
    }

    if (requirement.customWeights) {
      wCost = requirement.customWeights.cost;
      wLat = requirement.customWeights.latency;
      wQual = requirement.customWeights.quality;
      wRel = requirement.customWeights.reliability;
    }

    // Calculate normalized composite scores
    for (const c of candidates) {
      const model = providerRegistry.getModel(c.modelId)!;
      const compute = providerRegistry.getCompute(c.computeId)!;

      // Inverted normalization: lower cost is better, lower latency is better
      const costNorm = 1 - ((c.estimatedCostUsd - minCost) / Math.max(0.00001, maxCost - minCost));
      const latNorm = 1 - ((c.estimatedLatencyMs - minLat) / Math.max(1, maxLat - minLat));
      const qualNorm = c.projectedQualityScore / 100;
      const relNorm = (model.reliabilityScore * (compute.reliabilityUptime / 100));

      const costScore = Number((costNorm * 100 * wCost).toFixed(2));
      const latencyScore = Number((latNorm * 100 * wLat).toFixed(2));
      const qualityScore = Number((qualNorm * 100 * wQual).toFixed(2));
      const reliabilityScore = Number((relNorm * 100 * wRel).toFixed(2));

      let penalty = 0;
      if (!c.slaAdherent) penalty += 35; // SLA violation penalty
      if (!c.budgetAdherent) penalty += 40; // Budget violation penalty
      if (c.projectedQualityScore < requirement.minQualityScore) penalty += 25; // Quality threshold penalty

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

    // Calculate Pareto Optimality (Non-dominated in Cost, Latency, Quality)
    for (let i = 0; i < candidates.length; i++) {
      let dominated = false;
      for (let j = 0; j < candidates.length; j++) {
        if (i === j) continue;
        const a = candidates[i];
        const b = candidates[j];
        // B dominates A if B is <= cost, <= latency, >= quality and strictly better in at least one
        if (
          b.estimatedCostUsd <= a.estimatedCostUsd &&
          b.estimatedLatencyMs <= a.estimatedLatencyMs &&
          b.projectedQualityScore >= a.projectedQualityScore &&
          (b.estimatedCostUsd < a.estimatedCostUsd || b.estimatedLatencyMs < a.estimatedLatencyMs || b.projectedQualityScore > a.projectedQualityScore)
        ) {
          dominated = true;
          break;
        }
      }
      candidates[i].paretoOptimal = !dominated;
    }

    // Sort descending by composite score
    candidates.sort((a, b) => b.compositeScore - a.compositeScore);
    candidates.forEach((c, idx) => c.rank = idx + 1);

    const selected = candidates[0];
    // Pick fallback candidate from a DIFFERENT compute provider to guarantee fault tolerance
    const fallback = candidates.find(c => c.computeId !== selected.computeId && c.modelId !== selected.modelId) || candidates[1] || candidates[0];

    const paretoFrontier = candidates.filter(c => c.paretoOptimal);

    const decisionReasoning: string[] = [
      `Evaluated ${candidates.length} candidate combinations across ${models.length} models and ${computes.length} compute nodes.`,
      `Optimal selection: [${selected.modelName}] hosted on [${selected.computeName} (${selected.gpuType})].`,
      `Achieved composite score of ${selected.compositeScore} pts (Quality: ${selected.projectedQualityScore}/100, Est Latency: ${selected.estimatedLatencyMs}ms, Cost: ${selected.estimatedCostAlgo} ALGO).`,
      `SLA Status: ${selected.slaAdherent ? 'Compliant' : 'Warning: Exceeds Target'} | Budget Status: ${selected.budgetAdherent ? 'Under Budget' : 'Exceeds Budget'}.`,
      `Designated failover node: [${fallback.modelName}] on [${fallback.computeName}] (Score: ${fallback.compositeScore} pts).`
    ];

    return {
      taskId: requirement.id,
      selectedCandidate: selected,
      fallbackCandidate: fallback,
      evaluatedCandidatesCount: candidates.length,
      decisionReasoning,
      paretoFrontier,
      timestamp: Date.now()
    };
  }
}
