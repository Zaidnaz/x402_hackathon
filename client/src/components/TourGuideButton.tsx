import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X, Check, HelpCircle } from 'lucide-react';

export interface TourStep {
  targetSelector: string; // CSS selector or data-tour attribute e.g. '[data-tour="presets"]'
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface TourGuideProps {
  tourId: string;
  steps: TourStep[];
  onComplete?: () => void;
  buttonLabel?: string;
}

export const TourGuideButton: React.FC<TourGuideProps> = ({
  tourId,
  steps,
  onComplete,
  buttonLabel = 'Guided Tour'
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const startTour = () => {
    setCurrentStepIndex(0);
    setIsActive(true);
  };

  const endTour = () => {
    setIsActive(false);
    setTargetRect(null);
    if (onComplete) onComplete();
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Scroll to and highlight current element
  useEffect(() => {
    if (!isActive) return;

    const step = steps[currentStepIndex];
    if (!step) return;

    const updatePosition = () => {
      const el = document.querySelector(step.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        // If element not found, fallback to center of screen
        setTargetRect(null);
      }
    };

    // Small timeout to allow render/scroll
    const timer = setTimeout(updatePosition, 100);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isActive, currentStepIndex, steps]);

  const currentStep = steps[currentStepIndex];

  return (
    <>
      {/* Sleek Trigger Button */}
      <button
        onClick={startTour}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-brand-emerald/10 hover:bg-brand-emerald/20 border border-brand-emerald/30 hover:border-brand-emerald/50 text-brand-emerald text-xs font-mono font-medium transition-all shadow-sm active:scale-95 cursor-pointer"
        title="Start interactive guided spotlight tour"
      >
        <Sparkles className="w-3.5 h-3.5 text-brand-emerald animate-pulse" />
        <span>{buttonLabel}</span>
      </button>

      {/* Interactive Spotlight Overlay */}
      {isActive && (
        <div className="fixed inset-0 z-50 pointer-events-none font-mono">
          {/* Darkened Backdrop */}
          <div className="absolute inset-0 bg-black/75 transition-opacity duration-300 pointer-events-auto" onClick={endTour} />

          {/* Glowing Target Spotlight Box */}
          {targetRect && (
            <div
              style={{
                top: `${targetRect.top - 6}px`,
                left: `${targetRect.left - 6}px`,
                width: `${targetRect.width + 12}px`,
                height: `${targetRect.height + 12}px`,
              }}
              className="absolute rounded-xl border-2 border-brand-emerald shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all duration-300 pointer-events-none z-50 animate-pulse"
            />
          )}

          {/* Floating Tooltip / Popover pointing to element */}
          <div
            ref={popoverRef}
            style={{
              top: targetRect 
                ? `${Math.min(window.innerHeight - 260, Math.max(20, targetRect.bottom + 16))}px` 
                : '50%',
              left: targetRect 
                ? `${Math.min(window.innerWidth - 380, Math.max(20, targetRect.left))}px` 
                : '50%',
              transform: targetRect ? 'none' : 'translate(-50%, -50%)',
            }}
            className="fixed z-50 w-80 sm:w-96 bg-black/95 border border-brand-emerald/50 rounded-2xl p-5 shadow-2xl backdrop-blur-xl pointer-events-auto transition-all duration-300 space-y-4"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-brand-emerald text-black font-bold text-xs flex items-center justify-center">
                  {currentStepIndex + 1}
                </span>
                <span className="text-[11px] text-grid-400 font-semibold uppercase tracking-wider">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
              </div>

              <button
                onClick={endTour}
                className="p-1 rounded-lg hover:bg-white/[0.08] text-grid-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-white tracking-tight flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-emerald" />
                <span>{currentStep?.title}</span>
              </h4>
              <p className="text-xs text-grid-300 font-sans leading-relaxed">
                {currentStep?.description}
              </p>
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-xs">
              <button
                onClick={endTour}
                className="text-grid-400 hover:text-white text-[11px] hover:underline"
              >
                Skip Tour
              </button>

              <div className="flex items-center space-x-2">
                {currentStepIndex > 0 && (
                  <button
                    onClick={prevStep}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white flex items-center space-x-1 transition-all"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  onClick={nextStep}
                  className="px-4 py-1.5 rounded-lg bg-brand-emerald hover:bg-brand-emerald/90 text-black font-bold flex items-center space-x-1 shadow-glow-emerald transition-all active:scale-95"
                >
                  <span>{currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}</span>
                  {currentStepIndex === steps.length - 1 ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TourGuideButton;
