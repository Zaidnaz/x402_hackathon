import React, { useEffect } from 'react';
import { ShieldCheck, Coins, Timer, Send, X, Loader2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { formatCostRange } from '../utils/costEstimator';
import { useTaskContext } from '../context/TaskContext';
import { useEscrow } from '../context/EscrowContext';
import { useWallet } from '../context/WalletContext';
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
  onExecute,
  onDismiss,
  completedTask,
  errorMessage,
}) => {
  const { selectedConfig, clearSelection } = useTaskContext();
  const { state: escrowState, canExecuteSilently } = useEscrow();
  const { isConnected, walletAddress } = useWallet();

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

  // Show completion receipt
  if (completedTask && !isStreaming && !errorMessage) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 animate-slideDown">
        <div className="card-light p-4 shadow-drawer">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-zinc-950">Task Completed</div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  {completedTask.actualDurationMs}ms • {completedTask.actualCostAlgo.toFixed(6)} ALGO
                </div>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3 p-3 bg-zinc-50 rounded-lg border border-zinc-200">
            <div className="text-center">
              <div className="text-emerald-600 font-bold font-mono">{completedTask.actualCostAlgo.toFixed(6)} ALGO</div>
              <div className="text-[10px] text-zinc-500">Total Cost</div>
            </div>
            <div className="text-center border-x border-zinc-200">
              <div className="text-amber-600 font-bold font-mono">{completedTask.actualDurationMs}ms</div>
              <div className="text-[10px] text-zinc-500">Latency</div>
            </div>
            <div className="text-center">
              <a
                href={completedTask.algorandTx.loraUrl}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 hover:underline text-[11px] font-mono flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>View on Lora</span>
              </a>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onDismiss}
              className="flex-1 btn-secondary flex items-center justify-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
            <button
              onClick={() => { clearSelection(); onDismiss(); }}
              className="flex-1 btn-primary flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>New Task</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (errorMessage && !isStreaming) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 animate-slideDown">
        <div className="card-light p-4 shadow-drawer border-red-200 bg-red-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="font-semibold text-red-700">Task Failed</div>
            </div>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-red-600 mb-3">{errorMessage}</div>
          <div className="flex gap-2">
            <button
              onClick={onDismiss}
              className="flex-1 btn-secondary"
            >
              Dismiss
            </button>
            <button
              onClick={() => { clearSelection(); onDismiss(); }}
              className="flex-1 btn-primary"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show pending/streaming or pre-execution state
  if (!selectedConfig.model || !selectedConfig.compute) return null;

  const estimate = selectedConfig.estimate;
  const isSilentMode = canExecuteSilently();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 animate-slideDown">
      <div className="card-light p-3 shadow-drawer flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSilentMode ? 'bg-emerald-50' : 'bg-zinc-100'}`}>
              {isSilentMode ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              ) : (
                <Coins className="w-5 h-5 text-zinc-600" />
              )}
            </div>
            <div className="hidden sm:block">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                {isSilentMode ? 'ESCROW ACTIVE' : 'OPTIMAL ROUTE'}
              </div>
              <div className="font-semibold text-zinc-950 truncate max-w-[200px]">
                {selectedConfig.model.name} + {selectedConfig.compute.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 border-x border-zinc-200 px-3 py-1 sm:px-0">
            <div className="text-center min-w-[80px]">
              <div className="text-emerald-600 font-bold font-mono">{estimate ? formatCostRange(estimate) : '—'}</div>
              <div className="text-[10px] text-zinc-500">Est. Cost</div>
            </div>
            <div className="w-px h-6 bg-zinc-200 mx-2 sm:mx-3 hidden sm:block" />
            <div className="text-center min-w-[80px]">
              <div className="text-amber-600 font-bold font-mono">{estimate?.estimatedLatencyMs ?? '—'}ms</div>
              <div className="text-[10px] text-zinc-500">Latency</div>
            </div>
            <div className="w-px h-6 bg-zinc-200 mx-2 sm:mx-3 hidden sm:block" />
            <div className="text-center min-w-[80px]">
              <div className="text-emerald-600 font-bold font-mono">{selectedConfig.model.qualityBenchmark}/100</div>
              <div className="text-[10px] text-zinc-500">Quality</div>
            </div>
          </div>

          {isSilentMode && escrowState.isActive && (
            <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-mono text-emerald-700">
                {escrowState.tasksAuthorized - escrowState.tasksUsed} tasks • {escrowState.remainingBalanceAlgo.toFixed(4)} ALGO
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onDismiss}
            className="btn-secondary px-3 py-2 text-xs hidden sm:flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Dismiss</span>
          </button>
          <button
            onClick={onExecute}
            disabled={isStreaming}
            className={`btn-primary px-4 py-2 text-xs flex items-center gap-1.5 ${isStreaming ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isStreaming ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Executing...</span>
              </>
            ) : isSilentMode ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Execute (Silent)</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Pay & Execute</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickySettlementBar;