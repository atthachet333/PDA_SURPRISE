import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePageVisible } from '@/hooks/usePageVisible';
import { primaryServices } from '@/data/services';
import { cn } from '@/lib/cn';

/**
 * KINETIC MARQUEE — the seven services as moving display type.
 *
 * Two rows travelling in opposite directions at different speeds, so it reads
 * as depth rather than as a news ticker. Solid and outlined words alternate,
 * which gives the row rhythm without adding colour.
 *
 * Implementation notes
 *   - Each row renders its content TWICE and translates by -50%, which is what
 *     makes the loop seamless at any viewport width.
 *   - Driven by a CSS animation, not JS: it stays smooth while the main thread
 *     is busy, and the browser pauses it for us on hidden tabs.
 *   - Under `prefers-reduced-motion` the rows stop and become a static,
 *     readable strip. The words are the content, so they must never depend on
 *     motion to be legible.
 */

/** Technical English names, which is how these are said out loud in the trade. */
const WORDS = primaryServices.map((service) => service.nameEn.toUpperCase());

export function KineticMarquee({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const visible = usePageVisible();
  const running = !reduced && visible;

  return (
    <section
      className={cn('sect sect--grid relative overflow-hidden border-y border-steel-200 py-10 sm:py-14', className)}
      aria-label="บริการของ PDA BLISS"
    >
      <div className="sect-layer grid-lines opacity-60" aria-hidden="true" />

      {/* Both rows are decorative; the names stay available here as real text. */}
      <MarqueeWordList />

      <div className="marquee-mask relative flex flex-col gap-3 sm:gap-5">
        <MarqueeRow words={WORDS} running={running} direction="left" speed="38s" />
        <MarqueeRow words={[...WORDS].reverse()} running={running} direction="right" speed="54s" muted />
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
        {/* Rendered twice — the second copy is what the -50% translate lands on. */}
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {words.map((word, index) => (
              <span key={`${copy}-${word}`} className="flex items-center">
                <span
                  className={cn(
                    'thai-display whitespace-nowrap px-4 font-semibold sm:px-7',
                    muted ? 'text-[clamp(1.5rem,4vw,3.25rem)]' : 'text-[clamp(2rem,6vw,5.5rem)]',
                    // Alternate solid and outlined so the row has texture.
                    index % 2 === 0
                      ? muted
                        ? 'text-steel-300'
                        : 'text-ink'
                      : muted
                        ? 'text-outline text-steel-300'
                        : 'text-outline text-brand-500'
                  )}
                >
                  {word}
                </span>
                <span
                  className={cn(
                    'shrink-0 rounded-full bg-brand-500',
                    muted ? 'h-1 w-1' : 'h-1.5 w-1.5'
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

/**
 * Screen-reader and no-motion fallback list. Rendered visually hidden inside the
 * marquee section so the service names are always available as text.
 */
export function MarqueeWordList() {
  return (
    <ul className="sr-only">
      {primaryServices.map((service) => (
        <li key={service.id}>{service.title}</li>
      ))}
    </ul>
  );
}
