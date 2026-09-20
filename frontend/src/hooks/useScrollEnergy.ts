import { useEffect, useRef } from 'react';

export interface ScrollEnergy {
  /**
   * Signed, clamped scroll velocity in [-1, 1], decayed to the moment it is
   * read. Positive means moving down the page.
   */
  sample(): number;
}

/**
 * How fast you have to scroll to reach full energy, in pixels per second.
 * A brisk flick on a trackpad lands around 2500; this is deliberately above a
 * comfortable reading scroll so ordinary movement barely registers.
 */
const FULL_SPEED = 2600;

/** Seconds for the energy to fall to ~37% once scrolling stops. */
const DECAY_TAU = 0.38;

/**
 * A single, shared measure of "how hard is this person scrolling right now".
 *
 * WHY THIS SHAPE
 * --------------
 * The backdrop already runs one `useFrame` loop per layer. Adding a second
 * animation loop just to decay a number would be a waste, so nothing here
 * animates: the listener records a velocity and a timestamp, and `sample()`
 * applies the exponential decay AT THE MOMENT IT IS READ. The existing render
 * loop is the only clock, and when nothing is reading, nothing runs.
 *
 * The output is clamped twice over — once against `FULL_SPEED` and again to
 * [-1, 1] — because the whole risk of scroll-linked motion is that a fast
 * flick or a momentum fling turns into a lurch. A hard ceiling means the worst
 * case is simply "the maximum", which is tuned to be small.
 *
 * Returns a ref so consumers can read it inside a frame without re-rendering.
 */
export function useScrollEnergy(enabled = true): React.MutableRefObject<ScrollEnergy> {
  const state = useRef({ velocity: 0, at: 0 });

  const api = useRef<ScrollEnergy>({
    sample() {
      const { velocity, at } = state.current;
      if (!velocity) return 0;
      const elapsed = (performance.now() - at) / 1000;
      const decayed = velocity * Math.exp(-elapsed / DECAY_TAU);
      // Below this the value is doing nothing visible; zero it so consumers can
      // cheaply skip their own work.
      return Math.abs(decayed) < 0.002 ? 0 : decayed;
    }
  });

  useEffect(() => {
    if (!enabled) {
      state.current.velocity = 0;
      return;
    }

    let lastY = window.scrollY;
    let lastT = performance.now();

    const onScroll = () => {
      const now = performance.now();
      const dt = now - lastT;
      // Two scroll events in the same millisecond would divide by zero, and a
      // very long gap is a new gesture rather than one slow continuous one.
      if (dt < 4) return;
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      lastT = now;
      if (dt > 400) return;

      const pxPerSecond = (dy / dt) * 1000;
      const next = Math.max(-1, Math.min(1, pxPerSecond / FULL_SPEED));
      // Take the stronger of the decayed previous value and the new one, so a
      // sustained scroll holds its level instead of flickering between events.
      const current = api.current.sample();
      state.current.velocity = Math.abs(next) > Math.abs(current) ? next : current;
      state.current.at = now;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [enabled]);

  return api;
}
