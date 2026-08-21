import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { gsap } from 'gsap';

export interface ShuffleProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  shuffleDirection?: 'right' | 'left' | 'up' | 'down';
  duration?: number;
  maxDelay?: number;
  ease?: string;
  threshold?: number;
  rootMargin?: string;
  tag?: keyof JSX.IntrinsicElements;
  textAlign?: 'left' | 'center' | 'right';
  onShuffleComplete?: () => void;
  shuffleTimes?: number;
  animationMode?: 'evenodd' | 'random' | 'linear';
  loop?: boolean;
  loopDelay?: number;
  stagger?: number;
  scrambleCharset?: string;
  colorFrom?: string;
  colorTo?: string;
  triggerOnce?: boolean;
  respectReducedMotion?: boolean;
  triggerOnHover?: boolean;
}

const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*+=-_~';

export const Shuffle: React.FC<ShuffleProps> = ({
  text,
  className = '',
  style = {},
  shuffleDirection = 'right',
  duration = 0.35,
  ease = 'power3.out',
  textAlign = 'center',
  onShuffleComplete,
  shuffleTimes = 3,
  animationMode = 'evenodd',
  loop = false,
  loopDelay = 0,
  stagger = 0.03,
  scrambleCharset = DEFAULT_CHARSET,
  colorFrom,
  colorTo,
  triggerOnce = true,
  respectReducedMotion = true,
  triggerOnHover = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayedText, setDisplayedText] = useState<string[]>(() => text.split(''));
  const isPlayingRef = useRef(false);
  const timerIdsRef = useRef<number[]>([]);

  const chars = useMemo(() => text.split(''), [text]);

  const runShuffle = useCallback(() => {
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    // Clear existing timers
    timerIdsRef.current.forEach(id => clearTimeout(id));
    timerIdsRef.current = [];

    const charset = scrambleCharset || DEFAULT_CHARSET;
    const getRandomChar = () => charset.charAt(Math.floor(Math.random() * charset.length));

    chars.forEach((originalChar, index) => {
      if (originalChar === ' ') return;

      // Compute staggered start time based on animationMode
      let charDelay = 0;
      if (animationMode === 'evenodd') {
        const isEven = index % 2 === 0;
        charDelay = (isEven ? 0 : 0.08) + index * stagger;
      } else {
        charDelay = index * stagger;
      }

      const totalRolls = Math.max(2, shuffleTimes * 3);
      const stepInterval = (duration * 1000) / totalRolls;

      for (let roll = 0; roll < totalRolls; roll++) {
        const timerId = window.setTimeout(() => {
          setDisplayedText(prev => {
            const next = [...prev];
            next[index] = roll === totalRolls - 1 ? originalChar : getRandomChar();
            return next;
          });

          if (index === chars.length - 1 && roll === totalRolls - 1) {
            isPlayingRef.current = false;
            onShuffleComplete?.();
          }
        }, charDelay * 1000 + roll * stepInterval);

        timerIdsRef.current.push(timerId);
      }
    });
  }, [chars, duration, stagger, shuffleTimes, animationMode, scrambleCharset, onShuffleComplete]);

  useEffect(() => {
    setDisplayedText(text.split(''));
    runShuffle();

    return () => {
      timerIdsRef.current.forEach(id => clearTimeout(id));
      timerIdsRef.current = [];
    };
  }, [text, runShuffle]);

  const handleMouseEnter = () => {
    if (triggerOnHover) {
      runShuffle();
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      className={`inline-block select-none cursor-default font-mono ${className}`}
      style={{ textAlign, ...style }}
    >
      <span className="inline-flex flex-wrap justify-center items-center">
        {displayedText.map((char, idx) => (
          <span
            key={idx}
            className={`inline-block transition-colors duration-150 ${
              char !== chars[idx] ? 'text-brand-emerald opacity-90' : ''
            }`}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </span>
    </div>
  );
};

export default Shuffle;
