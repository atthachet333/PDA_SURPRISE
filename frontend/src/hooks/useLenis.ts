import Lenis from 'lenis';
import { useEffect, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

interface LenisOptions {
  enabled?: boolean;
  lerp?: number;
}

/**
 * Mounts a single Lenis instance for the current route. Scroll-driven
 * libraries read from the same rAF loop so nothing double-schedules.
 */
export function useLenis({ enabled = true, lerp = 0.1 }: LenisOptions = {}): void {
  const reduced = useReducedMotion();
  const instance = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!enabled || reduced) return;

    const lenis = new Lenis({
      lerp,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      smoothWheel: true
    });
    instance.current = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      instance.current = null;
    };
  }, [enabled, lerp, reduced]);
}
