import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';

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

const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*+=-_~/?><';

export const Shuffle: React.FC<ShuffleProps> = ({
  text,
  className = '',
  style = {},
  duration = 0.6,
  stagger = 0.04,
  shuffleTimes = 4,
  scrambleCharset = DEFAULT_CHARSET,
  triggerOnHover = true,
  loop = false,
  loopDelay = 3,
  onShuffleComplete
}) => {
  const [output, setOutput] = useState<string[]>(() => text.split(''));
  const animFrameRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);

  const chars = useMemo(() => text.split(''), [text]);

  const triggerShuffle = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const charset = scrambleCharset || DEFAULT_CHARSET;
    const getRandomChar = () => charset[Math.floor(Math.random() * charset.length)];

    const startTime = performance.now();
    const totalDurationMs = (duration + chars.length * stagger) * 1000;

    const tick = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      const nextOutput = chars.map((targetChar, index) => {
        if (targetChar === ' ' || targetChar === '\n') return targetChar;

        const charStartTime = index * stagger;
        const charDuration = duration;

        if (elapsed < charStartTime) {
          return getRandomChar();
        }

        const charProgress = (elapsed - charStartTime) / charDuration;

        if (charProgress >= 1) {
          return targetChar;
        }

        // Mid-shuffle: roll through random characters
        return getRandomChar();
      });

      setOutput(nextOutput);

      if (now - startTime < totalDurationMs) {
        animFrameRef.current = requestAnimationFrame(tick);
      } else {
        setOutput(chars);
        isAnimatingRef.current = false;
        if (onShuffleComplete) onShuffleComplete();
      }
    };

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(tick);
  }, [chars, duration, stagger, scrambleCharset, onShuffleComplete]);

  // Run automatically on mount and when text changes
  useEffect(() => {
    setOutput(text.split(''));
    // Small delay to ensure DOM is ready and visible
    const timer = setTimeout(() => {
      triggerShuffle();
    }, 150);

    let loopTimer: any = null;
    if (loop) {
      loopTimer = setInterval(() => {
        triggerShuffle();
      }, (duration + chars.length * stagger + loopDelay) * 1000);
    }

    return () => {
      clearTimeout(timer);
      if (loopTimer) clearInterval(loopTimer);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [text, loop, loopDelay, triggerShuffle, duration, chars.length, stagger]);

  return (
    <span
      onMouseEnter={() => {
        if (triggerOnHover) triggerShuffle();
      }}
      onClick={() => triggerShuffle()}
      className={`inline-block font-mono select-none cursor-pointer transition-opacity ${className}`}
      style={style}
    >
      {output.map((char, index) => {
        const isTarget = char === chars[index];
        return (
          <span
            key={index}
            className={`inline-block transition-colors duration-100 ${
              !isTarget && char !== ' ' ? 'text-brand-emerald opacity-90 scale-105' : ''
            }`}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </span>
  );
};

export default Shuffle;
