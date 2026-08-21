import React from 'react';
import { 
  ArrowRight, 
  Cpu, 
  Coins, 
  ArrowRightLeft, 
  Terminal, 
  Sparkles,
  Layers,
  ChevronRight
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
      {/* Full-Screen WebGL PixelSnow Background covering the entire page */}
      <div className="fixed inset-0 w-screen h-screen pointer-events-none z-0 overflow-hidden opacity-35">
        <PixelSnow 
          color="#ffffff"
          flakeSize={0.035}
          minFlakeSize={1.8}
          pixelResolution={200}
          speed={1.15}
          density={0.32}
          direction={125}
          brightness={1.0}
          depthFade={8}
          farPlane={20}
          gamma={0.4545}
          variant="square"
        />
      </div>

      {/* Main Landing Content Container */}
      <div className="relative z-10 min-h-[82vh] flex flex-col justify-center max-w-4xl mx-auto text-center space-y-12 py-12 px-4">
        {/* Status Pill */}
        <div>
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-brand-emerald/30 text-xs font-mono text-brand-emerald shadow-glow-emerald">
            <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
            <span>Algorand TestNet</span>
            <span className="text-grid-600">•</span>
            <span className="text-white font-medium">x402 Protocol Standard</span>
          </div>
        </div>

        {/* Hero Title with High-Energy Shuffle Animation */}
        <div className="space-y-4">
          <div className="text-5xl sm:text-7xl md:text-8xl font-mono font-extrabold tracking-tight text-white">
            <Shuffle
              text="AGENTGRID"
              duration={0.65}
              stagger={0.06}
              triggerOnHover={true}
              loop={true}
              loopDelay={4}
              className="text-white hover:text-brand-emerald transition-colors"
            />
          </div>

          <div className="text-xs sm:text-sm md:text-base font-mono text-brand-emerald tracking-widest font-semibold uppercase">
            <Shuffle
              text="Autonomous AI Infrastructure Marketplace"
              duration={0.45}
              stagger={0.02}
              triggerOnHover={true}
              className="text-brand-emerald"
            />
          </div>
        </div>

        {/* Crisp Subtitle */}
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="text-sm sm:text-base text-grid-300 font-sans leading-relaxed">
            AI agents shouldn&apos;t be locked into static API keys. AgentGrid dynamically selects the optimal model & GPU, negotiates <strong className="text-brand-emerald font-mono font-medium">x402 micropayments</strong>, and settles on <strong className="text-white font-mono font-medium">Algorand</strong> in real time.
          </p>
        </div>

        {/* Big Unmistakable "Enter App" Call-to-Action */}
        <div className="space-y-4 pt-2">
          <button
            onClick={onEnterApp}
            className="group px-8 py-4 rounded-2xl bg-brand-emerald hover:bg-brand-emerald/90 text-black font-mono font-bold text-sm sm:text-base uppercase tracking-wider inline-flex items-center space-x-3 shadow-glow-emerald transition-all active:scale-95 hover:scale-[1.02]"
          >
            <Terminal className="w-5 h-5 text-black" />
            <span>Launch AgentGrid Workspace</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-black" />
          </button>

          <div className="flex items-center justify-center space-x-6 text-xs font-mono text-grid-400">
            <button
              onClick={() => onNavigateTab('grid')}
              className="hover:text-brand-emerald transition-colors"
            >
              Browse GPU Grid →
            </button>
            <span className="text-grid-700">•</span>
            <button
              onClick={() => onNavigateTab('x402-demo')}
              className="hover:text-brand-emerald transition-colors"
            >
              Test x402 Paywall →
            </button>
          </div>
        </div>

        {/* 3 Simple Value Props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left font-mono text-xs">
          <div className="bg-black/75 backdrop-blur-md border border-white/[0.08] rounded-xl p-5 space-y-2 hover:border-brand-emerald/40 transition-all shadow-sm">
            <div className="text-brand-emerald font-bold flex items-center space-x-2 text-sm">
              <Cpu className="w-4 h-4 text-brand-emerald" />
              <span>Smart Pareto Routing</span>
            </div>
            <p className="text-grid-300 font-sans text-xs leading-relaxed">
              Optimizes Cost vs Speed vs Quality for every single prompt across Models & GPUs.
            </p>
          </div>

          <div className="bg-black/75 backdrop-blur-md border border-white/[0.08] rounded-xl p-5 space-y-2 hover:border-brand-emerald/40 transition-all shadow-sm">
            <div className="text-white font-bold flex items-center space-x-2 text-sm">
              <Coins className="w-4 h-4 text-brand-emerald" />
              <span>x402 on Algorand</span>
            </div>
            <p className="text-grid-300 font-sans text-xs leading-relaxed">
              Machine-to-machine HTTP 402 paywalls settled in &lt;2.8s on Algorand TestNet.
            </p>
          </div>

          <div className="bg-black/75 backdrop-blur-md border border-white/[0.08] rounded-xl p-5 space-y-2 hover:border-brand-emerald/40 transition-all shadow-sm">
            <div className="text-brand-emerald font-bold flex items-center space-x-2 text-sm">
              <ArrowRightLeft className="w-4 h-4 text-brand-emerald" />
              <span>Zero-Downtime Failover</span>
            </div>
            <p className="text-grid-300 font-sans text-xs leading-relaxed">
              Auto-reroutes in-flight if a GPU node drops or throttles with 0 dropped tokens.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
