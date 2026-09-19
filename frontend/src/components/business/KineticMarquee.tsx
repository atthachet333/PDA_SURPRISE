import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePageVisible } from '@/hooks/usePageVisible';
import { primaryServices } from '@/data/services';
import { cn } from '@/lib/cn';
import { SectionBackdrop } from './SectionBackdrop';

/**
 * KINETIC SERVICE STRIP — motion branding, not content.
 *
 * One primary row of service names with a thin secondary row beneath it.
 *
 * SIZING IS THE POINT: an earlier version ran at 86px type inside a 306px band,
 * which took a third of the viewport and pushed real content down. It is capped
 * at the `marquee` token (36px to 64px) inside a ~130-170px band, so it reads as
 * a branded divider between the hero and the showreel.
 *
 * - Each row renders twice and translates -50%, which is what makes the loop
 *   seamless at any width.
 * - Driven by a CSS animation, so it stays smooth off the main thread and the
 *   browser pauses it on hidden tabs for us.
 * - Under reduced motion the rows stop and stay perfectly readable; the names
 *   are also always present as real text for assistive tech.
 */

const WORDS = primaryServices.map((service) => service.nameEn.toUpperCase());

export function KineticMarquee({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const visible = usePageVisible();
  const running = !reduced && visible;

  return (
    <section
      className={cn(
        'sect sect--grid relative overflow-hidden border-y border-steel-200 py-6 sm:py-7',
        className
      )}
      aria-label="บริการของ PDA BLISS"
    >
      <SectionBackdrop variant="light-grid" intensity={0.5} />

      {/* The names as real text, for screen readers and for no-CSS fallback. */}
      <ul className="sr-only">
        {primaryServices.map((service) => (
          <li key={service.id}>{service.title}</li>
        ))}
      </ul>

      <div className="marquee-mask relative flex flex-col gap-1.5">
        <MarqueeRow words={WORDS} running={running} direction="left" speed="46s" />
        <MarqueeRow words={[...WORDS].reverse()} running={running} direction="right" speed="68s" muted />
      </div>
    </section>
  );
}

function MarqueeRow({
  words,
  running,
  direction,
  speed,
  muted = false
}: {
  words: string[];
  running: boolean;
  direction: 'left' | 'right';
  speed: string;
  muted?: boolean;
}) {
  return (
    <div className="flex overflow-hidden" aria-hidden="true">
      <div
        className="marquee-track"
        style={
          running
            ? {
                animationName: 'marquee-x',
                animationDuration: speed,
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
                animationDirection: direction === 'right' ? 'reverse' : 'normal'
              }
            : undefined
        }
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {words.map((word, index) => (
              <span key={`${copy}-${word}`} className="flex items-center">
                <span
                  className={cn(
                    'thai-display whitespace-nowrap font-semibold',
                    muted
                      ? 'px-3 text-[0.8125rem] uppercase tracking-[0.18em] text-steel-400 sm:px-4 sm:text-sm'
                      : 'px-4 text-marquee sm:px-6',
                    // Alternate solid and outlined so the row has texture
                    // without needing scale to be interesting.
                    !muted && (index % 2 === 0 ? 'text-ink' : 'text-outline text-brand-500')
                  )}
                >
                  {word}
                </span>
                <span
                  className={cn(
                    'shrink-0 rounded-full bg-brand-500',
                    muted ? 'h-[3px] w-[3px]' : 'h-1.5 w-1.5'
                  )}
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
