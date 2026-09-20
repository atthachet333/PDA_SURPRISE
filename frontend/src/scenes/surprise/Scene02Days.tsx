import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { SceneSection } from '@/components/surprise/SceneSection';
import { anniversary } from '@/data/anniversary';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAudio } from '@/app/audioContext';
import { useLongPress } from '@/hooks/useLongPress';
import { useSecret } from '@/hooks/useSecret';
import { SecretReveal } from '@/components/surprise/SecretReveal';
import { pad } from '@/lib/format';
import { LiveDuration } from '@/components/surprise/LiveDuration';

/**
 * Scene 02 — DAY 001 to DAY 365. The signature beat.
 *
 * Emotional job: BUILD then WOW.
 *
 * The count is paced by an explicit keyframe table rather than one easing
 * curve, because the drama is entirely in where it hesitates: slow off the
 * line, a long accelerating middle, a deliberate ratchet through 360-364, then
 * a full stop before the reveal lands.
 */

/**
 * The target is the REAL number of days together, derived from
 * `relationshipStartDate`. Nothing here assumes 365, so the beat stays correct
 * as the count grows.
 */
const TARGET = anniversary.dayCounter.target;

/**
 * Wall-clock seconds at which the counter should read a given FRACTION of the
 * target. Expressed as fractions rather than absolute days so the shape of the
 * beat — slow off the line, fast middle, braking — holds at any count.
 */
const PACE: { frac: number; at: number }[] = [
  { frac: 0, at: 0 },
  { frac: 0.016, at: 1.05 }, // slow off the line — every early day counted
  { frac: 0.082, at: 1.95 },
  { frac: 0.214, at: 2.7 },
  { frac: 0.34, at: 3.25 },
  { frac: 0.551, at: 3.95 }, // fastest stretch
  { frac: 0.789, at: 4.6 },
  { frac: 0.932, at: 5.25 },
  { frac: 0.973, at: 5.9 },  // braking
  { frac: 0.986, at: 6.35 }
];

/** Day number for a fraction of the way through, never below day 1. */
const dayAtFraction = (frac: number): number => Math.max(1, Math.round(frac * TARGET));

/** The last four days tick individually, with air between them. */
const RATCHET = [TARGET - 4, TARGET - 3, TARGET - 2, TARGET - 1].filter((day) => day >= 1);
const RATCHET_STEP = 0.34;
const RATCHET_START = 6.35;
/** Full stop on the day before the reveal. */
const HOLD_DAY = Math.max(1, TARGET - 1);
const HOLD = 1.15;

const COUNT_END = RATCHET_START + RATCHET.length * RATCHET_STEP;
const REVEAL_AT = COUNT_END + HOLD;

function dayAtTime(seconds: number): number {
  if (seconds <= 0) return 1;

  if (seconds >= RATCHET_START) {
    const index = Math.floor((seconds - RATCHET_START) / RATCHET_STEP);
    return RATCHET[Math.min(index, RATCHET.length - 1)] ?? HOLD_DAY;
  }

  for (let i = 0; i < PACE.length - 1; i += 1) {
    const from = PACE[i];
    const to = PACE[i + 1];
    if (!from || !to) break;
    if (seconds <= to.at) {
      const span = to.at - from.at || 1;
      const t = (seconds - from.at) / span;
      return dayAtFraction(from.frac + (to.frac - from.frac) * t);
    }
  }
  return dayAtFraction(0.986);
}

