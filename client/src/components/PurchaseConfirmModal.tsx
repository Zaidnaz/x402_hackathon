import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Coins, Clock, Zap, AlertTriangle } from 'lucide-react';
import { ModelProvider, ComputeProvider } from '../types';

interface PurchaseConfirmModalProps {
  isOpen: boolean;
  model: ModelProvider | null;
  compute: ComputeProvider | null;
  prompt?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export const PurchaseConfirmModal: React.FC<PurchaseConfirmModalProps> = ({
  isOpen,
  model,
  compute,
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = useState(false);
  const [estimatedTokens] = useState(1200);

  if (!isOpen || !model || !compute) return null;

  const tokenCostUsd = ((estimatedTokens / 1000) * model.costPer1kInputTokensUsd) + ((estimatedTokens / 1000) * model.costPer1kOutputTokensUsd);
  const computeDurationSec = Math.max(1.2, compute.latencyBaseMs / 1000 * 2.5);
  const computeCostUsd = (computeDurationSec / 3600) * compute.costPerHourUsd;
  const totalCostUsd = tokenCostUsd + computeCostUsd;
  const algoUsdRate = 0.22; // ~0.22 USD / ALGO
  const totalCostAlgo = Math.max(0.004, totalCostUsd / algoUsdRate);
  const protocolFeeAlgo = totalCostAlgo * 0.015;
  const providerPayoutAlgo = totalCostAlgo - protocolFeeAlgo;

  const handleConfirmClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-sm animate-fadeIn">
      <div 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="purchase-confirm-title" 
        className="bg-white border border-zinc-200 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative text-zinc-900"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <h3 id="purchase-confirm-title" className="text-sm font-bold font-mono text-zinc-950 uppercase tracking-wider">
              Confirm x402 Compute Slot
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-zinc-400 hover:text-zinc-900 p-1 rounded-md disabled:opacity-50 cursor-pointer"
            aria-label="Close purchase confirmation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Hardware & Model Specifications */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-zinc-500">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Target Node Architecture</span>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Model Endpoint</span>
                <span className="text-zinc-950 font-semibold">{model.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Model Provider</span>
                <span className="text-zinc-700">{model.providerOrg}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">GPU Cluster</span>
                <span className="text-zinc-950 font-semibold">{compute.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Hardware & VRAM</span>
                <span className="text-zinc-700">{compute.gpuType} ({compute.vramGb}GB)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Interconnect & Region</span>
                <span className="text-zinc-700">{compute.interconnect} • {compute.region}</span>
              </div>
            </div>
          </div>

          {/* Real-time Economic Breakdown */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 space-y-2.5">
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-800 font-semibold">
              <Coins className="w-3.5 h-3.5 text-emerald-600" />
              <span>x402 Micro-Settlement Breakdown</span>
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-zinc-600">
                <span>Estimated Tokens (~{estimatedTokens} tokens)</span>
                <span className="text-zinc-900 font-mono">${tokenCostUsd.toFixed(5)}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-600">
                <span>GPU Compute Execution (~{computeDurationSec.toFixed(1)}s)</span>
                <span className="text-zinc-900 font-mono">${computeCostUsd.toFixed(5)}</span>
              </div>
              <div className="border-t border-emerald-200 pt-1.5 flex items-center justify-between text-[11px] text-zinc-500">
                <span>Protocol Fee (1.5% Treasury)</span>
                <span className="text-zinc-700 font-mono">{protocolFeeAlgo.toFixed(6)} ALGO</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>Compute Provider Payout</span>
                <span className="text-zinc-700 font-mono">{providerPayoutAlgo.toFixed(6)} ALGO</span>
              </div>
              <div className="border-t border-emerald-200 pt-2 flex items-center justify-between text-base">
                <span className="font-bold text-zinc-950">Estimated Total</span>
                <span className="font-bold text-emerald-700 font-mono">{totalCostAlgo.toFixed(6)} ALGO</span>
              </div>
            </div>
          </div>

          {/* Performance & Quality Metrics */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5">
              <Clock className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <div className="text-[10px] text-zinc-500 font-mono uppercase">Est. Latency</div>
              <div className="text-xs font-bold text-zinc-950 font-mono">{compute.latencyBaseMs} ms</div>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-[10px] text-zinc-500 font-mono uppercase">Quality</div>
              <div className="text-xs font-bold text-emerald-700 font-mono">{model.qualityBenchmark}/100</div>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-[10px] text-zinc-500 font-mono uppercase">Reliability</div>
              <div className="text-xs font-bold text-zinc-950 font-mono">{(model.reliabilityScore * 100).toFixed(1)}%</div>
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 flex items-start space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-zinc-600 font-sans leading-relaxed">
              Payment is settled automatically via <strong className="text-zinc-900">x402 on Algorand TestNet</strong> using the autonomous agent wallet. You will observe live decisions, Pareto validation, and token streaming.
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-zinc-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded text-zinc-600 hover:text-zinc-950 text-xs font-mono cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center space-x-2 cursor-pointer transition-all disabled:opacity-40 shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{loading ? 'Confirming...' : 'Dispatch to Node'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseConfirmModal;