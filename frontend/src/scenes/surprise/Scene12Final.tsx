import { useCallback, useEffect, useMemo, useState } from 'react';
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
 * THE SHAPE OF THE ENDING
 *
 *   YEAR 01 fills          what happened
 *   COMPLETE               and it is behind us
 *   the echo               four fragments of it, passing
 *   stillness              a real pause, with nothing on screen
 *   YEAR 02 begins         and stops at 10%, because it has not happened
 *   the path opens         and leaves the frame
 *   the lines land         the only two sentences that matter
 *   A&I · 12.10.2025 — ∞   the identity, and no full stop
 *
 * Then nothing happens. No redirect, no auto-exit. The two quiet options appear
 * only well after the moment has passed.
 *
 * ── WHY THERE IS NO ANIMATION LIBRARY IN HERE ─────────────────────────────────
 *
 * Every element below was previously mounted at `opacity: 0` and brought back by
 * a framer `animate` target, which is reached by interpolating on animation
 * frames. When those frames do not arrive — a throttled tab, a stalled first
 * paint, a slow phone finishing layout — the element is left at the value it
 * started from, and the value it started from is invisible. Measured in a real
 * browser session, the two closing lines of the entire experience were sitting
 * at `opacity: 0`, and the replay controls never rendered at all.
 *
 * So the sequence is now wall-clock timers plus declarative CSS. The TARGET is
 * always in the DOM; the transition only decides how it is reached. Drop every
 * frame and the ending simply appears, fully formed. `locked` then removes the
 * transitions altogether once the sequence is over, so every later render is
 * static markup that cannot be held back by anything.
 */

/** Ordered beats. Each value is milliseconds from the scene coming into view. */
const BEAT = {
  YEAR_ONE: 0,
  COMPLETE: 2800,
  ECHO: 3600,
  STILLNESS: 6400,
  YEAR_TWO: 7200,
  PATH: 8800,
  LINES: 9800,
  IDENTITY: 12400,
  /** Sequence over. Beyond this point nothing animates. */
  LOCKED: 16000
} as const;

/** How long after the ending settles the two options are offered. */
const OPTIONS_AFTER_MS = 3200;

const { finalMessages } = anniversary;

