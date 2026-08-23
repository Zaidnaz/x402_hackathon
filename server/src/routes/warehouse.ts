import { Hono } from 'hono';
import { z } from 'zod';
import { 
  getProviderRegistry, 
  addProvider, 
  updateProviderAvailability, 
  getProviderById,
  ProviderListing 
} from '../seed.js';

const warehouseRouter = new Hono();

const registerProviderSchema = z.object({
  nodeName: z.string().min(1).max(80).optional(),
  category: z.enum(['MODEL_API', 'COMPUTE_GPU']).default('COMPUTE_GPU'),
  specs: z.string().max(200).optional(),
  pricePerUnit: z.number().positive().max(1000).default(0.1),
  unit: z.enum(['1M_TOKENS', 'HOUR', 'MINUTE']).default('HOUR'),
});

warehouseRouter.get('/providers', (c) => {
  const category = c.req.query('category');
  const providerType = c.req.query('providerType');
  const availability = c.req.query('availability');
  
  let providers = getProviderRegistry();
  
  if (category) {
    providers = providers.filter(p => p.category === category);
  }
  if (providerType) {
    providers = providers.filter(p => p.providerType === providerType);
  }
  if (availability) {
    providers = providers.filter(p => p.availability === availability);
  }
  
  return c.json({
    success: true,
    data: providers,
    count: providers.length
  });
});

warehouseRouter.get('/providers/:id', (c) => {
  const id = c.req.param('id');
  const provider = getProviderById(id);
  
  if (!provider) {
    return c.json({ success: false, error: 'Provider not found' }, 404);
  }
  
  return c.json({ success: true, data: provider });
});

warehouseRouter.post('/providers/register', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = registerProviderSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ 
      success: false, 
      error: parsed.error.issues[0].message 
    }, 400);
  }
  
  const data = parsed.data;
  
  const newProvider = addProvider({
    name: data.nodeName || `Community Node ${Date.now().toString().slice(-6)}`,
    category: data.category,
    providerType: 'COMMUNITY_P2P',
    specs: data.specs || 'Community GPU Node',
    pricePerUnit: data.pricePerUnit,
    unit: data.unit,
    avgLatencyMs: Math.floor(Math.random() * 40) + 30,
    uptimeScore: 100.0,
    availability: 'AVAILABLE',
    registeredBy: 'community'
  });
  
  return c.json({ 
    success: true, 
    message: 'GPU successfully listed on AgentGrid Marketplace!',
    data: newProvider 
  });
});

warehouseRouter.post('/providers/:id/availability', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json().catch(() => ({}));
  
  const availabilitySchema = z.object({
    availability: z.enum(['AVAILABLE', 'BUSY', 'OFFLINE'])
  });
  
  const parsed = availabilitySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: 'Invalid availability value' }, 400);
  }
  
  const updated = updateProviderAvailability(id, parsed.data.availability);
  
  if (!updated) {
    return c.json({ success: false, error: 'Provider not found' }, 404);
  }
  
  return c.json({ success: true, data: updated });
});

warehouseRouter.post('/route', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  
  const routeSchema = z.object({
    taskType: z.enum(['MODEL_API', 'COMPUTE_GPU']),
    maxBudget: z.number().positive(),
    maxLatency: z.number().positive().optional(),
    minUptime: z.number().min(0).max(100).optional(),
  });
  
  const parsed = routeSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: parsed.error.issues[0].message }, 400);
  }
  
  const { taskType, maxBudget, maxLatency, minUptime } = parsed.data;
  
  let candidates = getProviderRegistry().filter(p => 
    p.category === taskType &&
    p.availability === 'AVAILABLE' &&
    p.pricePerUnit <= maxBudget
  );
  
  if (maxLatency) {
    candidates = candidates.filter(p => p.avgLatencyMs <= maxLatency);
  }
  
  if (minUptime) {
    candidates = candidates.filter(p => p.uptimeScore >= minUptime);
  }
  
  if (candidates.length === 0) {
    return c.json({ 
      success: false, 
      error: 'No providers matched your SLA constraints' 
    }, 404);
  }
  
  const scored = candidates.map(p => ({
    ...p,
    score: (100 - p.pricePerUnit * 10) + (100 - p.avgLatencyMs / 10) + (p.uptimeScore / 2)
  })).sort((a, b) => b.score - a.score);
  
  return c.json({
    success: true,
    data: {
      recommended: scored[0],
      alternatives: scored.slice(1, 3)
    }
  });
});

export { warehouseRouter };