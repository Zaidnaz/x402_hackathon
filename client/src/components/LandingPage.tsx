import React from 'react';
import { 
  ArrowRight, 
  Cpu, 
  Coins, 
  ArrowRightLeft, 
  Terminal
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onNavigateTab: (tab: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onNavigateTab }) => {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-4xl mx-auto text-center space-y-10 py-12 px-4">
      {/* Status Pill */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-200 uppercase">Team LENA</span>
          <span className="text-zinc-600">•</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Algorand TestNet</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-200">x402 Protocol</span>
        </div>
      </div>

      {/* Hero Title */}
      <div className="space-y-3">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-mono font-bold tracking-tight text-white">
          AGENTGRID
        </h1>

        <p className="text-xs sm:text-sm font-mono text-zinc-400 tracking-wider uppercase">
          Autonomous AI Infrastructure Marketplace
        </p>
      </div>

      {/* Subtitle */}
      <div className="max-w-2xl mx-auto">
        <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
          AI agents dynamically select the optimal model & GPU, negotiate <strong className="text-zinc-200 font-mono font-normal">x402 micropayments</strong>, and settle on <strong className="text-zinc-200 font-mono font-normal">Algorand</strong> in real time.
        </p>
      </div>

      {/* Action Button */}
      <div className="space-y-4 pt-2">
        <button
          onClick={onEnterApp}
          className="px-6 py-3 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 font-mono font-semibold text-sm inline-flex items-center space-x-2 transition-all cursor-pointer"
        >
          <Terminal className="w-4 h-4 text-zinc-900" />
          <span>Launch Agent Workspace</span>
          <ArrowRight className="w-4 h-4 text-zinc-900" />
        </button>

        <div className="flex items-center justify-center space-x-6 text-xs font-mono text-zinc-500">
          <button
            onClick={() => onNavigateTab('grid')}
            className="hover:text-zinc-300 transition-colors cursor-pointer"
          >
            Browse GPU Grid →
          </button>
          <span className="text-zinc-700">•</span>
          <button
            onClick={() => onNavigateTab('x402-demo')}
            className="hover:text-zinc-300 transition-colors cursor-pointer"
          >
            Test x402 Paywall →
          </button>
        </div>
      </div>

      {/* 3 Simple Value Props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-6 text-left font-mono text-xs">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-1.5">
          <div className="text-zinc-200 font-semibold flex items-center space-x-2 text-xs">
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <span>Pareto Routing</span>
          </div>
          <p className="text-zinc-400 font-sans text-xs leading-relaxed">
            Optimizes cost, speed, and quality for every prompt across models and GPUs.
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-1.5">
          <div className="text-zinc-200 font-semibold flex items-center space-x-2 text-xs">
            <Coins className="w-3.5 h-3.5 text-zinc-400" />
            <span>x402 Micropayments</span>
          </div>
          <p className="text-zinc-400 font-sans text-xs leading-relaxed">
            Machine-to-machine HTTP 402 paywalls settled in &lt;2.8s on Algorand TestNet.
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-1.5">
          <div className="text-zinc-200 font-semibold flex items-center space-x-2 text-xs">
            <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-400" />
            <span>Automatic Failover</span>
          </div>
          <p className="text-zinc-400 font-sans text-xs leading-relaxed">
            Auto-reroutes in-flight if a GPU node throttles with zero dropped tokens.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
