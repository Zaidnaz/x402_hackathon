import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Zap, 
  Cpu, 
  Clock, 
  Coins, 
  Sparkles, 
  Sliders, 
  AlertTriangle, 
  ArrowRight,
  Gauge,
  Code2,
  FileText,
  BrainCircuit,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Settings2,
  Wallet,
  CheckCircle2
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { TaskRequirement, RoutingDecision, TaskModality } from '../types';
import { analyzePrompt, evaluateRoute } from '../utils/api';
import { HowThisWorksButton } from './HowThisWorksButton';

interface CommandCenterProps {
  onDispatchTask: (
    prompt: string, 
    overrides: Partial<TaskRequirement>, 
    simulateFailover: boolean,
    customPeraTx?: { txId: string; round: number; explorerUrl: string; loraUrl: string }
  ) => void;
  isStreaming: boolean;
}

const PRESET_PROMPTS = [
  {
    id: 'code',
    title: 'Fast Code Gen',
    desc: 'CUDA Kernel / Algorand SDK',
    modality: 'code' as TaskModality,
    prompt: 'Write an optimized FP16 matrix multiplication kernel for NVIDIA H100 with shared memory tiling and warp-level primitives.',
    priority: 'quality' as const,
    budget: 0.85,
    sla: 3500,
    icon: Code2
  },
  {
    id: 'reasoning',
    title: 'Deep Math & Logic',
    desc: 'Formal Proof & Safety Bounds',
    modality: 'reasoning' as TaskModality,
    prompt: 'Deduce formal safety bounds and worst-case execution latency for a multi-agent Raft consensus protocol across unstable network partitions.',
    priority: 'quality' as const,
    budget: 1.20,
    sla: 6000,
    icon: BrainCircuit
  },
  {
    id: 'batch',
    title: 'Batch Summarization',
    desc: 'Corpus & Anomaly Extraction',
    modality: 'batch-summary' as TaskModality,
    prompt: 'Synthesize 20,000 telemetry log lines into anomalous error clusters, root cause categories, and failure distribution metrics.',
    priority: 'cost' as const,
    budget: 0.30,
    sla: 10000,
    icon: FileText
  },
  {
    id: 'chat',
    title: 'Ultra-Low Latency Chat',
    desc: 'Instant Financial Derivative Pricing',
    modality: 'fast-chat' as TaskModality,
    prompt: 'Calculate implied volatility smile arbitrage conditions for continuous European call options with live delta hedging.',
    priority: 'speed' as const,
    budget: 0.20,
    sla: 1200,
    icon: MessageSquare
  }
];

