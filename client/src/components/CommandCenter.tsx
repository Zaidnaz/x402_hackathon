import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Zap, 
  Cpu, 
  Coins, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight,
  Code2,
  FileText,
  BrainCircuit,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Settings2,
  Wallet,
  CheckCircle2,
  Layers,
  SlidersHorizontal,
  ShieldCheck
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

const SIMPLE_PRESETS = [
  {
    id: 'code',
    title: '💻 Generate Smart Contract Code',
    desc: 'Writes an optimized PyTeal contract with inner transaction verification.',
    prompt: 'Write an optimized Algorand PyTeal smart contract for an atomic x402 payment escrow with 1.5% protocol fee routing.',
    modality: 'code' as TaskModality,
    priority: 'quality' as const,
    icon: Code2
  },
  {
    id: 'finance',
    title: '📈 Financial Market Alpha',
    desc: 'Calculates continuous option arbitrage and delta-hedging bounds in real-time.',
    prompt: 'Calculate implied volatility smile arbitrage conditions for continuous European call options with live delta hedging.',
    modality: 'fast-chat' as TaskModality,
    priority: 'speed' as const,
    icon: MessageSquare
  },
  {
    id: 'audit',
    title: '🛡️ Deep Protocol Audit',
    desc: 'Analyzes consensus safety bounds and Byzantine fault tolerance.',
    prompt: 'Deduce formal safety bounds and worst-case execution latency for a multi-agent Raft consensus protocol across unstable network partitions.',
    modality: 'reasoning' as TaskModality,
    priority: 'quality' as const,
    icon: BrainCircuit
  },
  {
    id: 'summary',
    title: '📄 Multi-Document Analysis',
    desc: 'Synthesizes enterprise agreements to extract liability & compliance terms.',
    prompt: 'Cross-reference enterprise SaaS master service agreements to extract indemnification liability caps and GDPR data sovereignty triggers.',
    modality: 'batch-summary' as TaskModality,
    priority: 'cost' as const,
    icon: FileText
  }
];