export function Scene12Final() {
  const [ref, inView] = useInViewOnce<HTMLElement>({ threshold: 0.4 });
  const reduced = useReducedMotion();
  const { play, triggerCue, restart } = useAudio();

  /** Milliseconds into the sequence. Only ever moves forward. */
  const [beat, setBeat] = useState(reduced ? BEAT.LOCKED : -1);
  const [locked, setLocked] = useState(reduced);

  /*
   * THE ECHO.
   *
   * Four fragments of the year that just ended, passing through and gone. They
   * are titles and dates that already exist in the story — nothing new is
   * written here, and no photograph is involved, so this owes nothing to the
   * pending photo work. It is the same handoff language the rest of the
   * experience uses: a fragment of one scene carried into the next.
   */
  const echo = useMemo(
    () =>
      anniversary.memories
        .filter((memory) => memory.featured && memory.date)
        .slice(0, 4)
        .map((memory) => ({ id: memory.id, title: memory.title, date: memory.date })),
    []
  );

  /*
   * HAS THE ENDING BEEN REACHED?
   *
   * `useInViewOnce` is an IntersectionObserver, and an observer is one more
   * thing that can fail to deliver — measured in this project's own tooling,
   * where no callback ever arrives and the entire sequence therefore never
   * started. The ending of the experience must not be contingent on that.
   *
   * So arrival is decided two ways: the observer when it works, and otherwise a
   * direct measurement. The measurement is polled rather than driven by scroll
   * events, because a smooth-scroll library can move the page without emitting
   * one — measured here, `window.scrollTo` produced zero scroll events while the
   * section was demonstrably on screen.
   *
   * Twice a second is nothing, it forces layout on a single element, and it
   * stops permanently the moment it has an answer. This is a visibility probe,
   * not an animation loop.
   */
  const [reached, setReached] = useState(false);

  useEffect(() => {
    if (reduced || reached) return;
    if (inView) {
      setReached(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const check = () => {
      const rect = node.getBoundingClientRect();
      // Same intent as threshold 0.4: a decent part of the scene is on screen.
      if (rect.top < window.innerHeight * 0.6 && rect.bottom > 0) setReached(true);
    };

    check();
    const probe = window.setInterval(check, 500);
    return () => window.clearInterval(probe);
  }, [inView, reached, reduced, ref]);

  /*
   * THE LAST RESORT.
   *
   * Not gated on arrival, not gated on anything. If every detection path above
   * fails, the ending is still complete and readable — late, but present. This
   * is the line that makes the rule in the header true rather than aspirational:
   * no observer, no event and no animation frame can leave this scene empty.
   */
  useEffect(() => {
    if (reduced) return;
    const guarantee = window.setTimeout(() => {
      setBeat((current) => Math.max(current, BEAT.LOCKED));
      setLocked(true);
    }, 30_000);
    return () => window.clearTimeout(guarantee);
  }, [reduced]);

  useEffect(() => {
    if (!reached || reduced) return;
    triggerCue('finale');
    // The music opens back up on its own: the scene mix map raises `final` to
    // 0.90 over 3s as this section takes the viewport. Nothing is set here.

    const advance = (to: number) => setBeat((current) => Math.max(current, to));
    const timers = Object.values(BEAT).map((at) =>
      window.setTimeout(() => {
        advance(at);
        if (at === BEAT.COMPLETE) play('transitionRise');
        if (at === BEAT.LOCKED) setLocked(true);
      }, at)
    );
    // Start immediately rather than waiting for the 0ms timer to be serviced.
    advance(BEAT.YEAR_ONE);

    /*
     * One wall-clock guarantee, independent of every timer above. Whatever
     * happens to the sequence, the ending is complete and transition-free by
     * this point — it can be late, it can never be missing.
     */
    const failsafe = window.setTimeout(() => {
      setBeat(BEAT.LOCKED);
      setLocked(true);
    }, BEAT.LOCKED + 2000);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(failsafe);
    };
  }, [play, reached, reduced, triggerCue]);

  const at = (mark: number) => reduced || locked || beat >= mark;
  const settled = at(BEAT.IDENTITY);

  /**
   * Declarative reveal. `locked` drops the transition entirely, so once the
   * sequence is over these are plain static styles.
   */
  const cue = (mark: number, delayMs = 0, lift = 16) => {
    const on = at(mark);
    return {
      opacity: on ? 1 : 0,
      translate: on ? '0 0' : `0 ${lift}px`,
      transition:
        reduced || locked
          ? undefined
          : `opacity 1600ms var(--ease-entrance) ${delayMs}ms, translate 1600ms var(--ease-entrance) ${delayMs}ms`
    } as const;
  };

  /** The echo is the one thing that leaves again: on at ECHO, off at STILLNESS. */
  const echoStyle = (index: number) => {
    const showing = !reduced && !locked && beat >= BEAT.ECHO && beat < BEAT.STILLNESS;
    return {
      opacity: showing ? 0.5 : 0,
      translate: showing ? '0 0' : '0 10px',
      transition: reduced || locked ? undefined : `opacity 1100ms ease ${index * 220}ms, translate 1100ms ease ${index * 220}ms`
    } as const;
  };

  /*
   * THE YEAR 02 SECRET — unchanged.
   *
   * Two ways in, both of them patient: touch the Year 02 indicator, or simply
   * still be here a few seconds after the finale has settled. The second is the
   * one that matters — the reward is for staying with the ending rather than
   * for hunting. It adds no scene and changes no state.
   */
  const FINALE = anniversary.secrets.finale;
  const finaleSecret = useSecret(FINALE.id, { duration: FINALE.duration });
  const { discover: discoverFinale, discovered: finaleFound } = finaleSecret;

  useEffect(() => {
    if (!settled || finaleFound) return;
    const timer = window.setTimeout(discoverFinale, FINALE.dwellMs);
    return () => window.clearTimeout(timer);
  }, [FINALE.dwellMs, discoverFinale, finaleFound, settled]);

  /** Options are offered late, and only once the ending has settled. */
  const [optionsShown, setOptionsShown] = useState(reduced);
  useEffect(() => {
    if (!settled || optionsShown) return;
    const timer = window.setTimeout(() => setOptionsShown(true), OPTIONS_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [optionsShown, settled]);

  /**
   * Replay the story. The music fades out, returns to the top, and fades back in
   * around the reset — never a hard cut to full volume at zero. `restart` runs
   * the reset callback even when there is no track, so this works with music off.
   *
   * The scene's own sequencing is reset too, so someone who watches the story a
   * second time gets the ending a second time rather than scrolling down to an
   * ending that has already happened. `useInViewOnce` is once-only and will not
   * fire again, which is exactly why the arrival probe above exists — it runs
   * again from scratch and re-detects the scene on the way back down. If it
   * somehow does not, the 30-second guarantee restores the full ending anyway,
   * so resetting can never strand it.
   */
  const replay = useCallback(() => {
    play('softClick');
    setBeat(-1);
    setLocked(false);
    setReached(false);
    setOptionsShown(false);
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
      {/* The horizon opens as the sequence resolves. Decorative: its resting
          state is the open one, so a stalled transition leaves the sky wide
          rather than shut. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[70vh] bg-[radial-gradient(75%_100%_at_50%_100%,rgba(255,255,255,0.32),rgba(126,200,255,0.18)_38%,transparent_74%)]"
        style={{
          opacity: at(BEAT.LINES) ? 1 : 0.3,
          scale: at(BEAT.LINES) ? '1 1' : '1 0.65',
          transformOrigin: 'bottom',
          transition: reduced || locked ? undefined : 'opacity 3600ms var(--ease-entrance), scale 3600ms var(--ease-entrance)'
        }}
      />

      <div className="relative w-full max-w-lg">
        <p className="mb-10 text-center font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-sky-100/55">
          12 · YEAR 02
        </p>

        {/* YEAR 01 — the bar's width is set declaratively to its final value on
            the first beat; the transition only decides how fast it gets there. */}
        <ProgressBlock
          label={finalMessages.yearOneLabel}
          percent={at(BEAT.YEAR_ONE) ? 100 : 0}
          animate={!reduced && !locked}
          durationMs={2600}
          tag={at(BEAT.COMPLETE) ? finalMessages.archivedLabel : undefined}
        />

        {/* THE ECHO, then the stillness. Four fragments of the year, passing.
            Reserved height so the pause is a real pause and not a collapse. */}
        <div
          aria-hidden="true"
          className="mt-8 flex min-h-[3.25rem] flex-wrap items-center justify-center gap-x-5 gap-y-1.5"
        >
          {echo.map((fragment, index) => (
            <span
              key={fragment.id}
              style={echoStyle(index)}
              className="font-mono text-[0.5rem] uppercase tracking-[0.24em] text-sky-100/70"
            >
              {fragment.title} · {fragment.date}
            </span>
          ))}
        </div>

        {/* YEAR 02 */}
        <div style={cue(BEAT.YEAR_TWO)} className="relative mt-6">
          <ProgressBlock
            label={finalMessages.yearTwoLabel}
            percent={at(BEAT.YEAR_TWO) ? finalMessages.yearTwoProgress : 0}
            animate={!reduced && !locked}
            durationMs={1500}
            loading
            tag="INITIALIZING"
          />

          {/*
            THE PATH THAT DOES NOT END.
            Year 02 has to read as continuation, not conclusion, so the line
            under it keeps going past the edge of the container instead of
            stopping where the bar stops. There is no arrowhead and no
            destination — it simply leaves. Under reduced motion it is drawn
            already extended, which says the same thing without moving.
          */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-full mt-5 block h-px w-[140%] origin-left bg-[linear-gradient(90deg,rgba(235,217,188,0.55),rgba(235,217,188,0.22)_45%,transparent)]"
            style={{
              scale: at(BEAT.PATH) ? '1 1' : '0 1',
              opacity: at(BEAT.PATH) ? 1 : 0,
              transition:
                reduced || locked ? undefined : 'scale 2600ms var(--ease-entrance), opacity 1400ms ease'
            }}
          />
          {/* One unresolved point, out along the path. It never arrives. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-full mt-5 block h-1 w-1 -translate-y-[1.5px] rounded-full bg-champagne/80 shadow-[0_0_10px_rgba(235,217,188,0.8)]"
            style={{
              left: at(BEAT.PATH) ? '118%' : '0%',
              opacity: at(BEAT.PATH) ? 0.9 : 0,
              transition: reduced || locked ? undefined : 'left 3200ms var(--ease-entrance), opacity 1200ms ease'
            }}
          />

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

          <div className="pointer-events-none absolute inset-x-0 top-full mt-10 flex justify-center">
            <SecretReveal show={finaleSecret.revealing} text={FINALE.message} />
          </div>
        </div>

        {/* A faint orbit beyond the horizon, only while the secret is showing. */}
        {finaleSecret.revealing ? (
          <span
            aria-hidden="true"
            className="pointer-events-none fixed left-1/2 top-[76%] -z-10 h-[52rem] w-[52rem] -translate-x-1/2 rounded-full border border-champagne/20"
            style={{ opacity: 0.45 }}
          />
        ) : null}

        {/* THE TWO SENTENCES. The payoff of the whole experience — and the
            elements that were measured sitting at opacity 0. */}
        <div className="mt-20 min-h-[9rem] text-center">
          {finalMessages.lines.map((line, index) => (
            <p
              key={line}
              style={cue(BEAT.LINES, index * 1300)}
              className={cn(
                'ai-legible font-display font-light leading-snug text-ivory',
                index === 0
                  ? 'text-[clamp(1.35rem,3.2vw,2rem)] text-ivory/70'
                  : 'mt-6 text-[clamp(1.85rem,4.6vw,3.15rem)]'
              )}
            >
              {line}
            </p>
          ))}
        </div>

        <figure
          style={cue(BEAT.IDENTITY, 400)}
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
        </figure>

        <div style={cue(BEAT.IDENTITY, 800)} className="mt-20 flex flex-col items-center">
          <span
            aria-hidden="true"
            className="h-16 w-px bg-gradient-to-b from-transparent via-sky-200/45 to-transparent"
          />
          <div className="mt-8">
            <AIMark size="loader" />
          </div>
          <span className="ai-wordmark mt-6 text-xl">Atthachet &amp; Isariya</span>
          {/* No full stop anywhere in the ending, deliberately. */}
          <span className="mt-3 font-mono text-[0.5625rem] tracking-[0.24em] text-sky-100/55">
            12.10.2025 — ∞
          </span>
        </div>

        {/* Offered late, and quietly — the moment comes first. Rendered only
            once, then left alone; nothing animates them away. */}
        {optionsShown ? (
          <div
            style={{
              opacity: 1,
              transition: reduced || locked ? undefined : 'opacity 1600ms ease'
            }}
            className="mt-14 flex flex-wrap items-center justify-center gap-3"
          >
            <FinalButton onClick={toMemories}>{finalMessages.memoriesLabel}</FinalButton>
            <FinalButton onClick={replay} subtle>
              {finalMessages.replayLabel}
            </FinalButton>
          </div>
        ) : null}
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
    <button type="button" onClick={onClick} data-cursor="interactive" className={cn(subtle ? 'ai-button-text' : 'ai-button-secondary')}>
      {children}
    </button>
  );
}

/**
 * A labelled progress line.
 *
 * The percentage is a PROP, not an animated counter — there is no frame loop
 * behind it. The bar's width is set to its final value and a CSS transition
 * carries it there, and the number beside it is derived from the same value, so
 * the two can never disagree and neither can be stranded mid-fill.
 */
function ProgressBlock({
  label,
  percent,
  animate,
  durationMs,
  loading = false,
  tag
}: {
  label: string;
  percent: number;
  animate: boolean;
  durationMs: number;
  loading?: boolean;
  tag?: string;
}) {
  /*
   * The readout counts along with the bar rather than jumping straight to the
   * end. It is driven by the same declarative target, stepped on a timer that
   * exists only while the bar is travelling — no animation frames, and if it
   * never runs the value below still ends up correct.
   */
  const [shown, setShown] = useState(animate ? 0 : percent);

  useEffect(() => {
    if (!animate) {
      setShown(percent);
      return;
    }
    const steps = 24;
    const from = 0;
    const timers = Array.from({ length: steps }, (_, index) =>
      window.setTimeout(
        () => setShown(Math.round(from + ((percent - from) * (index + 1)) / steps)),
        (durationMs / steps) * (index + 1)
      )
    );
    // Whatever happens to those, the readout lands on the real value.
    const settle = window.setTimeout(() => setShown(percent), durationMs + 400);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(settle);
    };
  }, [animate, durationMs, percent]);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-display text-lg uppercase tracking-[0.18em] text-ivory/85 sm:text-xl">
          {label}
        </span>
        <span className="font-mono text-[0.6875rem] tabular-nums text-sky-100/80">{shown}%</span>
      </div>

      <div className="mt-3 h-px w-full overflow-hidden bg-ivory/12">
        <span
          className={cn('block h-full', loading ? 'bg-champagne/85' : 'bg-ivory/85')}
          style={{
            width: `${percent}%`,
            transition: animate ? `width ${durationMs}ms var(--ease-entrance)` : undefined
          }}
        />
      </div>

      {tag ? (
        <span className="mt-4 block font-mono text-[0.5625rem] uppercase tracking-[0.34em] text-champagne/85">
          {tag}
        </span>
      ) : null}
    </div>
  );
}
