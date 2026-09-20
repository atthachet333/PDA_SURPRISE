import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePageVisible } from '@/hooks/usePageVisible';

interface Shot {
  key: number;
  top: number;
  left: number;
  length: number;
  angle: number;
  duration: number;
  /** The one that means something. See `herald`. */
  special?: boolean;
}

/** Where a special star came to rest. One at a time, and it stays. */
interface Remnant {
  key: number;
  top: number;
  left: number;
}

interface ShootingStarsProps {
  /**
   * A scene id. When it CHANGES to a non-empty value, one special star is sent
   * across the sky. The caller decides which moment deserves it; passing the
   * same value again does nothing, so scrolling back and forth does not
   * re-trigger it.
   */
  herald?: string;
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
 *
 * THE SPECIAL ONE
 * ---------------
 * The ambient cadence above is deliberately unchanged — the whole value of a
 * meaningful star is that it arrives among stars that mean nothing. The special
 * one is slower and a little brighter, and unlike the others it LEAVES
 * SOMETHING: a faint point of light that stays where it stopped. It is never
 * announced, has no sound, and if it is missed it costs the story nothing.
 */
export function ShootingStars({ herald }: ShootingStarsProps = {}) {
  const reduced = useReducedMotion();
  const visible = usePageVisible();
  const [shot, setShot] = useState<Shot | null>(null);
  const [remnant, setRemnant] = useState<Remnant | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    if (reduced || !visible) {
      setShot(null);
      return;
    }

    let timer = 0;
    let clear = 0;

    const schedule = () => {
      // 8–20s, so the rhythm never becomes predictable.
      const wait = 8000 + Math.random() * 12000;
      timer = window.setTimeout(() => {
        seq.current += 1;
        const duration = 0.8 + Math.random() * 0.8;
        setShot({
          key: seq.current,
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

  // The special one. Separate effect, separate timers: it must not disturb the
  // ambient rhythm above, and the ambient rhythm must not swallow it.
  useEffect(() => {
    if (!herald || reduced || !visible) return;

    let clear = 0;
    // A short beat first, so it reads as arriving WITH the scene rather than
    // being fired by the scroll that got you there.
    const start = window.setTimeout(() => {
      seq.current += 1;
      const key = seq.current;
      const duration = 1.9;
      const top = 10 + Math.random() * 14;
      const left = 14 + Math.random() * 30;
      const length = 190;
      const angle = 22;
      setShot({ key, top, left, length, angle, duration, special: true });
      clear = window.setTimeout(() => {
        setShot(null);
        // Geometry of where the head finished, so the point it leaves behind
        // sits at the end of the path rather than at its start.
        const radians = (angle * Math.PI) / 180;
        setRemnant({
          key,
          left: left + (length / window.innerWidth) * 100 * Math.cos(radians),
          top: top + (length / window.innerHeight) * 100 * Math.sin(radians)
        });
      }, duration * 1000);
    }, 900);

    return () => {
      window.clearTimeout(start);
      window.clearTimeout(clear);
    };
  }, [herald, reduced, visible]);

  if (!shot && !remnant) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden" aria-hidden="true">
      {shot ? (
        <span
          key={shot.key}
          className={shot.special ? 'shooting-star shooting-star--special' : 'shooting-star'}
          style={{
            top: `${shot.top}%`,
            left: `${shot.left}%`,
            width: `${shot.length}px`,
            transform: `rotate(${shot.angle}deg)`,
            animationDuration: `${shot.duration}s`
          }}
        />
      ) : null}

      {remnant ? (
        <span
          key={`remnant-${remnant.key}`}
          className="shooting-star-remnant"
          style={{ top: `${remnant.top}%`, left: `${remnant.left}%` }}
        />
      ) : null}
    </div>
  );
}
