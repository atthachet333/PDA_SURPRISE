import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { SceneSection } from '@/components/surprise/SceneSection';
import { AIMark } from '@/components/surprise/AIMark';
import { MemoryVideo } from '@/components/surprise/MemoryVideo';
import { anniversary } from '@/data/anniversary';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAudio } from '@/app/audioContext';
import { useSecret } from '@/hooks/useSecret';
import { SecretReveal } from '@/components/surprise/SecretReveal';
import { cn } from '@/lib/cn';

/**
 * Scene 12 — the close.
 *
 * Emotional job: ENORMOUS, BUT CALM. Camera language is a slow pull back.
 *
 * Year 01 fills and is archived; Year 02 begins and deliberately stops at 10%,
 * because it has not happened yet. The horizon opens as the lines land and the
 * music returns to full. Then nothing happens — no redirect, no auto-exit. The
 * visitor stays in this world as long as they want, and two quiet options
 * appear only well after the moment has passed.
 */

type Stage = 'filling' | 'archived' | 'loading' | 'lines' | 'settled';

const { finalMessages } = anniversary;

export function Scene12Final() {
  const [ref, inView] = useInViewOnce<HTMLElement>({ threshold: 0.4 });
  const [stage, setStage] = useState<Stage>('filling');
  const [yearOne, setYearOne] = useState(0);
  const [yearTwo, setYearTwo] = useState(0);
  const reduced = useReducedMotion();
  const { play, triggerCue, restart } = useAudio();

  useEffect(() => {
    if (!inView) return;
    triggerCue('finale');
    // The music opens back up on its own: the scene mix map raises `final` to
    // 0.90 over 3s as this section takes the viewport. Nothing is set here, so
    // the finale is warm rather than a jump to full.

    if (reduced) {
      setYearOne(100);
      setYearTwo(finalMessages.yearTwoProgress);
      setStage('settled');
      return;
    }

    const timers: number[] = [];
    let frame = 0;
    const began = performance.now();

    const fill = (now: number) => {
      const progress = Math.min(1, (now - began) / 2800);
      setYearOne(Math.round(progress * 100));
      if (progress < 1) {
        frame = requestAnimationFrame(fill);
        return;
      }

      play('transitionRise');
      setStage('archived');

      timers.push(
        window.setTimeout(() => {
          setStage('loading');
          const loadBegan = performance.now();
          const load = (time: number) => {
            const value = Math.min(
              finalMessages.yearTwoProgress,
              ((time - loadBegan) / 1500) * finalMessages.yearTwoProgress
            );
            setYearTwo(Math.round(value));
            if (value < finalMessages.yearTwoProgress) frame = requestAnimationFrame(load);
            else timers.push(window.setTimeout(() => setStage('lines'), 1700));
          };
          frame = requestAnimationFrame(load);
        }, 1700)
      );

      timers.push(window.setTimeout(() => setStage('settled'), 8200));
    };

    frame = requestAnimationFrame(fill);

    // Wall-clock safety net so a throttled tab still reaches the ending.
    const failsafe = window.setTimeout(() => {
      setYearOne(100);
      setYearTwo(finalMessages.yearTwoProgress);
      setStage('settled');
    }, 11_000);

    return () => {
      cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(failsafe);
    };
  }, [inView, play, reduced, triggerCue]);

  const showLines = stage === 'lines' || stage === 'settled';
  const settled = stage === 'settled';

  /*
   * THE YEAR 02 SECRET.
   *
   * Two ways in, both of them patient: touch the Year 02 indicator, or simply
   * still be here a few seconds after the finale has settled. The second is the
   * one that matters - the reward is for staying with the ending rather than
   * for hunting.
   *
   * It adds no scene and changes no state: a line appears, a faint orbit opens
   * beyond the horizon, and the finale continues exactly as before.
   */
  const FINALE = anniversary.secrets.finale;
  const finaleSecret = useSecret(FINALE.id, { duration: FINALE.duration });
  const { discover: discoverFinale, discovered: finaleFound } = finaleSecret;

  useEffect(() => {
    if (!settled || finaleFound) return;
    const timer = window.setTimeout(discoverFinale, FINALE.dwellMs);
    return () => window.clearTimeout(timer);
  }, [FINALE.dwellMs, discoverFinale, finaleFound, settled]);

  /**
   * Replay the story. The music fades out, returns to the top, and fades back in
   * around the reset — never a hard cut to full volume at zero. `restart` runs
   * the reset callback even when there is no track, so this works with music off.
   */
  const replay = useCallback(() => {
    play('softClick');
    restart(() => {
      document.getElementById('entry')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [play, restart]);

  /**
   * Back to the memories — a move WITHIN the story, so the music is untouched.
   * It keeps playing from where it is.
   */
  const toMemories = useCallback(() => {
    play('softClick');
    document.getElementById('memories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [play]);

  return (
    <SceneSection id="final" ref={ref} label="The close" className="overflow-hidden">
      {/* Horizon opens as the sequence resolves */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70vh] bg-[radial-gradient(75%_100%_at_50%_100%,rgba(255,255,255,0.32),rgba(126,200,255,0.18)_38%,transparent_74%)]"
        animate={{ opacity: showLines ? 1 : 0.3, scaleY: showLines ? 1 : 0.65 }}
        transition={{ duration: 3.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: 'bottom' }}
      />

      {/* Slow cloud drift along the horizon line */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-[12vh] h-32 bg-[linear-gradient(90deg,transparent,rgba(220,239,255,0.16),transparent)] blur-2xl"
        animate={reduced ? undefined : { x: ['-20%', '20%', '-20%'] }}
        transition={{ duration: 46, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative w-full max-w-lg">
        <p className="mb-10 text-center font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-sky-100/55">12 · YEAR 02</p>
        <ProgressBlock
          label={finalMessages.yearOneLabel}
          value={yearOne}
          state={stage === 'filling' ? 'active' : 'complete'}
          tag={stage !== 'filling' ? finalMessages.archivedLabel : undefined}
        />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{
            opacity: stage === 'loading' || showLines ? 1 : 0,
            y: stage === 'loading' || showLines ? 0 : 14
          }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-9"
        >
          <ProgressBlock label={finalMessages.yearTwoLabel} value={yearTwo} state="loading" tag="INITIALIZING" />

          {/* The indicator is touchable once the finale has settled. Before
              that it is inert, so it can never interrupt the sequence. */}
          {settled && !finaleFound ? (
            <button
              type="button"
              onClick={() => discoverFinale()}
              aria-label={finalMessages.yearTwoLabel}
              className="absolute inset-0 rounded-card transition-colors duration-300 hover:bg-sky-200/[0.06] active:bg-sky-200/[0.1] focus-visible:outline-none"
              style={{ touchAction: 'manipulation' }}
            />
          ) : null}

          <div className="pointer-events-none absolute inset-x-0 top-full mt-3 flex justify-center">
            <SecretReveal show={finaleSecret.revealing} text={FINALE.message} />
          </div>
        </motion.div>

        {/* A faint orbit beyond the horizon: there is more out there, and it has
            not happened yet. Purely decorative, and it leaves with the reveal. */}
        <AnimatePresence>
          {finaleSecret.revealing ? (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none fixed left-1/2 top-[76%] -z-10 h-[52rem] w-[52rem] -translate-x-1/2 rounded-full border border-champagne/20"
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: reduced ? 0.5 : [0, 0.6, 0.35], scale: reduced ? 1 : [0.86, 1.04, 1.1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0.4 : 4, ease: [0.16, 1, 0.3, 1] }}
            />
          ) : null}
        </AnimatePresence>

        <div className="mt-16 min-h-[9rem] text-center">
          {finalMessages.lines.map((line, index) => (
            <motion.p
              key={line}
              initial={{ opacity: 0, y: 18, filter: 'blur(9px)' }}
              animate={
                showLines
                  ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                  : { opacity: 0, y: 18, filter: 'blur(9px)' }
              }
              transition={{ duration: 1.8, delay: index * 1.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'ai-legible font-display font-light leading-snug text-ivory',
                index === 0
                  ? 'text-[clamp(1.35rem,3.2vw,2rem)] text-ivory/70'
                  : 'mt-6 text-[clamp(1.85rem,4.6vw,3.15rem)]'
              )}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.figure
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: settled ? 1 : 0, y: settled ? 0 : 18 }}
          transition={{ duration: 1.8, delay: 0.5 }}
          className="ai-frame-memory ai-photo-spill relative mx-auto mt-10 aspect-[4/5] w-40 overflow-hidden shadow-glow sm:w-48"
        >
          {/* The clip is the closing image: two shadows drawing a heart. It
              carries the ending far better than a still, and MemoryVideo falls
              back to its own poster frame under reduced motion or a load
              failure, so this never becomes an empty box. */}
          <MemoryVideo
            src={anniversary.memoryVideos.finale.src}
            poster={anniversary.memoryVideos.finale.poster}
            alt={anniversary.memoryVideos.finale.alt}
          />
        </motion.figure>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: settled ? 1 : 0 }}
          transition={{ duration: 2.4, delay: 0.8 }}
          className="mt-20 flex flex-col items-center"
        >
          <span
            aria-hidden="true"
            className="h-16 w-px bg-gradient-to-b from-transparent via-sky-200/45 to-transparent"
          />
          <div className="mt-8">
            <AIMark size="loader" />
          </div>
          <span className="ai-wordmark mt-6 text-xl">Atthachet &amp; Isariya</span>
          <span className="mt-3 font-mono text-[0.5625rem] tracking-[0.24em] text-sky-100/55">12.10.2025 — ∞</span>
        </motion.div>

        {/* Offered late, and quietly — the moment comes first */}
        <AnimatePresence>
          {settled ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.6, delay: 3.2 }}
              className="mt-14 flex flex-wrap items-center justify-center gap-3"
            >
              <FinalButton onClick={toMemories}>{finalMessages.memoriesLabel}</FinalButton>
              <FinalButton onClick={replay} subtle>
                {finalMessages.replayLabel}
              </FinalButton>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </SceneSection>
  );
}

function FinalButton({
  onClick,
  subtle = false,
  children
}: {
  onClick: () => void;
  subtle?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="interactive"
      className={cn(
        subtle ? 'ai-button-text' : 'ai-button-secondary'
      )}
    >
      {children}
    </button>
  );
}

function ProgressBlock({
  label,
  value,
  state,
  tag
}: {
  label: string;
  value: number;
  state: 'active' | 'complete' | 'loading';
  tag?: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-display text-lg uppercase tracking-[0.18em] text-ivory/85 sm:text-xl">
          {label}
        </span>
        <span className="font-mono text-[0.6875rem] tabular-nums text-sky-100/80">{value}%</span>
      </div>

      <div className="mt-3 h-px w-full overflow-hidden bg-ivory/12">
        <motion.span
          className={cn('block h-full', state === 'loading' ? 'bg-champagne/85' : 'bg-ivory/85')}
          style={{ width: `${value}%` }}
        />
      </div>

      {tag ? (
        <motion.span
          initial={{ opacity: 0, letterSpacing: '0.6em' }}
          animate={{ opacity: 1, letterSpacing: '0.34em' }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 block font-mono text-[0.5625rem] uppercase text-champagne/85"
        >
          {tag}
        </motion.span>
      ) : null}
    </div>
  );
}
