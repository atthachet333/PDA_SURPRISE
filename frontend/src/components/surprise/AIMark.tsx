import { AnimatePresence, motion } from 'framer-motion';
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
  /**
   * Brief celebratory state for the mark secret: the orbits speed up and a
   * small A - I constellation draws itself. Purely additive - the mark renders
   * and behaves identically when false, which is almost always.
   */
  excited?: boolean;
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
export function AIMark({
  size = 'inline',
  className,
  animateIn = false,
  bare = false,
  excited = false
}: AIMarkProps) {
  const reduced = useReducedMotion();
  const preset = SIZES[size];
  const mark = anniversary.couple.initials;
  const { shortA, shortB } = anniversary.couple;

  /*
   * Under reduced motion the secret still happens - it just arrives as a steady
   * glow and a drawn constellation instead of an acceleration. Nothing becomes
   * unreachable, which is the rule for every one of these.
   */
  const spin = excited && !reduced;

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
              'absolute inset-0 rounded-full border transition-colors duration-500',
              excited ? 'border-sky-100/70' : 'border-sky-200/25',
              !reduced && 'animate-spin-slower'
            )}
            style={spin ? { animationDuration: '2.4s' } : undefined}
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
              'absolute inset-[15%] rounded-full border transition-colors duration-500',
              excited ? 'border-champagne/60' : 'border-sky-100/15',
              !reduced && 'animate-spin-slow'
            )}
            style={
              reduced
                ? undefined
                : { animationDirection: 'reverse', animationDuration: spin ? '1.6s' : undefined }
            }
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

      {/*
        The constellation: two points and a line, resolving to A - I. Drawn with
        an SVG stroke rather than particles so it costs nothing, works in LOW
        quality mode, and needs no canvas.
      */}
      <AnimatePresence>
        {excited ? (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-[-14%]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.25 : 0.5 }}
          >
            <span className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,rgba(126,200,255,0.4),transparent_70%)] blur-lg" />
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
              <motion.line
                x1="26"
                y1="62"
                x2="74"
                y2="38"
                stroke="rgba(220,239,255,0.75)"
                strokeWidth="0.8"
                strokeLinecap="round"
                initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: reduced ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
              {[
                [26, 62],
                [74, 38]
              ].map(([cx, cy]) => (
                <circle key={`${cx}`} cx={cx} cy={cy} r="2.1" fill="#DCEFFF" />
              ))}
            </svg>
            <span className="absolute left-[16%] top-[58%] font-display text-[0.7em] text-ivory/90">
              {shortA}
            </span>
            <span className="absolute left-[76%] top-[24%] font-display text-[0.7em] text-ivory/90">
              {shortB}
            </span>
          </motion.span>
        ) : null}
      </AnimatePresence>

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
