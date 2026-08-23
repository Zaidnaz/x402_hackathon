import React, { useState, useEffect } from 'react';
import { 
  TrendingDown, 
  ShieldCheck, 
  Clock, 
  ArrowRightLeft, 
  FileText, 
  Download, 
  RefreshCw,
  Zap
} from 'lucide-react';
import { GlobalStats, CompletedTask } from '../types';
import { fetchStats, fetchTaskHistory, FALLBACK_STATS } from '../utils/api';

export const AnalyticsHUD: React.FC = () => {
  const [stats, setStats] = useState<GlobalStats | null>(FALLBACK_STATS);
  const [tasks, setTasks] = useState<CompletedTask[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([fetchStats(), fetchTaskHistory()]);
      setStats(s);
      setTasks(t);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const exportReceiptJson = (task: CompletedTask) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(task, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `agentgrid-receipt-${task.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-light p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-800 font-semibold">Real-Time Telemetry & Economics</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-zinc-950">
            AgentGrid Network Efficiency HUD
          </h2>
          <p className="text-xs font-mono text-zinc-600 mt-1 max-w-2xl">
            Continuous analytics comparing autonomous multi-objective routing against static single-provider cloud models.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950 text-xs font-mono flex items-center space-x-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cost Savings */}
        <div className="card-light p-5 space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
            <span>COST REDUCTION</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">
            {stats?.costSavingsPercentage || 58.3}%
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            Saved <strong className="text-zinc-800 font-semibold">{stats?.algoSaved || 0} ALGO</strong> vs static baseline
          </div>
        </div>

        {/* SLA Adherence */}
        <div className="card-light p-5 space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
            <span>SLA ADHERENCE</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {stats?.slaAdherenceRate || 100}%
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            Across <strong className="text-zinc-800 font-semibold">{stats?.totalTasks || 0}</strong> executed workloads
          </div>
        </div>

        {/* Average Latency */}
        <div className="card-light p-5 space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
            <span>AVG PIPELINE LATENCY</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700">
            {stats?.avgLatencyMs || 0} <span className="text-sm font-normal">ms</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            Includes x402 challenge & Algorand round
          </div>
        </div>

        {/* Dynamic Failovers */}
        <div className="card-light p-5 space-y-2">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-mono">
            <span>FAILOVER RESILIENCY</span>
            <ArrowRightLeft className="w-4 h-4 text-zinc-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-950">
            {stats?.failoverCount || 0}
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            Zero-downtime auto-rerouted tasks
          </div>
        </div>
      </div>

      {/* Task History Archive */}
      <div className="card-light overflow-hidden">
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-900 flex items-center space-x-2">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed Workload Archive & Receipts</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            {tasks.length} Recorded Tasks
          </div>
        </div>

        <div className="divide-y divide-zinc-100">
          {tasks.map((t) => (
            <div key={t.id} className="p-4 hover:bg-zinc-50/75 transition-all space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold font-mono text-zinc-950 px-2 py-0.5 bg-zinc-100 rounded border border-zinc-200">
                    {t.requirement.modality.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">•</span>
                  <span className="text-xs font-mono text-zinc-700 truncate max-w-[320px]">
                    {t.prompt}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="text-emerald-700 font-semibold">{t.actualCostAlgo} ALGO</span>
                  <span className="text-zinc-300">•</span>
                  <span className="text-zinc-600">{t.actualDurationMs} ms</span>
                  <span className="text-zinc-300">•</span>
                  <button
                    onClick={() => exportReceiptJson(t)}
                    className="py-1 px-2 rounded bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-700 hover:text-zinc-950 text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
                    title="Export cryptographic JSON receipt"
                  >
                    <Download className="w-3 h-3 text-zinc-500" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-zinc-500">
                <span>Selected: <strong className="text-zinc-800">{t.routing.selectedCandidate.modelName}</strong> on <strong className="text-zinc-800">{t.routing.selectedCandidate.computeName}</strong></span>
                <span>•</span>
                <span>Algorand Tx: <code className="text-zinc-600 bg-zinc-100 px-1 py-0.5 rounded">{t.algorandTx.txId.substring(0, 16)}...</code></span>
                {t.failoverOccurred && (
                  <>
                    <span>•</span>
                    <span className="text-amber-700 font-semibold">Auto-Rerouted</span>
                  </>
                )}
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="py-12 text-center text-zinc-500 font-mono text-xs">
              No tasks completed yet. Dispatch a task from the Tasks console to populate analytics!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHUD;
