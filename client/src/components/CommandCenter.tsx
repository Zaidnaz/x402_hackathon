import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, ChevronDown, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { TaskRequirement, SpendingPolicy } from '../types';
import { fetchFundingStatus, fetchPolicy, updatePolicy } from '../utils/api';

interface CommandCenterProps {
  onDispatchTask: (
    prompt: string,
    overrides: Partial<TaskRequirement>,
    simulateFailover: boolean
  ) => void;
  isStreaming: boolean;
}

const EXAMPLE_PROMPTS = [
  'Write an optimized Algorand PyTeal contract for an atomic x402 escrow',
  'Summarize the tradeoffs between Pareto-optimal routing and greedy cost minimization',
  'Deduce worst-case latency bounds for a Raft cluster under network partition'
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
  const [policy, setPolicy] = useState<SpendingPolicy | null>(null);
  const [todaySpendAlgo, setTodaySpendAlgo] = useState(0);
  const [policyDraft, setPolicyDraft] = useState<{ dailyBudgetAlgo: string; autoApproveThresholdAlgo: string } | null>(null);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchFundingStatus().then(setFunding).catch(() => setFunding(null));
    fetchPolicy().then((res) => {
      if (!res) return;
      setPolicy(res.policy);
      setTodaySpendAlgo(res.todaySpendAlgo);
      setPolicyDraft({
        dailyBudgetAlgo: String(res.policy.dailyBudgetAlgo),
        autoApproveThresholdAlgo: String(res.policy.autoApproveThresholdAlgo)
      });
    });
  }, []);

  const handleSavePolicy = async () => {
    if (!policyDraft) return;
    const dailyBudgetAlgo = parseFloat(policyDraft.dailyBudgetAlgo);
    const autoApproveThresholdAlgo = parseFloat(policyDraft.autoApproveThresholdAlgo);
    if (!(dailyBudgetAlgo > 0) || !(autoApproveThresholdAlgo >= 0)) return;

    setSavingPolicy(true);
    const updated = await updatePolicy({ dailyBudgetAlgo, autoApproveThresholdAlgo });
    if (updated) setPolicy(updated);
    setSavingPolicy(false);
  };

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
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="text-center space-y-2 mb-1">
        <h1 className="font-serif text-[2rem] sm:text-[2.5rem] leading-tight font-medium text-white tracking-tight">
          What do you need done?
        </h1>
        <p className="text-sm text-grid-400 max-w-md mx-auto leading-relaxed">
          Describe the task. The agent picks the model, pays for the compute on Algorand, and runs it — you'll watch every decision it makes, live.
        </p>
      </div>

      {funding && !funding.isFunded && (
        <a
          href={funding.fundUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center space-x-2 text-[13px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/25 rounded-xl px-3.5 py-2.5"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Agent wallet has no TestNet ALGO — tasks will fail to settle. Tap to fund it.</span>
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
                    className={`py-1.5 rounded-lg text-[13px] font-medium capitalize transition-all cursor-pointer ${
                      priority === opt
                        ? 'bg-brand-emerald/15 border border-brand-emerald/40 text-brand-emerald'
                        : 'bg-white/[0.03] border border-white/[0.06] text-grid-400 hover:text-white'
                    }`}
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
                className="accent-brand-emerald"
              />
              <span>Simulate a mid-task provider failure</span>
            </label>

            {policyDraft && (
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-[11px] text-grid-500 uppercase tracking-wide">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Spending governance</span>
                  </div>
                  {policy && (
                    <span className="text-[11px] text-grid-500 font-mono">
                      Today: {todaySpendAlgo.toFixed(3)} / {policy.dailyBudgetAlgo} ALGO
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="space-y-1">
                    <span className="text-[11px] text-grid-500">Daily budget cap (ALGO)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={policyDraft.dailyBudgetAlgo}
                      onChange={(e) => setPolicyDraft((d) => (d ? { ...d, dailyBudgetAlgo: e.target.value } : d))}
                      className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[13px] text-white focus:outline-none focus:border-brand-emerald/40"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[11px] text-grid-500">Auto-approve under (ALGO)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      value={policyDraft.autoApproveThresholdAlgo}
                      onChange={(e) => setPolicyDraft((d) => (d ? { ...d, autoApproveThresholdAlgo: e.target.value } : d))}
                      className="w-full bg-black/50 border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[13px] text-white focus:outline-none focus:border-brand-emerald/40"
                    />
                  </label>
                </div>
                <p className="text-[11px] text-grid-500 leading-relaxed">
                  Tasks above the auto-approve threshold pause for your sign-off before paying. Any task that would push today's spend past the daily cap is rejected outright.
                </p>
                <button
                  onClick={handleSavePolicy}
                  disabled={savingPolicy}
                  className="text-[12px] px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-grid-300 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                >
                  {savingPolicy ? 'Saving...' : 'Save policy'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {!prompt && (
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
