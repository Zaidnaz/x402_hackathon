import { ModelProvider, ComputeProvider } from '../types/index.js';
import { algorandService } from './algorandService.js';
import { supabase } from '../db/supabaseClient.js';

const DEFAULT_MODELS: ModelProvider[] = [
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

function buildDefaultComputes(): ComputeProvider[] {
  return [
    {
      id: 'runpod-h100-us',
      name: 'RunPod Cloud',
      gpuType: 'NVIDIA H100 80GB SXM5',
      vramGb: 80,
      region: 'US-East (N. Virginia)',
      costPerHourUsd: 2.89,
      latencyBaseMs: 42,
      bandwidthGbps: 100,
      interconnect: 'NVLink 900 GB/s',
      reliabilityUptime: 99.95,
      currentLoad: 48,
      algorandPayoutAddress: algorandService.getProviderAddress('runpod-h100-us'),
      endpointUrl: 'https://api.runpod.ai/v2/x402-node-us/inference',
      x402Supported: true,
      status: 'active'
    },
    {
      id: 'lambda-a100-eu',
      name: 'Lambda Labs',
      gpuType: 'NVIDIA A100 80GB SXM4',
      vramGb: 80,
      region: 'EU-West (Frankfurt)',
      costPerHourUsd: 1.65,
      latencyBaseMs: 78,
      bandwidthGbps: 50,
      interconnect: 'NVLink 600 GB/s',
      reliabilityUptime: 99.88,
      currentLoad: 62,
      algorandPayoutAddress: algorandService.getProviderAddress('lambda-a100-eu'),
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
      algorandPayoutAddress: algorandService.getProviderAddress('together-serverless'),
      endpointUrl: 'https://api.together.xyz/v1/x402/completions',
      x402Supported: true,
      status: 'active'
    },
    {
      id: 'coreweave-h200-us',
      name: 'CoreWeave Dedicated',
      gpuType: 'NVIDIA H200 141GB HBM3e',
      vramGb: 141,
      region: 'US-Central (Chicago)',
      costPerHourUsd: 4.25,
      latencyBaseMs: 28,
      bandwidthGbps: 400,
      interconnect: 'Infiniband NDR 3.2Tbps',
      reliabilityUptime: 99.99,
      currentLoad: 78,
      algorandPayoutAddress: algorandService.getProviderAddress('coreweave-h200-us'),
      endpointUrl: 'https://coreweave.cloud/x402/ultra-tier',
      x402Supported: true,
      status: 'active'
    },
    {
      id: 'octo-l40s-asia',
      name: 'OctoAI Edge Node',
      gpuType: 'NVIDIA L40S 48GB Ada',
      vramGb: 48,
      region: 'AP-East (Tokyo)',
      costPerHourUsd: 1.20,
      latencyBaseMs: 140,
      bandwidthGbps: 30,
      interconnect: 'PCIe 4.0',
      reliabilityUptime: 99.82,
      currentLoad: 24,
      algorandPayoutAddress: algorandService.getProviderAddress('octo-l40s-asia'),
      endpointUrl: 'https://octoai.cloud/x402/tokyo-l40s',
      x402Supported: true,
      status: 'active'
    }
  ];
}

function modelToRow(m: ModelProvider) {
  return {
    id: m.id,
    name: m.name,
    family: m.family,
    context_window: m.contextWindow,
    quality_benchmark: m.qualityBenchmark,
    cost_per_1k_input_tokens_usd: m.costPer1kInputTokensUsd,
    cost_per_1k_output_tokens_usd: m.costPer1kOutputTokensUsd,
    typical_tps: m.typicalTps,
    reliability_score: m.reliabilityScore,
    supported_modalities: m.supportedModalities,
    provider_org: m.providerOrg,
    status: m.status
  };
}

function rowToModel(r: any): ModelProvider {
  return {
    id: r.id,
    name: r.name,
    family: r.family,
    contextWindow: r.context_window,
    qualityBenchmark: Number(r.quality_benchmark),
    costPer1kInputTokensUsd: Number(r.cost_per_1k_input_tokens_usd),
    costPer1kOutputTokensUsd: Number(r.cost_per_1k_output_tokens_usd),
    typicalTps: Number(r.typical_tps),
    reliabilityScore: Number(r.reliability_score),
    supportedModalities: r.supported_modalities,
    providerOrg: r.provider_org,
    status: r.status
  };
}

function computeToRow(c: ComputeProvider) {
  return {
    id: c.id,
    name: c.name,
    gpu_type: c.gpuType,
    vram_gb: c.vramGb,
    region: c.region,
    cost_per_hour_usd: c.costPerHourUsd,
    latency_base_ms: c.latencyBaseMs,
    bandwidth_gbps: c.bandwidthGbps,
    interconnect: c.interconnect,
    reliability_uptime: c.reliabilityUptime,
    current_load: c.currentLoad,
    algorand_payout_address: c.algorandPayoutAddress,
    endpoint_url: c.endpointUrl,
    x402_supported: c.x402Supported,
    status: c.status
  };
}

function rowToCompute(r: any): ComputeProvider {
  return {
    id: r.id,
    name: r.name,
    gpuType: r.gpu_type,
    vramGb: r.vram_gb,
    region: r.region,
    costPerHourUsd: Number(r.cost_per_hour_usd),
    latencyBaseMs: r.latency_base_ms,
    bandwidthGbps: r.bandwidth_gbps,
    interconnect: r.interconnect,
    reliabilityUptime: Number(r.reliability_uptime),
    currentLoad: r.current_load,
    algorandPayoutAddress: r.algorand_payout_address,
    endpointUrl: r.endpoint_url,
    x402Supported: r.x402_supported,
    status: r.status
  };
}

class ProviderRegistry {
  // In-memory read cache: routerEngine scores every model x compute
  // combination synchronously per task, so this stays a plain Map fed from
  // Postgres at startup rather than an async DB call per lookup.
  private models: Map<string, ModelProvider> = new Map();
  private computes: Map<string, ComputeProvider> = new Map();
  private initialized = false;

  /**
   * Loads the catalog from Postgres, seeding it with the default catalog on
   * first boot. Must be awaited before the server starts accepting traffic.
   */
  public async init(): Promise<void> {
    if (this.initialized) return;

    const [{ data: modelRows, error: modelErr }, { data: computeRows, error: computeErr }] = await Promise.all([
      supabase.from('model_providers').select('*'),
      supabase.from('compute_providers').select('*')
    ]);

    if (modelErr) console.error('[ProviderRegistry] Failed to load model_providers:', modelErr.message);
    if (computeErr) console.error('[ProviderRegistry] Failed to load compute_providers:', computeErr.message);

    if (modelRows && modelRows.length > 0) {
      for (const row of modelRows) this.models.set(row.id, rowToModel(row));
    } else {
      const { error } = await supabase.from('model_providers').insert(DEFAULT_MODELS.map(modelToRow));
      if (error) console.error('[ProviderRegistry] Failed to seed model_providers:', error.message);
      for (const m of DEFAULT_MODELS) this.models.set(m.id, m);
    }

    if (computeRows && computeRows.length > 0) {
      for (const row of computeRows) this.computes.set(row.id, rowToCompute(row));
    } else {
      const defaults = buildDefaultComputes();
      const { error } = await supabase.from('compute_providers').insert(defaults.map(computeToRow));
      if (error) console.error('[ProviderRegistry] Failed to seed compute_providers:', error.message);
      for (const c of defaults) this.computes.set(c.id, c);
    }

    this.initialized = true;
    console.log(`[ProviderRegistry] Loaded ${this.models.size} models, ${this.computes.size} compute providers from Postgres.`);
  }

  public getAllModels(): ModelProvider[] {
    return Array.from(this.models.values());
  }

  public getAllComputes(): ComputeProvider[] {
    return Array.from(this.computes.values());
  }

  public getModel(id: string): ModelProvider | undefined {
    return this.models.get(id);
  }

  public getCompute(id: string): ComputeProvider | undefined {
    return this.computes.get(id);
  }

  public async registerCustomModel(model: ModelProvider): Promise<ModelProvider> {
    const { error } = await supabase.from('model_providers').upsert(modelToRow(model));
    if (error) console.error('[ProviderRegistry] Failed to persist custom model:', error.message);
    this.models.set(model.id, model);
    return model;
  }

  public async registerCustomCompute(compute: ComputeProvider): Promise<ComputeProvider> {
    const payoutAddr = compute.algorandPayoutAddress || algorandService.getProviderAddress(compute.id);
    const updated = { ...compute, algorandPayoutAddress: payoutAddr };
    const { error } = await supabase.from('compute_providers').upsert(computeToRow(updated));
    if (error) console.error('[ProviderRegistry] Failed to persist custom compute:', error.message);
    this.computes.set(compute.id, updated);
    return updated;
  }

  public async updateComputeStatus(id: string, status: ComputeProvider['status']): Promise<boolean> {
    const comp = this.computes.get(id);
    if (!comp) return false;

    comp.status = status;
    const { error } = await supabase.from('compute_providers').update({ status }).eq('id', id);
    if (error) console.error('[ProviderRegistry] Failed to persist compute status:', error.message);
    return true;
  }
}

export const providerRegistry = new ProviderRegistry();
