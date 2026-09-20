import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePageVisible } from '@/hooks/usePageVisible';

interface Shot {
  key: number;
  top: number;
  left: number;
  length: number;
  angle: number;
  duration: number;
}

/**
 * Occasional shooting stars.
 *
 * DOM, not WebGL, on purpose: one absolutely-positioned element that exists for
 * about a second and then unmounts is far cheaper than keeping a particle
 * system alive in the canvas, it works at every quality tier, and it needs no
 * change to the celestial architecture.
 *
 * RARE BY DESIGN — one every 8–20 seconds, never two at once. Meteor rain would
 * pull attention away from the photographs, which is the opposite of the point.
 * Nothing is scheduled while the tab is hidden, and reduced motion gets none.
 */
export function ShootingStars() {
  const reduced = useReducedMotion();
  const visible = usePageVisible();
  const [shot, setShot] = useState<Shot | null>(null);

  useEffect(() => {
    if (reduced || !visible) {
      setShot(null);
      return;
    }

    let timer = 0;
    let clear = 0;
    let key = 0;

    const schedule = () => {
      // 8–20s, so the rhythm never becomes predictable.
      const wait = 8000 + Math.random() * 12000;
      timer = window.setTimeout(() => {
        key += 1;
        const duration = 0.8 + Math.random() * 0.8;
        setShot({
          key,
          // Upper half of the sky only — a streak behind the reading column
          // would be a distraction rather than atmosphere.
          top: 4 + Math.random() * 38,
          left: 8 + Math.random() * 62,
          length: 90 + Math.random() * 130,
          angle: 18 + Math.random() * 16,
          duration
        });
        clear = window.setTimeout(() => setShot(null), duration * 1000 + 120);
        schedule();
      }, wait);
    };

    schedule();
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(clear);
    };
  }, [reduced, visible]);

  if (!shot) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden" aria-hidden="true">
      <span
        key={shot.key}
        className="shooting-star"
        style={{
          top: `${shot.top}%`,
          left: `${shot.left}%`,
          width: `${shot.length}px`,
          transform: `rotate(${shot.angle}deg)`,
          animationDuration: `${shot.duration}s`
        }}
      />
    </div>
  );
}
