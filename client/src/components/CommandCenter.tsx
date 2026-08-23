import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ChevronDown, Loader2, AlertTriangle } from 'lucide-react';
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
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="text-center space-y-2 mb-3">
        <h1 className="font-serif text-[36px] leading-[42px] sm:text-[44px] sm:leading-[50px] text-grid-100 tracking-tight font-medium">
          Start with a task
        </h1>
        <p className="text-body text-grid-400 max-w-xl mx-auto">
          Describe what you want to run. AgentGrid will choose a route, show the cost, settle payment, and keep the receipt in the same place.
        </p>
      </div>

      {funding && !funding.isFunded && (
        <a
          href={funding.fundUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-2 text-body-sm text-signal-amber bg-signal-amberDim border border-signal-amber/25 rounded-card px-3.5 py-2.5"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>The agent wallet has no TestNet ALGO. Add funds before running a paid task.</span>
        </a>
      )}

      <div className="bg-grid-900 border border-grid-750 rounded-panel shadow-subtle-panel focus-within:border-brand-emerald/50 transition-colors">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          placeholder="Example: summarize these provider tradeoffs and choose the best route..."
          rows={1}
          className="w-full bg-transparent text-grid-100 placeholder-grid-500 text-body-lg resize-none focus:outline-none disabled:opacity-50 px-5 pt-4 pb-1"
        />

        <div className="flex items-center justify-between px-3.5 pb-3.5 pt-1.5">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="flex items-center space-x-1 text-body-sm text-grid-500 hover:text-grid-300 transition-colors cursor-pointer px-1.5 py-1 rounded-control hover:bg-grid-850"
          >
            <span>Advanced</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={handleDispatch}
            disabled={isStreaming || !prompt.trim()}
            aria-label="Run agent"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-emerald text-white shadow-glow-emerald hover:bg-brand-mint active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4.5 h-4.5" />}
          </button>
        </div>

        {showAdvanced && (
          <div className="px-4 pb-4 pt-1 border-t border-grid-800 space-y-3 animate-fadeIn">
            <div className="space-y-1.5 pt-3">
              <div className="text-caption text-grid-500">Optimize for</div>
              <div className="grid grid-cols-4 gap-1.5">
                {(['balanced', 'cost', 'speed', 'quality'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setPriority(opt)}
                    className={`py-1.5 rounded-control text-body-sm font-medium capitalize transition-all cursor-pointer ${
                      priority === opt
                        ? 'bg-brand-emerald/15 border border-brand-emerald/40 text-brand-emerald'
                        : 'bg-grid-850 border border-grid-750 text-grid-400 hover:text-grid-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center space-x-2 text-body-sm text-grid-400 cursor-pointer">
              <input
                type="checkbox"
                checked={simulateFailover}
                onChange={(e) => setSimulateFailover(e.target.checked)}
                className="accent-brand-emerald"
              />
              <span>Simulate a mid-task provider failure</span>
            </label>
          </div>
        )}
      </div>

      {!prompt && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          {EXAMPLE_PROMPTS.map((ex) => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="text-caption px-3 py-1.5 rounded-full bg-grid-850 border border-grid-750 text-grid-400 hover:text-grid-100 hover:border-grid-600 transition-all cursor-pointer truncate max-w-[260px]"
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

