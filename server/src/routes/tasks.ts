import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { AIAnalyzer } from '../services/aiAnalyzer.js';
import { RouterEngine } from '../services/routerEngine.js';
import { WorkloadExecutor } from '../services/executor.js';
import { storage } from '../db/storage.js';
import {
  executeTaskBodySchema,
  analyzeBodySchema,
  evaluateRouteBodySchema,
  promptSchema,
  requirementOverridesSchema,
  formatZodError
} from '../validators.js';

const tasksRouter = new Hono();

// Analyze prompt & extract requirements
tasksRouter.post('/analyze', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = analyzeBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: formatZodError(parsed.error) }, 400);
  }
  const requirement = AIAnalyzer.analyzeTask(parsed.data.prompt, parsed.data.overrides);
  return c.json({ success: true, requirement });
});

// Evaluate routing matrix for given requirements
tasksRouter.post('/evaluate-route', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = evaluateRouteBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: formatZodError(parsed.error) }, 400);
  }
  const requirement = parsed.data.requirement || AIAnalyzer.analyzeTask(parsed.data.prompt!);
  const routing = RouterEngine.evaluateGrid(requirement);
  return c.json({ success: true, routing });
});

// Synchronous Task Execution
tasksRouter.post('/execute', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = executeTaskBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: formatZodError(parsed.error) }, 400);
  }

  try {
    const task = await WorkloadExecutor.execute({
      prompt: parsed.data.prompt,
      overrides: parsed.data.overrides,
      simulateFailover: Boolean(parsed.data.simulateFailover)
    });
    return c.json({ success: true, task });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// SSE Streaming Execution Endpoint
tasksRouter.get('/stream', async (c) => {
  const rawPrompt = c.req.query('prompt') || '';
  const promptCheck = promptSchema.safeParse(rawPrompt);
  if (!promptCheck.success) {
    return c.json({ success: false, error: formatZodError(promptCheck.error) }, 400);
  }

  const overridesCheck = requirementOverridesSchema.safeParse({
    priority: c.req.query('priority') || undefined,
    maxBudgetAlgo: c.req.query('maxBudgetAlgo') ? parseFloat(c.req.query('maxBudgetAlgo')!) : undefined,
    deadlineMs: c.req.query('deadlineMs') ? parseInt(c.req.query('deadlineMs')!, 10) : undefined,
    minQualityScore: c.req.query('minQualityScore') ? parseInt(c.req.query('minQualityScore')!, 10) : undefined
  });
  if (!overridesCheck.success) {
    return c.json({ success: false, error: formatZodError(overridesCheck.error) }, 400);
  }

  const prompt = promptCheck.data;
  const simulateFailover = c.req.query('simulateFailover') === 'true';

  return streamSSE(c, async (stream) => {
    // Real Algorand confirmation (and Gemini calls) can go several seconds
    // without emitting any pipeline event. A dev proxy (or any intermediary)
    // watching for stream activity can — and does — treat that silence as a
    // dead connection and kill it. A steady heartbeat prevents that.
    const heartbeat = setInterval(() => {
      stream.writeSSE({ event: 'heartbeat', data: String(Date.now()) }).catch(() => {});
    }, 3000);

    try {
      await WorkloadExecutor.execute({
        prompt,
        overrides: overridesCheck.data,
        simulateFailover,
        onEvent: async (event) => {
          await stream.writeSSE({
            event: 'pipeline_event',
            data: JSON.stringify(event)
          });
        },
        onTokenChunk: async (chunk) => {
          await stream.writeSSE({
            event: 'token_chunk',
            data: JSON.stringify({ chunk })
          });
        }
      });
    } catch (err: any) {
      await stream.writeSSE({
        event: 'error',
        data: JSON.stringify({ error: err.message })
      });
    } finally {
      clearInterval(heartbeat);
    }
  });
});

// Task history
tasksRouter.get('/history', async (c) => {
  const history = await storage.getAllTasks();
  return c.json({ success: true, count: history.length, tasks: history });
});

// Single task
tasksRouter.get('/:id', async (c) => {
  const id = c.req.param('id');
  const task = await storage.getTask(id);
  if (!task) return c.json({ success: false, error: 'Task not found' }, 404);
  return c.json({ success: true, task });
});

export { tasksRouter };