export function Scene02Days() {
  const [ref, inView] = useInViewOnce<HTMLElement>({ threshold: 0.5 });
  const [day, setDay] = useState(1);
  const [phase, setPhase] = useState<'idle' | 'counting' | 'holding' | 'revealed'>('idle');
  const reduced = useReducedMotion();
  const { play, onCue, triggerCue } = useAudio();
  const started = useRef(false);

  // A music cue can also fire the reveal when a track is present.
  useEffect(() => onCue('day365', () => setPhase('revealed')), [onCue]);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;

    if (reduced) {
      setDay(TARGET);
      setPhase('revealed');
      return;
    }

    triggerCue('dayStart');
    setPhase('counting');

    const began = performance.now();
    let frame = 0;
    let ticks = 0;
    let lastTickDay = 0;
    let impactPlayed = false;

    const tick = (now: number) => {
      const seconds = (now - began) / 1000;

      if (seconds < COUNT_END) {
        const next = dayAtTime(seconds);
        setDay(next);
        /*
         * AUDIBLE STEPS ONLY. Two soft ticks as the count leaves day one, then
         * nothing at all through the accelerating middle, then one tick for each
         * of the final ratchet days. Every other visible change is silent — a
         * tick per day would be hundreds of them.
         */
        if (next !== lastTickDay) {
          const opening = ticks < 2 && seconds < 1.3;
          const ratcheting = seconds >= RATCHET_START;
          if (opening || ratcheting) {
            lastTickDay = next;
            ticks += 1;
            play('softClick');
          }
        }
        frame = requestAnimationFrame(tick);
        return;
      }

      if (seconds < REVEAL_AT) {
        setDay(HOLD_DAY);
        setPhase('holding');
        frame = requestAnimationFrame(tick);
        return;
      }

      setDay(TARGET);
      setPhase('revealed');
      if (!impactPlayed) {
        impactPlayed = true;
        /*
         * The landing is on the REAL current day, whatever it is today. Before
         * the anniversary that is the true count; on the day itself it happens
         * to be 365. Nothing here celebrates a completion that has not happened.
         */
        play('softImpact');
        triggerCue('day365');
      }
    };

    frame = requestAnimationFrame(tick);

    // Wall-clock safety net: if frames never arrive, still land the reveal.
    const failsafe = window.setTimeout(
      () => {
        setDay(TARGET);
        setPhase('revealed');
      },
      (REVEAL_AT + 1) * 1000
    );

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(failsafe);
    };
  }, [inView, play, reduced, triggerCue]);

  const revealed = phase === 'revealed';
  const holding = phase === 'holding';

  /*
   * THE 365 SECRET.
   *
   * Hold the numeral and it shows the count against the milestone. The two
   * states are NOT cosmetic: before the anniversary it reads the real current
   * day over 365 and says the counting is still going, and only on or after day
   * 365 does it say Year 01 is complete. Showing completion early would be the
   * one lie this whole experience has been built to avoid.
   *
   * Offered only once the counter has landed, so it can never interfere with
   * the signature beat.
   */
  const DAY_SECRET = anniversary.secrets.day;
  const daySecret = useSecret(DAY_SECRET.id, { duration: DAY_SECRET.duration });
  const { milestone } = anniversary.project;
  const yearOneComplete = TARGET >= milestone;
  const hold = useLongPress(daySecret.discover, {
    ms: DAY_SECRET.holdMs,
    enabled: revealed && !daySecret.discovered
  });

  return (
    <SceneSection id="days" ref={ref} label="001 ถึงวันนี้" className="overflow-hidden text-center">
      {/* Radial light burst */}
      <AnimatePresence>
        {revealed ? (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.15 }}
            animate={{ opacity: [0, 0.95, 0.2], scale: [0.15, 1.6, 2.9] }}
            transition={{ duration: 2.6, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.9),rgba(126,200,255,0.4)_36%,transparent_70%)] blur-2xl"
          />
        ) : null}
      </AnimatePresence>

      {/* Particles thrown outward on the reveal */}
      <AnimatePresence>
        {revealed && !reduced ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {Array.from({ length: 28 }).map((_, index) => {
              const angle = (index / 28) * Math.PI * 2;
              const distance = 26 + ((index * 13) % 18);
              return (
                <motion.span
                  key={index}
                  className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-sky-100"
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.6 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: `${Math.cos(angle) * distance}vmin`,
                    y: `${Math.sin(angle) * distance}vmin`,
                    scale: [0.6, 1, 0.2]
                  }}
                  transition={{ duration: 2.4, delay: 0.1 + (index % 6) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                />
              );
            })}
          </div>
        ) : null}
      </AnimatePresence>

      {/* Ring system: tightens during the hold, expands on the reveal */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: revealed ? 1.18 : holding ? 0.94 : 1,
          opacity: revealed ? 1 : holding ? 0.35 : 0.55
        }}
        transition={{ duration: revealed ? 2.2 : 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {[20, 29, 40].map((size, index) => (
          <span
            key={size}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-200/15 animate-spin-slower"
            style={{
              width: `${size}rem`,
              height: `${size}rem`,
              animationDuration: `${62 + index * 31}s`,
              animationDirection: index % 2 ? 'reverse' : 'normal'
            }}
          />
        ))}
      </motion.div>

      <div className="relative">
        <motion.p
          animate={{ opacity: holding ? 0.35 : 0.6 }}
          className="font-mono text-[0.625rem] uppercase tracking-[0.44em] text-sky-100"
        >
          01 · DAYS
        </motion.p>

        <div className="relative mt-4 flex justify-center">
          {/*
            A plain span, not a button: this is the hero numeral of the scene and
            turning it into a control would put a focus ring and a pressed state
            on the single most important piece of type in the story. The hold is
            an extra on top of decoration, and the number itself is already read
            out as text.
          */}
          <motion.span
            animate={
              revealed
                ? { scale: [1, 1.14, 1], filter: ['blur(8px)', 'blur(0px)'] }
                : holding
                  ? { scale: 0.985 }
                  : { scale: 1 }
            }
            transition={{ duration: revealed ? 1.8 : 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="ai-legible select-none font-display text-[clamp(5rem,19vw,12rem)] font-light leading-none tabular-nums text-ivory"
            style={{
              textShadow:
                hold.holding || daySecret.revealing
                  ? '0 0 120px rgba(233,213,168,0.85)'
                  : revealed
                    ? '0 0 90px rgba(255,255,255,0.6)'
                    : undefined,
              touchAction: 'manipulation'
            }}
            {...hold.handlers}
          >
            {pad(day, 3)}
          </motion.span>

          {/* The hold has to be visible while it happens, or it is a secret
              nobody can tell they are close to finding. */}
          {hold.holding && !reduced ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-3 left-1/2 h-px w-32 -translate-x-1/2 overflow-hidden bg-ivory/15"
            >
              <span
                className="block h-full bg-champagne/80 transition-none"
                style={{ width: `${Math.round(hold.progress * 100)}%` }}
              />
            </span>
          ) : null}
        </div>

        {/* The hidden layer */}
        <AnimatePresence>
          {daySecret.revealing ? (
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.3 : 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none absolute inset-x-0 -bottom-2 flex flex-col items-center gap-1"
            >
              <span className="font-mono text-[0.6875rem] tracking-[0.3em] text-champagne/90">
                {yearOneComplete
                  ? `${milestone} / YEAR 01 COMPLETE`
                  : `${TARGET} / ${milestone}`}
              </span>
              <SecretReveal show text={DAY_SECRET.message} polite={false} />
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="mt-10 min-h-[7rem]">
          <AnimatePresence mode="wait">
            {revealed ? (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="ai-legible font-display text-[clamp(1.75rem,4.4vw,3rem)] font-light tracking-[0.06em] text-ivory">
                  {anniversary.dayCounter.headline}
                </p>
                {anniversary.dayCounter.subline.map((line, index) => (
                  <motion.p
                    key={line}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.4, delay: 1.1 + index * 0.45 }}
                    className="mt-1.5 font-display text-[clamp(1rem,2.3vw,1.5rem)] italic text-sky-100/85"
                  >
                    {line}
                  </motion.p>
                ))}
                <LiveDuration showDays={false} className="mt-8" />
              </motion.div>
            ) : (
              <motion.p
                key="counting"
                exit={{ opacity: 0 }}
                animate={{ opacity: holding ? 0 : 0.3 }}
                transition={{ duration: 0.6 }}
                className="font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-ivory"
              >
                กำลังนับ
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SceneSection>
  );
}
