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
import { toggleComputeStatus, FALLBACK_MODELS, FALLBACK_COMPUTES } from '../utils/api';
import { TourGuideButton } from './TourGuideButton';

interface MarketplaceGridProps {
  models: ModelProvider[];
  computes: ComputeProvider[];
  onOpenRegisterModal: () => void;
  onRefreshCatalog: () => void;
  onSelectNode?: (computeId?: string, modelId?: string) => void;
}

export const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({
  models = [],
  computes = [],
  onOpenRegisterModal,
  onRefreshCatalog,
  onSelectNode
}) => {
  const safeModels = models && models.length > 0 ? models : FALLBACK_MODELS;
  const safeComputes = computes && computes.length > 0 ? computes : FALLBACK_COMPUTES;
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
            <span className="w-2 h-2 rounded-full bg-signal-emerald" />
            <span className="text-xs font-mono uppercase tracking-widest text-signal-emerald font-semibold">Live Infrastructure Grid</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-grid-100">
            Decentralized Model & GPU Compute Fleet
          </h2>
          <p className="text-xs font-mono text-grid-400 mt-1 max-w-2xl">
            Autonomous nodes register via standard <span className="text-grid-200">x402 paywall endpoints</span> and settle payouts directly in <span className="text-grid-200">ALGO</span>. Deploy compute slots or toggle status in real-time.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <TourGuideButton
            tourId="marketplace-tour"
            buttonLabel="How It Works"
            steps={[
              {
                targetSelector: '[data-tour="marketplace-header"]',
                title: "1. Fleet Registry Header",
                description: "Independent GPU clusters & models register their API paywalls and Algorand payout wallets here."
              },
              {
                targetSelector: '[data-tour="register-provider-btn"]',
                title: "2. Register Provider",
                description: "Deploy a new model endpoint or GPU cluster into the live decentralized network."
              },
              {
                targetSelector: '[data-tour="node-status-toggle"]',
                title: "3. Interactive Fault Simulation",
                description: "Click status badges to simulate degradation/outages. The Pareto router detects this and fails over."
              }
            ]}
          />

          <button
            onClick={onRefreshCatalog}
            title="Sync registry telemetry from network"
            className="p-2 rounded-lg bg-grid-800 hover:bg-grid-750 text-grid-300 hover:text-white transition-colors cursor-pointer border border-grid-700"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            data-tour="register-provider-btn"
            onClick={onOpenRegisterModal}
            className="px-4 py-2 rounded-lg bg-brand-emerald text-black text-xs font-mono font-bold flex items-center space-x-2 hover:bg-brand-emerald/90 transition-all cursor-pointer shadow-glow-emerald"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Provider</span>
          </button>
        </div>
      </div>

      {/* Tab Filter */}
      <div className="flex items-center space-x-1.5 sm:space-x-2 border-b border-grid-800 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: `All (${safeModels.length + safeComputes.length})` },
          { id: 'models', label: `Models (${safeModels.length})` },
          { id: 'computes', label: `GPU Fleet (${safeComputes.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
              selectedTab === tab.id
                ? 'bg-grid-850 text-signal-amber border border-grid-700 font-bold'
                : 'text-grid-400 hover:text-grid-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Compute Providers Grid */}
      {(selectedTab === 'all' || selectedTab === 'computes') && (
        <div data-tour="compute-fleet-cards" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-grid-400 flex items-center space-x-2">
              <Server className="w-3.5 h-3.5 text-signal-amber" />
              <span>GPU Compute Clusters & Inference Nodes</span>
            </h3>
            <span className="text-[11px] font-mono text-grid-500">Live Telemetry & Spot Pricing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeComputes.map((comp) => (
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
                    data-tour="node-status-toggle"
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

                {onSelectNode && (
                  <button
                    onClick={() => onSelectNode(comp.id, undefined)}
                    className="w-full py-2 px-3 rounded-lg bg-brand-emerald text-black font-bold text-xs flex items-center justify-center space-x-1.5 hover:bg-brand-emerald/90 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>Deploy & Purchase with x402</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Model Providers Grid */}
      {(selectedTab === 'all' || selectedTab === 'models') && (
        <div data-tour="model-catalog-cards" className="space-y-3 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-grid-400 flex items-center space-x-2">
              <Cpu className="w-3.5 h-3.5 text-signal-cyan" />
              <span>Foundation Models & LLM Endpoints</span>
            </h3>
            <span className="text-[11px] font-mono text-grid-500">Benchmark Scores & Token Economics</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeModels.map((m) => (
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

                {onSelectNode && (
                  <button
                    onClick={() => onSelectNode(undefined, m.id)}
                    className="w-full py-2 px-3 rounded-lg bg-white/[0.08] hover:bg-brand-emerald hover:text-black text-white font-bold text-xs flex items-center justify-center space-x-1.5 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Run Task on {m.name.split(' ')[0]}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
