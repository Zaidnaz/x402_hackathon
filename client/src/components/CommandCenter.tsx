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
import { TourGuideButton } from './TourGuideButton';

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
    id: 'cuda',
    title: 'CUDA Tensor Kernel',
    tag: 'Code & FLOPS',
    desc: 'FP16 Warp Matrix Multiplication',
    modality: 'code' as TaskModality,
    prompt: 'Write an optimized FP16 matrix multiplication kernel for NVIDIA H100 with shared memory tiling, double-buffering, and warp-level tensor core primitives.',
    priority: 'quality' as const,
    budget: 0.85,
    sla: 3500,
    icon: Code2
  },
  {
    id: 'algorand',
    title: 'Algorand Contract Audit',
    tag: 'Smart Contract',
    desc: 'PyTeal Reentrancy & Opcode Cost',
    modality: 'reasoning' as TaskModality,
    prompt: 'Audit this Algorand PyTeal smart contract for inner transaction reentrancy, re-keying vulnerabilities, minimum balance requirements, and maximum opcode budget consumption.',
    priority: 'quality' as const,
    budget: 1.20,
    sla: 6000,
    icon: BrainCircuit
  },
  {
    id: 'finance',
    title: 'High-Freq Alpha Signal',
    tag: 'Real-Time Finance',
    desc: 'Implied Volatility Arbitrage',
    modality: 'fast-chat' as TaskModality,
    prompt: 'Calculate implied volatility smile arbitrage conditions for continuous European call options with live delta hedging and Black-Scholes Greeks sensitivity bounds.',
    priority: 'speed' as const,
    budget: 0.20,
    sla: 1200,
    icon: MessageSquare
  },
  {
    id: 'genomics',
    title: 'Genomics Sequence Match',
    tag: 'Bio & Scientific',
    desc: 'CRISPR Target Cleavage Analysis',
    modality: 'batch-summary' as TaskModality,
    prompt: 'Analyze CRISPR-Cas9 off-target cleavage probabilities across a 3.2M base pair genomic FASTA sequence with PAM motif alignment and mismatch penalties.',
    priority: 'cost' as const,
    budget: 0.40,
    sla: 8000,
    icon: FileText
  },
  {
    id: 'swarm',
    title: 'Multi-Agent Consensus',
    tag: 'Agent Swarm',
    desc: 'Raft Byzantine Fault Tolerance',
    modality: 'fast-chat' as TaskModality,
    prompt: 'Synthesize a fault-tolerant state-machine quorum for 12 autonomous trading agents handling asynchronous transaction ordering over high-latency networks.',
    priority: 'speed' as const,
    budget: 0.35,
    sla: 1800,
    icon: Zap
  },
  {
    id: 'legal',
    title: 'Legal Multi-Doc Synthesis',
    tag: 'Enterprise NLP',
    desc: 'Multi-Jurisdictional Cross-Ref',
    modality: 'batch-summary' as TaskModality,
    prompt: 'Cross-reference 15 enterprise SaaS master service agreements (MSAs) to extract indemnification liability caps, GDPR data sovereignty clauses, and termination triggers.',
    priority: 'cost' as const,
    budget: 0.25,
    sla: 9000,
    icon: FileText
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

  // Live preview decision & custom candidate selection
  const [previewRouting, setPreviewRouting] = useState<RoutingDecision | null>(null);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState(0);
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
          setSelectedCandidateIndex(0);
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

  const activeCandidate = previewRouting?.paretoFrontier && previewRouting.paretoFrontier[selectedCandidateIndex]
    ? previewRouting.paretoFrontier[selectedCandidateIndex]
    : previewRouting?.selectedCandidate;

  const handleDispatch = async () => {
    let customPeraTx: { txId: string; round: number; explorerUrl: string; loraUrl: string } | undefined = undefined;

    if (isConnected && activeCandidate) {
      try {
        setIsSigningPera(true);
        const targetNodePayout = 'A3R6WQFOLES2CTKEHALIEXFNEZ75R4KYJJ4VPWMZ63X57IZ7MIRJ7Q6HVQ';
        const costAlgo = activeCandidate.estimatedCostAlgo || 0.05;
        
        const txResult = await executePeraPayment(
          targetNodePayout,
          costAlgo,
          `x402:task:${previewRouting?.taskId || 'demo'}:prompt:${prompt.substring(0, 16)}`
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
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-1">
        <div className="text-left space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-brand-emerald/10 border border-brand-emerald/25 text-[10px] sm:text-xs font-mono text-brand-emerald">
            <Sparkles className="w-3 h-3" />
            <span>Autonomous AI Infrastructure Dispatcher</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold font-mono text-white tracking-tight">
            Agent Task Execution Console
          </h1>
          <p className="text-[11px] sm:text-xs text-grid-300 max-w-xl font-sans leading-relaxed">
            Pick a workload preset or enter a custom prompt. AgentGrid dynamically benchmarks the compute fleet, settles x402 on Algorand, and streams live AI tokens.
          </p>
        </div>

        <TourGuideButton
          tourId="console-tour"
          buttonLabel="How It Works"
          steps={[
            {
              targetSelector: '[data-tour="preset-archetypes"]',
              title: "1. Workload Presets (6 Options)",
              description: "Pick an AI workload preset (CUDA kernels, Smart Contract audits, Alpha signals, Genomics, Swarms) or enter your custom goal."
            },
            {
              targetSelector: '[data-tour="prompt-input"]',
              title: "2. Prompt & Token Estimator",
              description: "AgentGrid automatically extracts intent, calculates estimated tokens, and establishes SLA constraints."
            },
            {
              targetSelector: '[data-tour="priority-selector"]',
              title: "3. Optimization Priority",
              description: "Choose your primary goal: Max Quality, Ultra-Low Latency, Lowest Cost, or Balanced Pareto Frontier."
            },
            {
              targetSelector: '[data-tour="pareto-preview"]',
              title: "4. Multi-Option Pareto Alternatives",
              description: "Compare the Top 3 Pareto-optimal Model + GPU cluster pairs and pick your preferred trade-off before dispatching!"
            },
            {
              targetSelector: '[data-tour="wallet-status"]',
              title: "5. Algorand Pera Wallet Settlement",
              description: "Connect your mobile Pera Wallet to sign real on-chain transactions on TestNet, or let the autonomous agent wallet settle seamlessly."
            },
            {
              targetSelector: '[data-tour="dispatch-btn"]',
              title: "6. Dispatch & Settle",
              description: "Click here to trigger the 6-stage autonomous pipeline, negotiate the x402 paywall, and stream live AI tokens."
            }
          ]}
        />
      </div>

      {/* 1-Click Workload Archetype Selector (6 High-Tech Cards) */}
      <div data-tour="preset-archetypes" className="space-y-1.5">
        <div className="text-[11px] sm:text-xs font-mono text-grid-400 font-semibold uppercase tracking-wider flex items-center justify-between">
          <span>Choose AI Workload Archetype ({PRESET_PROMPTS.length} Presets):</span>
          <span className="text-[10px] text-brand-emerald">1-Click Auto-Fill</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {PRESET_PROMPTS.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPresetId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => handleApplyPreset(p)}
                disabled={isStreaming || isSigningPera}
                className={`p-3 rounded-xl border text-left transition-all relative group cursor-pointer ${
                  isSelected
                    ? 'bg-brand-emerald/15 border-brand-emerald shadow-glow-emerald scale-[1.01]'
                    : 'bg-black/60 border-white/[0.08] hover:border-white/[0.2] active:scale-[0.98]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="px-1.5 py-0.2 rounded text-[8px] sm:text-[9px] font-mono uppercase bg-white/[0.06] text-grid-300">
                    {p.tag}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-emerald' : 'text-grid-400 group-hover:text-white'}`} />
                </div>
                <div className="text-[11px] sm:text-xs font-bold font-mono text-white truncate">{p.title}</div>
                <div className="text-[9px] sm:text-[10px] font-sans text-grid-400 mt-0.5 line-clamp-1 leading-tight">{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Task Input Card */}
      <div className="bg-black/80 border border-white/[0.1] rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl backdrop-blur-md">
        {/* Prompt Input */}
        <div data-tour="prompt-input" className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-grid-200 font-semibold uppercase tracking-wider flex items-center space-x-1.5 text-[11px] sm:text-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Task Prompt / Agent Goal</span>
            </span>
            <span className="text-grid-400 text-[10px] sm:text-[11px]">
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
            rows={3}
            disabled={isStreaming || isSigningPera}
            className="w-full bg-black border border-white/[0.12] rounded-xl p-3 sm:p-4 text-xs sm:text-sm font-mono text-white placeholder-grid-500 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald/40 transition-all resize-none leading-relaxed"
          />
        </div>

        {/* Priority Objective Pills */}
        <div data-tour="priority-selector" className="space-y-2 pt-2 border-t border-white/[0.08]">
          <div className="text-[11px] sm:text-xs font-mono text-grid-300">Optimization Goal:</div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
            {[
              { id: 'quality', label: 'Max Quality (H100)', desc: 'FP16 Precision' },
              { id: 'speed', label: 'Ultra Latency (<1.5s)', desc: 'Fastest Ping' },
              { id: 'cost', label: 'Lowest Cost (Spot)', desc: 'Max Savings' },
              { id: 'balanced', label: 'Balanced Pareto', desc: 'Non-Dominated' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setPriority(opt.id as any)}
                disabled={isStreaming || isSigningPera}
                className={`py-2 px-2.5 sm:px-3 sm:py-1.5 rounded-lg border text-[11px] sm:text-xs font-mono text-center transition-all ${
                  priority === opt.id
                    ? 'bg-brand-emerald/20 border-brand-emerald text-brand-emerald font-bold shadow-sm'
                    : 'bg-black/60 border-white/[0.08] text-grid-300 hover:text-white hover:border-white/[0.2]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Option Pareto Alternatives Selector */}
        {previewRouting && previewRouting.paretoFrontier && (
          <div data-tour="pareto-preview" className="space-y-2 pt-2 border-t border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px] sm:text-xs font-mono">
              <span className="text-grid-300 font-semibold uppercase tracking-wide flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Pareto Frontier Compute Routes (Top Options):</span>
              </span>
              <span className="text-[10px] text-grid-400">Click to Switch Route</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {previewRouting.paretoFrontier.slice(0, 3).map((candidate, idx) => {
                const isCandidateSelected = selectedCandidateIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedCandidateIndex(idx)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isCandidateSelected
                        ? 'bg-brand-emerald/15 border-brand-emerald shadow-glow-emerald'
                        : 'bg-black/70 border-white/[0.08] hover:border-white/[0.2]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono ${
                        idx === 0 ? 'bg-brand-emerald text-black' : 'bg-white/[0.1] text-grid-300'
                      }`}>
                        {idx === 0 ? '🏆 #1 Optimal' : `Option #${idx + 1}`}
                      </span>
                      <span className="text-[10px] text-brand-emerald font-bold font-mono">
                        {candidate.estimatedCostAlgo} ALGO
                      </span>
                    </div>
                    <div className="text-xs font-bold font-mono text-white truncate">
                      {candidate.modelName}
                    </div>
                    <div className="text-[10px] font-mono text-grid-400 truncate">
                      {candidate.computeName} ({candidate.gpuType})
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-grid-400 mt-1.5 pt-1.5 border-t border-white/[0.06]">
                      <span>{candidate.estimatedLatencyMs}ms</span>
                      <span className="text-signal-cyan font-semibold">{candidate.projectedQualityScore}/100</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Collapsible Advanced Settings (SLA, Budget, Failover) */}
        <div className="border-t border-white/[0.08] pt-2 sm:pt-3">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-[11px] sm:text-xs font-mono text-grid-300 hover:text-white py-1 transition-colors"
          >
            <span className="flex items-center space-x-1.5">
              <Settings2 className="w-3.5 h-3.5 text-brand-emerald" />
              <span>Budget, SLA Deadlines & Regional Failover</span>
            </span>
            {showAdvanced ? <ChevronUp className="w-4 h-4 text-brand-emerald" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-3.5 sm:p-4 bg-black/60 rounded-xl border border-white/[0.08] space-y-3.5 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* SLA Deadline */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] sm:text-xs font-mono">
                    <span className="text-grid-300">Max SLA Latency</span>
                    <span className="text-brand-emerald font-bold">{deadlineMs} ms</span>
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
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] sm:text-xs font-mono">
                    <span className="text-grid-300">Max Budget Cap</span>
                    <span className="text-brand-emerald font-bold">{maxBudgetAlgo.toFixed(2)} ALGO</span>
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
                  <div className="space-y-0.5 pr-2">
                    <div className="text-[11px] sm:text-xs font-mono text-white flex items-center space-x-1.5">
                      <AlertTriangle className={`w-3.5 h-3.5 ${simulateFailover ? 'text-signal-rose' : 'text-grid-400'}`} />
                      <span>Simulate Regional Node Failure</span>
                    </div>
                    <div className="text-[9px] sm:text-[10px] text-grid-400">
                      Tests live in-flight dynamic rerouting mid-execution with zero dropped tokens
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={simulateFailover}
                    onChange={(e) => setSimulateFailover(e.target.checked)}
                    disabled={isStreaming || isSigningPera}
                    className="w-4 h-4 accent-signal-rose cursor-pointer rounded shrink-0"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Pera Wallet Status Banner */}
        <div data-tour="wallet-status">
          {isConnected ? (
            <div className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-[11px] sm:text-xs font-mono text-brand-emerald flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
              <span className="flex items-center space-x-1.5 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                <span className="truncate">Settling via Pera ({walletAddress?.substring(0, 6)}...{walletAddress?.substring(walletAddress.length - 4)})</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-brand-emerald shrink-0">On-Chain Signer Ready</span>
            </div>
          ) : (
            <div className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl bg-black/60 border border-white/[0.08] text-[11px] sm:text-xs font-mono text-grid-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
              <span className="flex items-center space-x-1.5">
                <Wallet className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                <span>Pera Wallet Signer (Algorand TestNet):</span>
              </span>
              <button
                onClick={connectWallet}
                className="text-brand-emerald hover:underline text-xs font-bold text-left sm:text-right"
              >
                Connect Pera Wallet →
              </button>
            </div>
          )}
        </div>

        {/* Primary Action Button */}
        <div data-tour="dispatch-btn">
          <button
            onClick={handleDispatch}
            disabled={isStreaming || isSigningPera || !prompt.trim()}
            className={`w-full py-3.5 sm:py-4 px-4 sm:px-6 rounded-xl font-mono font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              isStreaming || isSigningPera
                ? 'bg-grid-800 text-grid-400 cursor-not-allowed'
                : 'bg-brand-emerald hover:bg-brand-emerald/90 text-black shadow-glow-emerald active:scale-[0.99]'
            }`}
          >
            {isSigningPera ? (
              <>
                <Wallet className="w-4 h-4 animate-bounce text-black shrink-0" />
                <span>Confirming on Pera Wallet...</span>
              </>
            ) : isStreaming ? (
              <>
                <Zap className="w-4 h-4 animate-spin text-black shrink-0" />
                <span>Orchestrating across AgentGrid...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black text-black shrink-0" />
                <span>Dispatch Autonomous Workload ({activeCandidate?.estimatedCostAlgo || '0.009'} ALGO)</span>
                <ArrowRight className="w-4 h-4 text-black shrink-0" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommandCenter;