export const CommandCenter: React.FC<CommandCenterProps> = ({
  onDispatchTask,
  isStreaming
}) => {
  const { isConnected, walletAddress, connectWallet, executePeraPayment } = useWallet();
  const [prompt, setPrompt] = useState(PRESET_PROMPTS[0].prompt);
  const [selectedPresetId, setSelectedPresetId] = useState(PRESET_PROMPTS[0].id);
  const [modality, setModality] = useState<TaskModality>(PRESET_PROMPTS[0].modality);
  const [priority, setPriority] = useState<'balanced' | 'cost' | 'speed' | 'quality'>('quality');
  
  // Constraints
  const [maxBudgetAlgo, setMaxBudgetAlgo] = useState(0.85);
  const [deadlineMs, setDeadlineMs] = useState(3500);
  const [minQualityScore, setMinQualityScore] = useState(85);
  const [simulateFailover, setSimulateFailover] = useState(false);

  // Progressive Disclosure: Advanced Settings Toggle
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Live preview decision
  const [previewRouting, setPreviewRouting] = useState<RoutingDecision | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSigningPera, setIsSigningPera] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      if (!prompt.trim()) return;
      setIsEvaluating(true);
      try {
        const req = await analyzePrompt(prompt, {
          modality,
          priority,
          maxBudgetAlgo,
          deadlineMs,
          minQualityScore
        });
        const route = await evaluateRoute(req);
        if (active) {
          setPreviewRouting(route);
        }
      } catch (err) {
        console.error('Preview error', err);
      } finally {
        if (active) setIsEvaluating(false);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [prompt, modality, priority, maxBudgetAlgo, deadlineMs, minQualityScore]);

  const handleApplyPreset = (preset: typeof PRESET_PROMPTS[0]) => {
    setSelectedPresetId(preset.id);
    setPrompt(preset.prompt);
    setModality(preset.modality);
    setPriority(preset.priority);
    setMaxBudgetAlgo(preset.budget);
    setDeadlineMs(preset.sla);
  };

  const handleDispatch = async () => {
    let customPeraTx: { txId: string; round: number; explorerUrl: string; loraUrl: string } | undefined = undefined;

    if (isConnected && previewRouting) {
      try {
        setIsSigningPera(true);
        const targetNodePayout = 'A3R6WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6HVQ';
        const costAlgo = previewRouting.selectedCandidate.estimatedCostAlgo || 0.05;
        
        const txResult = await executePeraPayment(
          targetNodePayout,
          costAlgo,
          `x402:task:${previewRouting.taskId}:prompt:${prompt.substring(0, 16)}`
        );
        customPeraTx = txResult;
      } catch (err: any) {
        console.warn('Pera signing skipped or cancelled, falling back to autonomous settlement:', err);
      } finally {
        setIsSigningPera(false);
      }
    }

    onDispatchTask(
      prompt,
      {
        modality,
        priority,
        maxBudgetAlgo,
        deadlineMs,
        minQualityScore
      },
      simulateFailover,
      customPeraTx
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
        <div className="text-center sm:text-left space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-emerald/10 border border-brand-emerald/25 text-xs font-mono text-brand-emerald">
            <Sparkles className="w-3 h-3" />
            <span>Autonomous AI Infrastructure Dispatcher</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono text-white">
            Agent Task Execution Console
          </h1>
          <p className="text-xs sm:text-sm text-grid-300 max-w-xl font-sans">
            Pick a workload preset or enter custom prompt. AgentGrid dynamically selects the optimal model & GPU, negotiates x402 payment, and settles on Algorand.
          </p>
        </div>

        <HowThisWorksButton
          guide={{
            pageTitle: "Agent Task Console & Autonomous Pipeline",
            badge: "Core Orchestration",
            tagline: "End-to-End Autonomous AI Compute Brokerage",
            overview: "This console simulates how an autonomous AI agent accepts user prompts with strict budgets and SLA deadlines, benchmarks open GPU/model nodes using Pareto optimization, pays on-demand using x402 on Algorand, and streams live tokens with zero-downtime failover.",
            steps: [
              {
                title: "1. Select a Workload Archetype",
                desc: "Choose from Fast Code Gen, Deep Math & Logic, Batch Summarization, or Low-Latency Chat (or type any custom prompt).",
                highlightAction: "Click any top preset"
              },
              {
                title: "2. Dispatch & Settle on Algorand",
                desc: "Click 'Dispatch Autonomous Workload'. If Pera Wallet is connected, sign on your phone; otherwise the autonomous agent settles automatically in ~2.8s.",
                highlightAction: "Green Dispatch Button"
              },
              {
                title: "3. Verify on Lora & Download Receipt",
                desc: "Watch the 6-stage HUD negotiate the GoPlausible x402 challenge, stream Gemini AI tokens, click 'Open in Lora' for on-chain block proof, and download the cryptographic receipt.",
                highlightAction: "Inspector Panel"
              }
            ],
            whatToLookFor: [
              "Stage 4: RFC 7235 x402 challenge via GoPlausible Facilitator (avm:exact).",
              "Stage 5: Live confirmed block round number and micro-ALGO fees on Algorand TestNet.",
              "1-Click 'Inspect on Lora' link directly to https://lora.algokit.io/testnet.",
              "Live Gemini 3.7 / 2.0 Flash-Lite real-time streaming output."
            ],
            evaluationTip: "Toggle 'Simulate Regional Node Failure' in advanced settings to show judges live zero-downtime dynamic failover without losing tokens!"
          }}
        />
      </div>

      {/* 1-Click Workload Archetype Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PRESET_PROMPTS.map((p) => {
          const Icon = p.icon;
          const isSelected = selectedPresetId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleApplyPreset(p)}
              disabled={isStreaming || isSigningPera}
              className={`p-4 rounded-xl border text-left transition-all relative group ${
                isSelected
                  ? 'bg-brand-emerald/10 border-brand-emerald shadow-glow-emerald'
                  : 'bg-black/60 border-white/[0.08] hover:border-white/[0.18]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-emerald' : 'text-grid-400 group-hover:text-white'}`} />
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald shadow-glow-emerald" />}
              </div>
              <div className="text-xs font-bold font-mono text-white">{p.title}</div>
              <div className="text-[10px] font-sans text-grid-400 mt-0.5">{p.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Main Task Input Card */}
      <div className="bg-black/75 border border-white/[0.09] rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl backdrop-blur-md">
        {/* Prompt Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-grid-200 font-semibold uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Task Prompt / Agent Goal</span>
            </span>
            <span className="text-grid-400 text-[11px]">
              ~{Math.round(prompt.split(/\s+/).length * 1.35)} est. tokens
            </span>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              setSelectedPresetId('');
            }}
            placeholder="Describe what you want the agent to accomplish..."
            rows={4}
            disabled={isStreaming || isSigningPera}
            className="w-full bg-grid-950 border border-white/[0.10] rounded-xl p-4 text-xs sm:text-sm font-mono text-white placeholder-grid-500 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald/40 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Priority Objective Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
          <div className="text-xs font-mono text-grid-300">Optimization Goal:</div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'quality', label: 'Max Quality' },
              { id: 'speed', label: 'Ultra-Low Latency' },
              { id: 'cost', label: 'Lowest Cost' },
              { id: 'balanced', label: 'Balanced Pareto' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setPriority(opt.id as any)}
                disabled={isStreaming || isSigningPera}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                  priority === opt.id
                    ? 'bg-brand-emerald/15 border-brand-emerald text-brand-emerald font-semibold shadow-sm'
                    : 'bg-black/50 border-white/[0.08] text-grid-300 hover:text-white hover:border-white/[0.2]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Collapsible Advanced Settings (SLA, Budget, Failover) */}
        <div className="border-t border-white/[0.08] pt-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-xs font-mono text-grid-300 hover:text-white py-1 transition-colors"
          >
            <span className="flex items-center space-x-1.5">
              <Settings2 className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Customize Budget, SLA Deadlines & Failover Resilience</span>
            </span>
            {showAdvanced ? <ChevronUp className="w-4 h-4 text-brand-emerald" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="mt-4 p-4 bg-grid-950/80 rounded-xl border border-white/[0.08] space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SLA Deadline */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-grid-300">Max SLA Latency</span>
                    <span className="text-brand-emerald font-semibold">{deadlineMs} ms</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="15000"
                    step="250"
                    value={deadlineMs}
                    onChange={(e) => setDeadlineMs(parseInt(e.target.value, 10))}
                    disabled={isStreaming || isSigningPera}
                    className="w-full h-1.5 bg-grid-800 rounded-lg appearance-none cursor-pointer accent-brand-emerald"
                  />
                </div>

                {/* Max Budget Cap */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-grid-300">Max Budget Cap</span>
                    <span className="text-brand-emerald font-semibold">{maxBudgetAlgo.toFixed(2)} ALGO</span>
                  </div>
                  <input
                    type="range"
                    min="0.10"
                    max="2.50"
                    step="0.05"
                    value={maxBudgetAlgo}
                    onChange={(e) => setMaxBudgetAlgo(parseFloat(e.target.value))}
                    disabled={isStreaming || isSigningPera}
                    className="w-full h-1.5 bg-grid-800 rounded-lg appearance-none cursor-pointer accent-brand-emerald"
                  />
                </div>
              </div>

              {/* Failover Simulation Switch */}
              <div className="pt-2 border-t border-white/[0.06]">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5">
                    <div className="text-xs font-mono text-white flex items-center space-x-1.5">
                      <AlertTriangle className={`w-3.5 h-3.5 ${simulateFailover ? 'text-signal-rose' : 'text-grid-400'}`} />
                      <span>Simulate Regional Node Failure</span>
                    </div>
                    <div className="text-[10px] text-grid-400">
                      Tests live in-flight dynamic rerouting mid-execution with zero dropped tokens
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={simulateFailover}
                    onChange={(e) => setSimulateFailover(e.target.checked)}
                    disabled={isStreaming || isSigningPera}
                    className="w-4 h-4 accent-signal-rose cursor-pointer rounded"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Live Pre-Evaluation Card */}
        {previewRouting && (
          <div className="bg-grid-950 p-3.5 rounded-xl border border-white/[0.08] text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-[10px] text-grid-400 uppercase">Optimal Pareto Pair</div>
              <div className="text-white font-semibold">
                {previewRouting.selectedCandidate.modelName} <span className="text-grid-400 font-normal">on</span> {previewRouting.selectedCandidate.computeName}
              </div>
            </div>

            <div className="flex items-center space-x-3 text-[11px]">
              <span className="text-brand-emerald font-semibold">
                {previewRouting.selectedCandidate.estimatedCostAlgo} ALGO
              </span>
              <span className="text-grid-600">•</span>
              <span className="text-white">
                {previewRouting.selectedCandidate.estimatedLatencyMs} ms
              </span>
              <span className="text-grid-600">•</span>
              <span className="text-brand-emerald">
                {previewRouting.selectedCandidate.projectedQualityScore}/100
              </span>
            </div>
          </div>
        )}

        {/* Pera Wallet Status Banner */}
        {isConnected ? (
          <div className="px-3.5 py-2.5 rounded-lg bg-brand-emerald/10 border border-brand-emerald/30 text-xs font-mono text-brand-emerald flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Settlement via Connected Pera Wallet ({walletAddress?.substring(0, 6)}...{walletAddress?.substring(walletAddress.length - 4)})</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-brand-emerald">On-Chain Signer Ready</span>
          </div>
        ) : (
          <div className="px-3.5 py-2.5 rounded-lg bg-grid-950 border border-white/[0.08] text-xs font-mono text-grid-300 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Wallet className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Sign real Algorand transactions with Pera Wallet:</span>
            </span>
            <button
              onClick={connectWallet}
              className="text-brand-emerald hover:underline text-[11px] font-semibold"
            >
              Connect Pera Wallet →
            </button>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          onClick={handleDispatch}
          disabled={isStreaming || isSigningPera || !prompt.trim()}
          className={`w-full py-4 px-6 rounded-xl font-mono font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
            isStreaming || isSigningPera
              ? 'bg-grid-800 text-grid-400 cursor-not-allowed'
              : 'bg-brand-emerald hover:bg-brand-emerald/90 text-black shadow-glow-emerald active:scale-[0.99]'
          }`}
        >
          {isSigningPera ? (
            <>
              <Wallet className="w-4 h-4 animate-bounce text-black" />
              <span>Confirming on Pera Wallet...</span>
            </>
          ) : isStreaming ? (
            <>
              <Zap className="w-4 h-4 animate-spin text-black" />
              <span>Orchestrating across AgentGrid...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-black text-black" />
              <span>Dispatch Autonomous Workload</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CommandCenter;