export const CommandCenter: React.FC<CommandCenterProps> = ({
  onDispatchTask,
  isStreaming
}) => {
  const { isConnected, walletAddress, connectWallet, executePeraPayment } = useWallet();
  const [viewMode, setViewMode] = useState<'simple' | 'pro'>('simple');
  const [prompt, setPrompt] = useState(SIMPLE_PRESETS[0].prompt);
  const [selectedPresetId, setSelectedPresetId] = useState(SIMPLE_PRESETS[0].id);
  const [modality, setModality] = useState<TaskModality>(SIMPLE_PRESETS[0].modality);
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
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [prompt, modality, priority, maxBudgetAlgo, deadlineMs, minQualityScore]);

  const handleApplySimplePreset = (preset: typeof SIMPLE_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setPrompt(preset.prompt);
    setModality(preset.modality);
    setPriority(preset.priority);
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
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 font-mono">
      {/* Top Header & Simple/Pro Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
        <div className="text-left space-y-0.5">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-brand-emerald font-bold">Autonomous AI Agent Console</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Run Machine-to-Machine x402 Task
          </h1>
          <p className="text-xs text-grid-300 font-sans">
            Pick a task, let AgentGrid find the cheapest GPU on Algorand, and stream results in seconds.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          {/* Mode Switcher */}
          <div className="bg-black/80 p-1 rounded-xl border border-white/[0.12] flex items-center space-x-1">
            <button
              onClick={() => setViewMode('simple')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'simple'
                  ? 'bg-brand-emerald text-black shadow-glow-emerald'
                  : 'text-grid-400 hover:text-white'
              }`}
            >
              ⚡ Simple
            </button>
            <button
              onClick={() => setViewMode('pro')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'pro'
                  ? 'bg-white/[0.15] text-white border border-white/[0.2]'
                  : 'text-grid-400 hover:text-white'
              }`}
            >
              🛠️ Pro
            </button>
          </div>

          <TourGuideButton
            tourId="console-tour"
            buttonLabel="How It Works"
            steps={[
              {
                targetSelector: '[data-tour="preset-archetypes"]',
                title: "1. Select Agent Task",
                description: "Pick an AI agent workload preset or enter custom prompt requirements."
              },
              {
                targetSelector: '[data-tour="priority-selector"]',
                title: "2. Optimization Priority",
                description: "Choose your primary goal: Best Quality, Lowest Cost, or Ultra-Low Latency."
              },
              {
                targetSelector: '[data-tour="pareto-preview"]',
                title: "3. Optimal Route & Cost",
                description: "AgentGrid automatically finds the cheapest and fastest GPU node with exact micro-ALGO pricing."
              },
              {
                targetSelector: '[data-tour="dispatch-btn"]',
                title: "4. Run AI Agent",
                description: "Click to negotiate the x402 paywall, settle on Algorand TestNet, and stream live AI tokens."
              }
            ]}
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ⚡ SIMPLE MODE VIEW (Super Clean, 3 Easy Steps) */}
      {/* ========================================================================= */}
      {viewMode === 'simple' && (
        <div className="space-y-4 animate-fadeIn">
          {/* STEP 1: Pick an AI Task */}
          <div data-tour="preset-archetypes" className="space-y-2">
            <div className="text-xs text-grid-300 font-bold uppercase tracking-wide flex items-center space-x-1.5">
              <span className="w-4 h-4 rounded-full bg-brand-emerald/20 text-brand-emerald text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Select AI Agent Workload:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SIMPLE_PRESETS.map((p) => {
                const isSelected = selectedPresetId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleApplySimplePreset(p)}
                    disabled={isStreaming || isSigningPera}
                    className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                      isSelected
                        ? 'bg-brand-emerald/15 border-brand-emerald shadow-glow-emerald ring-1 ring-brand-emerald'
                        : 'bg-black/60 border-white/[0.08] hover:border-white/[0.2] active:scale-[0.99]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{p.title}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />}
                    </div>
                    <div className="text-[11px] font-sans text-grid-300 leading-snug">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Choose Strategy */}
          <div data-tour="priority-selector" className="space-y-2 pt-1">
            <div className="text-xs text-grid-300 font-bold uppercase tracking-wide flex items-center space-x-1.5">
              <span className="w-4 h-4 rounded-full bg-brand-emerald/20 text-brand-emerald text-[10px] flex items-center justify-center font-bold">2</span>
              <span>Routing Optimization Goal:</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'quality', label: '🏆 Best Quality', desc: 'NVIDIA H100 Tensor' },
                { id: 'speed', label: '⚡ Ultra Fast', desc: '<1.2s Round-Trip' },
                { id: 'cost', label: '💰 Lowest Cost', desc: 'Maximum Savings' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPriority(opt.id as any)}
                  disabled={isStreaming || isSigningPera}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    priority === opt.id
                      ? 'bg-brand-emerald/20 border-brand-emerald text-brand-emerald font-bold shadow-sm'
                      : 'bg-black/60 border-white/[0.08] text-grid-300 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-[9px] text-grid-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: Live Preview & Dispatch Card */}
          <div className="bg-black/80 border-2 border-white/[0.12] rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl backdrop-blur-xl">
            {/* Pareto Best Match Display */}
            <div data-tour="pareto-preview" className="bg-[#0b100d] p-3.5 rounded-xl border border-brand-emerald/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="space-y-0.5">
                <div className="text-[10px] text-brand-emerald font-bold uppercase tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-brand-emerald" />
                  <span>Optimal Compute Match Found</span>
                </div>
                <div className="text-sm font-bold text-white">
                  {activeCandidate?.modelName || 'Gemini 3.7 Flash Lite'}{' '}
                  <span className="text-grid-400 font-normal text-xs">on</span>{' '}
                  <span className="text-brand-emerald">{activeCandidate?.computeName || 'NVIDIA H100 SXM5'}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs bg-black/60 px-3 py-1.5 rounded-lg border border-white/[0.08] shrink-0">
                <span className="text-brand-emerald font-extrabold text-sm">
                  {activeCandidate?.estimatedCostAlgo || '0.0092'} ALGO
                </span>
                <span className="text-grid-600">•</span>
                <span className="text-white">
                  {activeCandidate?.estimatedLatencyMs || 450} ms
                </span>
              </div>
            </div>

            {/* Pera Wallet Status */}
            <div data-tour="wallet-status">
              {isConnected ? (
                <div className="p-2.5 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 text-xs text-brand-emerald flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                    <span>Signing via Connected Pera Wallet ({walletAddress?.substring(0, 6)}...{walletAddress?.substring(walletAddress.length - 4)})</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase">Ready</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/[0.08] text-xs text-grid-300 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Wallet className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                    <span>Auto-settling via Autonomous Agent Wallet</span>
                  </span>
                  <button
                    onClick={connectWallet}
                    className="text-brand-emerald hover:underline text-xs font-bold"
                  >
                    Connect Pera ➔
                  </button>
                </div>
              )}
            </div>

            {/* BIG 1-CLICK DISPATCH BUTTON */}
            <div data-tour="dispatch-btn">
              <button
                onClick={handleDispatch}
                disabled={isStreaming || isSigningPera}
                className={`w-full py-4 px-6 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-glow-emerald transition-all cursor-pointer ${
                  isStreaming || isSigningPera
                    ? 'bg-grid-800 text-grid-400 cursor-not-allowed'
                    : 'bg-brand-emerald hover:bg-brand-emerald/90 text-black active:scale-[0.99]'
                }`}
              >
                {isSigningPera ? (
                  <>
                    <Wallet className="w-5 h-5 animate-bounce text-black shrink-0" />
                    <span>Confirming on Pera Wallet...</span>
                  </>
                ) : isStreaming ? (
                  <>
                    <Zap className="w-5 h-5 animate-spin text-black shrink-0" />
                    <span>Orchestrating across AgentGrid...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-black text-black shrink-0" />
                    <span>Run AI Agent with x402 ({activeCandidate?.estimatedCostAlgo || '0.009'} ALGO)</span>
                    <ArrowRight className="w-5 h-5 text-black shrink-0" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🛠️ PRO MODE VIEW (Custom Prompt, Full Sliders, Multi-Route Choices) */}
      {/* ========================================================================= */}
      {viewMode === 'pro' && (
        <div className="bg-black/80 border border-white/[0.1] rounded-2xl p-4 sm:p-6 space-y-4 shadow-2xl backdrop-blur-md animate-fadeIn">
          {/* Custom Prompt Input */}
          <div data-tour="prompt-input" className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-grid-200 font-bold uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Custom Agent Prompt</span>
              </span>
              <span className="text-grid-400 text-[11px]">
                ~{Math.round(prompt.split(/\s+/).length * 1.35)} est. tokens
              </span>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter custom prompt requirements..."
              rows={3}
              disabled={isStreaming || isSigningPera}
              className="w-full bg-black border border-white/[0.12] rounded-xl p-3 sm:p-4 text-xs font-mono text-white placeholder-grid-500 focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald/40 transition-all resize-none leading-relaxed"
            />
          </div>

          {/* Multi-Option Pareto Alternatives */}
          {previewRouting && previewRouting.paretoFrontier && (
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center justify-between text-xs font-bold text-grid-300 uppercase">
                <span>Pareto Route Options (Click to Switch):</span>
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
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          idx === 0 ? 'bg-brand-emerald text-black' : 'bg-white/[0.1] text-grid-300'
                        }`}>
                          {idx === 0 ? '🏆 #1 Optimal' : `Option #${idx + 1}`}
                        </span>
                        <span className="text-[11px] text-brand-emerald font-bold">
                          {candidate.estimatedCostAlgo} ALGO
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white truncate">{candidate.modelName}</div>
                      <div className="text-[10px] text-grid-400 truncate">{candidate.computeName}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Collapsible SLA Sliders & Regional Failover */}
          <div className="border-t border-white/[0.08] pt-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-xs text-grid-300 hover:text-white py-1 transition-colors"
            >
              <span className="flex items-center space-x-1.5">
                <Settings2 className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Fine-Tune Budget, SLA Latency & Failover Simulation</span>
              </span>
              {showAdvanced ? <ChevronUp className="w-4 h-4 text-brand-emerald" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="mt-3 p-4 bg-black/60 rounded-xl border border-white/[0.08] space-y-3 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
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
                      className="w-full h-1.5 bg-grid-800 rounded-lg appearance-none cursor-pointer accent-brand-emerald"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
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
                      className="w-full h-1.5 bg-grid-800 rounded-lg appearance-none cursor-pointer accent-brand-emerald"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.06]">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-xs text-white flex items-center space-x-1.5">
                      <AlertTriangle className={`w-3.5 h-3.5 ${simulateFailover ? 'text-signal-rose' : 'text-grid-400'}`} />
                      <span>Simulate Regional Node Failure (Tests in-flight zero-downtime rerouting)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={simulateFailover}
                      onChange={(e) => setSimulateFailover(e.target.checked)}
                      className="w-4 h-4 accent-signal-rose cursor-pointer rounded"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Dispatch Button in Pro Mode */}
          <button
            onClick={handleDispatch}
            disabled={isStreaming || isSigningPera || !prompt.trim()}
            className={`w-full py-4 px-6 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              isStreaming || isSigningPera
                ? 'bg-grid-800 text-grid-400 cursor-not-allowed'
                : 'bg-brand-emerald hover:bg-brand-emerald/90 text-black shadow-glow-emerald active:scale-[0.99]'
            }`}
          >
            <Play className="w-4 h-4 fill-black text-black shrink-0" />
            <span>Dispatch Pro Task ({activeCandidate?.estimatedCostAlgo || '0.009'} ALGO)</span>
            <ArrowRight className="w-4 h-4 text-black shrink-0" />
          </button>
        </div>
      )}
    </div>
  );
};

export default CommandCenter;
