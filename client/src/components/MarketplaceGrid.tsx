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
  RefreshCw,
  TrendingUp,
  Activity,
  Globe,
  Database,
  Timer,
  CheckCircle2,
} from 'lucide-react';
import { ModelProvider, ComputeProvider } from '../types';
import { toggleComputeStatus, FALLBACK_MODELS, FALLBACK_COMPUTES } from '../utils/api';
import { TourGuideButton } from './TourGuideButton';
import { PurchaseConfirmModal } from './PurchaseConfirmModal';
import { RegisterGpuModal } from './RegisterGpuModal';
import { estimateTaskCost, formatCostRange, getSupportedModalitiesDisplay } from '../utils/costEstimator';
import { useTaskContext } from '../context/TaskContext';

interface MarketplaceGridProps {
  models: ModelProvider[];
  computes: ComputeProvider[];
  onOpenRegisterModal: () => void;
  onRefreshCatalog: () => void;
  onNavigateToCommand: () => void;
}

export const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({
  models = [],
  computes = [],
  onOpenRegisterModal,
  onRefreshCatalog,
  onNavigateToCommand,
}) => {
  const safeModels = models && models.length > 0 ? models : FALLBACK_MODELS;
  const safeComputes = computes && computes.length > 0 ? computes : FALLBACK_COMPUTES;
  const { setSelection } = useTaskContext();
  const [selectedTab, setSelectedTab] = useState<'all' | 'models' | 'computes'>('all');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  
  const [purchaseModal, setPurchaseModal] = useState<{
    isOpen: boolean;
    model: ModelProvider | null;
    compute: ComputeProvider | null;
  }>({ isOpen: false, model: null, compute: null });

  const [showRegisterGpuModal, setShowRegisterGpuModal] = useState(false);

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

  const openPurchaseModal = (model: ModelProvider | null, compute: ComputeProvider | null) => {
    if (model && compute) {
      setPurchaseModal({ isOpen: true, model, compute });
    } else if (compute) {
      const defaultModel = safeModels.find(m => m.status === 'online') || safeModels[0];
      if (defaultModel) {
        setPurchaseModal({ isOpen: true, model: defaultModel, compute });
      }
    } else if (model) {
      const defaultCompute = safeComputes.find(c => c.status === 'active') || safeComputes[0];
      if (defaultCompute) {
        setPurchaseModal({ isOpen: true, model, compute: defaultCompute });
      }
    }
  };

  const handlePurchaseConfirm = () => {
    if (purchaseModal.model && purchaseModal.compute) {
      const estimate = getEstimatedTaskCost(purchaseModal.model, purchaseModal.compute);
      setSelection(purchaseModal.model, purchaseModal.compute, estimate);
    }
    setPurchaseModal({ isOpen: false, model: null, compute: null });
    onNavigateToCommand();
  };

  const getEstimatedTaskCost = (model: ModelProvider, compute: ComputeProvider) => {
    return estimateTaskCost('Typical inference task (~500 words input, ~600 tokens output)', model, compute);
  };

  const formatUptime = (uptime: number) => uptime.toFixed(2) + '%';
  const formatLoad = (load: number) => load.toFixed(0) + '%';
  const costPerMillion = (costPer1k: number) => '$' + (costPer1k * 1000).toFixed(2) + '/M';

  return (
    <div className="space-y-6">
      <PurchaseConfirmModal
        isOpen={purchaseModal.isOpen}
        onClose={() => setPurchaseModal({ isOpen: false, model: null, compute: null })}
        onConfirm={handlePurchaseConfirm}
        model={purchaseModal.model}
        compute={purchaseModal.compute}
        prompt="Typical inference task (~500 words input, ~600 tokens output)"
      />

      <RegisterGpuModal
        isOpen={showRegisterGpuModal}
        onClose={() => setShowRegisterGpuModal(false)}
        onSuccess={onRefreshCatalog}
      />

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
            Autonomous nodes register via standard <span className="text-grid-200">x402 paywall endpoints</span> and settle payouts directly in <span className="text-grid-200">ALGO</span>. Select a model + compute pair to see exact pricing.
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
              },
              {
                targetSelector: '[data-tour="purchase-button"]',
                title: "4. Purchase & Configure",
                description: "Click 'Select & Configure' on any model or compute to see exact pricing, then confirm to start a task."
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
          <button
            onClick={() => setShowRegisterGpuModal(true)}
            className="px-4 py-2 rounded-lg bg-signal-amber/20 text-signal-amber text-xs font-mono font-bold flex items-center space-x-2 hover:bg-signal-amber/30 border border-signal-amber/30 transition-all cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>List Your GPU</span>
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
            {safeComputes.map((comp) => {
              const estimate = getEstimatedTaskCost(safeModels.find(m => m.status === 'online') || safeModels[0], comp);
              return (
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
                      <div className="flex items-center space-x-2 text-[11px] font-mono text-grid-400 mt-0.5">
                        <Globe className="w-3 h-3" />
                        <span>{comp.region}</span>
                      </div>
                    </div>

                    <button
                      data-tour="node-status-toggle"
                      onClick={() => handleToggleStatus(comp.id, comp.status)}
                      disabled={isUpdatingStatus === comp.id}
                      title="Click to cycle status (Active → Degraded → Offline) — simulation only"
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
                      <span className="text-grid-500 flex items-center space-x-1">
                        <HardDrive className="w-3 h-3" />
                        <span>Hardware</span>
                      </span>
                      <span className="text-grid-200 font-semibold truncate max-w-[170px]">{comp.gpuType}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-grid-500 flex items-center space-x-1">
                        <Database className="w-3 h-3" />
                        <span>VRAM</span>
                      </span>
                      <span className="text-grid-300">{comp.vramGb} GB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-grid-500 flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>Interconnect</span>
                      </span>
                      <span className="text-grid-300 text-[10px]">{comp.interconnect}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-grid-500 flex items-center space-x-1">
                        <Coins className="w-3 h-3" />
                        <span>Spot Rate</span>
                      </span>
                      <span className="text-signal-emerald font-semibold">${comp.costPerHourUsd.toFixed(2)}/hr</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-grid-500 flex items-center space-x-1">
                        <Timer className="w-3 h-3" />
                        <span>Base Ping</span>
                      </span>
                      <span className="text-grid-300">{comp.latencyBaseMs} ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-grid-500 flex items-center space-x-1">
                        <Activity className="w-3 h-3" />
                        <span>Uptime</span>
                      </span>
                      <span className="text-signal-cyan font-semibold">{formatUptime(comp.reliabilityUptime)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-grid-500 flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Current Load</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-1.5 bg-grid-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              comp.currentLoad > 80 ? 'bg-signal-rose' : comp.currentLoad > 60 ? 'bg-signal-amber' : 'bg-signal-emerald'
                            }`}
                            style={{ width: `${comp.currentLoad}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-grid-300">{formatLoad(comp.currentLoad)}</span>
                      </div>
                    </div>
                    <div className="border-t border-grid-800 pt-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-grid-400">Est. cost (typical task)</span>
                      <span className="text-brand-emerald font-bold font-mono">{formatCostRange(estimate)}</span>
                    </div>
                  </div>

                  <button
                    data-tour="purchase-button"
                    onClick={() => openPurchaseModal(null, comp)}
                    disabled={comp.status === 'offline'}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                      comp.status === 'offline'
                        ? 'bg-grid-800 text-grid-500 border border-grid-700 cursor-not-allowed'
                        : 'bg-brand-emerald text-black hover:bg-brand-emerald/90 active:scale-[0.98] cursor-pointer shadow-glow-emerald'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>{comp.status === 'offline' ? 'Node Offline' : 'Select & Configure'}</span>
                  </button>
                </div>
              );
            })}
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
            {safeModels.map((m) => {
              const estimate = getEstimatedTaskCost(m, safeComputes.find(c => c.status === 'active') || safeComputes[0]);
              const modalities = getSupportedModalitiesDisplay(m);
              return (
                <div
                  key={m.id}
                  className="bg-grid-900 border border-grid-800 hover:border-grid-700 rounded-xl p-5 space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold font-mono text-grid-100">{m.name}</div>
                      <div className="flex items-center space-x-2 text-[11px] font-mono text-grid-400 mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-signal-emerald" />
                        <span>{m.providerOrg}</span>
                        <span className="text-grid-600">•</span>
                        <span className="text-signal-cyan font-semibold">{(m.reliabilityScore * 100).toFixed(1)}% reliability</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-grid-800 text-signal-cyan border border-signal-cyan/30">
                      {m.qualityBenchmark} / 100
                    </span>
                  </div>

                  <div className="bg-grid-950 p-2.5 rounded-lg border border-grid-800 text-xs font-mono space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-grid-500 flex items-center space-x-1">
                        <Database className="w-3 h-3" />
                        <span>Context Window</span>
                      </span>
                      <span className="text-grid-200">{(m.contextWindow / 1000).toFixed(0)}k tokens</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-grid-500 flex items-center space-x-1">
                        <Coins className="w-3 h-3" />
                        <span>Input Cost</span>
                      </span>
                      <div className="flex items-center space-x-2 text-right">
                        <span className="text-grid-300 font-semibold">${m.costPer1kInputTokensUsd.toFixed(5)}/1k</span>
                        <span className="text-grid-400 text-[9px]">{costPerMillion(m.costPer1kInputTokensUsd)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-grid-500 flex items-center space-x-1">
                        <Coins className="w-3 h-3" />
                        <span>Output Cost</span>
                      </span>
                      <div className="flex items-center space-x-2 text-right">
                        <span className="text-signal-emerald font-semibold">${m.costPer1kOutputTokensUsd.toFixed(5)}/1k</span>
                        <span className="text-grid-400 text-[9px]">{costPerMillion(m.costPer1kOutputTokensUsd)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-grid-500 flex items-center space-x-1">
                        <Timer className="w-3 h-3" />
                        <span>Baseline TPS</span>
                      </span>
                      <span className="text-grid-300">{m.typicalTps} tok/s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-grid-500 flex items-center space-x-1">
                        <Activity className="w-3 h-3" />
                        <span>Uptime</span>
                      </span>
                      <span className="text-signal-emerald font-semibold">{(m.reliabilityScore * 100).toFixed(1)}%</span>
                    </div>
                    <div className="border-t border-grid-800 pt-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-grid-400">Est. cost (typical task)</span>
                      <span className="text-brand-emerald font-bold font-mono">{formatCostRange(estimate)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {modalities.map((mod, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-grid-800 text-grid-400 border border-grid-700">
                        {mod}
                      </span>
                    ))}
                  </div>

                  <button
                    data-tour="purchase-button"
                    onClick={() => openPurchaseModal(m, null)}
                    disabled={m.status === 'offline'}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                      m.status === 'offline'
                        ? 'bg-grid-800 text-grid-500 border border-grid-700 cursor-not-allowed'
                        : 'bg-white/[0.08] hover:bg-brand-emerald hover:text-black text-white active:scale-[0.98] cursor-pointer border border-white/[0.1]'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>{m.status === 'offline' ? 'Model Offline' : 'Select & Configure'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceGrid;