import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SceneSection } from '@/components/surprise/SceneSection';
import { AIMark } from '@/components/surprise/AIMark';
import { anniversary } from '@/data/anniversary';
import { useAudio } from '@/app/audioContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ArrivalWhisper } from '@/components/surprise/ArrivalWhisper';
import { useMagnetic } from '@/hooks/useMagnetic';
import {
  ARRIVAL_CUES as CUE_AT,
  ARRIVAL_CUES_FROM_GATEWAY as CUE_AT_FROM_GATEWAY,
  ARRIVAL_ENTRY_FROM_GATEWAY,
  ARRIVAL_SETTLE_FROM_GATEWAY_MS,
  ARRIVAL_SETTLE_MS,
  ARRIVAL_STEP as STEP
} from '@/lib/gatewayTiming';

/**
 * Scene 01 — arrival.
 *
 * Emotional job: CALM. The visitor has just come through the portal, so this
 * scene resolves rather than escalates. A white flash settles into sky, the
 * mark assembles from light, then the copy arrives one line at a time and the
 * single call to action appears last.
 */

const { intro } = anniversary;

export function Scene01Entry({ onEnter }: { onEnter: () => void }) {
  const { play, triggerCue } = useAudio();
  const reduced = useReducedMotion();
  /* Read once. A later state change must not restart the arrival. */
  const [fromGateway] = useState(
    () => Boolean((window.history.state as { usr?: { fromGateway?: boolean } } | null)?.usr?.fromGateway)
  );
  const [step, setStep] = useState<number>(
    reduced ? STEP.READY : fromGateway ? ARRIVAL_ENTRY_FROM_GATEWAY : STEP.MARK
  );
  /*
   * Set once the sequence is over AND its longest transition has had time to
   * finish. From then on the reveal styles carry no `transition` at all, so the
   * arrival is plain static markup: any later re-render, any engine that has
   * stopped its animation clock, any repaint — all land on the final value
   * immediately. The choreography exists for the first few seconds of the first
   * visit and then gets out of the way entirely.
   */
  const [settled, setSettled] = useState(reduced);
  const stage = step >= STEP.READY ? 'ready' : 'entering';
  /*
   * A very light magnetic pull on the one call to action — 0.12, roughly a
   * tenth of the pointer's offset, so the button leans toward the cursor rather
   * than chasing it. It lives on a WRAPPER, not on the button: the button is a
   * `motion.button` and framer already owns its transform, so two writers on
   * the same property would fight every frame. The hook no-ops on touch and
   * under reduced motion.
   */
  const magnet = useMagnetic<HTMLSpanElement>(0.12);

  useEffect(() => {
    if (reduced) return;

    // `Math.max` so a skip can never be undone by a timer that was already in
    // flight — the sequence only ever moves forward.
    const advance = (to: number) => setStep((current) => Math.max(current, to));
    const timers = (fromGateway ? CUE_AT_FROM_GATEWAY : CUE_AT).map(([to, ms]) =>
      window.setTimeout(() => {
        advance(to);
        if (to === STEP.READY) triggerCue('entry');
      }, ms)
    );

    /*
     * THE SEQUENCE IS AN OFFER, NOT A GATE.
     *
     * Anyone who touches anything — pointer, key, wheel, scroll — has told us
     * they are here and do not want to watch a title sequence. That skips
     * straight to the end rather than pausing or replaying, so nobody is ever
     * waiting on choreography to reach the button. The listeners detach as
     * soon as they have done their job.
     */
    const skip = () => {
      advance(STEP.READY);
      triggerCue('entry');
      detach();
    };
    const detach = () => {
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
      window.removeEventListener('wheel', skip);
      window.removeEventListener('touchstart', skip);
    };
    window.addEventListener('pointerdown', skip, { passive: true });
    window.addEventListener('keydown', skip);
    window.addEventListener('wheel', skip, { passive: true });
    window.addEventListener('touchstart', skip, { passive: true });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      detach();
    };
  }, [fromGateway, reduced, triggerCue]);

  /*
   * A single wall-clock guarantee, independent of every timer above and of the
   * skip handler. Whatever happens to the sequence, the arrival is fully
   * visible and transition-free by this point.
   */
  useEffect(() => {
    if (reduced) return;
    const done = window.setTimeout(
      () => {
        setStep((current) => Math.max(current, STEP.READY));
        setSettled(true);
      },
      fromGateway ? ARRIVAL_SETTLE_FROM_GATEWAY_MS : ARRIVAL_SETTLE_MS
    );
    return () => window.clearTimeout(done);
  }, [fromGateway, reduced]);

  /*
   * THE REVEAL IS A CSS TRANSITION, NOT AN ANIMATION LIBRARY CALL.
   *
   * This matters more than it looks. A framer `animate` target is reached by
   * interpolating on requestAnimationFrame — if those frames never come (a
   * background tab during load, a stalled first paint, a throttled renderer),
   * the element is left at the value it started from, which here is invisible.
   * The arrival would strand at opacity 0 with no way back.
   *
   * With a declarative style the TARGET is always in the DOM and the transition
   * only decides how it is reached. Drop every frame and the text simply
   * appears, which is exactly the failure mode we want.
   */
  const cue = (at: number, delay = 0) => {
    const on = reduced || settled || step >= at;
    return {
      opacity: on ? 1 : 0,
      translate: on ? '0 0' : '0 14px',
      /* See the note below on why this is 'none' rather than undefined. */
      transition:
        reduced || settled
          ? 'none'
          : `opacity 1400ms var(--ease-entrance) ${delay}ms, translate 1400ms var(--ease-entrance) ${delay}ms`
    } as const;
  };

  return (
    <SceneSection id="entry" label="00 · Arrival" className="text-center">
      {/* The portal hands over on white; it opens into sky here. */}
      <AnimatePresence>
        {step < STEP.ORBIT && !reduced ? (
          <motion.span
            key="flash"
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[5] bg-ivory"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : null}
      </AnimatePresence>

      <div className="relative flex flex-col items-center">
        <motion.div
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <AIMark size="hero" />
        </motion.div>

        <p style={cue(STEP.WORDMARK)} className="ai-wordmark mt-7 text-[clamp(1rem,2vw,1.35rem)]">
          Atthachet &amp; Isariya
        </p>

        {/* The line that quietly changes its mind. Given a little more presence
            than it had — it is the first sign the page is alive, and at /65 on a
            dark sky it read as a caption someone forgot to remove. */}
        <div style={cue(STEP.WHISPER)}>
          <ArrivalWhisper className="mt-5 block min-h-7 font-thai text-[0.9375rem] leading-7 tracking-[0.03em] text-sky-100/80" />
        </div>

        <div className="mt-7 flex flex-col items-center px-2">
          {intro.title.map((line, index) => (
            <p
              key={line}
              style={cue(STEP.TITLE, index * 280)}
              className="thai-display ai-legible font-thai text-[clamp(1.75rem,4.2vw,2.75rem)] font-light text-ivory"
            >
              {line}
            </p>
          ))}

          <p
            style={cue(STEP.READY)}
            className="mt-7 flex max-w-[18rem] flex-col items-center justify-center gap-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-sky-100/70 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-x-3 sm:gap-y-1 sm:text-[0.625rem] sm:tracking-[0.3em]"
          >
            {intro.subtitle.map((line, index) => (
              <span key={line} className="flex items-center gap-3">
                {index > 0 ? <span className="hidden h-1 w-1 rounded-full bg-sky-200/40 sm:block" /> : null}
                {line}
              </span>
            ))}
          </p>
        </div>

        {/* Wrapper carries the magnetic transform; the button carries framer's. */}
        <span ref={magnet} className="mt-14 inline-flex">
          <button
            type="button"
            /* Clickable throughout, including while it is still fading in: the
               reveal describes the arrival, it does not withhold it. */
            style={{ ...cue(STEP.READY), pointerEvents: 'auto' }}
            onClick={() => {
              play('airWhoosh');
              onEnter();
            }}
            data-cursor="enter"
            className="ai-button-primary group min-h-12 px-9"
          >
            <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(220,239,255,0.28),transparent)] transition-transform duration-[1500ms] ease-smooth group-hover:translate-x-full" />
            <span className="absolute inset-0 rounded-pill bg-sky-400/0 transition-colors duration-slow group-hover:bg-sky-400/10" />
            <span className="relative flex items-center gap-3">
              {intro.cta}
              <span aria-hidden="true" className="transition-transform duration-base group-hover:translate-x-1">
                →
              </span>
            </span>
          </button>
        </span>
      </div>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: stage === 'ready' ? [0, 0.55, 0] : 0 }}
        transition={{ duration: 3.4, delay: 1.2, repeat: Infinity }}
        className="absolute bottom-10 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[0.5rem] uppercase tracking-[0.3em] text-ivory/40">เลื่อนลง</span>
        <span className="h-9 w-px bg-gradient-to-b from-sky-200/60 to-transparent" />
      </motion.div>
    </SceneSection>
  );
}
