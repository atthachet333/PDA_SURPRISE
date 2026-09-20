import { useEffect, useState } from 'react';
import { anniversary } from '@/data/anniversary';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * The small line under ATTHACHET & ISARIYA that keeps the arrival from sitting
 * completely still.
 *
 * It cycles a few short phrases rather than animating the layout — the screen
 * stays calm and one line quietly changes its mind. Crossfade only: no typing
 * effect, no character-by-character reveal, nothing that would make a visitor
 * wait to read a sentence.
 *
 * Under reduced motion it shows the first phrase and stops. The content is
 * never behind the animation.
 */
export function ArrivalWhisper({ className }: { className?: string }) {
  const lines = anniversary.intro.whisper;
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    if (reduced || lines.length < 2) return;
    let fade = 0;
    // Long dwell: this is a thing you notice on second glance, not a carousel.
    const cycle = window.setInterval(() => {
      setShown(false);
      fade = window.setTimeout(() => {
        setIndex((i) => (i + 1) % lines.length);
        setShown(true);
      }, 700);
    }, 5200);
    return () => {
      window.clearInterval(cycle);
      window.clearTimeout(fade);
    };
  }, [lines.length, reduced]);

  return (
    <span
      className={className}
      style={{
        // Opacity is the only animated property, and its resting value is 1 —
        // a stalled transition leaves the line readable, never blank.
        opacity: reduced ? 1 : shown ? 1 : 0,
        transition: reduced ? undefined : 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {lines[reduced ? 0 : index]}
    </span>
  );
}
