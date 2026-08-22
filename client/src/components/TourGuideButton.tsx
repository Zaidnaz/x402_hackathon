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
        // Re-compute bounding client rect
        setTimeout(() => {
          const freshEl = document.querySelector(step.targetSelector);
          if (freshEl) {
            setTargetRect(freshEl.getBoundingClientRect());
          }
        }, 150);
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
    const cardWidth = isMobile ? window.innerWidth - 32 : 380;
    const cardHeight = 220;

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
    const fitsBelow = targetRect.bottom + cardHeight + 20 < window.innerHeight;
    const fitsAbove = targetRect.top - cardHeight - 20 > 0;

    let top: number;
    if (fitsBelow) {
      top = Math.max(16, targetRect.bottom + 14);
    } else if (fitsAbove) {
      top = Math.max(16, targetRect.top - cardHeight - 14);
    } else {
      // If neither fits perfectly, stick to bottom of screen safely
      top = window.innerHeight - cardHeight - 24;
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
        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-brand-emerald/15 hover:bg-brand-emerald/25 border border-brand-emerald/35 hover:border-brand-emerald/60 text-brand-emerald text-xs font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
        title="Start interactive guided spotlight tour"
      >
        <Sparkles className="w-3.5 h-3.5 text-brand-emerald animate-pulse" />
        <span>{buttonLabel}</span>
      </button>

      {/* Interactive Spotlight Overlay */}
      {isActive && (
        <div className="fixed inset-0 z-50 pointer-events-none font-mono">
          {/* Darkened Clickable Backdrop */}
          <div 
            className="absolute inset-0 bg-black/75 transition-opacity duration-300 pointer-events-auto" 
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
              className="fixed rounded-xl border-2 border-brand-emerald shadow-[0_0_30px_rgba(16,185,129,0.7)] transition-all duration-200 pointer-events-none z-50 animate-pulse"
            />
          )}

          {/* Floating Tooltip anchored cleanly without overflow */}
          <div
            style={getPopoverStyle()}
            className="fixed z-50 bg-black/95 border border-brand-emerald/60 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl pointer-events-auto transition-all duration-200 space-y-3.5 max-w-[calc(100vw-32px)]"
          >
            {/* Popover Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-brand-emerald text-black font-bold text-xs flex items-center justify-center">
                  {currentStepIndex + 1}
                </span>
                <span className="text-[10px] sm:text-[11px] text-grid-300 font-semibold uppercase tracking-wider">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
              </div>

              <button
                onClick={endTour}
                className="p-1 rounded-lg hover:bg-white/[0.08] text-grid-400 hover:text-white transition-colors"
                title="Close Tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                <span className="truncate">{currentStep?.title}</span>
              </h4>
              <p className="text-[11px] sm:text-xs text-grid-300 font-sans leading-relaxed">
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
                    className="px-2.5 sm:px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white flex items-center space-x-1 transition-all text-xs"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  onClick={nextStep}
                  className="px-3.5 sm:px-4 py-1 rounded-lg bg-brand-emerald hover:bg-brand-emerald/90 text-black font-bold flex items-center space-x-1 shadow-glow-emerald transition-all active:scale-95 text-xs"
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
