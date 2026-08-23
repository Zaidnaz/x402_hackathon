import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X, Check } from 'lucide-react';

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
  buttonLabel = 'How It Works'
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

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
        setTimeout(() => {
          const freshEl = document.querySelector(step.targetSelector);
          if (freshEl) {
            setTargetRect(freshEl.getBoundingClientRect());
          }
        }, 120);
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    const handleScroll = () => {
      const el = document.querySelector(step.targetSelector);
      if (el) setTargetRect(el.getBoundingClientRect());
    };

    window.addEventListener('resize', handleScroll);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isActive, currentStepIndex, steps]);

  const currentStep = steps[currentStepIndex];

  // Calculate intelligent bounded position for popover
  const getPopoverStyle = (): React.CSSProperties => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const cardWidth = isMobile ? Math.min(window.innerWidth - 32, 360) : 400;
    const cardHeight = 240;

    if (!targetRect) {
      // Dock at bottom center of viewport
      return {
        bottom: '24px',
        left: isMobile ? '16px' : '50%',
        transform: isMobile ? 'none' : 'translateX(-50%)',
        width: `${cardWidth}px`,
      };
    }

    // Determine if tooltip should be above or below element
    const fitsBelow = targetRect.bottom + cardHeight + 24 < window.innerHeight;
    const fitsAbove = targetRect.top - cardHeight - 24 > 0;

    let top: number;
    if (fitsBelow) {
      top = Math.max(16, targetRect.bottom + 14);
    } else if (fitsAbove) {
      top = Math.max(16, targetRect.top - cardHeight - 14);
    } else {
      top = Math.max(16, window.innerHeight - cardHeight - 20);
    }

    let left = isMobile 
      ? 16 
      : Math.max(16, Math.min(window.innerWidth - cardWidth - 16, targetRect.left));

    return {
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
    };
  };

  return (
    <>
      {/* Sleek "How It Works" Trigger Button */}
      <button
        onClick={startTour}
        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-brand-emerald/15 hover:bg-brand-emerald/25 border border-brand-emerald/40 hover:border-brand-emerald/70 text-brand-emerald text-xs font-mono font-bold transition-all shadow-glow-emerald active:scale-95 cursor-pointer"
        title="Start interactive guided tour"
      >
        <Sparkles className="w-3.5 h-3.5 text-brand-emerald " />
        <span>{buttonLabel}</span>
      </button>

      {/* Interactive Spotlight Overlay */}
      {isActive && (
        <div className="fixed inset-0 z-[100] pointer-events-none font-mono">
          {/* High-Contrast Frosted Dimmer Backdrop */}
          <div 
            className="absolute inset-0 bg-grid-900/85 backdrop-blur-md transition-opacity duration-300 pointer-events-auto" 
            onClick={endTour} 
          />

          {/* Glowing Target Spotlight Box */}
          {targetRect && (
            <div
              style={{
                top: `${Math.max(4, targetRect.top - 6)}px`,
                left: `${Math.max(4, targetRect.left - 6)}px`,
                width: `${Math.min(window.innerWidth - 8, targetRect.width + 12)}px`,
                height: `${targetRect.height + 12}px`,
              }}
              className="fixed rounded-xl border-2 border-brand-emerald bg-brand-emerald/10 shadow-[0_0_35px_rgba(16,185,129,0.8),0_0_0_9999px_rgba(0,0,0,0.65)] transition-all duration-200 pointer-events-none z-[101] "
            />
          )}

          {/* Floating High-Contrast Spotlight Card */}
          <div
            style={getPopoverStyle()}
            className="fixed z-[102] bg-[#0c120e] border-2 border-brand-emerald/70 rounded-2xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95),0_0_30px_rgba(16,185,129,0.25)] backdrop-blur-2xl pointer-events-auto transition-all duration-200 space-y-4 max-w-[calc(100vw-32px)]"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-brand-emerald/20 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full bg-brand-emerald text-white font-extrabold text-xs">
                  {currentStepIndex + 1}/{steps.length}
                </span>
                <span className="text-xs text-brand-emerald font-semibold">
                  How This Works
                </span>
              </div>

              <button
                onClick={endTour}
                className="p-1 rounded-lg bg-grid-850 hover:bg-white/[0.15] text-grid-300 hover:text-grid-100 transition-colors cursor-pointer"
                title="Close Tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Body */}
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-grid-100 tracking-tight flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-brand-emerald shrink-0" />
                <span className="truncate">{currentStep?.title}</span>
              </h4>
              <p className="text-xs text-grid-200 font-sans leading-relaxed">
                {currentStep?.description}
              </p>
            </div>

            {/* High-Visibility Navigation Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-brand-emerald/20">
              <button
                onClick={endTour}
                className="text-grid-400 hover:text-grid-100 text-xs font-mono underline cursor-pointer py-1"
              >
                Skip Tour
              </button>

              <div className="flex items-center space-x-2">
                {currentStepIndex > 0 && (
                  <button
                    onClick={prevStep}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.15] text-grid-100 flex items-center space-x-1 transition-all text-xs font-bold cursor-pointer active:scale-95"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  onClick={nextStep}
                  className="px-4 py-2 rounded-xl bg-brand-emerald hover:bg-brand-mint text-white font-extrabold flex items-center space-x-1.5 shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all active:scale-95 text-xs uppercase tracking-wide cursor-pointer"
                >
                  <span>{currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}</span>
                  {currentStepIndex === steps.length - 1 ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-white" />
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

