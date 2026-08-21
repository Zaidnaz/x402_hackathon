import { ModelProvider, ComputeProvider } from '../types/index.js';
import { algorandService } from './algorandService.js';

class ProviderRegistry {
  private models: Map<string, ModelProvider> = new Map();
  private computes: Map<string, ComputeProvider> = new Map();

  constructor() {
    this.seedDefaultProviders();
  }

  private seedDefaultProviders() {
    const defaultModels: ModelProvider[] = [
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
        id: 'gemini-2-flash',
        name: 'Gemini 2.0 Flash',
        family: 'Google',
        contextWindow: 1048576,
        qualityBenchmark: 90.2,
        costPer1kInputTokensUsd: 0.00010,
        costPer1kOutputTokensUsd: 0.00040,
        typicalTps: 145,
        reliabilityScore: 0.999,
        supportedModalities: ['code', 'general', 'fast-chat', 'vision', 'batch-summary'],
        providerOrg: 'Google DeepMind',
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

    const defaultComputes: ComputeProvider[] = [
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

    for (const m of defaultModels) this.models.set(m.id, m);
    for (const c of defaultComputes) this.computes.set(c.id, c);
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

  public registerCustomModel(model: ModelProvider): ModelProvider {
    this.models.set(model.id, model);
    return model;
  }

  public registerCustomCompute(compute: ComputeProvider): ComputeProvider {
    const payoutAddr = compute.algorandPayoutAddress || algorandService.getProviderAddress(compute.id);
    const updated = { ...compute, algorandPayoutAddress: payoutAddr };
    this.computes.set(compute.id, updated);
    return updated;
  }

  public updateComputeStatus(id: string, status: ComputeProvider['status']): boolean {
    const comp = this.computes.get(id);
    if (comp) {
      comp.status = status;
      return true;
    }
    return false;
  }
}

export const providerRegistry = new ProviderRegistry();
