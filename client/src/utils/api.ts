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

export async function fetchCatalog(): Promise<{ models: ModelProvider[]; computes: ComputeProvider[] }> {
  const res = await fetch(`${API_BASE}/marketplace/catalog`);
  const data = await res.json();
  return data.data;
}

export async function analyzePrompt(prompt: string, overrides?: Partial<TaskRequirement>): Promise<TaskRequirement> {
  const res = await fetch(`${API_BASE}/tasks/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, overrides })
  });
  const data = await res.json();
  return data.requirement;
}

export async function evaluateRoute(requirement: TaskRequirement): Promise<RoutingDecision> {
  const res = await fetch(`${API_BASE}/tasks/evaluate-route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requirement })
  });
  const data = await res.json();
  return data.routing;
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
