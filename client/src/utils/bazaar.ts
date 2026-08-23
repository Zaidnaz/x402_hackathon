export interface BazaarEndpoint {
  id: string;
  name: string;
  description: string;
  endpointUrl: string;
  paymentAddress: string;
  price: number; // microALGO
  category: string;
  tags: string[];
  network: 'algorand-testnet' | 'algorand-mainnet';
  scheme: 'exact';
  facilitator: string;
  registeredAt: number;
  verified: boolean;
}

export interface BazaarRegistrationRequest {
  name: string;
  description: string;
  endpointUrl: string;
  paymentAddress: string;
  price: number;
  category: string;
  tags: string[];
  network: 'algorand-testnet' | 'algorand-mainnet';
  scheme: 'exact';
}

export interface BazaarRegistrationResponse {
  success: boolean;
  endpointId?: string;
  bazaarUrl?: string;
  error?: string;
}

const GOPLAUSIBLE_FACILITATOR = 'https://facilitator.goplausible.xyz';
const BAZAAR_API_BASE = 'https://facilitator.goplausible.xyz/api/v1';

export async function registerOnGoPlausibleBazaar(
  endpoint: BazaarRegistrationRequest,
  apiKey?: string
): Promise<BazaarRegistrationResponse> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const res = await fetch(`${BAZAAR_API_BASE}/endpoints`, {
      method: 'POST',
      headers,
      body: JSON.stringify(endpoint),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.error || `Registration failed: ${res.status} ${res.statusText}`,
      };
    }

    return {
      success: true,
      endpointId: data.id,
      bazaarUrl: `https://facilitator.goplausible.xyz/bazaar/${data.id}`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error during bazaar registration',
    };
  }
}

export async function getBazaarEndpoints(filters?: {
  category?: string;
  network?: string;
}): Promise<BazaarEndpoint[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.network) params.append('network', filters.network);

    const res = await fetch(`${BAZAAR_API_BASE}/endpoints?${params.toString()}`);
    const data = await res.json();

    if (!res.ok) {
      console.warn('Failed to fetch bazaar endpoints:', data);
      return [];
    }

    return data.endpoints || [];
  } catch (error) {
    console.warn('Error fetching bazaar endpoints:', error);
    return [];
  }
}

export function generateAgentGridBazaarPayload(
  providerName: string,
  endpointUrl: string,
  paymentAddress: string,
  priceMicroAlgo: number,
  category: string = 'ai-compute',
  tags: string[] = ['agentgrid', 'x402', 'algorand']
): BazaarRegistrationRequest {
  return {
    name: `AgentGrid: ${providerName}`,
    description: `AgentGrid x402-enabled compute endpoint. Autonomous agent pays per task via Algorand TestNet.`,
    endpointUrl,
    paymentAddress,
    price: priceMicroAlgo,
    category,
    tags,
    network: 'algorand-testnet',
    scheme: 'exact',
  };
}

export async function autoRegisterAgentGridEndpoint(
  providerName: string,
  endpointUrl: string,
  paymentAddress: string,
  priceMicroAlgo: number,
  apiKey?: string
): Promise<BazaarRegistrationResponse> {
  const payload = generateAgentGridBazaarPayload(
    providerName,
    endpointUrl,
    paymentAddress,
    priceMicroAlgo
  );
  return registerOnGoPlausibleBazaar(payload, apiKey);
}