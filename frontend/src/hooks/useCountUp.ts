import { useEffect, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';

interface CountUpOptions {
  duration?: number;
  start?: number;
  active?: boolean;
  decimals?: number;
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function useCountUp(target: number, options: CountUpOptions = {}): number {
  const { duration = 1800, start = 0, active = true, decimals = 0 } = options;
  const reduced = useReducedMotion();
  const [value, setValue] = useState(active && !reduced ? start : target);

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setValue(target);
      return;
    }

    let frame = 0;
    const began = performance.now();
    const factor = 10 ** decimals;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - began) / duration);
      const next = start + (target - start) * easeOutExpo(progress);
      setValue(Math.round(next * factor) / factor);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, decimals, duration, reduced, start, target]);

  return value;
}
