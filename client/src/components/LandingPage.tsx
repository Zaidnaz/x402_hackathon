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
      {/* Full-Screen WebGL PixelSnow Background with Black Pixels */}
      <div className="fixed inset-0 w-screen h-screen pointer-events-none z-0 overflow-hidden opacity-25">
        <PixelSnow 
          color="#18181b"
          flakeSize={0.035}
          minFlakeSize={1.8}
          pixelResolution={180}
          speed={1.0}
          density={0.28}
          direction={125}
          brightness={1.0}
          depthFade={8}
          farPlane={20}
          gamma={0.4545}
          variant="square"
        />
      </div>

      <div className="relative z-10 min-h-[80vh] flex flex-col justify-center max-w-4xl mx-auto text-center space-y-10 py-16 px-4">
      {/* Status Pill */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-mono text-zinc-600">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 text-zinc-900 uppercase">Team LENA</span>
          <span className="text-zinc-400">•</span>
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span className="text-zinc-700">Algorand TestNet</span>
          <span className="text-zinc-400">•</span>
          <span className="text-zinc-700 font-mono">x402 Protocol</span>
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

        <div className="text-xs sm:text-sm font-mono text-emerald-600 tracking-widest font-semibold uppercase">
          Autonomous AI Infrastructure Marketplace
        </div>
      </div>

      {/* Subtitle */}
      <div className="max-w-2xl mx-auto space-y-3">
        <p className="text-sm sm:text-base text-zinc-600 font-sans leading-relaxed">
          AI agents shouldn&apos;t be locked into static API keys. AgentGrid dynamically selects the optimal model & GPU, negotiates <strong className="text-zinc-900 font-mono font-medium">x402 micropayments</strong>, and settles on <strong className="text-zinc-900 font-mono font-medium">Algorand</strong> in real time.
        </p>
      </div>

      {/* Enter App CTA */}
      <div className="space-y-4 pt-2">
        <button
          onClick={onEnterApp}
          className="px-8 py-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 text-white font-mono font-bold text-sm sm:text-base uppercase tracking-wider inline-flex items-center space-x-3 transition-colors cursor-pointer active:scale-95 shadow-sm"
        >
          <Terminal className="w-5 h-5" />
          <span>Launch Agent Console</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center space-x-6 text-xs font-mono text-zinc-500">
          <button
            onClick={() => onNavigateTab('grid')}
            className="hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Browse Marketplace</span>
            <span className="text-zinc-400">→</span>
          </button>
          <span className="text-zinc-300">•</span>
          <button
            onClick={() => onNavigateTab('x402-demo')}
            className="hover:text-zinc-900 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Test x402 Paywall</span>
            <span className="text-zinc-400">→</span>
          </button>
        </div>
      </div>

      {/* 3 Simple Value Props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left font-mono text-xs">
        <div className="card-light p-5 space-y-2 hover:shadow-panel transition-shadow">
          <div className="text-emerald-600 font-bold flex items-center space-x-2 text-sm">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Smart Pareto Routing</span>
          </div>
          <p className="text-zinc-600 font-sans text-xs leading-relaxed">
            Optimizes Cost vs Speed vs Quality for every single prompt across Models & GPUs.
          </p>
        </div>

        <div className="card-light p-5 space-y-2 hover:shadow-panel transition-shadow">
          <div className="text-zinc-950 font-bold flex items-center space-x-2 text-sm">
            <CoinsIcon className="w-4 h-4 text-emerald-600" />
            <span>x402 on Algorand</span>
          </div>
          <p className="text-zinc-600 font-sans text-xs leading-relaxed">
            Machine-to-machine HTTP 402 paywalls settled in {'<2.8s'} on Algorand TestNet.
          </p>
        </div>

        <div className="card-light p-5 space-y-2 hover:shadow-panel transition-shadow">
          <div className="text-emerald-600 font-bold flex items-center space-x-2 text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero-Downtime Failover</span>
          </div>
          <p className="text-zinc-600 font-sans text-xs leading-relaxed">
            Auto-reroutes in-flight if a GPU node drops or throttles with 0 dropped tokens.
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default LandingPage;