import { Hono } from 'hono';
import { spendingPolicy } from '../services/spendingPolicy.js';
import { updatePolicyBodySchema, formatZodError } from '../validators.js';

const policyRouter = new Hono();

// Current spending governance policy plus how much of today's budget is left.
policyRouter.get('/', async (c) => {
  const policy = spendingPolicy.get();
  const todaySpendAlgo = await spendingPolicy.getTodaySpendAlgo();
  return c.json({
    success: true,
    policy,
    todaySpendAlgo: Number(todaySpendAlgo.toFixed(6)),
    remainingTodayAlgo: Number(Math.max(0, policy.dailyBudgetAlgo - todaySpendAlgo).toFixed(6))
  });
});

policyRouter.put('/', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const parsed = updatePolicyBodySchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, error: formatZodError(parsed.error) }, 400);
  }
  try {
    const policy = spendingPolicy.update(parsed.data);
    return c.json({ success: true, policy });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

export { policyRouter };
