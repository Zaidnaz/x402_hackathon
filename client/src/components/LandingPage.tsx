import React from 'react';
import {
  ArrowRight,
  Cpu,
  Coins,
  ArrowRightLeft,
  CheckCircle2,
  Search
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onNavigateTab: (tab: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onNavigateTab }) => {
  return (
    <section className="min-h-[72vh] flex flex-col justify-center gap-10 py-8">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-center">
        <div className="space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-grid-800 bg-grid-900 px-3 py-1.5 text-caption text-grid-500 shadow-xs">
            <span className="h-2 w-2 rounded-full bg-brand-emerald" />
            <span>Algorand TestNet</span>
            <span className="text-grid-700">·</span>
            <span>x402 payments</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-serif text-[42px] leading-[46px] sm:text-[58px] sm:leading-[62px] text-grid-100 font-medium">
              Route compute work without the guesswork.
            </h1>
            <p className="text-body-lg text-grid-400 max-w-2xl">
              AgentGrid helps a user submit one task, compare available model and GPU providers, pay the selected route, and keep a clear settlement trail.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onEnterApp}
              className="group inline-flex items-center justify-center gap-2 rounded-control bg-brand-emerald px-5 py-3 text-body-sm font-semibold text-white shadow-glow-emerald hover:bg-brand-mint active:scale-[0.99] transition-all"
            >
              <span>Start a task</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => onNavigateTab('grid')}
              className="inline-flex items-center justify-center gap-2 rounded-control border border-grid-800 bg-grid-900 px-5 py-3 text-body-sm font-semibold text-grid-200 hover:border-grid-700 hover:bg-white transition-all"
            >
              <Search className="w-4 h-4" />
              <span>Browse providers</span>
            </button>
          </div>
        </div>

        <div className="rounded-panel border border-grid-800 bg-grid-900 p-5 shadow-subtle-panel">
          <div className="flex items-center justify-between border-b border-grid-800 pb-3">
            <div>
              <div className="text-caption text-grid-500">Typical task flow</div>
              <div className="text-heading-sm text-grid-100">Submit, route, pay, verify</div>
            </div>
            <span className="rounded-full bg-brand-emeraldDim px-3 py-1 text-caption font-medium text-brand-emerald">
              Live
            </span>
          </div>

          <div className="divide-y divide-grid-800">
            {[
              ['Understand the request', 'Collect task needs and priorities.'],
              ['Choose a provider', 'Balance cost, latency, quality, and reliability.'],
              ['Settle payment', 'Use x402 with an Algorand transaction receipt.'],
              ['Return the result', 'Show the route and output in one place.']
            ].map(([title, body], index) => (
              <div key={title} className="flex gap-3 py-4">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-grid-850 text-caption font-semibold text-grid-300">
                  {index + 1}
                </div>
                <div>
                  <div className="text-body-sm font-semibold text-grid-100">{title}</div>
                  <div className="text-body-sm text-grid-500">{body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          [Cpu, 'Routing you can inspect', 'See why a provider was chosen before the work runs.'],
          [Coins, 'Receipts included', 'Every paid task keeps the amount, destination, and explorer link.'],
          [ArrowRightLeft, 'Failure-aware choices', 'Provider status can change without making the interface hard to follow.']
        ].map(([Icon, title, body]) => {
          const LucideIcon = Icon as typeof Cpu;
          return (
            <div key={title as string} className="rounded-card border border-grid-800 bg-grid-900 p-5 shadow-xs">
              <LucideIcon className="mb-4 h-5 w-5 text-brand-emerald" />
              <div className="text-body font-semibold text-grid-100">{title as string}</div>
              <p className="mt-1 text-body-sm text-grid-500">{body as string}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 text-caption text-grid-500">
        <CheckCircle2 className="h-4 w-4 text-brand-emerald" />
        <span>Built for straightforward testing, demos, and provider onboarding.</span>
      </div>
    </section>
  );
};

export default LandingPage;

