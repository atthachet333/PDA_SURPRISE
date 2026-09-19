import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

/**
 * REVEAL LINES — masked headline reveal that cannot fail hidden.
 *
 * THE BUG THIS FIXES
 *   Headlines were built as `overflow: hidden` boxes whose inner span STARTED
 *   at `translateY(108%)` and animated up. That makes the hidden position the
 *   element's default, so anything that stops the animation — a backgrounded
 *   tab pausing rAF, a throttled browser, a `whileInView` observer that never
 *   fires — leaves the text clipped out of its own box forever. The START
 *   heading rendered blank because of exactly this.
 *
 * HOW THIS IS DIFFERENT
 *   1. The natural CSS state is VISIBLE. The hidden position exists only inside
 *      a running keyframe (see `.reveal-line` in global.css).
 *   2. The animation is armed only when the block scrolls into view AND the
 *      document is visible, so it is never armed into a paused state.
 *   3. A watchdog disarms it after the animation should have finished. Even if
 *      the animation is frozen mid-flight, the text returns to its natural
 *      position within about a second.
 *
 * Animation may enhance the arrival of this text. It can never be required for
 * the text to exist.
 */

interface RevealLinesProps {
  /** One entry per visual line. Thai must be split explicitly — it has no
   *  inter-word spaces, so a browser left to wrap will break mid-word. */
  lines: React.ReactNode[];
  className?: string;
  /** Per-line stagger, ms. */
  stagger?: number;
  duration?: number;
  /** Class applied to each line's inner span, e.g. to colour one line. */
  lineClassName?: (index: number) => string | undefined;
  as?: 'h1' | 'h2' | 'p' | 'div';
}

export function RevealLines({
  lines,
  className,
  stagger = 110,
  duration = 900,
  lineClassName,
  as: Tag = 'div'
}: RevealLinesProps) {
  const hostRef = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const node = hostRef.current;
    if (!node) return;

    // Never arm while the document is hidden: a paused animation would hold the
    // `from` keyframe and re-create the very bug this component exists to fix.
    if (document.visibilityState === 'hidden') return;

    let disarm = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setArmed(true);

        // Watchdog: once the animation should be over, drop the class so the
        // element rests in its natural (visible) state no matter what happened.
        disarm = window.setTimeout(
          () => setArmed(false),
          duration + stagger * lines.length + 400
        );
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(disarm);
    };
  }, [duration, lines.length, reduced, stagger]);

  return (
    <Tag ref={hostRef as React.RefObject<HTMLHeadingElement>} className={className}>
      {lines.map((line, index) => (
        <span
          // Lines are a fixed authored list, so the index is a stable key.
          key={index}
          className={cn('reveal-line', armed && 'is-armed')}
          style={
            {
              '--reveal-duration': `${duration}ms`,
              '--reveal-delay': `${index * stagger}ms`
            } as React.CSSProperties
          }
        >
          <span className={lineClassName?.(index)}>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
