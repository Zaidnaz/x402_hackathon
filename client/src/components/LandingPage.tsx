import React from 'react';
import { 
  ArrowRight, 
  Cpu, 
  Coins, 
  ArrowRightLeft, 
  Terminal
} from 'lucide-react';
import Shuffle from './Shuffle';

interface LandingPageProps {
  onEnterApp: () => void;
  onNavigateTab: (tab: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onNavigateTab }) => {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-4xl mx-auto text-center space-y-10 py-12 px-4">
      {/* Status Pill */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-grid-900 border border-grid-800 text-xs font-mono text-grid-300">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-grid-800 text-grid-200 uppercase">Team LENA</span>
          <span className="text-grid-600">•</span>
          <span className="w-2 h-2 rounded-full bg-brand-emerald" />
          <span>Algorand TestNet</span>
          <span className="text-grid-600">•</span>
          <span className="text-grid-200">x402 Protocol Standard</span>
        </div>
      </div>

      {/* Hero Title */}
      <div className="space-y-3">
        <div className="text-5xl sm:text-7xl md:text-8xl font-mono font-extrabold tracking-tight text-white">
          <Shuffle
            text="AGENTGRID"
            duration={0.5}
            stagger={0.04}
            triggerOnHover={true}
            className="text-white"
          />
        </div>

        <div className="text-xs sm:text-sm font-mono text-brand-emerald tracking-widest font-semibold uppercase">
          Autonomous AI Infrastructure Marketplace
        </div>
      </div>

      {/* Subtitle */}
      <div className="max-w-2xl mx-auto space-y-3">
        <p className="text-sm sm:text-base text-grid-400 font-sans leading-relaxed">
          AI agents shouldn&apos;t be locked into static API keys. AgentGrid dynamically selects the optimal model & GPU, negotiates <strong className="text-grid-200 font-mono font-medium">x402 micropayments</strong>, and settles on <strong className="text-grid-200 font-mono font-medium">Algorand</strong> in real time.
        </p>
      </div>

      {/* Enter App CTA */}
      <div className="space-y-4 pt-2">
        <button
          onClick={onEnterApp}
          className="px-7 py-3.5 rounded-xl bg-brand-emerald hover:bg-brand-emerald/90 text-black font-mono font-bold text-sm sm:text-base uppercase tracking-wider inline-flex items-center space-x-2.5 transition-all cursor-pointer active:scale-95"
        >
          <Terminal className="w-4.5 h-4.5 text-black" />
          <span>Launch Agent Console</span>
          <ArrowRight className="w-4.5 h-4.5 text-black" />
        </button>

        <div className="flex items-center justify-center space-x-6 text-xs font-mono text-grid-400">
          <button
            onClick={() => onNavigateTab('grid')}
            className="hover:text-grid-200 transition-colors cursor-pointer"
          >
            Browse GPU Grid →
          </button>
          <span className="text-grid-700">•</span>
          <button
            onClick={() => onNavigateTab('x402-demo')}
            className="hover:text-grid-200 transition-colors cursor-pointer"
          >
            Test x402 Paywall →
          </button>
        </div>
      </div>

      {/* 3 Simple Value Props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left font-mono text-xs">
        <div className="bg-grid-900 border border-grid-800 rounded-xl p-4.5 space-y-2">
          <div className="text-brand-emerald font-bold flex items-center space-x-2 text-sm">
            <Cpu className="w-4 h-4 text-brand-emerald" />
            <span>Smart Pareto Routing</span>
          </div>
          <p className="text-grid-400 font-sans text-xs leading-relaxed">
            Optimizes Cost vs Speed vs Quality for every single prompt across Models & GPUs.
          </p>
        </div>

        <div className="bg-grid-900 border border-grid-800 rounded-xl p-4.5 space-y-2">
          <div className="text-white font-bold flex items-center space-x-2 text-sm">
            <Coins className="w-4 h-4 text-brand-emerald" />
            <span>x402 on Algorand</span>
          </div>
          <p className="text-grid-400 font-sans text-xs leading-relaxed">
            Machine-to-machine HTTP 402 paywalls settled in &lt;2.8s on Algorand TestNet.
          </p>
        </div>

        <div className="bg-grid-900 border border-grid-800 rounded-xl p-4.5 space-y-2">
          <div className="text-brand-emerald font-bold flex items-center space-x-2 text-sm">
            <ArrowRightLeft className="w-4 h-4 text-brand-emerald" />
            <span>Zero-Downtime Failover</span>
          </div>
          <p className="text-grid-400 font-sans text-xs leading-relaxed">
            Auto-reroutes in-flight if a GPU node drops or throttles with 0 dropped tokens.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
