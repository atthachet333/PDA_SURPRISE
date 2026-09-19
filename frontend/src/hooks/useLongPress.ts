import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A deliberate press-and-hold.
 *
 * Used for secrets, so the bar for "deliberate" matters: a tap must not trip it,
 * and a hold that turns into a scroll must cancel. Pointer events cover mouse,
 * pen and touch with one code path, and `pointercancel` is what fires when the
 * browser takes the gesture over for scrolling — which is exactly when this
 * should give up.
 *
 * `progress` is exposed so the surface can show that something is happening
 * while the hold is in flight; without it a long-press is an invisible
 * affordance that only rewards people who happen to wait.
 */
export function useLongPress(
  onHold: () => void,
  { ms = 1500, enabled = true }: { ms?: number; enabled?: boolean } = {}
) {
  const [holding, setHolding] = useState(false);
  const timer = useRef(0);
  const frame = useRef(0);
  const [progress, setProgress] = useState(0);

  const cancel = useCallback(() => {
    window.clearTimeout(timer.current);
    cancelAnimationFrame(frame.current);
    setHolding(false);
    setProgress(0);
  }, []);

  useEffect(() => cancel, [cancel]);

  const start = useCallback(() => {
    if (!enabled) return;
    setHolding(true);
    const began = performance.now();

    const tick = (now: number) => {
      setProgress(Math.min(1, (now - began) / ms));
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);

    // Wall clock, not frames: a throttled tab must not make the hold
    // unreachable, and the rAF loop above is only for the visual.
    timer.current = window.setTimeout(() => {
      cancel();
      onHold();
    }, ms);
  }, [cancel, enabled, ms, onHold]);

  return {
    holding,
    progress,
    handlers: {
      onPointerDown: start,
      onPointerUp: cancel,
      onPointerLeave: cancel,
      onPointerCancel: cancel
    }
  };
}
