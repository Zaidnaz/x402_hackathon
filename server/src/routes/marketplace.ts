import { Hono } from 'hono';
import { providerRegistry } from '../services/providerRegistry.js';
import { registerModelBodySchema, registerComputeBodySchema, formatZodError } from '../validators.js';
import { z } from 'zod';

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
  const body = await c.req.json().catch(() => ({}));
  const parsed = registerModelBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: formatZodError(parsed.error) }, 400);
  }
  const d = parsed.data;

  const model = await providerRegistry.registerCustomModel({
    id: d.id,
    name: d.name,
    family: d.family || 'Community',
    contextWindow: d.contextWindow || 64000,
    qualityBenchmark: d.qualityBenchmark || 85.0,
    costPer1kInputTokensUsd: d.costPer1kInputTokensUsd,
    costPer1kOutputTokensUsd: d.costPer1kOutputTokensUsd || d.costPer1kInputTokensUsd * 2,
    typicalTps: d.typicalTps || 80,
    reliabilityScore: d.reliabilityScore || 0.99,
    supportedModalities: d.supportedModalities || ['code', 'general'],
    providerOrg: d.providerOrg || 'Independent Provider',
    status: 'online'
  });

  return c.json({ success: true, message: 'Model registered successfully', model });
});

marketplaceRouter.post('/register-compute', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = registerComputeBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: formatZodError(parsed.error) }, 400);
  }
  const d = parsed.data;

  const compute = await providerRegistry.registerCustomCompute({
    id: d.id,
    name: d.name,
    gpuType: d.gpuType,
    vramGb: d.vramGb || 48,
    region: d.region || 'US-Central',
    costPerHourUsd: d.costPerHourUsd,
    latencyBaseMs: d.latencyBaseMs || 45,
    bandwidthGbps: d.bandwidthGbps || 100,
    interconnect: d.interconnect || 'PCIe 4.0',
    reliabilityUptime: d.reliabilityUptime || 99.9,
    currentLoad: d.currentLoad || 20,
    algorandPayoutAddress: d.algorandPayoutAddress || '',
    endpointUrl: d.endpointUrl || `https://api.agentgrid.io/v1/node/${d.id}`,
    x402Supported: true,
    status: 'active'
  });

  return c.json({ success: true, message: 'Compute node registered successfully', compute });
});

const toggleStatusSchema = z.object({
  computeId: z.string().trim().min(1),
  status: z.enum(['active', 'busy', 'offline', 'degraded'])
});

marketplaceRouter.post('/toggle-status', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = toggleStatusSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: formatZodError(parsed.error) }, 400);
  }
  const updated = await providerRegistry.updateComputeStatus(parsed.data.computeId, parsed.data.status);
  return c.json({ success: updated, computeId: parsed.data.computeId, status: parsed.data.status });
});

export { marketplaceRouter };
