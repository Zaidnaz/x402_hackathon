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
  X,
  Wallet,
  Play,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { ModelProvider, ComputeProvider } from '../types';
import { toggleComputeStatus, FALLBACK_MODELS, FALLBACK_COMPUTES, purchaseCatalogItem } from '../utils/api';
import { TourGuideButton } from './TourGuideButton';
import { useWallet } from '../context/WalletContext';

interface MarketplaceGridProps {
  models: ModelProvider[];
  computes: ComputeProvider[];
  onOpenRegisterModal: () => void;
  onRefreshCatalog: () => void;
}

const ALGO_USD_RATE = 0.1904;

export const MarketplaceGrid: React.FC<MarketplaceGridProps> = ({
  models = [],
  computes = [],
  onOpenRegisterModal,
  onRefreshCatalog
}) => {
  const safeModels = models && models.length > 0 ? models : FALLBACK_MODELS;
  const safeComputes = computes && computes.length > 0 ? computes : FALLBACK_COMPUTES;
  const [selectedTab, setSelectedTab] = useState<'all' | 'models' | 'computes'>('all');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Wallet integration & Purchase states
  const { isConnected, walletAddress, liveBalanceAlgo, connectWallet, executePeraPayment } = useWallet();
  const [deployedIds, setDeployedIds] = useState<string[]>([]);
  const [purchasingItem, setPurchasingItem] = useState<{ item: any; type: 'model' | 'compute' } | null>(null);
  const [purchaseState, setPurchaseState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentMethod, setPaymentMethod] = useState<'agent' | 'pera'>('agent');
  const [txDetails, setTxDetails] = useState<{ txId: string; round: number; explorerUrl: string; loraUrl: string } | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setErrorMessage(null);
    try {
      await onRefreshCatalog();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not refresh the provider directory.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleStatus = async (computeId: string, currentStatus: ComputeProvider['status']) => {
    setIsUpdatingStatus(computeId);
    setErrorMessage(null);
    try {
      const nextStatus = currentStatus === 'active' ? 'degraded' : currentStatus === 'degraded' ? 'offline' : 'active';
      await toggleComputeStatus(computeId, nextStatus);
      await onRefreshCatalog();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Could not update provider status.');
      console.error('Status toggle failed', err);
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const openPurchaseModal = (item: any, type: 'model' | 'compute') => {
    setPurchasingItem({ item, type });
    setPurchaseState('idle');
    setTxDetails(null);
    setPurchaseError(null);
    setPaymentMethod(isConnected ? 'pera' : 'agent');
  };

  const handleConfirmPurchase = async () => {
    if (!purchasingItem) return;
    const { item, type } = purchasingItem;
    
    // Calculate price in ALGO
    const costAlgo = type === 'compute'
      ? Number((item.costPerHourUsd / ALGO_USD_RATE).toFixed(4))
      : Number((item.qualityBenchmark * 0.01).toFixed(4));

    const payoutAddress = type === 'compute'
      ? item.algorandPayoutAddress
      : 'TRSRY77VLE4J6R7K2P9M3N8Q5W4E9Z2Y7U8I1O3P5A6S7D8F9G0H1J2K3L'; // default model registry treasury

    setPurchaseState('processing');
    setPurchaseError(null);

    try {
      if (paymentMethod === 'pera') {
        if (!walletAddress) {
          throw new Error('Please connect your Pera Wallet first.');
        }
        const note = `x402-deploy:${type}:${item.id}`;
        const result = await executePeraPayment(payoutAddress, costAlgo, note);
        setTxDetails({
          txId: result.txId,
          round: result.round,
          explorerUrl: result.explorerUrl,
          loraUrl: result.loraUrl
        });
      } else {
        // Autonomous Agent Payout (backend API)
        const result = await purchaseCatalogItem(item.id, costAlgo, type);
        setTxDetails({
          txId: result.txId,
          round: result.round,
          explorerUrl: result.explorerUrl,
          loraUrl: result.loraUrl
        });
      }

      setDeployedIds(prev => [...prev, item.id]);
      setPurchaseState('success');
    } catch (err: any) {
      console.error('Deployment purchase error:', err);
      setPurchaseError(err.message || 'The payout transaction was rejected or failed.');
      setPurchaseState('error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-grid-800 rounded-panel p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald animate-pulse" />
            <span className="text-caption font-semibold tracking-wide text-brand-emerald uppercase">
              Provider Registry
            </span>
          </div>
          <h2 className="text-2xl font-serif font-medium text-grid-100">
            Model & Compute Marketplace
          </h2>
          <p className="text-body-sm text-grid-500 max-w-2xl leading-relaxed">
            Onboard, deploy, and inspect active compute resources in real-time. Compute clusters settle payouts directly on-chain via standard <span className="text-grid-100 font-medium">x402 endpoints</span>.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
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
                description: "Click here to simulate onboarding a new custom vLLM inference node or foundation model with custom pricing."
              },
              {
                targetSelector: '[data-tour="compute-fleet-cards"]',
                title: "3. GPU Hardware Telemetry & Spot Rates",
                description: "Inspect hardware VRAM, interconnect type (NVLink/PCIe), base latency ping, and spot hourly rates."
              },
              {
                targetSelector: '[data-tour="node-status-toggle"]',
                title: "4. Dynamic Node Degradation",
                description: "Click any status badge (Active -> Degraded -> Offline) to simulate real-time cluster failures and watch the Pareto router adapt!"
              },
              {
                targetSelector: '[data-tour="model-catalog-cards"]',
                title: "5. Foundation Models Catalog",
                description: "Browse supported models with token economics (input/output rates) and standard quality benchmark scores."
              }
            ]}
          />

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh provider directory"
            className="px-3.5 py-2 rounded-control bg-white border border-grid-800 hover:border-grid-700 text-grid-400 hover:text-grid-100 text-body-sm flex items-center space-x-2 transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <div data-tour="register-provider-btn">
            <button
              onClick={onOpenRegisterModal}
              className="px-4 py-2 rounded-control bg-brand-emerald hover:bg-brand-mint text-white text-body-sm font-semibold flex items-center space-x-2 shadow-glow-emerald transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register Node</span>
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="flex items-start gap-2 rounded-card border border-signal-rose/30 bg-signal-roseDim p-4 text-body-sm text-signal-rose shadow-xs">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tab Filter */}
      <div className="flex items-center space-x-1 border-b border-grid-800 pb-1.5 overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: `All Resources (${safeModels.length + safeComputes.length})` },
          { id: 'models', label: `Foundation Models (${safeModels.length})` },
          { id: 'computes', label: `GPU Compute Nodes (${safeComputes.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`px-4 py-2 rounded-control text-body-sm font-medium transition-all ${
              selectedTab === tab.id
                ? 'bg-brand-emeraldDim text-brand-emerald font-semibold'
                : 'text-grid-500 hover:text-grid-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Compute Providers Grid */}
      {(selectedTab === 'all' || selectedTab === 'computes') && (
        <div data-tour="compute-fleet-cards" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-body-sm font-semibold uppercase tracking-wider text-grid-400 flex items-center space-x-2">
              <Server className="w-4 h-4 text-brand-emerald" />
              <span>Active GPU Fleet Nodes</span>
            </h3>
            <span className="text-caption text-grid-500">Live Hardware Telemetry & Spot Pricing</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeComputes.map((comp) => {
              const isDeployed = deployedIds.includes(comp.id);
              const costAlgo = (comp.costPerHourUsd / ALGO_USD_RATE).toFixed(2);
              return (
                <div
                  key={comp.id}
                  className={`bg-white border rounded-card p-6 space-y-4 transition-all shadow-xs flex flex-col justify-between hover:shadow-sm ${
                    isDeployed
                      ? 'border-brand-emerald bg-brand-emeraldDim/5 shadow-glow-emerald'
                      : comp.status === 'active'
                      ? 'border-grid-800 hover:border-grid-700'
                      : comp.status === 'degraded'
                      ? 'border-signal-amber/40 bg-signal-amberDim/5'
                      : 'border-grid-800/60 bg-grid-950/40 opacity-70'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-heading-sm font-serif font-medium text-grid-100">{comp.name}</div>
                        <div className="text-caption text-grid-500 mt-0.5">{comp.region}</div>
                      </div>

                      <button
                        data-tour="node-status-toggle"
                        onClick={() => handleToggleStatus(comp.id, comp.status)}
                        disabled={isUpdatingStatus === comp.id}
                        title="Click to cycle status (Active -> Degraded -> Offline)"
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border flex items-center space-x-1.5 cursor-pointer transition-all uppercase tracking-wider ${
                          comp.status === 'active'
                            ? 'bg-brand-emeraldDim text-brand-emerald border-brand-emerald/20 hover:bg-brand-emerald/10'
                            : comp.status === 'degraded'
                            ? 'bg-signal-amberDim text-signal-amber border-signal-amber/20 hover:bg-signal-amber/10'
                            : 'bg-signal-roseDim text-signal-rose border-signal-rose/20 hover:bg-signal-rose/10'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${comp.status === 'active' ? 'bg-brand-emerald' : comp.status === 'degraded' ? 'bg-signal-amber' : 'bg-signal-rose'}`} />
                        <span>{comp.status}</span>
                      </button>
                    </div>

                    <div className="bg-grid-950 p-4 rounded-control border border-grid-800/40 text-body-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-grid-500">GPU Core</span>
                        <span className="text-grid-100 font-medium truncate max-w-[160px]">{comp.gpuType}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-grid-500">VRAM / Bus</span>
                        <span className="text-grid-200">{comp.vramGb} GB · {comp.interconnect}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-grid-500">Spot Cost</span>
                        <span className="text-brand-emerald font-semibold">${comp.costPerHourUsd.toFixed(2)}/hr <span className="text-caption text-grid-500 font-normal">({costAlgo} A)</span></span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-grid-500">Latency</span>
                        <span className="text-grid-200">{comp.latencyBaseMs} ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 space-y-3">
                    <div className="text-[11px] text-grid-500 flex items-center justify-between border-t border-grid-850 pt-2.5">
                      <span>Micropayments:</span>
                      <span className="text-brand-emerald font-medium">Algorand x402</span>
                    </div>

                    {isDeployed ? (
                      <div className="w-full py-2.5 rounded-control bg-brand-emerald/10 border border-brand-emerald/25 text-brand-emerald text-body-sm font-semibold flex items-center justify-center space-x-2 animate-pulse-subtle">
                        <span className="w-2 h-2 rounded-full bg-brand-emerald animate-ping" />
                        <span>Deployed &amp; Running</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => openPurchaseModal(comp, 'compute')}
                        disabled={comp.status === 'offline'}
                        className="w-full py-2.5 rounded-control bg-grid-900 border border-grid-800 text-grid-200 hover:border-brand-emerald hover:text-brand-emerald hover:bg-brand-emeraldDim/5 text-body-sm font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50 disabled:hover:border-grid-800 disabled:hover:text-grid-200 disabled:hover:bg-grid-900 disabled:cursor-not-allowed"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Deploy Cluster</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Model Providers Grid */}
      {(selectedTab === 'all' || selectedTab === 'models') && (
        <div data-tour="model-catalog-cards" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-body-sm font-semibold uppercase tracking-wider text-grid-400 flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-brand-emerald" />
              <span>Foundation LLM Models</span>
            </h3>
            <span className="text-caption text-grid-500">Benchmark Scores & Token Economics</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeModels.map((m) => {
              const isDeployed = deployedIds.includes(m.id);
              const costAlgo = (m.qualityBenchmark * 0.01).toFixed(2);
              return (
                <div
                  key={m.id}
                  className={`bg-white border rounded-card p-6 space-y-4 transition-all shadow-xs flex flex-col justify-between hover:shadow-sm ${
                    isDeployed
                      ? 'border-brand-emerald bg-brand-emeraldDim/5 shadow-glow-emerald'
                      : 'border-grid-800 hover:border-grid-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-heading-sm font-serif font-medium text-grid-100">{m.name}</div>
                        <div className="text-caption text-grid-500 mt-0.5">{m.providerOrg}</div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-caption font-semibold bg-brand-emeraldDim/20 text-brand-emerald">
                        Score: {m.qualityBenchmark}
                      </span>
                    </div>

                    <div className="bg-grid-950 p-4 rounded-control border border-grid-800/40 text-body-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-grid-500">Context Window</span>
                        <span className="text-grid-200">{(m.contextWindow / 1000).toFixed(0)}k tokens</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-grid-500">Input / 1k Tok</span>
                        <span className="text-grid-200">${m.costPer1kInputTokensUsd.toFixed(5)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-grid-500">Output / 1k Tok</span>
                        <span className="text-brand-emerald font-semibold">${m.costPer1kOutputTokensUsd.toFixed(5)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-grid-500">Inference Speed</span>
                        <span className="text-grid-200">{m.typicalTps} t/s</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex flex-wrap gap-1">
                      {m.supportedModalities.slice(0, 3).map((mod, i) => (
                        <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-grid-850 text-grid-500 capitalize">
                          {mod}
                        </span>
                      ))}
                    </div>

                    <div className="text-[11px] text-grid-500 flex items-center justify-between border-t border-grid-850 pt-2.5">
                      <span>Deployment Payout:</span>
                      <span className="text-brand-emerald font-semibold">{costAlgo} ALGO</span>
                    </div>

                    {isDeployed ? (
                      <div className="w-full py-2.5 rounded-control bg-brand-emerald/10 border border-brand-emerald/25 text-brand-emerald text-body-sm font-semibold flex items-center justify-center space-x-2 animate-pulse-subtle">
                        <span className="w-2 h-2 rounded-full bg-brand-emerald animate-ping" />
                        <span>Endpoint Active</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => openPurchaseModal(m, 'model')}
                        className="w-full py-2.5 rounded-control bg-grid-900 border border-grid-800 text-grid-200 hover:border-brand-emerald hover:text-brand-emerald hover:bg-brand-emeraldDim/5 text-body-sm font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Deploy Model</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Deployment & Purchase Confirmation Modal */}
      {purchasingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-grid-100/40 backdrop-blur-md animate-fadeIn">
          <div role="dialog" aria-modal="true" className="w-full max-w-lg bg-white border border-grid-800 rounded-panel shadow-md overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-grid-800">
              <div className="flex items-center space-x-2">
                <Coins className="w-5 h-5 text-brand-emerald" />
                <h3 className="text-lg font-serif font-medium text-grid-100">
                  Confirm Deployment Settlement
                </h3>
              </div>
              {purchaseState !== 'processing' && (
                <button
                  onClick={() => setPurchasingItem(null)}
                  className="text-grid-500 hover:text-grid-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {purchaseState === 'idle' && (
                <div className="space-y-5">
                  <div className="bg-grid-950 p-5 rounded-card border border-grid-800/40 space-y-3.5 text-body-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-grid-500">Resource Name:</span>
                      <span className="text-grid-100 font-semibold text-body-lg">{purchasingItem.item.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-grid-500">Category:</span>
                      <span className="text-grid-200 capitalize font-medium">{purchasingItem.type} Payout</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-grid-500">Recipient Address:</span>
                      <span className="text-grid-300 font-mono text-caption truncate max-w-[240px]">
                        {purchasingItem.type === 'compute'
                          ? purchasingItem.item.algorandPayoutAddress
                          : 'TRSRY77VLE4J6R7K2P9M3N8Q5W4E9Z2Y7U8I1O3P5A6S7D8F9G0H1J2K3L'
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-grid-800 pt-3 mt-1">
                      <span className="text-grid-500 font-semibold">Total Cost:</span>
                      <span className="text-brand-emerald font-bold text-lg font-serif">
                        {purchasingItem.type === 'compute'
                          ? (purchasingItem.item.costPerHourUsd / ALGO_USD_RATE).toFixed(3)
                          : (purchasingItem.item.qualityBenchmark * 0.01).toFixed(3)
                        } ALGO
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2.5">
                    <label className="text-caption font-semibold uppercase tracking-wider text-grid-500">
                      Select Funding Wallet
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Agent Wallet Option */}
                      <button
                        onClick={() => setPaymentMethod('agent')}
                        className={`p-4 rounded-card border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          paymentMethod === 'agent'
                            ? 'border-brand-emerald bg-brand-emeraldDim/5 ring-1 ring-brand-emerald'
                            : 'border-grid-800 hover:border-grid-700 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-body-sm font-semibold text-grid-100">Agent Wallet</span>
                          <Zap className="w-3.5 h-3.5 text-brand-emerald" />
                        </div>
                        <span className="text-caption text-grid-500 mt-2">
                          Instant autonomous payout. Deducts ALGO from the Agent's shared TestNet address.
                        </span>
                      </button>

                      {/* Pera Wallet Option */}
                      <button
                        onClick={async () => {
                          if (!isConnected) {
                            try {
                              await connectWallet();
                              setPaymentMethod('pera');
                            } catch {}
                          } else {
                            setPaymentMethod('pera');
                          }
                        }}
                        className={`p-4 rounded-card border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          paymentMethod === 'pera'
                            ? 'border-brand-emerald bg-brand-emeraldDim/5 ring-1 ring-brand-emerald'
                            : 'border-grid-800 hover:border-grid-700 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-body-sm font-semibold text-grid-100">
                            {isConnected ? 'Pera Wallet' : 'Connect Pera'}
                          </span>
                          <Wallet className="w-3.5 h-3.5 text-brand-emerald" />
                        </div>
                        <span className="text-caption text-grid-500 mt-2">
                          {isConnected
                            ? `Deducts from connected address: ${walletAddress?.slice(0, 5)}... (${liveBalanceAlgo?.toFixed(1)} A)`
                            : 'Pay manually using the Pera Wallet mobile app or browser extension.'
                          }
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {purchaseState === 'processing' && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <RefreshCw className="w-8 h-8 text-brand-emerald animate-spin" />
                  <div className="text-center space-y-1.5">
                    <h4 className="text-body font-semibold text-grid-100">Broadcasting transaction to Algorand TestNet...</h4>
                    <p className="text-caption text-grid-500 max-w-sm">
                      Priming recipient address and generating on-chain payment proof. Please wait, this takes about 3 seconds.
                    </p>
                  </div>
                </div>
              )}

              {purchaseState === 'success' && txDetails && (
                <div className="space-y-5 py-2">
                  <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <div className="w-12 h-12 rounded-full bg-brand-emeraldDim/30 flex items-center justify-center text-brand-emerald mb-2">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h4 className="text-lg font-serif font-medium text-grid-100">Resource Deployed Successfully</h4>
                    <p className="text-body-sm text-grid-500 max-w-sm">
                      Payout settled in Round #{txDetails.round}. The resource has been added to your live deployments.
                    </p>
                  </div>

                  <div className="bg-grid-950 p-4 rounded-card border border-grid-800/40 space-y-2.5 text-body-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-grid-500">Transaction ID</span>
                      <span className="text-grid-100 font-mono text-caption truncate max-w-[200px]">{txDetails.txId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-grid-500">Confirmed Block</span>
                      <span className="text-grid-200">#{txDetails.round}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-grid-850 pt-2.5 mt-1.5">
                      <span className="text-grid-500">Explorer Receipt</span>
                      <a
                        href={txDetails.loraUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-emerald hover:text-brand-mint font-semibold flex items-center space-x-1"
                      >
                        <span>View on Lora Explorer</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {purchaseState === 'error' && (
                <div className="space-y-4 py-4">
                  <div className="flex items-start gap-2.5 rounded-card border border-signal-rose/30 bg-signal-roseDim p-4 text-body-sm text-signal-rose">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                    <div className="space-y-1">
                      <span className="font-semibold block">Transaction Failed</span>
                      <span>{purchaseError || 'The settlement process was rejected or timed out.'}</span>
                    </div>
                  </div>
                  <div className="text-center text-caption text-grid-500">
                    If paying with Pera Wallet, ensure you approved the transaction on your device.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-2 px-6 py-4 border-t border-grid-800 bg-grid-950/20">
              {purchaseState === 'idle' && (
                <>
                  <button
                    onClick={() => setPurchasingItem(null)}
                    className="px-4 py-2 text-body-sm text-grid-400 hover:text-grid-100 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmPurchase}
                    className="px-5 py-2 rounded-control bg-brand-emerald hover:bg-brand-mint text-white text-body-sm font-semibold flex items-center space-x-1.5 shadow-glow-emerald transition-all cursor-pointer"
                  >
                    <span>Approve &amp; Deploy</span>
                  </button>
                </>
              )}
              {purchaseState === 'error' && (
                <>
                  <button
                    onClick={() => setPurchaseState('idle')}
                    className="px-4 py-2 text-body-sm text-brand-emerald hover:text-brand-mint transition-colors cursor-pointer font-semibold"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setPurchasingItem(null)}
                    className="px-4 py-2 text-body-sm text-grid-400 hover:text-grid-100 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </>
              )}
              {purchaseState === 'success' && (
                <button
                  onClick={() => setPurchasingItem(null)}
                  className="px-5 py-2 rounded-control bg-brand-emerald hover:bg-brand-mint text-white text-body-sm font-semibold transition-all cursor-pointer shadow-glow-emerald"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceGrid;
