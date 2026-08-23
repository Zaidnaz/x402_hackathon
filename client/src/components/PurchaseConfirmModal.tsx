import React, { useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, Coins, Zap, Clock, ShieldCheck, ExternalLink } from 'lucide-react';
import { ModelProvider, ComputeProvider } from '../types';
import { estimateTaskCost, formatCostRange, getSupportedModalitiesDisplay } from '../utils/costEstimator';

interface PurchaseConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  model: ModelProvider | null;
  compute: ComputeProvider | null;
  prompt: string;
  loading?: boolean;
}

export const PurchaseConfirmModal: React.FC<PurchaseConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  model,
  compute,
  prompt,
  loading = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !model || !compute) return null;

  const estimate = estimateTaskCost(prompt || 'Sample task for cost estimation', model, compute);
  const modalities = getSupportedModalitiesDisplay(model);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-grid-950/80 backdrop-blur-sm animate-fadeIn">
      <div role="dialog" aria-modal="true" aria-labelledby="purchase-confirm-title" className="bg-grid-900 border border-grid-800 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-grid-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-brand-emerald" />
            <h3 id="purchase-confirm-title" className="text-sm font-bold font-mono text-grid-100 uppercase tracking-wider">
              Confirm Purchase
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-grid-400 hover:text-grid-200 p-1 rounded-md disabled:opacity-50"
            aria-label="Close purchase confirmation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-grid-950 border border-grid-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-grid-400">
              <Zap className="w-3.5 h-3.5 text-signal-amber" />
              <span>What you're purchasing</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-grid-400">Model</span>
                <span className="text-grid-100 font-mono font-semibold">{model.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grid-400">Provider</span>
                <span className="text-grid-300 font-mono">{model.providerOrg}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grid-400">Compute Node</span>
                <span className="text-grid-100 font-mono">{compute.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grid-400">GPU</span>
                <span className="text-grid-300 font-mono">{compute.gpuType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grid-400">Region</span>
                <span className="text-grid-300 font-mono">{compute.region}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grid-400">Supported Tasks</span>
                <span className="text-grid-300 font-mono text-[11px]">{modalities.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="bg-brand-emerald/10 border border-brand-emerald/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-brand-emerald">
              <Coins className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Estimated Cost</span>
            </div>
            <div className="space-y-1.5 text-sm font-mono">
              <div className="flex items-center justify-between text-grid-300">
                <span>Token Cost (est. {prompt?.split(/\s+/).length || 0} words → ~{Math.round((prompt?.split(/\s+/).length || 0) * 1.35) + 600} tokens)</span>
                <span className="text-grid-100">${estimate.breakdown.tokenCostUsd.toFixed(6)}</span>
              </div>
              <div className="flex items-center justify-between text-grid-300">
                <span>Compute Cost (~{Math.round(estimate.breakdown.computeCostUsd * 3600 / compute.costPerHourUsd * 100) / 100}s on {compute.gpuType})</span>
                <span className="text-grid-100">${estimate.breakdown.computeCostUsd.toFixed(6)}</span>
              </div>
              <div className="border-t border-brand-emerald/30 pt-1.5 flex items-center justify-between">
                <span className="text-brand-emerald font-semibold">Subtotal</span>
                <span className="text-brand-emerald font-semibold">${estimate.breakdown.totalCostUsd.toFixed(6)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-grid-400">
                <span>Protocol Fee (1.5%)</span>
                <span className="text-grid-300">{estimate.breakdown.protocolFeeAlgo.toFixed(6)} ALGO</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-grid-400">
                <span>Provider Payout</span>
                <span className="text-grid-300">{estimate.breakdown.providerPayoutAlgo.toFixed(6)} ALGO</span>
              </div>
              <div className="border-t border-brand-emerald/30 pt-2 flex items-center justify-between text-lg">
                <span className="font-bold text-white">Total</span>
                <span className="font-bold text-brand-emerald">{formatCostRange(estimate)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-grid-950 border border-grid-800 rounded-lg p-3">
              <Clock className="w-5 h-5 text-signal-amber mx-auto mb-1" />
              <div className="text-[10px] text-grid-400 font-mono uppercase">Est. Latency</div>
              <div className="text-sm font-bold text-grid-100">{estimate.estimatedLatencyMs} ms</div>
            </div>
            <div className="bg-grid-950 border border-grid-800 rounded-lg p-3">
              <ShieldCheck className="w-5 h-5 text-signal-cyan mx-auto mb-1" />
              <div className="text-[10px] text-grid-400 font-mono uppercase">Quality</div>
              <div className="text-sm font-bold text-signal-cyan">{model.qualityBenchmark}/100</div>
            </div>
            <div className="bg-grid-950 border border-grid-800 rounded-lg p-3">
              <CheckCircle2 className="w-5 h-5 text-signal-emerald mx-auto mb-1" />
              <div className="text-[10px] text-grid-400 font-mono uppercase">Reliability</div>
              <div className="text-sm font-bold text-signal-emerald">{(model.reliabilityScore * 100).toFixed(1)}%</div>
            </div>
          </div>

          <div className="bg-signal-amber/10 border border-signal-amber/30 rounded-lg p-3 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-signal-amber shrink-0 mt-0.5" />
            <div className="text-xs text-grid-300 font-sans leading-relaxed">
              Payment is settled automatically via <strong className="text-white">x402 on Algorand TestNet</strong> using the autonomous agent wallet. 
              The agent pays on your behalf — no manual wallet interaction required unless you connect Pera Wallet in the x402 Testbed.
              <br /><br />
              <span className="text-signal-amber">Estimates vary ±30% based on actual token usage and runtime.</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-grid-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded text-grid-400 hover:text-grid-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 rounded bg-brand-emerald text-black font-bold uppercase tracking-wider flex items-center space-x-2 shadow-glow-emerald disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Confirming...' : 'Confirm & Configure Task'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseConfirmModal;