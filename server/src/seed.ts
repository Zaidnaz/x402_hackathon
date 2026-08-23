export interface ProviderListing {
  id: string;
  name: string;
  category: 'MODEL_API' | 'COMPUTE_GPU';
  providerType: 'ENTERPRISE' | 'COMMUNITY_P2P';
  specs: string;
  pricePerUnit: number;
  unit: '1M_TOKENS' | 'HOUR' | 'MINUTE';
  avgLatencyMs: number;
  uptimeScore: number;
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE';
  isRealEndpoint?: boolean;
  registeredAt: number;
  registeredBy?: string;
}

export const DUMMY_DATA_WAREHOUSE: ProviderListing[] = [
  {
    id: "mod-01",
    name: "Groq Llama-3-70B",
    category: "MODEL_API",
    providerType: "ENTERPRISE",
    specs: "70B Params | LPUs | 8k Context",
    pricePerUnit: 0.85,
    unit: "1M_TOKENS",
    avgLatencyMs: 80,
    uptimeScore: 99.9,
    availability: "AVAILABLE",
    registeredAt: Date.now() - 86400000 * 30,
    registeredBy: "system"
  },
  {
    id: "mod-02",
    name: "DeepSeek V3 (Together AI)",
    category: "MODEL_API",
    providerType: "ENTERPRISE",
    specs: "671B MoE | 128k Context",
    pricePerUnit: 0.28,
    unit: "1M_TOKENS",
    avgLatencyMs: 210,
    uptimeScore: 99.5,
    availability: "AVAILABLE",
    registeredAt: Date.now() - 86400000 * 15,
    registeredBy: "system"
  },
  {
    id: "mod-03",
    name: "Local vLLM Container (Live Demo)",
    category: "MODEL_API",
    providerType: "COMMUNITY_P2P",
    specs: "Qwen-2.5-7B | RTX 4090 Native",
    pricePerUnit: 0.05,
    unit: "1M_TOKENS",
    avgLatencyMs: 45,
    uptimeScore: 100.0,
    availability: "AVAILABLE",
    isRealEndpoint: true,
    registeredAt: Date.now() - 86400000 * 7,
    registeredBy: "system"
  },
  {
    id: "gpu-01",
    name: "RunPod Spot Instance",
    category: "COMPUTE_GPU",
    providerType: "ENTERPRISE",
    specs: "1x NVIDIA RTX 4090 | 24GB VRAM | 64GB RAM",
    pricePerUnit: 0.45,
    unit: "HOUR",
    avgLatencyMs: 30,
    uptimeScore: 98.7,
    availability: "AVAILABLE",
    registeredAt: Date.now() - 86400000 * 60,
    registeredBy: "system"
  },
  {
    id: "gpu-02",
    name: "Lambda Cloud Node",
    category: "COMPUTE_GPU",
    providerType: "ENTERPRISE",
    specs: "1x NVIDIA H100 SXM | 80GB VRAM | 200GB RAM",
    pricePerUnit: 2.10,
    unit: "HOUR",
    avgLatencyMs: 15,
    uptimeScore: 99.9,
    availability: "BUSY",
    registeredAt: Date.now() - 86400000 * 45,
    registeredBy: "system"
  },
  {
    id: "p2p-01",
    name: "Alex's Home Rig (P2P)",
    category: "COMPUTE_GPU",
    providerType: "COMMUNITY_P2P",
    specs: "1x RTX 3090 | 24GB VRAM | Ubuntu 24.04",
    pricePerUnit: 0.20,
    unit: "HOUR",
    avgLatencyMs: 65,
    uptimeScore: 96.2,
    availability: "AVAILABLE",
    registeredAt: Date.now() - 86400000 * 3,
    registeredBy: "community"
  }
];

let providerRegistry: ProviderListing[] = [...DUMMY_DATA_WAREHOUSE];

export function getProviderRegistry(): ProviderListing[] {
  return providerRegistry;
}

export function addProvider(provider: Omit<ProviderListing, 'id' | 'registeredAt'>): ProviderListing {
  const newProvider: ProviderListing = {
    ...provider,
    id: `p2p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    registeredAt: Date.now(),
  };
  providerRegistry.unshift(newProvider);
  return newProvider;
}

export function updateProviderAvailability(id: string, availability: ProviderListing['availability']): ProviderListing | undefined {
  const idx = providerRegistry.findIndex(p => p.id === id);
  if (idx === -1) return undefined;
  providerRegistry[idx] = { ...providerRegistry[idx], availability };
  return providerRegistry[idx];
}

export function getProviderById(id: string): ProviderListing | undefined {
  return providerRegistry.find(p => p.id === id);
}