import React, { useState } from 'react';
import { 
  HelpCircle, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Lightbulb, 
  Sparkles,
  Zap,
  ExternalLink
} from 'lucide-react';

export interface GuideStep {
  title: string;
  desc: string;
  highlightAction?: string;
}

export interface PageGuideConfig {
  pageTitle: string;
  badge: string;
  tagline: string;
  overview: string;
  steps: GuideStep[];
  whatToLookFor: string[];
  evaluationTip?: string;
}

interface HowThisWorksButtonProps {
  guide: PageGuideConfig;
}

export const HowThisWorksButton: React.FC<HowThisWorksButtonProps> = ({ guide }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Sleek, Unobtrusive "How this works?" Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-brand-emerald/10 hover:bg-brand-emerald/20 border border-brand-emerald/30 hover:border-brand-emerald/50 text-brand-emerald text-xs font-mono font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
      >
        <HelpCircle className="w-3.5 h-3.5 text-brand-emerald" />
        <span>How This Works?</span>
      </button>

      {/* Interactive Modal Guide Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-grid-900/85 backdrop-blur-md animate-fadeIn">
          <div 
            className="relative w-full max-w-2xl bg-grid-900 border border-grid-750 rounded-2xl p-6 sm:p-7 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh] text-left font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-grid-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30">
                    {guide.badge}
                  </span>
                  <span className="text-xs text-grid-400">· Interactive Guide</span>
                </div>
                <h3 className="text-xl font-bold text-grid-100 tracking-tight">
                  {guide.pageTitle}
                </h3>
                <p className="text-xs text-brand-emerald font-semibold">
                  {guide.tagline}
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-grid-850 hover:bg-white/[0.08] border border-grid-800 text-grid-300 hover:text-grid-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overview Paragraph */}
            <div className="text-xs sm:text-sm text-grid-200 font-sans leading-relaxed bg-grid-850 p-4 rounded-xl border border-grid-800">
              {guide.overview}
            </div>

            {/* 3 Actionable Steps */}
            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wider text-grid-100 font-bold flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-emerald" />
                <span>What To Do On This Page:</span>
              </div>

              <div className="space-y-2.5">
                {guide.steps.map((step, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-xl bg-grid-950 border border-grid-800 flex items-start space-x-3 text-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-brand-emerald text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="space-y-1 font-sans">
                      <div className="font-bold text-grid-100 font-mono text-xs flex items-center justify-between">
                        <span>{step.title}</span>
                        {step.highlightAction && (
                          <span className="text-[10px] text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded border border-brand-emerald/20">
                            {step.highlightAction}
                          </span>
                        )}
                      </div>
                      <div className="text-grid-300 text-xs leading-relaxed">
                        {step.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What To Look For / Key Highlights */}
            {guide.whatToLookFor && guide.whatToLookFor.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs uppercase tracking-wider text-grid-400 font-bold">
                  Key Verification Points for Judges:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                  {guide.whatToLookFor.map((item, i) => (
                    <div key={i} className="flex items-start space-x-2 text-grid-300 bg-grid-850 p-2.5 rounded-lg border border-white/[0.04]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pro Evaluation Tip */}
            {guide.evaluationTip && (
              <div className="p-3.5 bg-brand-emerald/10 border border-brand-emerald/25 rounded-xl flex items-start space-x-2.5 text-xs text-grid-200 font-sans">
                <Lightbulb className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
                <div>
                  <strong className="text-brand-emerald font-mono">Pro Tip:</strong> {guide.evaluationTip}
                </div>
              </div>
            )}

            {/* Close / Action Footer */}
            <div className="pt-3 border-t border-grid-800 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-brand-emerald hover:bg-brand-mint text-white font-mono font-bold text-xs uppercase tracking-wider shadow-glow-emerald transition-all active:scale-95 cursor-pointer"
              >
                Got It, Let&apos;s Try!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HowThisWorksButton;

