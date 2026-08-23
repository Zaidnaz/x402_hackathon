import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Zap, Send, ChevronDown, Loader2, ShieldCheck, Coins, Timer, Cpu, X } from 'lucide-react';
import { TaskRequirement } from '../types';
import { fetchFundingStatus } from '../utils/api';
import { useTaskContext } from '../context/TaskContext';
import { useEscrow } from '../context/EscrowContext';
import { formatCostRange } from '../utils/costEstimator';
import { EscrowPanel } from './EscrowPanel';

const EXAMPLE_PROMPTS = [
  'Write an optimized Algorand PyTeal contract for an atomic x402 escrow',
  'Summarize the tradeoffs between Pareto-optimal routing and greedy cost minimization',
  'Deduce worst-case latency bounds for a Raft cluster under network partition'
];

interface CommandBarLightProps {
  onDispatchTask: (
    prompt: string,
    overrides: Partial<TaskRequirement>,
    simulateFailover: boolean
  ) => void;
  isStreaming: boolean;
}

export const CommandBarLight: React.FC<CommandBarLightProps> = ({
  onDispatchTask,
  isStreaming,
}) => {
  const { selectedConfig, clearSelection, isLocked } = useTaskContext();
  const { state: escrowState, canExecuteSilently, recordTaskExecution } = useEscrow();
  const [prompt, setPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priority, setPriority] = useState<'balanced' | 'cost' | 'speed' | 'quality'>('balanced');
  const [simulateFailover, setSimulateFailover] = useState(false);
  const [funding, setFunding] = useState<{ isFunded: boolean; balanceAlgo: number; fundUrl: string; agentAddress: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchFundingStatus().then(setFunding).catch(() => setFunding(null));
  }, []);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [prompt]);

  const handleDispatch = () => {
    if (!prompt.trim() || isStreaming) return;
    const overrides: Partial<TaskRequirement> = { priority };
    if (selectedConfig.model) overrides.modality = 'code';
    
    if (escrowState.isActive && selectedConfig.estimate) {
      recordTaskExecution(selectedConfig.estimate.breakdown.totalCostUsd / 0.1904);
    }
    
    onDispatchTask(prompt.trim(), overrides, simulateFailover);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDispatch();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      textareaRef.current?.focus();
    }
  };

  const handleClearSelection = () => {
    clearSelection();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Escrow Panel */}
      <EscrowPanel isStreaming={isStreaming} />

      {/* Selection Summary Bar */}
      {selectedConfig.model && selectedConfig.compute && (
        <div className="card-light p-4 space-y-3 animate-slideDown" role="status" aria-live="polite">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-600">Active Selection</span>
            </div>
            <button
              onClick={handleClearSelection}
              disabled={isStreaming}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors disabled:opacity-50"
              aria-label="Clear model/compute selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-600" />
                <span>Model</span>
              </div>
              <div className="text-zinc-950 font-semibold truncate">{selectedConfig.model.name}</div>
              <div className="text-[10px] text-zinc-500">{selectedConfig.model.providerOrg}</div>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Compute</span>
              </div>
              <div className="text-zinc-950 font-semibold truncate">{selectedConfig.compute.name}</div>
              <div className="text-[10px] text-zinc-500">{selectedConfig.compute.gpuType}</div>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                <span>Est. Cost</span>
              </div>
              <div className="text-emerald-600 font-bold font-mono">{formatCostRange(selectedConfig.estimate!)}</div>
              <div className="text-[10px] text-zinc-500">±30% based on actual usage</div>
            </div>
            <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                <Timer className="w-3.5 h-3.5 text-amber-600" />
                <span>Est. Latency</span>
              </div>
              <div className="text-amber-600 font-bold font-mono">{selectedConfig.estimate?.estimatedLatencyMs} ms</div>
              <div className="text-[10px] text-zinc-500">Quality: {selectedConfig.model.qualityBenchmark}/100</div>
            </div>
          </div>

          {isLocked && (
            <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Selection locked — click ✕ to change</span>
            </div>
          )}
        </div>
      )}

      {/* Main Command Bar */}
      <div className="card-light p-3 shadow-sm font-mono">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-zinc-900">ROUTER_ENGINE</span>
            <span className="text-emerald-600">:: READY</span>
          </div>
          <span className="text-[11px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-200">
            ⌘K Express
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400 font-bold">$</span>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="e.g. Process 100k tokens under 0.5 ALGO with low latency..."
            rows={1}
            className="w-full bg-transparent text-sm text-zinc-950 focus:outline-none placeholder:text-zinc-400 font-sans resize-none disabled:opacity-50"
          />
          <button
            onClick={handleDispatch}
            disabled={isStreaming || !prompt.trim()}
            className="bg-zinc-950 hover:bg-zinc-900 text-white text-xs font-medium px-3.5 py-1.5 rounded transition-colors whitespace-nowrap disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isStreaming ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Running...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Find Route
              </>
            )}
          </button>
        </div>

        <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center gap-1 text-[12px] text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer px-1.5 py-1 rounded hover:bg-zinc-100"
          >
            <span>Advanced</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {!prompt && !selectedConfig.model && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 transition-colors cursor-pointer truncate max-w-[200px]"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>

        {showAdvanced && (
          <div className="pt-2 border-t border-zinc-100 space-y-3 animate-fadeIn">
            <div className="space-y-1.5 pt-2">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wide">Optimize for</div>
              <div className="grid grid-cols-4 gap-1.5">
                {(['balanced', 'cost', 'speed', 'quality'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setPriority(opt)}
                    disabled={isLocked}
                    className={`py-1.5 rounded-lg text-[12px] font-medium capitalize transition-colors cursor-pointer ${
                      priority === opt
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                        : 'bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-zinc-900'
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 text-[12px] text-zinc-600 cursor-pointer">
              <input
                type="checkbox"
                checked={simulateFailover}
                onChange={(e) => setSimulateFailover(e.target.checked)}
                disabled={isLocked}
                className="accent-emerald-600"
              />
              <span>Simulate a mid-task provider failure</span>
              {isLocked && <span className="text-[10px] text-zinc-400">(locked)</span>}
            </label>

            {isLocked && (
              <div className="text-[11px] text-zinc-500 font-mono bg-zinc-50 border border-zinc-200 rounded-lg p-2">
                Model and compute are pre-selected from Marketplace. Unlock to let the agent choose automatically.
              </div>
            )}
          </div>
        )}

        {funding && !funding.isFunded && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-[12px] text-amber-700 font-sans">
            <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
              <span className="w-4 h-4" />⚠
              <span>Fund Autonomous Agent Wallet on TestNet</span>
              <a href={funding.fundUrl} target="_blank" rel="noreferrer" className="text-[11px] font-mono text-emerald-600 underline hover:text-emerald-700">
                Get free ALGO →
              </a>
            </div>
            <p className="mt-1 text-zinc-600 leading-snug">
              AgentGrid's autonomous backend agent signs and settles compute payments on-chain on your behalf. Please fund the <strong className="text-zinc-900">Agent Wallet</strong> (<code className="text-emerald-600 font-mono text-[11px]">{funding.agentAddress.slice(0, 8)}...{funding.agentAddress.slice(-6)}</code>) via the AlgoKit dispenser, not just your personal connected wallet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandBarLight;