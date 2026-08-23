import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';

interface Step {
  title: string;
  desc: string;
}

interface HowItWorksProps {
  pageTitle: string;
  badgeText: string;
  summary: string;
  steps: Step[];
  proTip?: string;
}

export const HowItWorksBanner: React.FC<HowItWorksProps> = ({
  pageTitle,
  badgeText,
  summary,
  steps,
  proTip
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-grid-900/60 border border-grid-800 hover:border-brand-emerald/30 rounded-xl overflow-hidden transition-all shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left font-mono text-xs hover:bg-grid-850 transition-colors"
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-5 h-5 rounded-full bg-brand-emerald/15 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald shrink-0">
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-grid-100 uppercase tracking-wider">How This Works:</span>
            <span className="text-grid-300">{pageTitle}</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/25">
              {badgeText}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-brand-emerald shrink-0 text-[11px]">
          <span>{isOpen ? 'Hide Tutorial' : 'Show Tutorial (3 Steps)'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-grid-800 bg-grid-900/80 space-y-4 font-mono text-xs animate-fadeIn">
          <p className="text-grid-200 leading-relaxed font-sans text-xs sm:text-sm">
            {summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-grid-950 p-3.5 rounded-lg border border-grid-800 space-y-1.5"
              >
                <div className="flex items-center space-x-2 text-[11px] font-bold text-brand-emerald">
                  <span className="w-4 h-4 rounded-full bg-brand-emerald/20 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{step.title}</span>
                </div>
                <div className="text-[11px] text-grid-300 font-sans leading-relaxed">
                  {step.desc}
                </div>
              </div>
            ))}
          </div>

          {proTip && (
            <div className="p-3 bg-brand-emerald/10 border border-brand-emerald/25 rounded-lg flex items-start space-x-2 text-[11px] text-grid-200">
              <Lightbulb className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
              <div className="font-sans leading-relaxed">
                <strong className="text-brand-emerald font-mono">Evaluation Tip:</strong> {proTip}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HowItWorksBanner;

