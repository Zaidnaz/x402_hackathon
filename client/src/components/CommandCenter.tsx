import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ChevronDown, Loader2, AlertTriangle, X, Zap, Cpu, Coins, Timer, ShieldCheck } from 'lucide-react';
import { TaskRequirement } from '../types';
import { fetchFundingStatus } from '../utils/api';
import { useTaskContext } from '../context/TaskContext';
import { formatCostRange } from '../utils/costEstimator';

const EXAMPLE_PROMPTS = [
  'Write an optimized Algorand PyTeal contract for an atomic x402 escrow',
  'Summarize the tradeoffs between Pareto-optimal routing and greedy cost minimization',
  'Deduce worst-case latency bounds for a Raft cluster under network partition'
];

export const CommandCenter: React.FC<{
  onDispatchTask: (
    prompt: string,
    overrides: Partial<TaskRequirement>,
    simulateFailover: boolean
  ) => void;
  isStreaming: boolean;
}> = ({ onDispatchTask, isStreaming }) => {
  const { selectedConfig, clearSelection, isLocked } = useTaskContext();
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
    el.style.height = `${Math.min(el.scrollHeight, 260)}px`;
  }, [prompt]);

  const handleDispatch = () => {
    if (!prompt.trim() || isStreaming) return;
    const overrides: Partial<TaskRequirement> = { priority };
    if (selectedConfig.model) overrides.modality = 'code';
    onDispatchTask(prompt.trim(), overrides, simulateFailover);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDispatch();
    }
  };

  const handleClearSelection = () => {
    clearSelection();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Selection Summary Bar */}
      {selectedConfig.model && selectedConfig.compute && (
        <div className="bg-brand-emerald/10 border border-brand-emerald/30 rounded-xl p-4 space-y-3 animate-slideDown" role="status" aria-live="polite">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-brand-emerald" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-emerald">Active Selection</span>
            </div>
            <button
              onClick={handleClearSelection}
              disabled={isStreaming}
              className="p-1.5 rounded-lg text-grid-400 hover:text-white hover:bg-white/[0.06] transition-colors disabled:opacity-50"
              aria-label="Clear model/compute selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-grid-950 border border-grid-800 rounded-lg p-3">
              <div className="flex items-center space-x-1.5 text-grid-400 mb-1">
                <Cpu className="w-3.5 h-3.5 text-signal-cyan" />
                <span>Model</span>
              </div>
              <div className="text-grid-100 font-semibold truncate">{selectedConfig.model.name}</div>
              <div className="text-[10px] text-grid-400">{selectedConfig.model.providerOrg}</div>
            </div>
            <div className="bg-grid-950 border border-grid-800 rounded-lg p-3">
              <div className="flex items-center space-x-1.5 text-grid-400 mb-1">
                <Zap className="w-3.5 h-3.5 text-signal-amber" />
                <span>Compute</span>
              </div>
              <div className="text-grid-100 font-semibold truncate">{selectedConfig.compute.name}</div>
              <div className="text-[10px] text-grid-400">{selectedConfig.compute.gpuType}</div>
            </div>
            <div className="bg-grid-950 border border-grid-800 rounded-lg p-3">
              <div className="flex items-center space-x-1.5 text-grid-400 mb-1">
                <Coins className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Est. Cost</span>
              </div>
              <div className="text-brand-emerald font-bold font-mono">{formatCostRange(selectedConfig.estimate!)}</div>
              <div className="text-[10px] text-grid-400">±30% based on actual usage</div>
            </div>
            <div className="bg-grid-950 border border-grid-800 rounded-lg p-3">
              <div className="flex items-center space-x-1.5 text-grid-400 mb-1">
                <Timer className="w-3.5 h-3.5 text-signal-amber" />
                <span>Est. Latency</span>
              </div>
              <div className="text-signal-amber font-bold font-mono">{selectedConfig.estimate?.estimatedLatencyMs} ms</div>
              <div className="text-[10px] text-grid-400">Quality: {selectedConfig.model.qualityBenchmark}/100</div>
            </div>
          </div>

          {isLocked && (
            <div className="text-[10px] text-grid-500 font-mono flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-brand-emerald" />
              <span>Selection locked — click ✕ to change</span>
            </div>
          )}
        </div>
      )}

      <div className="text-center space-y-2 mb-1">
        <h1 className="font-serif text-[2rem] sm:text-[2.5rem] leading-tight font-medium text-white tracking-tight">
          What do you need done?
        </h1>
        <p className="text-sm text-grid-400 max-w-md mx-auto leading-relaxed">
          {selectedConfig.model && selectedConfig.compute
            ? `Running on <strong className="text-white">{selectedConfig.model.name}</strong> + <strong className="text-white">{selectedConfig.compute.name}</strong>. Describe your task below.`
            : 'Describe the task. The agent picks the model, pays for the compute on Algorand, and runs it — you\'ll watch every decision it makes, live.'}
        </p>
      </div>

      {funding && !funding.isFunded && (
        <a
          href={funding.fundUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-start space-x-2.5 text-[13px] text-signal-amber bg-signal-amber/10 border border-signal-amber/30 rounded-xl p-3.5 hover:bg-signal-amber/15 transition-all group"
        >
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-1 text-left">
            <div className="font-semibold text-white flex items-center space-x-1.5">
              <span>Fund Autonomous Agent Wallet on TestNet</span>
              <span className="text-[11px] font-mono text-signal-amber underline group-hover:text-white">Tap to get free ALGO ›</span>
            </div>
            <p className="text-[12px] text-grid-300 leading-snug">
              AgentGrid's autonomous backend agent signs and settles compute payments on-chain on your behalf. Please fund the <strong className="text-white">Agent Wallet</strong> (<code className="text-signal-amber font-mono text-[11px]">{funding.agentAddress.slice(0, 8)}...{funding.agentAddress.slice(-6)}</code>) via the AlgoKit dispenser, not just your personal connected wallet.
            </p>
          </div>
        </a>
      )}

      <div className="bg-[#0a0d0b] border border-white/[0.09] rounded-[28px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] focus-within:border-brand-emerald/40 transition-colors">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder="Ask the agent to do something..."
          rows={1}
          className="w-full bg-transparent text-white placeholder-grid-500 text-[15px] sm:text-base resize-none focus:outline-none disabled:opacity-50 px-5 pt-4.5 pb-1 leading-relaxed"
        />

        <div className="flex items-center justify-between px-3.5 pb-3.5 pt-1.5">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center space-x-1 text-[13px] text-grid-500 hover:text-grid-300 transition-colors cursor-pointer px-1.5 py-1 rounded-lg hover:bg-white/[0.04]"
          >
            <span>Advanced</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={handleDispatch}
            disabled={isStreaming || !prompt.trim()}
            aria-label="Run agent"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-emerald text-black shadow-glow-emerald hover:bg-brand-emerald/90 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4.5 h-4.5" />}
          </button>
        </div>

        {showAdvanced && (
          <div className="px-4 pb-4 pt-1 border-t border-white/[0.06] space-y-3 animate-fadeIn">
            <div className="space-y-1.5 pt-3">
              <div className="text-[11px] text-grid-500 uppercase tracking-wide">Optimize for</div>
              <div className="grid grid-cols-4 gap-1.5">
                {(['balanced', 'cost', 'speed', 'quality'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setPriority(opt)}
                    disabled={isLocked}
                    className={`py-1.5 rounded-lg text-[13px] font-medium capitalize transition-all cursor-pointer ${
                      priority === opt
                        ? 'bg-brand-emerald/15 border border-brand-emerald/40 text-brand-emerald'
                        : 'bg-white/[0.03] border border-white/[0.06] text-grid-400 hover:text-white'
                    } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center space-x-2 text-[13px] text-grid-400 cursor-pointer">
              <input
                type="checkbox"
                checked={simulateFailover}
                onChange={(e) => setSimulateFailover(e.target.checked)}
                disabled={isLocked}
                className="accent-brand-emerald"
              />
              <span>Simulate a mid-task provider failure</span>
              {isLocked && <span className="text-[10px] text-grid-500">(locked)</span>}
            </label>

            {isLocked && (
              <div className="text-[11px] text-grid-500 font-mono bg-grid-950 border border-grid-800 rounded-lg p-2">
                Model and compute are pre-selected from Marketplace. Unlock to let the agent choose automatically.
              </div>
            )}
          </div>
        )}
      </div>

      {!prompt && !selectedConfig.model && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          {EXAMPLE_PROMPTS.map((ex) => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="text-[12px] px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.07] text-grid-400 hover:text-white hover:border-white/[0.15] transition-all cursor-pointer truncate max-w-[260px]"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommandCenter;