import { SpendingPolicy } from '../types/index.js';
import { supabase } from '../db/supabaseClient.js';

const DEFAULT_POLICY: SpendingPolicy = {
  dailyBudgetAlgo: Number(process.env.DAILY_BUDGET_ALGO) || 5,
  autoApproveThresholdAlgo: Number(process.env.AUTO_APPROVE_THRESHOLD_ALGO) || 0.05
};

/**
 * The agent's spending governance policy — a hard daily cap (tasks that
 * would exceed it are rejected, not queued) and a per-task threshold above
 * which a task pauses for explicit human sign-off instead of paying
 * automatically. Held in memory with sane defaults; a production build
 * would persist this per-organization in Postgres alongside an audit log
 * of who approved what.
 */
class SpendingPolicyService {
  private policy: SpendingPolicy = { ...DEFAULT_POLICY };

  public get(): SpendingPolicy {
    return { ...this.policy };
  }

  public update(patch: Partial<SpendingPolicy>): SpendingPolicy {
    if (patch.dailyBudgetAlgo !== undefined) {
      if (!(patch.dailyBudgetAlgo > 0)) throw new Error('dailyBudgetAlgo must be a positive number');
      this.policy.dailyBudgetAlgo = patch.dailyBudgetAlgo;
    }
    if (patch.autoApproveThresholdAlgo !== undefined) {
      if (!(patch.autoApproveThresholdAlgo >= 0)) throw new Error('autoApproveThresholdAlgo must be a non-negative number');
      this.policy.autoApproveThresholdAlgo = patch.autoApproveThresholdAlgo;
    }
    return this.get();
  }

  /** Sum of actual_cost_algo for every task completed since UTC midnight today. */
  public async getTodaySpendAlgo(): Promise<number> {
    const startOfDayMs = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z').getTime();
    const { data, error } = await supabase
      .from('tasks')
      .select('actual_cost_algo')
      .gte('completed_at', startOfDayMs);

    if (error || !data) {
      console.error('[SpendingPolicy] Failed to compute today\'s spend, failing open to avoid blocking tasks on a DB hiccup:', error?.message);
      return 0;
    }
    return data.reduce((sum: number, row: any) => sum + Number(row.actual_cost_algo), 0);
  }
}

export const spendingPolicy = new SpendingPolicyService();

export class DailyBudgetExceededError extends Error {
  constructor(public todaySpendAlgo: number, public projectedCostAlgo: number, public dailyBudgetAlgo: number) {
    super(
      `Daily spending cap reached: today's spend (${todaySpendAlgo.toFixed(4)} ALGO) plus this task ` +
      `(${projectedCostAlgo.toFixed(4)} ALGO) would total ${(todaySpendAlgo + projectedCostAlgo).toFixed(4)} ALGO, ` +
      `over the ${dailyBudgetAlgo} ALGO/day cap.`
    );
    this.name = 'DailyBudgetExceededError';
  }
}

export class ApprovalRequiredError extends Error {
  constructor(
    public estimatedCostAlgo: number,
    public thresholdAlgo: number,
    public modelName: string,
    public computeName: string,
    public prompt: string
  ) {
    super(`This task costs ${estimatedCostAlgo} ALGO, at or above the ${thresholdAlgo} ALGO auto-approve threshold — it needs human sign-off before paying.`);
    this.name = 'ApprovalRequiredError';
  }
}
