import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { anniversary } from '@/data/anniversary';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export type AIMarkSize = 'nav' | 'inline' | 'loader' | 'hero';

interface AIMarkProps {
  size?: AIMarkSize;
  className?: string;
  /** Hero use: the mark assembles from light rather than simply fading in. */
  animateIn?: boolean;
  /** Hides the orbital furniture, leaving just the letterform. */
  bare?: boolean;
}

const SIZES: Record<AIMarkSize, { box: string; type: string; particle: string }> = {
  nav: { box: 'h-9 w-9', type: 'text-[0.95rem]', particle: 'h-[3px] w-[3px]' },
  inline: { box: 'h-16 w-16', type: 'text-xl', particle: 'h-1 w-1' },
  loader: { box: 'h-28 w-28', type: 'text-3xl', particle: 'h-1.5 w-1.5' },
  hero: { box: 'h-[17rem] w-[17rem] sm:h-[21rem] sm:w-[21rem]', type: 'text-[clamp(3.25rem,10vw,6rem)]', particle: 'h-1.5 w-1.5' }
};

/**
 * The A&I signature.
 *
 * One outer orbital ring, one inner orbit, a few light particles, a slow
 * breathing glow, and a highlight that travels the outer ring on a long cycle.
 * Deliberately the only place this motion is defined — nav, loader, entry and
 * finale all render this same component so the mark reads as one identity.
 */
export function AIMark({ size = 'inline', className, animateIn = false, bare = false }: AIMarkProps) {
  const reduced = useReducedMotion();
  const preset = SIZES[size];
  const mark = anniversary.couple.initials;

  return (
    <span
      className={cn('relative inline-flex shrink-0 items-center justify-center', preset.box, className)}
      aria-label={mark}
      role="img"
    >
      {!bare ? (
        <>
          {/* Breathing core glow */}
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(126,200,255,0.42),transparent_68%)] blur-md',
              !reduced && 'animate-breathe'
            )}
          />

          {/* Outer ring */}
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-0 rounded-full border border-sky-200/25',
              !reduced && 'animate-spin-slower'
            )}
          >
            <span
              className={cn(
                'absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-100 shadow-glow-sm',
                preset.particle
              )}
            />
          </span>

          {/* Highlight sweeping the outer ring */}
          {!reduced ? (
            <span aria-hidden="true" className="absolute inset-0 animate-sweep-ring">
              <span
                className="absolute left-1/2 top-0 h-[7%] w-px -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-ivory to-transparent"
                style={{ boxShadow: '0 0 12px rgba(126,200,255,0.9)' }}
              />
            </span>
          ) : null}

          {/* Inner counter-rotating orbit */}
          <span
            aria-hidden="true"
            className={cn(
              'absolute inset-[15%] rounded-full border border-sky-100/15',
              !reduced && 'animate-spin-slow'
            )}
            style={reduced ? undefined : { animationDirection: 'reverse' }}
          >
            <span
              className={cn(
                'absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-champagne/90',
                preset.particle
              )}
            />
          </span>

          {/* Free-floating motes on a third cadence */}
          {!reduced && size !== 'nav'
            ? [0, 1].map((index) => (
                <span
                  key={index}
                  aria-hidden="true"
                  className="absolute inset-[-8%] animate-spin-slower"
                  style={{
                    animationDuration: `${64 + index * 37}s`,
                    animationDirection: index % 2 ? 'reverse' : 'normal'
                  }}
                >
                  <span
                    className={cn(
                      'absolute rounded-full bg-sky-100/80',
                      preset.particle
                    )}
                    style={{ top: `${14 + index * 9}%`, left: `${index ? 82 : 16}%` }}
                  />
                </span>
              ))
            : null}
        </>
      ) : null}

      <motion.span
        className={cn('relative font-display font-light text-ivory', preset.type)}
        initial={animateIn && !reduced ? { opacity: 0, letterSpacing: '0.75em', filter: 'blur(14px)' } : false}
        animate={animateIn && !reduced ? { opacity: 1, letterSpacing: '0.14em', filter: 'blur(0px)' } : undefined}
        transition={{ duration: 2.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ letterSpacing: animateIn ? undefined : '0.14em' }}
      >
        {mark}
      </motion.span>
    </span>
  );
}
