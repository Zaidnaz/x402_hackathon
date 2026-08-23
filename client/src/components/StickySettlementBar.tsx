import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, ExternalLink, X, Coins } from 'lucide-react';
import { CompletedTask } from '../types';

interface StickySettlementBarProps {
  isVisible: boolean;
  isStreaming: boolean;
  onExecute: () => void;
  onDismiss: () => void;
  completedTask?: CompletedTask | null;
  errorMessage?: string | null;
}

export const StickySettlementBar: React.FC<StickySettlementBarProps> = ({
  isVisible,
  isStreaming,
  onDismiss,
  completedTask,
  errorMessage,
}) => {
  // Auto-dismiss after 6 seconds for a clean non-intrusive notification
  useEffect(() => {
    if (isVisible && !isStreaming) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isStreaming, onDismiss]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  // Modern non-intrusive toast for completed tasks
  if (completedTask && !isStreaming && !errorMessage) {
    return (
      <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-slideDown shadow-xl">
        <div className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-lg flex items-start gap-3 text-zinc-900">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-zinc-950">Settlement Confirmed</span>
              <button
                onClick={onDismiss}
                className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded transition-colors cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[11px] text-zinc-600 font-mono mt-0.5">
              Paid <span className="text-emerald-700 font-bold">{completedTask.actualCostAlgo.toFixed(6)} ALGO</span> in {completedTask.actualDurationMs}ms
            </div>

            <div className="mt-2 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-400">Round #{completedTask.algorandTx.round}</span>
              <a
                href={completedTask.algorandTx.loraUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:text-emerald-800 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <span>View on Lora</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modern toast for errors
  if (errorMessage && !isStreaming) {
    return (
      <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-slideDown shadow-xl">
        <div className="bg-white border border-red-200 rounded-xl p-3.5 shadow-lg flex items-start gap-3 text-zinc-900">
          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-red-700">Execution Alert</span>
              <button
                onClick={onDismiss}
                className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded transition-colors cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[11px] text-zinc-600 font-sans mt-0.5">
              {errorMessage}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StickySettlementBar;