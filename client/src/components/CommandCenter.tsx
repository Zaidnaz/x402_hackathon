import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ChevronDown, Loader2, AlertTriangle, Settings } from 'lucide-react';
import { TaskRequirement } from '../types';
import { fetchFundingStatus } from '../utils/api';

interface CommandCenterProps {
  onDispatchTask: (
    prompt: string,
    overrides: Partial<TaskRequirement>,
    simulateFailover: boolean
  ) => void;
  isStreaming: boolean;
}

const EXAMPLE_PROMPTS = [
  'Draft a simple Algorand escrow contract',
  'Compare three model routes for a summarization task',
  'Estimate the latency risk for a distributed workload'
];

export const CommandCenter: React.FC<CommandCenterProps> = ({
  onDispatchTask,
  isStreaming
}) => {
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
    onDispatchTask(prompt.trim(), { priority }, simulateFailover);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleDispatch();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center space-y-3 mb-2">
        <h1 className="font-serif text-[36px] leading-[42px] sm:text-[42px] sm:leading-[48px] text-grid-100 tracking-tight font-medium">
          Start with a task
        </h1>
        <p className="text-body text-grid-500 max-w-xl mx-auto leading-relaxed">
          Describe what you want to build or run. The router evaluates active nodes on the grid, optimizes for constraints, and handles payouts autonomously.
        </p>
      </div>

      {funding && !funding.isFunded && (
        <a
          href={funding.fundUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-2 text-body-sm text-signal-amber bg-signal-amberDim border border-signal-amber/25 rounded-card px-4 py-3 shadow-xs hover:bg-signal-amber/10 transition-colors"
        >
          <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
          <span>The autonomous agent wallet has no TestNet ALGO. Add faucet funds before running a paid task.</span>
        </a>
      )}

      {/* Input container styled like Claude's input capsule */}
      <div className="bg-white border border-grid-800 rounded-panel shadow-md focus-within:border-brand-emerald focus-within:ring-1 focus-within:ring-brand-emerald transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder="Example: summarize these provider tradeoffs and choose the best route..."
          rows={1}
          className="w-full bg-transparent text-grid-100 placeholder-grid-600 text-body-lg resize-none focus:outline-none disabled:opacity-50 px-6 pt-5 pb-2 min-h-[56px] leading-relaxed"
        />

        <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-grid-950/40">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center space-x-1.5 text-body-sm text-grid-500 hover:text-grid-100 hover:bg-grid-950 px-3 py-1.5 rounded-control transition-all cursor-pointer border border-transparent hover:border-grid-850"
          >
            <Settings className="w-4 h-4" />
            <span>Options</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={handleDispatch}
            disabled={isStreaming || !prompt.trim()}
            aria-label="Run task"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-emerald text-white shadow-glow-emerald hover:bg-brand-mint active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-5 h-5" />}
          </button>
        </div>

        {showAdvanced && (
          <div className="px-6 pb-6 pt-4 border-t border-grid-850 space-y-4 animate-fadeIn">
            <div className="space-y-2">
              <div className="text-caption font-semibold uppercase tracking-wider text-grid-500">
                Optimize Routing weights for
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['balanced', 'cost', 'speed', 'quality'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setPriority(opt)}
                    className={`py-2 rounded-control text-body-sm font-semibold capitalize border transition-all cursor-pointer ${
                      priority === opt
                        ? 'bg-brand-emeraldDim text-brand-emerald border-brand-emerald/30 font-bold'
                        : 'bg-white border-grid-800 text-grid-400 hover:border-grid-700 hover:text-grid-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <label className="inline-flex items-center space-x-2.5 text-body-sm text-grid-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateFailover}
                  onChange={(e) => setSimulateFailover(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-grid-800 text-brand-emerald focus:ring-brand-emerald accent-brand-emerald"
                />
                <span className="font-medium text-grid-300">Simulate a mid-task provider failure (zero-downtime routing demo)</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {!prompt && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 animate-fadeIn">
          {EXAMPLE_PROMPTS.map((ex) => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="text-caption px-4 py-2 rounded-full bg-white border border-grid-800 text-grid-500 hover:text-grid-100 hover:border-grid-700 hover:bg-grid-950/40 transition-all cursor-pointer shadow-xs truncate max-w-[280px]"
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
