import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { AIAnalyzer } from '../services/aiAnalyzer.js';
import { RouterEngine } from '../services/routerEngine.js';
import { WorkloadExecutor } from '../services/executor.js';
import { storage } from '../db/storage.js';

const tasksRouter = new Hono();

// Analyze prompt & extract requirements
tasksRouter.post('/analyze', async (c) => {
  const body = await c.req.json();
  const prompt = body.prompt || 'Optimize matrix multiplication kernel in CUDA C++';
  const requirement = AIAnalyzer.analyzeTask(prompt, body.overrides);
  return c.json({ success: true, requirement });
});

// Evaluate routing matrix for given requirements
tasksRouter.post('/evaluate-route', async (c) => {
  const body = await c.req.json();
  const requirement = body.requirement || AIAnalyzer.analyzeTask(body.prompt || 'Run financial risk Monte Carlo simulation');
  const routing = RouterEngine.evaluateGrid(requirement);
  return c.json({ success: true, routing });
});

// Synchronous Task Execution
tasksRouter.post('/execute', async (c) => {
  const body = await c.req.json();
  const prompt = body.prompt || 'Decompose distributed key-value store architecture with Raft consensus';
  const simulateFailover = Boolean(body.simulateFailover);
  
  try {
    const task = await WorkloadExecutor.execute({
      prompt,
      overrides: body.overrides,
      simulateFailover
    });
    return c.json({ success: true, task });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// SSE Streaming Execution Endpoint
tasksRouter.get('/stream', async (c) => {
  const prompt = c.req.query('prompt') || 'Autonomous database index optimizer';
  const simulateFailover = c.req.query('simulateFailover') === 'true';
  const priority = c.req.query('priority') as any;
  const maxBudgetAlgo = c.req.query('maxBudgetAlgo') ? parseFloat(c.req.query('maxBudgetAlgo')!) : undefined;
  const deadlineMs = c.req.query('deadlineMs') ? parseInt(c.req.query('deadlineMs')!, 10) : undefined;
  const minQualityScore = c.req.query('minQualityScore') ? parseInt(c.req.query('minQualityScore')!, 10) : undefined;

  return streamSSE(c, async (stream) => {
    try {
      await WorkloadExecutor.execute({
        prompt,
        overrides: {
          priority,
          maxBudgetAlgo,
          deadlineMs,
          minQualityScore
        },
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
    }
  });
});

// Task history
tasksRouter.get('/history', (c) => {
  const history = storage.getAllTasks();
  return c.json({ success: true, count: history.length, tasks: history });
});

// Single task
tasksRouter.get('/:id', (c) => {
  const id = c.req.param('id');
  const task = storage.getTask(id);
  if (!task) return c.json({ success: false, error: 'Task not found' }, 404);
  return c.json({ success: true, task });
});

export { tasksRouter };
