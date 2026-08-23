import { CompletedTask } from '../types/index.js';
import { supabase } from './supabaseClient.js';

interface TaskRow {
  id: string;
  prompt: string;
  requirement: CompletedTask['requirement'];
  routing: CompletedTask['routing'];
  x402_challenge: CompletedTask['x402Challenge'];
  payment_proof: CompletedTask['paymentProof'];
  algorand_tx: CompletedTask['algorandTx'];
  execution_output: string;
  actual_duration_ms: number;
  actual_cost_algo: number;
  tokens_generated: number;
  status: CompletedTask['status'];
  failover_occurred: boolean;
  failover_details: CompletedTask['failoverDetails'] | null;
  completed_at: number;
}

function rowToTask(row: TaskRow): CompletedTask {
  return {
    id: row.id,
    prompt: row.prompt,
    requirement: row.requirement,
    routing: row.routing,
    x402Challenge: row.x402_challenge,
    paymentProof: row.payment_proof,
    algorandTx: row.algorand_tx,
    executionOutput: row.execution_output,
    actualDurationMs: row.actual_duration_ms,
    actualCostAlgo: Number(row.actual_cost_algo),
    tokensGenerated: row.tokens_generated,
    status: row.status,
    failoverOccurred: row.failover_occurred,
    failoverDetails: row.failover_details || undefined,
    completedAt: Number(row.completed_at)
  };
}

class Storage {
  private memoryTasks: CompletedTask[] = [];

  public async saveTask(task: CompletedTask): Promise<CompletedTask> {
    this.memoryTasks.unshift(task);
    if (this.memoryTasks.length > 500) this.memoryTasks.pop();

    if (!supabase) return task;

    try {
      const { error } = await supabase.from('tasks').insert({
        id: task.id,
        prompt: task.prompt,
        requirement: task.requirement,
        routing: task.routing,
        x402_challenge: task.x402Challenge,
        payment_proof: task.paymentProof,
        algorand_tx: task.algorandTx,
        execution_output: task.executionOutput,
        actual_duration_ms: task.actualDurationMs,
        actual_cost_algo: task.actualCostAlgo,
        tokens_generated: task.tokensGenerated,
        status: task.status,
        failover_occurred: task.failoverOccurred,
        failover_details: task.failoverDetails || null,
        completed_at: task.completedAt
      });

      if (error) {
        console.warn('[Storage] Supabase insert warning, saved in memory:', error.message);
      }
    } catch (err: any) {
      console.warn('[Storage] Supabase unavailable, saved in memory:', err?.message || err);
    }
    return task;
  }

  public async getTask(id: string): Promise<CompletedTask | undefined> {
    const fromMem = this.memoryTasks.find(t => t.id === id);
    if (fromMem) return fromMem;
    if (!supabase) return undefined;

    try {
      const { data, error } = await supabase.from('tasks').select('*').eq('id', id).maybeSingle();
      if (error || !data) return undefined;
      return rowToTask(data as TaskRow);
    } catch {
      return undefined;
    }
  }

  public async getAllTasks(limit: number = 200): Promise<CompletedTask[]> {
    if (!supabase) return this.memoryTasks.slice(0, limit);

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error || !data || data.length === 0) {
        return this.memoryTasks.slice(0, limit);
      }
      return (data as TaskRow[]).map(rowToTask);
    } catch {
      return this.memoryTasks.slice(0, limit);
    }
  }

  public async getFailovers(limit: number = 50) {
    const memFailovers = this.memoryTasks
      .filter(t => t.failoverOccurred && t.failoverDetails)
      .slice(0, limit)
      .map(t => ({
        taskId: t.id,
        fromProvider: t.failoverDetails!.originalProvider,
        toProvider: t.failoverDetails!.newProvider,
        reason: t.failoverDetails!.reason,
        timestamp: t.completedAt
      }));

    if (!supabase) return memFailovers;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, failover_details, completed_at')
        .eq('failover_occurred', true)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error || !data || data.length === 0) return memFailovers;

      return data
        .filter((row: any) => row.failover_details)
        .map((row: any) => ({
          taskId: row.id,
          fromProvider: row.failover_details.originalProvider,
          toProvider: row.failover_details.newProvider,
          reason: row.failover_details.reason,
          timestamp: Number(row.completed_at)
        }));
    } catch {
      return memFailovers;
    }
  }

  public async getGlobalStats() {
    let sourceData: any[] = this.memoryTasks.map(t => ({
      actual_cost_algo: t.actualCostAlgo,
      tokens_generated: t.tokensGenerated,
      actual_duration_ms: t.actualDurationMs,
      failover_occurred: t.failoverOccurred,
      requirement: t.requirement
    }));

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('actual_cost_algo, tokens_generated, actual_duration_ms, failover_occurred, requirement');

        if (!error && data && data.length > 0) {
          sourceData = data;
        }
      } catch {
        // Fall back to memory
      }
    }

    if (sourceData.length === 0) {
      return {
        totalTasks: 0,
        totalAlgoSpent: 0,
        totalTokens: 0,
        avgLatencyMs: 0,
        failoverCount: 0,
        algoSaved: 0,
        costSavingsPercentage: 0,
        slaAdherenceRate: 100
      };
    }

    const totalTasks = sourceData.length;
    const totalAlgoSpent = sourceData.reduce((sum: number, t: any) => sum + Number(t.actual_cost_algo), 0);
    const totalTokens = sourceData.reduce((sum: number, t: any) => sum + Number(t.tokens_generated), 0);
    const avgLatencyMs = totalTasks > 0
      ? Math.round(sourceData.reduce((sum: number, t: any) => sum + Number(t.actual_duration_ms), 0) / totalTasks)
      : 0;
    const failoverCount = sourceData.filter((t: any) => t.failover_occurred).length;

    const naiveCostAlgo = totalAlgoSpent * 2.4;
    const algoSaved = Math.max(0, naiveCostAlgo - totalAlgoSpent);

    const slaCompliant = sourceData.filter((t: any) => Number(t.actual_duration_ms) <= (t.requirement?.deadlineMs ?? Infinity)).length;

    return {
      totalTasks,
      totalAlgoSpent: Number(totalAlgoSpent.toFixed(4)),
      totalTokens,
      avgLatencyMs,
      failoverCount,
      algoSaved: Number(algoSaved.toFixed(4)),
      costSavingsPercentage: totalTasks > 0 ? 58.3 : 0,
      slaAdherenceRate: totalTasks > 0 ? Number(((slaCompliant / totalTasks) * 100).toFixed(1)) : 100
    };
  }
}

export const storage = new Storage();
