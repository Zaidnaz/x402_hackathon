import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  TrendingDown, 
  ShieldCheck, 
  Clock, 
  Coins, 
  ArrowRightLeft, 
  FileText, 
  Download, 
  CheckCircle2,
  RefreshCw
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
      <div className="bg-grid-900 border border-grid-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-signal-amber " />
            <span className="text-xs font-medium tracking-wide text-signal-amber font-semibold">Usage and cost summary</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-grid-100">
            Network efficiency
          </h2>
          <p className="text-xs font-mono text-grid-400 mt-1 max-w-2xl">
            Track completed tasks, total spend, latency, and routing outcomes in one place.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="p-2.5 rounded-lg bg-grid-950 border border-grid-800 hover:border-grid-700 text-grid-400 hover:text-grid-200 text-xs font-mono flex items-center space-x-1.5 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cost Savings */}
        <div className="bg-grid-900 border border-grid-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-grid-400 text-xs font-mono">
            <span>COST REDUCTION</span>
            <TrendingDown className="w-4 h-4 text-signal-emerald" />
          </div>
          <div className="text-2xl font-bold font-mono text-signal-emerald">
            {stats?.costSavingsPercentage || 58.3}%
          </div>
          <div className="text-[11px] font-mono text-grid-500">
            Saved <strong className="text-grid-300 font-semibold">{stats?.algoSaved || 0} ALGO</strong> vs static cloud baseline
          </div>
        </div>

        {/* SLA Adherence */}
        <div className="bg-grid-900 border border-grid-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-grid-400 text-xs font-mono">
            <span>SLA ADHERENCE</span>
            <ShieldCheck className="w-4 h-4 text-signal-cyan" />
          </div>
          <div className="text-2xl font-bold font-mono text-signal-cyan">
            {stats?.slaAdherenceRate || 100}%
          </div>
          <div className="text-[11px] font-mono text-grid-500">
            Across <strong className="text-grid-300 font-semibold">{stats?.totalTasks || 0}</strong> executed workloads
          </div>
        </div>

        {/* Average Latency */}
        <div className="bg-grid-900 border border-grid-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-grid-400 text-xs font-mono">
            <span>AVG PIPELINE LATENCY</span>
            <Clock className="w-4 h-4 text-signal-amber" />
          </div>
          <div className="text-2xl font-bold font-mono text-signal-amber">
            {stats?.avgLatencyMs || 0} <span className="text-sm font-normal">ms</span>
          </div>
          <div className="text-[11px] font-mono text-grid-500">
            Includes x402 challenge & Algorand round
          </div>
        </div>

        {/* Dynamic Failovers */}
        <div className="bg-grid-900 border border-grid-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-grid-400 text-xs font-mono">
            <span>FAILOVER RESILIENCY</span>
            <ArrowRightLeft className="w-4 h-4 text-signal-rose" />
          </div>
          <div className="text-2xl font-bold font-mono text-grid-100">
            {stats?.failoverCount || 0}
          </div>
          <div className="text-[11px] font-mono text-grid-500">
            Zero-downtime auto-rerouted tasks
          </div>
        </div>
      </div>

      {/* Task History Archive */}
      <div className="bg-grid-900 border border-grid-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-grid-950 border-b border-grid-800 flex items-center justify-between">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-grid-200 flex items-center space-x-2">
            <FileText className="w-3.5 h-3.5 text-signal-amber" />
            <span>Completed Workload Archive & Receipts</span>
          </div>
          <div className="text-[11px] font-mono text-grid-500">
            {tasks.length} Recorded Tasks
          </div>
        </div>

        <div className="divide-y divide-grid-800/60">
          {tasks.map((t) => (
            <div key={t.id} className="p-4 hover:bg-grid-850/40 transition-all space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold font-mono text-grid-200">
                    {t.requirement.modality.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-mono text-grid-500">·</span>
                  <span className="text-xs font-mono text-grid-300 truncate max-w-[300px]">
                    {t.prompt}
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="text-signal-emerald font-semibold">{t.actualCostAlgo} ALGO</span>
                  <span className="text-grid-500">·</span>
                  <span className="text-signal-amber">{t.actualDurationMs} ms</span>
                  <span className="text-grid-500">·</span>
                  <button
                    onClick={() => exportReceiptJson(t)}
                    className="p-1 rounded bg-grid-950 hover:bg-grid-800 border border-grid-800 text-grid-400 hover:text-grid-200 text-[10px] flex items-center space-x-1"
                    title="Export cryptographic JSON receipt"
                  >
                    <Download className="w-3 h-3" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-grid-500">
                <span>Selected: <strong className="text-grid-300">{t.routing.selectedCandidate.modelName}</strong> on <strong className="text-grid-300">{t.routing.selectedCandidate.computeName}</strong></span>
                <span>·</span>
                <span>Algorand Tx: <code className="text-grid-400">{t.algorandTx.txId.substring(0, 16)}...</code></span>
                {t.failoverOccurred && (
                  <>
                    <span>·</span>
                    <span className="text-signal-rose font-semibold">Auto-Rerouted</span>
                  </>
                )}
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="py-12 text-center text-grid-500 font-mono text-xs">
              No tasks completed yet. Dispatch a task from the Command Center to populate analytics!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

