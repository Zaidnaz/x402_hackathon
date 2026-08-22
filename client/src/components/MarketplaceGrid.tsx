import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Server, 
  Wifi, 
  Plus, 
  ShieldCheck, 
  Coins, 
  Zap, 
  CheckCircle, 
  AlertTriangle,
  HardDrive,
  RefreshCw
} from 'lucide-react';
import { ModelProvider, ComputeProvider } from '../types';
import { toggleComputeStatus } from '../utils/api';
import { HowItWorksBanner } from './HowItWorksBanner';

interface MarketplaceGridProps {
  models: ModelProvider[];
  computes: ComputeProvider[];
  onOpenRegisterModal: () => void;
  onRefreshCatalog: () => void;
}

export const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({
  models,
  computes,
  onOpenRegisterModal,
  onRefreshCatalog
}) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'models' | 'computes'>('all');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);

  const handleToggleStatus = async (computeId: string, currentStatus: ComputeProvider['status']) => {
    setIsUpdatingStatus(computeId);
    try {
      const nextStatus = currentStatus === 'active' ? 'degraded' : currentStatus === 'degraded' ? 'offline' : 'active';
      await toggleComputeStatus(computeId, nextStatus);
      onRefreshCatalog();
    } catch (err) {
      console.error('Status toggle failed', err);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-grid-900 border border-grid-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-signal-emerald animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-signal-emerald font-semibold">Live Infrastructure Grid</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-grid-100">
            Decentralized Model & GPU Compute Fleet
          </h2>
          <p className="text-xs font-mono text-grid-400 mt-1 max-w-2xl">
            Autonomous nodes register via standard <span className="text-grid-200">x402 paywall endpoints</span> and settle payouts directly in <span className="text-grid-200">ALGO</span>. Toggle status to test router adaptation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefreshCatalog}
            className="p-2.5 rounded-lg bg-grid-950 border border-grid-800 hover:border-grid-700 text-grid-400 hover:text-grid-200 text-xs font-mono flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
          <button
            onClick={onOpenRegisterModal}
            className="px-3.5 py-2.5 rounded-lg bg-signal-amber hover:bg-signal-amber/90 text-grid-950 text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-glow-amber transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register Provider</span>
          </button>
        </div>
      </div>

      {/* Interactive Page Tutorial Banner */}
      <HowItWorksBanner
        pageTitle="Decentralized Compute Marketplace"
        badgeText="Service Registry"
        summary="This marketplace acts as the open discovery registry where GPU hosts and foundation models publish their live endpoint capabilities, spot pricing, and Algorand payout addresses."
        steps={[
          {
            title: "1. Inspect Fleet Telemetry",
            desc: "Browse NVIDIA H100, A100, and Serverless clusters with real-time VRAM, interconnect bandwidth, and spot rates."
          },
          {
            title: "2. Register New Providers",
            desc: "Click 'Register Provider' to simulate onboarding a custom vLLM inference node with an Algorand payout wallet."
          },
          {
            title: "3. Test Node Status Cycle",
            desc: "Click the status badge on any GPU card (Active ➔ Degraded ➔ Offline) to test how the Pareto router avoids degraded nodes."
          }
        ]}
        proTip="Switch a GPU node to 'Degraded' and watch the Console automatically avoid it during Pareto routing!"
      />

      {/* Tab Filter */}
      <div className="flex items-center space-x-2 border-b border-grid-800 pb-3">
        {[
          { id: 'all', label: `All Resources (${models.length + computes.length})` },
          { id: 'models', label: `AI Models (${models.length})` },
          { id: 'computes', label: `GPU Compute Nodes (${computes.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-all ${
              selectedTab === tab.id
                ? 'bg-grid-850 text-signal-amber border border-grid-700 font-medium'
                : 'text-grid-400 hover:text-grid-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Compute Providers Grid */}
      {(selectedTab === 'all' || selectedTab === 'computes') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-grid-400 flex items-center space-x-2">
              <Server className="w-3.5 h-3.5 text-signal-amber" />
              <span>GPU Compute Clusters & Inference Nodes</span>
            </h3>
            <span className="text-[11px] font-mono text-grid-500">Live Telemetry & Spot Pricing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {computes.map((comp) => (
              <div
                key={comp.id}
                className={`bg-grid-900 border rounded-xl p-5 space-y-3 transition-all ${
                  comp.status === 'active'
                    ? 'border-grid-800 hover:border-grid-700'
                    : comp.status === 'degraded'
                    ? 'border-signal-amber/40 bg-signal-amberDim/10'
                    : 'border-signal-rose/40 bg-signal-roseDim/10 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold font-mono text-grid-100">{comp.name}</div>
                    <div className="text-[11px] font-mono text-grid-400 mt-0.5">{comp.region}</div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(comp.id, comp.status)}
                    disabled={isUpdatingStatus === comp.id}
                    title="Click to cycle status (Active -> Degraded -> Offline)"
                    className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-tight border flex items-center space-x-1 cursor-pointer transition-all ${
                      comp.status === 'active'
                        ? 'bg-signal-emeraldDim text-signal-emerald border-signal-emerald/30 hover:bg-signal-emerald/20'
                        : comp.status === 'degraded'
                        ? 'bg-signal-amberDim text-signal-amber border-signal-amber/30 hover:bg-signal-amber/20'
                        : 'bg-signal-roseDim text-signal-rose border-signal-rose/30 hover:bg-signal-rose/20'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${comp.status === 'active' ? 'bg-signal-emerald' : comp.status === 'degraded' ? 'bg-signal-amber' : 'bg-signal-rose'}`} />
                    <span>{comp.status}</span>
                  </button>
                </div>

                <div className="bg-grid-950 p-2.5 rounded-lg border border-grid-800 text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-grid-500">Hardware</span>
                    <span className="text-grid-200 font-semibold truncate max-w-[170px]">{comp.gpuType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-grid-500">VRAM / Bus</span>
                    <span className="text-grid-300">{comp.vramGb} GB • {comp.interconnect}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-grid-500">Spot Rate</span>
                    <span className="text-signal-emerald font-semibold">${comp.costPerHourUsd.toFixed(2)}/hr</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-grid-500">Base Ping</span>
                    <span className="text-grid-300">{comp.latencyBaseMs} ms</span>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-grid-500 flex items-center justify-between pt-1">
                  <span>x402 Micropayments:</span>
                  <span className="text-signal-cyan font-semibold">Enabled (ALGO)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Providers Grid */}
      {(selectedTab === 'all' || selectedTab === 'models') && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-grid-400 flex items-center space-x-2">
              <Cpu className="w-3.5 h-3.5 text-signal-cyan" />
              <span>Foundation Models & LLM Endpoints</span>
            </h3>
            <span className="text-[11px] font-mono text-grid-500">Benchmark Scores & Token Economics</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((m) => (
              <div
                key={m.id}
                className="bg-grid-900 border border-grid-800 hover:border-grid-700 rounded-xl p-5 space-y-3 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-bold font-mono text-grid-100">{m.name}</div>
                    <div className="text-[11px] font-mono text-grid-400 mt-0.5">{m.providerOrg}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-grid-800 text-signal-cyan border border-signal-cyan/30">
                    {m.qualityBenchmark} / 100
                  </span>
                </div>

                <div className="bg-grid-950 p-2.5 rounded-lg border border-grid-800 text-xs font-mono space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-grid-500">Context Window</span>
                    <span className="text-grid-200">{(m.contextWindow / 1000).toFixed(0)}k tokens</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-grid-500">Input / 1k Tokens</span>
                    <span className="text-grid-300 font-semibold">${m.costPer1kInputTokensUsd.toFixed(5)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-grid-500">Output / 1k Tokens</span>
                    <span className="text-signal-emerald font-semibold">${m.costPer1kOutputTokensUsd.toFixed(5)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-grid-500">Baseline TPS</span>
                    <span className="text-grid-300">{m.typicalTps} tokens/s</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 pt-1">
                  {m.supportedModalities.map((mod, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-grid-800 text-grid-400">
                      {mod}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
