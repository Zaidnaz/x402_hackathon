import React, { useEffect, useRef } from 'react';

export interface PixelSnowProps {
  color?: string;
  flakeSize?: number;
  minFlakeSize?: number;
  pixelResolution?: number;
  speed?: number;
  depthFade?: number;
  farPlane?: number;
  brightness?: number;
  gamma?: number;
  density?: number;
  variant?: 'square' | 'round' | 'snowflake';
  direction?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  swingOffset: number;
  swingSpeed: number;
}

export default function PixelSnow({
  color = '#18181b',
  density = 0.35,
  speed = 1.0,
  className = '',
  style = {}
}: PixelSnowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Number of particles based on screen area & density
    const count = Math.floor((width * height) / 18000 * Math.max(0.2, density));
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.floor(Math.random() * 4) + 2, // 2px to 5px crisp square pixels
        speed: (Math.random() * 0.8 + 0.4) * speed,
        opacity: Math.random() * 0.25 + 0.08, // Subtle 0.08 - 0.33 opacity
        swingOffset: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.015 + 0.005,
      });
    }

    let time = 0;
    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speed;
        p.x += Math.sin(time * p.swingSpeed + p.swingOffset) * 0.45;

        // Reset if off screen
        if (p.y > height + 10) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x > width + 10) {
          p.x = -10;
        } else if (p.x < -10) {
          p.x = width + 10;
        }

        // Draw crisp pixel square
        ctx.fillStyle = color;
        ctx.globalAlpha = p.opacity;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [color, density, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{ background: 'transparent', ...style }}
    />
  );
}
