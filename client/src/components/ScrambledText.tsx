import React, { useEffect, useRef, useState, useMemo } from 'react';

export interface ScrambledTextProps {
  radius?: number;
  duration?: number;
  speed?: number;
  scrambleChars?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const ScrambledText: React.FC<ScrambledTextProps> = ({
  radius = 120,
  duration = 1.0,
  speed = 0.5,
  scrambleChars = '.:!<>-_/[]{}—=+*^?#',
  className = '',
  style = {},
  children
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const textContent = typeof children === 'string' ? children : String(children ?? '');
  
  const chars = useMemo(() => textContent.split(''), [textContent]);
  const [displayChars, setDisplayChars] = useState<string[]>(() => [...chars]);
  
  const activeScrambles = useRef<Map<number, { endTime: number; original: string; intervalId?: number }>>(new Map());

  useEffect(() => {
    setDisplayChars(chars);
  }, [chars]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const charElements = el.querySelectorAll<HTMLSpanElement>('.scramble-char');
    const randomChar = () => scrambleChars[Math.floor(Math.random() * scrambleChars.length)] || '.';

    const handlePointerMove = (e: PointerEvent) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      const now = performance.now();

      charElements.forEach((span, idx) => {
        const rect = span.getBoundingClientRect();
        const charX = rect.left + rect.width / 2;
        const charY = rect.top + rect.height / 2;
        const dist = Math.hypot(mouseX - charX, mouseY - charY);

        if (dist < radius) {
          const original = chars[idx];
          if (original === ' ' || original === '\n') return;

          const factor = 1 - dist / radius;
          const animDuration = Math.max(200, duration * factor * 1000);
          const endTime = now + animDuration;

          const existing = activeScrambles.current.get(idx);
          if (existing) {
            existing.endTime = endTime;
            return;
          }

          activeScrambles.current.set(idx, { endTime, original });

          const scrambleInterval = window.setInterval(() => {
            const current = activeScrambles.current.get(idx);
            if (!current) {
              clearInterval(scrambleInterval);
              return;
            }

            if (performance.now() >= current.endTime) {
              clearInterval(scrambleInterval);
              activeScrambles.current.delete(idx);
              setDisplayChars(prev => {
                const next = [...prev];
                next[idx] = current.original;
                return next;
              });
            } else {
              setDisplayChars(prev => {
                const next = [...prev];
                next[idx] = randomChar();
                return next;
              });
            }
          }, Math.max(30, 70 * (1 - speed)));
        }
      });
    };

    el.addEventListener('pointermove', handlePointerMove);

    return () => {
      el.removeEventListener('pointermove', handlePointerMove);
      activeScrambles.current.clear();
    };
  }, [chars, radius, duration, speed, scrambleChars]);

  return (
    <div
      ref={rootRef}
      className={`font-mono inline-block select-none ${className}`}
      style={style}
    >
      <p className="inline-block leading-snug">
        {displayChars.map((char, i) => (
          <span
            key={i}
            className={`scramble-char inline-block will-change-transform ${
              char !== chars[i] ? 'text-brand-emerald' : ''
            }`}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </p>
    </div>
  );
};

export default ScrambledText;
