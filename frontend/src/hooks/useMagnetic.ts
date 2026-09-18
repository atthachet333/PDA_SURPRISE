import { useEffect, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

/** Desktop-only magnetic pull for primary CTAs. No-ops on touch/reduced motion. */
export function useMagnetic<T extends HTMLElement>(strength = 0.28) {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced) return;
    if (window.matchMedia('(hover: none)').matches) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const render = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      node.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        frame = requestAnimationFrame(render);
      } else {
        frame = 0;
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onMove = (event: PointerEvent) => {
      const rect = node.getBoundingClientRect();
      targetX = (event.clientX - (rect.left + rect.width / 2)) * strength;
      targetY = (event.clientY - (rect.top + rect.height / 2)) * strength;
      schedule();
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      schedule();
    };

    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerleave', onLeave);

    return () => {
      node.removeEventListener('pointermove', onMove);
      node.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
      node.style.transform = '';
    };
  }, [reduced, strength]);

  return ref;
}
