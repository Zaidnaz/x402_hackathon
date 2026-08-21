import { Hono } from 'hono';
import { providerRegistry } from '../services/providerRegistry.js';

const marketplaceRouter = new Hono();

marketplaceRouter.get('/catalog', (c) => {
  const models = providerRegistry.getAllModels();
  const computes = providerRegistry.getAllComputes();

  return c.json({
    success: true,
    data: {
      models,
      computes,
      summary: {
        totalModels: models.length,
        totalComputes: computes.length,
        activeNodes: computes.filter(comp => comp.status === 'active').length,
        supportedGpus: Array.from(new Set(computes.map(comp => comp.gpuType)))
      }
    }
  });
});

marketplaceRouter.post('/register-model', async (c) => {
  const body = await c.req.json();
  if (!body.id || !body.name || !body.costPer1kInputTokensUsd) {
    return c.json({ success: false, error: 'Missing required model fields' }, 400);
  }

  const model = providerRegistry.registerCustomModel({
    id: body.id,
    name: body.name,
    family: body.family || 'Community',
    contextWindow: body.contextWindow || 64000,
    qualityBenchmark: body.qualityBenchmark || 85.0,
    costPer1kInputTokensUsd: body.costPer1kInputTokensUsd,
    costPer1kOutputTokensUsd: body.costPer1kOutputTokensUsd || body.costPer1kInputTokensUsd * 2,
    typicalTps: body.typicalTps || 80,
    reliabilityScore: body.reliabilityScore || 0.99,
    supportedModalities: body.supportedModalities || ['code', 'general'],
    providerOrg: body.providerOrg || 'Independent Provider',
    status: 'online'
  });

  return c.json({ success: true, message: 'Model registered successfully', model });
});

marketplaceRouter.post('/register-compute', async (c) => {
  const body = await c.req.json();
  if (!body.id || !body.name || !body.gpuType || !body.costPerHourUsd) {
    return c.json({ success: false, error: 'Missing required compute node fields' }, 400);
  }

  const compute = providerRegistry.registerCustomCompute({
    id: body.id,
    name: body.name,
    gpuType: body.gpuType,
    vramGb: body.vramGb || 48,
    region: body.region || 'US-Central',
    costPerHourUsd: body.costPerHourUsd,
    latencyBaseMs: body.latencyBaseMs || 45,
    bandwidthGbps: body.bandwidthGbps || 100,
    interconnect: body.interconnect || 'PCIe 4.0',
    reliabilityUptime: body.reliabilityUptime || 99.9,
    currentLoad: body.currentLoad || 20,
    algorandPayoutAddress: body.algorandPayoutAddress || '',
    endpointUrl: body.endpointUrl || `https://api.agentgrid.io/v1/node/${body.id}`,
    x402Supported: true,
    status: 'active'
  });

  return c.json({ success: true, message: 'Compute node registered successfully', compute });
});

marketplaceRouter.post('/toggle-status', async (c) => {
  const body = await c.req.json();
  const { computeId, status } = body;
  if (!computeId || !status) {
    return c.json({ success: false, error: 'computeId and status required' }, 400);
  }
  const updated = providerRegistry.updateComputeStatus(computeId, status);
  return c.json({ success: updated, computeId, status });
});

export { marketplaceRouter };
