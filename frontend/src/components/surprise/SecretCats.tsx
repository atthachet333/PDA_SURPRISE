import { AnimatePresence, motion } from 'framer-motion';
import { anniversary } from '@/data/anniversary';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSecret } from '@/hooks/useSecret';
import { cn } from '@/lib/cn';

const CATS = anniversary.secrets.cats;

/**
 * ถ้วยฟู and หนมถ้วย, hidden in the Life scene.
 *
 * Two small celestial marks — a paw drawn as four points and a pad, in the same
 * light language as everything else in this sky. No cartoon, no illustration,
 * no colour that does not already exist here.
 *
 * Finding one names that cat. Finding both draws a line between them, which is
 * the whole joke: they are a pair. The names come from `anniversary.pets`, so
 * there is no second copy of them to drift out of sync, and nothing here
 * invents a fact about either animal.
 */
export function SecretCats({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const [first, second] = anniversary.pets;

  const firstSecret = useSecret(`${CATS.id}-0`, { duration: CATS.duration });
  const secondSecret = useSecret(`${CATS.id}-1`, { duration: CATS.duration });
  const both = firstSecret.discovered && secondSecret.discovered;

  if (!first || !second) return null;

  return (
    <div className={cn('pointer-events-none relative', className)} aria-hidden={false}>
      {/* The pair line, once both are found. */}
      <AnimatePresence>
        {both ? (
          <motion.svg
            aria-hidden="true"
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0.3 : 1.2 }}
          >
            <motion.line
              x1="14"
              y1="22"
              x2="86"
              y2="22"
              stroke="rgba(220,239,255,0.45)"
              strokeWidth="0.4"
              strokeDasharray="2 3"
              initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduced ? 0 : 1.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.svg>
        ) : null}
      </AnimatePresence>

      <div className="relative flex items-center justify-center gap-24 sm:gap-40">
        <PawMark
          name={first.name}
          secret={firstSecret}
          reduced={reduced}
          paired={both}
        />
        <PawMark
          name={second.name}
          secret={secondSecret}
          reduced={reduced}
          paired={both}
        />
      </div>
    </div>
  );
}

function PawMark({
  name,
  secret,
  reduced,
  paired
}: {
  name: string;
  secret: { discovered: boolean; revealing: boolean; discover: () => boolean };
  reduced: boolean;
  paired: boolean;
}) {
  const lit = secret.discovered;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => secret.discover()}
        /* Neutral: enough for a screen reader to know a control exists, not
           enough to announce what it hides. */
        aria-label="จุดแสงเล็ก ๆ"
        className="group pointer-events-auto relative flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-200 active:scale-90 focus-visible:outline-none"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 overflow-visible" aria-hidden="true">
          {/* Four toes and a pad, as points of light. */}
          {[
            [7, 8, 1.5],
            [11, 6, 1.6],
            [15, 7, 1.5],
            [18, 10.5, 1.3]
          ].map(([cx, cy, r]) => (
            <circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r={r}
              className={cn(
                'transition-all duration-500',
                lit ? 'fill-champagne' : 'fill-sky-100/25 group-hover:fill-sky-100/55'
              )}
              style={lit ? { filter: 'drop-shadow(0 0 4px rgba(233,213,168,0.9))' } : undefined}
            />
          ))}
          <ellipse
            cx="12"
            cy="15"
            rx="4.6"
            ry="3.6"
            className={cn(
              'transition-all duration-500',
              lit ? 'fill-champagne/90' : 'fill-sky-100/20 group-hover:fill-sky-100/45'
            )}
            style={lit ? { filter: 'drop-shadow(0 0 6px rgba(233,213,168,0.8))' } : undefined}
          />
        </svg>

        {/* Discovery bloom */}
        <AnimatePresence>
          {secret.revealing ? (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-[-0.75rem] rounded-full bg-[radial-gradient(circle,rgba(233,213,168,0.32),transparent_68%)]"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0], scale: reduced ? 1 : [0.5, 1.5, 2] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
            />
          ) : null}
        </AnimatePresence>
      </button>

      {/*
        The name stays once found — the pair line only makes sense with both
        names visible beside it.

        Same rule as SecretReveal: the resting state is VISIBLE and the keyframe
        only adds the rise. A framer entrance here would mean a name that never
        appears if the animation does not run, and this one is the content.
      */}
      {lit ? (
        <span
          className={cn(
            'secret-whisper absolute left-1/2 top-full mt-2 -translate-x-1/2 text-xs',
            paired ? 'text-champagne/90' : 'text-ivory/70'
          )}
        >
          {name}
        </span>
      ) : null}
    </div>
  );
}
