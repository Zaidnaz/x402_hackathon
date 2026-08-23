import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Server, 
  Database, 
  Zap, 
  Timer, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  Globe,
  Plus,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  CheckCircle2,
  X
} from 'lucide-react';
import { ModelProvider, ComputeProvider } from '../types';
import { FALLBACK_MODELS, FALLBACK_COMPUTES } from '../utils/api';
import { estimateTaskCost, formatCostRange, getSupportedModalitiesDisplay } from '../utils/costEstimator';
import { TourGuideButton } from './TourGuideButton';
import { PurchaseConfirmModal } from './PurchaseConfirmModal';
import { RegisterGpuModal } from './RegisterGpuModal';

interface MarketplaceOrderBookProps {
  models: ModelProvider[];
  computes: ComputeProvider[];
  onOpenRegisterModal: () => void;
  onRefreshCatalog: () => void;
  onNavigateToCommand: () => void;
}

export const MarketplaceOrderBook: React.FC<MarketplaceOrderBookProps> = ({
  models = [],
  computes = [],
  onOpenRegisterModal,
  onRefreshCatalog,
  onNavigateToCommand,
}) => {
  const safeModels = models && models.length > 0 ? models : FALLBACK_MODELS;
  const safeComputes = computes && computes.length > 0 ? computes : FALLBACK_COMPUTES;
  const [selectedTab, setSelectedTab] = useState<'all' | 'models' | 'computes'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'price', direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
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
      await fetch('/api/marketplace/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ computeId, status: nextStatus })
      });
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
    setPurchaseModal({ isOpen: false, model: null, compute: null });
    onNavigateToCommand();
  };

  const getEstimatedTaskCost = (model: ModelProvider, compute: ComputeProvider) => {
    return estimateTaskCost('Typical inference task (~500 words input, ~600 tokens output)', model, compute);
  };

  const formatUptime = (uptime: number) => uptime.toFixed(2) + '%';
  const formatLoad = (load: number) => load.toFixed(0) + '%';

  // Combine and filter data
  const allProviders = [
    ...safeComputes.map(c => ({ ...c, type: 'compute' as const, estimate: getEstimatedTaskCost(safeModels.find(m => m.status === 'online') || safeModels[0], c) })),
    ...safeModels.map(m => ({ ...m, type: 'model' as const, estimate: getEstimatedTaskCost(m, safeComputes.find(c => c.status === 'active') || safeComputes[0]) }))
  ];

  const filteredProviders = allProviders.filter(p => {
    const isCompute = p.type === 'compute';
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (isCompute && (p as any).gpuType?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (!isCompute && (p as any).providerOrg?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (isCompute ? ((p as any).reliabilityScore * 100) : (p as any).qualityBenchmark)?.toString().includes(searchQuery);
    
    const matchesTab = selectedTab === 'all' || 
      (selectedTab === 'computes' && p.type === 'compute') ||
      (selectedTab === 'models' && p.type === 'model');
    
    return matchesSearch && matchesTab;
  });

  const sortedProviders = [...filteredProviders].sort((a, b) => {
    let aVal: any, bVal: any;
    const aP = a as any, bP = b as any;
    switch (sortConfig.key) {
      case 'name': aVal = a.name; bVal = b.name; break;
      case 'price': aVal = a.estimate?.breakdown.totalCostUsd ?? aP.costPerHourUsd ?? aP.costPer1kInputTokensUsd; bVal = b.estimate?.breakdown.totalCostUsd ?? bP.costPerHourUsd ?? bP.costPer1kInputTokensUsd; break;
      case 'latency': aVal = a.estimate?.estimatedLatencyMs ?? aP.latencyBaseMs; bVal = b.estimate?.estimatedLatencyMs ?? bP.latencyBaseMs; break;
      case 'quality': aVal = aP.qualityBenchmark ?? aP.projectedQualityScore; bVal = bP.qualityBenchmark ?? bP.projectedQualityScore; break;
      case 'uptime': aVal = aP.reliabilityScore ? aP.reliabilityScore * 100 : aP.reliabilityUptime; bVal = bP.reliabilityScore ? bP.reliabilityScore * 100 : bP.reliabilityUptime; break;
      default: return 0;
    }
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const requestSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'badge-green';
      case 'degraded': return 'badge-amber';
      case 'offline': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  const getProviderTypeBadge = (type: string) => (
    <span className={`px-2 py-0.5 text-[10px] font-medium rounded border ${type === 'compute' ? 'bg-zinc-100 text-zinc-700 border-zinc-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
      {type === 'compute' ? 'COMPUTE' : 'MODEL'}
    </span>
  );

  return (
    <div className="space-y-4">
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

      {/* Header */}
      <div className="card-light p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 font-semibold">Live Infrastructure Grid</span>
          </div>
          <h2 className="text-xl font-bold font-mono text-zinc-950">
            Compute & Model Inventory
          </h2>
          <p className="text-xs font-mono text-zinc-500 mt-1 max-w-2xl">
            {safeComputes.length + safeModels.length} providers • {safeComputes.filter(c => c.status === 'active').length} active GPUs • {safeModels.filter(m => m.status === 'online').length} online models
          </p>
        </div>

        <div className="flex items-center gap-2">
          <TourGuideButton
            tourId="marketplace-tour"
            buttonLabel="How It Works"
            steps={[
              {
                targetSelector: '[data-tour="marketplace-header"]',
                title: "1. Inventory Header",
                description: "Live view of all registered compute GPUs and model APIs with real-time pricing and availability."
              },
              {
                targetSelector: '[data-tour="search-filter"]',
                title: "2. Search & Filter",
                description: "Search by name, hardware, or provider. Sort by price, latency, quality, or uptime."
              },
              {
                targetSelector: '[data-tour="register-gpu"]',
                title: "3. List Your GPU",
                description: "Register your idle hardware as a community P2P node to earn ALGO per task."
              },
              {
                targetSelector: '[data-tour="select-btn"]',
                title: "4. Select & Execute",
                description: "Click 'Select' on any provider to see exact pricing, then confirm to route a task."
              }
            ]}
          />

          <button
            onClick={onRefreshCatalog}
            title="Sync registry telemetry"
            className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors border border-zinc-200"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            data-tour="register-gpu"
            onClick={onOpenRegisterModal}
            className="px-3 py-2 rounded-lg bg-zinc-950 text-white text-xs font-mono font-bold flex items-center gap-2 hover:bg-zinc-900 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Provider</span>
          </button>
          <button
            onClick={() => setShowRegisterGpuModal(true)}
            className="px-3 py-2 rounded-lg bg-amber-100 text-amber-700 text-xs font-mono font-bold flex items-center gap-2 hover:bg-amber-200 border border-amber-200 transition-colors"
          >
            <Server className="w-3.5 h-3.5" />
            <span>List Your GPU</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="card-light p-4" data-tour="search-filter">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search providers, hardware, specs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-mono rounded-lg border border-zinc-200 flex items-center gap-1.5 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1 border border-zinc-200 rounded-lg bg-white overflow-hidden">
              {[
                { id: 'all', label: `All (${safeModels.length + safeComputes.length})` },
                { id: 'models', label: `Models (${safeModels.length})` },
                { id: 'computes', label: `GPUs (${safeComputes.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`px-3 py-1.5 text-xs font-mono whitespace-nowrap transition-colors ${
                    selectedTab === tab.id
                      ? 'bg-zinc-950 text-white'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-3 pt-3 border-t border-zinc-200 flex flex-wrap gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Sort by:</span>
              {[
                { key: 'name', label: 'Name' },
                { key: 'price', label: 'Price' },
                { key: 'latency', label: 'Latency' },
                { key: 'quality', label: 'Quality' },
                { key: 'uptime', label: 'Uptime' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => requestSort(opt.key)}
                  className={`px-2.5 py-1 rounded text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors ${
                    sortConfig.key === opt.key ? 'bg-zinc-100 text-zinc-900 font-medium' : ''
                  }`}
                >
                  {opt.label}
                  {sortConfig.key === opt.key && (
                    <span className="ml-1">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Book Table */}
      <div className="card-light overflow-hidden">
        <table className="table-light">
          <thead>
            <tr>
              <th className="py-2.5 px-4 font-medium" onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
                Provider / Node
                <ChevronDown className="w-3.5 h-3.5 inline ml-1 opacity-50" />
              </th>
              <th className="py-2.5 px-4 font-medium" onClick={() => requestSort('price')} style={{ cursor: 'pointer' }}>
                Price
                <ChevronDown className="w-3.5 h-3.5 inline ml-1 opacity-50" />
              </th>
              <th className="py-2.5 px-4 font-medium" onClick={() => requestSort('latency')} style={{ cursor: 'pointer' }}>
                Est. Latency
                <ChevronDown className="w-3.5 h-3.5 inline ml-1 opacity-50" />
              </th>
              <th className="py-2.5 px-4 font-medium" onClick={() => requestSort('quality')} style={{ cursor: 'pointer' }}>
                Quality
                <ChevronDown className="w-3.5 h-3.5 inline ml-1 opacity-50" />
              </th>
              <th className="py-2.5 px-4 font-medium" onClick={() => requestSort('uptime')} style={{ cursor: 'pointer' }}>
                Uptime
                <ChevronDown className="w-3.5 h-3.5 inline ml-1 opacity-50" />
              </th>
              <th className="py-2.5 px-4 font-medium text-right">Status</th>
              <th className="py-2.5 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {sortedProviders.map((p, idx) => {
              const isCompute = p.type === 'compute';
              const estimate = p.estimate;
              const priceDisplay = isCompute 
                ? `$${(p as ComputeProvider).costPerHourUsd.toFixed(2)}/hr`
                : `$${(p as ModelProvider).costPer1kOutputTokensUsd.toFixed(5)}/1k out`;
              const latencyDisplay = estimate ? `${estimate.estimatedLatencyMs}ms` : `${(p as ComputeProvider).latencyBaseMs ?? 0}ms`;
              const qualityDisplay = (p as ModelProvider).qualityBenchmark ?? (p as ComputeProvider).reliabilityUptime;
              const uptimeDisplay = (p as ComputeProvider).reliabilityUptime ?? (p as ModelProvider).reliabilityScore ? (p as ModelProvider).reliabilityScore! * 100 : 99.9;
              const status = isCompute ? (p as ComputeProvider).status : (p as ModelProvider).status;

              return (
                <tr key={`${p.type}-${p.id}`} className={idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isCompute ? (
                          <Server className="w-5 h-5 text-zinc-500" />
                        ) : (
                          <Cpu className="w-5 h-5 text-emerald-600" />
                        )}
                        <div>
                          <div className="font-semibold text-zinc-950">{p.name}</div>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                            {getProviderTypeBadge(p.type)}
                            {p.type === 'compute' && (p as any).region && <span className="text-zinc-400">{(p as any).region}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono font-medium text-zinc-950">
                      {estimate ? formatCostRange(estimate) : priceDisplay}
                    </div>
                    <div className="text-[10px] text-zinc-500">
                      {isCompute ? `~$${(p as ComputeProvider).costPerHourUsd.toFixed(2)}/hr` : `$${(p as ModelProvider).costPer1kInputTokensUsd.toFixed(5)}/1k in / $${(p as ModelProvider).costPer1kOutputTokensUsd.toFixed(5)}/1k out`}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-zinc-900">{latencyDisplay}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-zinc-950">{qualityDisplay.toFixed(1)}</span>
                      <span className="text-zinc-500 text-[10px]">/ 100</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-zinc-900">{uptimeDisplay.toFixed(2)}%</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`${getStatusColor(status)}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      data-tour="select-btn"
                      onClick={() => openPurchaseModal(isCompute ? null : p as ModelProvider, isCompute ? p as ComputeProvider : null)}
                      disabled={status === 'offline'}
                      className={`px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1.5 justify-end ${
                        status === 'offline'
                          ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed'
                          : 'bg-zinc-950 text-white hover:bg-zinc-900 shadow-sm'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{status === 'offline' ? 'Offline' : 'Select'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
            {sortedProviders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-500 font-mono">
                  No providers match your search and filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketplaceOrderBook;