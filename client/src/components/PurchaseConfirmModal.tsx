import React from 'react';
import { 
  X, 
  Cpu, 
  Zap, 
  Coins, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { ModelProvider, ComputeProvider } from '../types';

interface PurchaseConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  model: ModelProvider | null;
  compute: ComputeProvider | null;
  prompt?: string;
  loading?: boolean;
}

export const PurchaseConfirmModal: React.FC<PurchaseConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  model,
  compute,
  prompt,
  loading = false
}) => {
  if (!isOpen || !model || !compute) return null;

  // Estimated tokens based on prompt or default baseline
  const estimatedTokens = Math.max(500, Math.round((prompt?.split(/\s+/).length || 20) * 1.35) + 600);
  const tokenCostUsd = ((estimatedTokens / 1000) * model.costPer1kInputTokensUsd) + ((estimatedTokens / 1000) * model.costPer1kOutputTokensUsd);
  const computeDurationSec = Math.max(1.2, compute.latencyBaseMs / 1000 * 2.5);
  const computeCostUsd = (computeDurationSec / 3600) * compute.costPerHourUsd;
  const totalCostUsd = tokenCostUsd + computeCostUsd;
  const algoUsdRate = 0.22; // ~0.22 USD / ALGO
  const totalCostAlgo = Math.max(0.004, totalCostUsd / algoUsdRate);
  const protocolFeeAlgo = totalCostAlgo * 0.015;
  const providerPayoutAlgo = totalCostAlgo - protocolFeeAlgo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="purchase-confirm-title" 
        className="bg-grid-900 border border-grid-800 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative"
      >
        <div className="flex items-center justify-between border-b border-grid-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-brand-emerald" />
            <h3 id="purchase-confirm-title" className="text-sm font-bold font-mono text-grid-100 uppercase tracking-wider">
              Confirm x402 Compute Slot
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-grid-400 hover:text-grid-200 p-1 rounded-md disabled:opacity-50 cursor-pointer"
            aria-label="Close purchase confirmation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Hardware & Model Specifications */}
          <div className="bg-grid-950 border border-grid-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-grid-400">
              <Zap className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Target Node Architecture</span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-grid-400">Model Endpoint</span>
                <span className="text-grid-100 font-semibold">{model.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grid-400">Model Provider</span>
                <span className="text-grid-300">{model.providerOrg}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grid-400">GPU Cluster</span>
                <span className="text-grid-100 font-semibold">{compute.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grid-400">Hardware & VRAM</span>
                <span className="text-grid-300">{compute.gpuType} ({compute.vramGb}GB)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-grid-400">Interconnect & Region</span>
                <span className="text-grid-300">{compute.interconnect} • {compute.region}</span>
              </div>
            </div>
          </div>

          {/* Real-time Economic Breakdown */}
          <div className="bg-brand-emerald/10 border border-brand-emerald/30 rounded-lg p-4 space-y-2.5">
            <div className="flex items-center space-x-2 text-xs font-mono text-brand-emerald">
              <Coins className="w-3.5 h-3.5 text-brand-emerald" />
              <span>x402 Micro-Settlement Breakdown</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-grid-300">
                <span>Estimated Tokens (~{estimatedTokens} tokens)</span>
                <span className="text-grid-100">${tokenCostUsd.toFixed(5)}</span>
              </div>
              <div className="flex items-center justify-between text-grid-300">
                <span>GPU Compute Execution (~{computeDurationSec.toFixed(1)}s)</span>
                <span className="text-grid-100">${computeCostUsd.toFixed(5)}</span>
              </div>
              <div className="border-t border-brand-emerald/30 pt-1.5 flex items-center justify-between text-[11px] text-grid-400">
                <span>Protocol Fee (1.5% Treasury)</span>
                <span className="text-grid-300">{protocolFeeAlgo.toFixed(6)} ALGO</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-grid-400">
                <span>Compute Provider Payout</span>
                <span className="text-grid-300">{providerPayoutAlgo.toFixed(6)} ALGO</span>
              </div>
              <div className="border-t border-brand-emerald/30 pt-2 flex items-center justify-between text-base">
                <span className="font-bold text-white">Estimated Total</span>
                <span className="font-bold text-brand-emerald">{totalCostAlgo.toFixed(6)} ALGO</span>
              </div>
            </div>
          </div>

          {/* Performance & Quality Metrics */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-grid-950 border border-grid-800 rounded-lg p-2.5">
              <Clock className="w-4 h-4 text-brand-emerald mx-auto mb-1" />
              <div className="text-[10px] text-grid-400 font-mono uppercase">Est. Latency</div>
              <div className="text-xs font-bold text-grid-100 font-mono">{compute.latencyBaseMs} ms</div>
            </div>
            <div className="bg-grid-950 border border-grid-800 rounded-lg p-2.5">
              <ShieldCheck className="w-4 h-4 text-signal-cyan mx-auto mb-1" />
              <div className="text-[10px] text-grid-400 font-mono uppercase">Quality</div>
              <div className="text-xs font-bold text-signal-cyan font-mono">{model.qualityBenchmark}/100</div>
            </div>
            <div className="bg-grid-950 border border-grid-800 rounded-lg p-2.5">
              <CheckCircle2 className="w-4 h-4 text-signal-emerald mx-auto mb-1" />
              <div className="text-[10px] text-grid-400 font-mono uppercase">Reliability</div>
              <div className="text-xs font-bold text-signal-emerald font-mono">{(model.reliabilityScore * 100).toFixed(1)}%</div>
            </div>
          </div>

          <div className="bg-grid-950 border border-grid-800 rounded-lg p-3 flex items-start space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 text-grid-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-grid-400 font-sans leading-relaxed">
              Payment is settled automatically via <strong className="text-grid-200">x402 on Algorand TestNet</strong> using the autonomous agent wallet. You will observe live decisions, Pareto validation, and token streaming.
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-grid-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded text-grid-400 hover:text-grid-200 text-xs font-mono cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-brand-emerald hover:bg-brand-emerald/90 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center space-x-2 cursor-pointer transition-all disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Confirming...' : 'Dispatch to Node'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseConfirmModal;