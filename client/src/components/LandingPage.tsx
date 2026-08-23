import React from 'react';
import { 
  ArrowRight, 
  Cpu, 
  Coins, 
  ArrowRightLeft, 
  Terminal,
  ShieldCheck,
  Zap,
  Coins as CoinsIcon
} from 'lucide-react';
import Shuffle from './Shuffle';
import PixelSnow from './PixelSnow';

interface LandingPageProps {
  onEnterApp: () => void;
  onNavigateTab: (tab: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onNavigateTab }) => {
  return (
    <>
      {/* 100% Transparent PixelSnow with Floating Black Pixels */}
      <PixelSnow 
        color="#18181b"
        density={0.4}
        speed={0.9}
      />

      <div className="relative z-10 min-h-[80vh] flex flex-col justify-center max-w-4xl mx-auto text-center space-y-10 py-16 px-4">
        {/* Status Pill */}
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-zinc-200 text-xs font-mono text-zinc-700 shadow-sm">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-white uppercase">Team LENA</span>
            <span className="text-zinc-300">•</span>
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span className="text-zinc-800 font-medium">Algorand TestNet</span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-800 font-mono font-medium">x402 Protocol</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="space-y-3">
          <div className="text-5xl sm:text-7xl md:text-8xl font-mono font-extrabold tracking-tight text-zinc-950">
            <Shuffle
              text="AGENTGRID"
              duration={0.5}
              stagger={0.04}
              triggerOnHover={true}
              className="text-zinc-950"
            />
          </div>

          <div className="text-xs sm:text-sm font-mono text-emerald-700 tracking-widest font-bold uppercase">
            Autonomous AI Infrastructure Marketplace
          </div>
        </div>

        {/* Subtitle */}
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-sm sm:text-base text-zinc-600 font-sans leading-relaxed">
            AI agents shouldn&apos;t be locked into static API keys. AgentGrid dynamically selects the optimal model & GPU, negotiates <strong className="text-zinc-950 font-mono font-semibold">x402 micropayments</strong>, and settles on <strong className="text-zinc-950 font-mono font-semibold">Algorand</strong> in real time.
          </p>
        </div>

        {/* Enter App CTA */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-mono font-bold text-sm sm:text-base uppercase tracking-wider inline-flex items-center justify-center space-x-3 transition-colors cursor-pointer active:scale-95 shadow-sm"
            >
              <Terminal className="w-5 h-5 text-emerald-400" />
              <span>Start a task</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('grid')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-900 font-mono font-semibold text-sm sm:text-base inline-flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-sm"
            >
              <Cpu className="w-4 h-4 text-zinc-500" />
              <span>Browse providers</span>
            </button>
          </div>

          <div className="flex items-center justify-center space-x-6 text-xs font-mono text-zinc-500">
            <button
              onClick={() => onNavigateTab('routing')}
              className="hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Inspect Pareto Matrix</span>
              <span className="text-zinc-400">→</span>
            </button>
            <span className="text-zinc-300">•</span>
            <button
              onClick={() => onNavigateTab('x402-demo')}
              className="hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Test x402 Paywall</span>
              <span className="text-zinc-400">→</span>
            </button>
          </div>
        </div>

        {/* 4-Step Operational Flow */}
        <div className="card-light p-4 text-left border-zinc-200 bg-white">
          <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-3">
            Autonomous Task Execution Pipeline
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-zinc-950 font-bold">
                <span className="text-emerald-600 font-mono">01.</span>
                <span>Understand</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-sans leading-tight">
                Parses intent, token requirements, and SLA bounds.
              </p>
            </div>

            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-zinc-950 font-bold">
                <span className="text-emerald-600 font-mono">02.</span>
                <span>Smart Route</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-sans leading-tight">
                Pareto optimizer selects optimal Model & GPU cluster.
              </p>
            </div>

            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-zinc-950 font-bold">
                <span className="text-emerald-600 font-mono">03.</span>
                <span>Settle x402</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-sans leading-tight">
                Locks micro-escrow & pays on Algorand TestNet in {'<2.8s'}.
              </p>
            </div>

            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/80 space-y-1">
              <div className="flex items-center space-x-1.5 text-zinc-950 font-bold">
                <span className="text-emerald-600 font-mono">04.</span>
                <span>Stream & Verify</span>
              </div>
              <p className="text-[11px] text-zinc-600 font-sans leading-tight">
                Streams output with zero-drop failover and verifiable receipts.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Capability Signals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left font-mono text-xs">
          <div className="card-light p-4 space-y-1.5 hover:border-zinc-300 transition-colors">
            <div className="text-emerald-700 font-bold flex items-center space-x-2 text-xs">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Inspectable Routing</span>
            </div>
            <p className="text-zinc-600 font-sans text-xs leading-relaxed">
              Live multi-objective Pareto optimization across 25+ model & GPU node combinations.
            </p>
          </div>

          <div className="card-light p-4 space-y-1.5 hover:border-zinc-300 transition-colors">
            <div className="text-zinc-950 font-bold flex items-center space-x-2 text-xs">
              <CoinsIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>On-Chain Receipts</span>
            </div>
            <p className="text-zinc-600 font-sans text-xs leading-relaxed">
              Every inference request settles with a cryptographic receipt on Algorand TestNet.
            </p>
          </div>

          <div className="card-light p-4 space-y-1.5 hover:border-zinc-300 transition-colors">
            <div className="text-emerald-700 font-bold flex items-center space-x-2 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Failure-Aware Failover</span>
            </div>
            <p className="text-zinc-600 font-sans text-xs leading-relaxed">
              Autonomous in-flight rerouting ensures zero dropped tokens if a compute node degrades.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;