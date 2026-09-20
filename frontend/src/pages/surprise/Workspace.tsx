import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/business/Logo';
import { Button } from '@/components/shared/Button';
import { PortalTransition } from '@/components/surprise/PortalTransition';
import { anniversary } from '@/data/anniversary';
import { useAudio } from '@/app/audioContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import { formatMemoryDate } from '@/lib/memoryGate';
import { usePageMeta } from '@/hooks/usePageMeta';
import { privateMeta } from '@/lib/seo';

type Phase = 'checking' | 'listing' | 'project' | 'leaving';

const CHECKS = [
  { label: 'Checking device', ms: 900 },
  { label: 'Verifying access', ms: 1100 },
  { label: 'Loading private workspace', ms: 1200 }
];

export default function Workspace() {
  usePageMeta(privateMeta);

  const location = useLocation();
  const [receivedMemoryGate] = useState(
    () => Boolean((location.state as { memoryGateReveal?: boolean } | null)?.memoryGateReveal)
  );
  const [phase, setPhase] = useState<Phase>(() => (receivedMemoryGate ? 'project' : 'checking'));
  const [checkIndex, setCheckIndex] = useState(0);
  const [handoffVisible, setHandoffVisible] = useState(receivedMemoryGate);
  const navigate = useNavigate();
  const { play, unlock, prepare, start } = useAudio();
  const reduced = useReducedMotion();
  const weddingDate = formatMemoryDate(anniversary.relationship.weddingDate);
  const anniversaryProgress = Math.min(
    100,
    Math.round((anniversary.project.days / anniversary.project.milestone) * 100)
  );
  /** The private project is on screen: begin leaning toward the other world. */
  const approaching = phase === 'project' || phase === 'leaving';

  /**
   * The gateway is the last screen before the story, so it is where the audio
   * gets ready.
   *
   * `unlock()` re-arms the context (the login submit already opened it, and this
   * covers a visitor who landed on /workspace directly). `prepare()` creates the
   * ONE music instance and pulls its metadata, so the track is warm by the time
   * the visitor reaches the button — without playing a note and without blocking
   * this screen from rendering.
   */
  useEffect(() => {
    unlock();
    prepare();
  }, [prepare, unlock]);

  /** Consume the route handoff once so refresh/back never replays the reveal. */
  useEffect(() => {
    if (!receivedMemoryGate) return;
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
    const timer = window.setTimeout(() => setHandoffVisible(false), reduced ? 420 : 1250);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.search, navigate, receivedMemoryGate, reduced]);

  // Sequential access checks, then the single private project.
  useEffect(() => {
    if (phase !== 'checking') return;
    const speed = reduced ? 0.4 : 1;
    const current = CHECKS[checkIndex];
    if (!current) return;

    const timer = window.setTimeout(() => {
      // No per-check sound: three bleeps on the way in would be app UI, and the
      // one moment worth marking is the project appearing.
      if (checkIndex === CHECKS.length - 1) setPhase('listing');
      else setCheckIndex((index) => index + 1);
    }, current.ms * speed);

    return () => window.clearTimeout(timer);
  }, [checkIndex, phase, play, reduced]);

  useEffect(() => {
    if (phase !== 'listing') return;
    const timer = window.setTimeout(
      () => {
        play('transitionRise');
        setPhase('project');
      },
      reduced ? 500 : 1400
    );
    return () => window.clearTimeout(timer);
  }, [phase, play, reduced]);

  /**
   * The one gesture that opens the story — and therefore the one place the music
   * is allowed to begin.
   *
   * Everything audio-related happens SYNCHRONOUSLY here, inside the gesture
   * chain, because iOS Safari only honours playback that originates there. And
   * nothing is awaited: `start()` returns immediately whether the file is
   * loaded, still buffering or missing entirely, so the portal transition and
   * the navigation that follows never wait on audio.
   */
  const onOpen = useCallback(() => {
    unlock();
    start();
    play('softClick');
    setPhase('leaving');
  }, [play, start, unlock]);

  const onTransitionComplete = useCallback(() => {
    navigate('/us', { replace: true });
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hairline-grid opacity-50 [mask-image:radial-gradient(70%_60%_at_50%_20%,black,transparent)]"
      />

      {/*
        THE BRIDGE BETWEEN TWO WORLDS.

        The gateway opens as a corporate screen and, as the private project
        resolves, quietly stops being one: the brand green recedes, a pale sky
        glow comes up, and a faint orbit appears behind the card. It never goes
        far enough to show the celestial world - that belongs to the other side
        of the portal - it only stops the arrival there from being a jump cut.
      */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        initial={false}
        animate={{ opacity: approaching ? 1 : 0 }}
        transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="absolute -right-1/4 -top-1/3 h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle,rgba(126,200,255,0.16),transparent_66%)] blur-2xl" />
        <span className="absolute -bottom-1/3 -left-1/4 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(247,241,232,0.5),transparent_64%)] blur-2xl" />
        <motion.span
          className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/20"
          animate={
            reduced
              ? undefined
              : { scale: phase === 'leaving' ? [1, 1.7] : [1, 1.04, 1], opacity: phase === 'leaving' ? [0.9, 0] : 1 }
          }
          transition={
            phase === 'leaving'
              ? { duration: 1.6, ease: [0.7, 0, 0.84, 0] }
              : { duration: 9, repeat: Infinity, ease: 'easeInOut' }
          }
        />
        <motion.span
          className="absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-300/15"
          animate={
            reduced
              ? undefined
              : { scale: phase === 'leaving' ? [1, 2.1] : 1, opacity: phase === 'leaving' ? [0.8, 0] : 1 }
          }
          transition={{ duration: 1.6, ease: [0.7, 0, 0.84, 0] }}
        />
      </motion.div>

      <AnimatePresence>
        {handoffVisible ? (
          <motion.div
            key="memory-date-handoff"
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[95] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_48%,rgba(23,50,77,0.96),rgba(12,27,41,1)_68%)] px-5 text-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.2 : 0.72, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              initial={false}
              animate={{
                opacity: reduced ? 0.85 : [1, 1, 0],
                y: reduced ? 0 : [0, 0, -42],
                filter: reduced ? 'blur(0px)' : ['blur(0px)', 'blur(0px)', 'blur(8px)']
              }}
              transition={{ duration: reduced ? 0.3 : 1.7, times: [0, 0.45, 1], ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="font-display text-[clamp(2.25rem,8vw,4.75rem)] font-light tracking-[0.08em] text-sky-100">
                {weddingDate.english}
              </p>
              <p className="mt-2 text-sm font-light text-cream/55">{weddingDate.thai}</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/*
        The 365 outlives the UI by a beat. Everything else blurs out from under
        it, the numeral holds alone against the opening orbit, and only then does
        the portal take over - so the last thing carried across is the number the
        whole story is about.
      */}
      <AnimatePresence>
        {phase === 'leaving' ? (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none fixed left-1/2 top-1/2 z-[110] -translate-x-1/2 -translate-y-1/2 font-display text-[clamp(7rem,26vw,16rem)] font-light leading-none text-sky-500"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: reduced ? 0.22 : [0, 0.34, 0.26, 0], scale: reduced ? 1 : [0.94, 1, 1.25] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1], times: [0, 0.25, 0.6, 1] }}
          >
            {anniversary.project.milestone}
          </motion.span>
        ) : null}
      </AnimatePresence>

      <motion.div
        className="relative mx-auto flex min-h-screen w-full max-w-[40rem] flex-col justify-center px-5 py-12 sm:px-6 sm:py-16"
        animate={
          phase === 'leaving' && !reduced
            ? { scale: 1.06, opacity: 0, filter: 'blur(14px)' }
            : { scale: 1, opacity: 1, filter: 'blur(0px)' }
        }
        transition={{
          duration: phase === 'leaving' ? 1.4 : receivedMemoryGate ? 1.1 : 0.3,
          delay: phase === 'leaving' ? 0 : receivedMemoryGate ? 0.42 : 0,
          ease: phase === 'leaving' ? [0.7, 0, 0.84, 0] : [0.16, 1, 0.3, 1]
        }}
      >
        <div className="flex items-center justify-between">
          <Logo compact />
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-steel-400">
            Workspace
          </span>
        </div>

        {/*
          Deliberately not `mode="wait"`. That would hold the project card back
          until the checks panel finished animating out — and exit animations
          are frame-driven, so a tab backgrounded at the wrong moment would
          leave the gateway stuck on the checks. Both children are absolutely
          positioned instead, so the reveal is driven purely by state.
        */}
        <div className="relative mt-10 min-h-[37rem] sm:min-h-[35rem]">
          <AnimatePresence>
            {phase === 'checking' || phase === 'listing' ? (
              <motion.div
                key="checks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-x-0 top-0 rounded-panel border border-steel-200 bg-white p-7"
              >
                <ul className="space-y-4">
                  {CHECKS.map((check, index) => {
                    const done = phase === 'listing' || index < checkIndex;
                    const running = phase === 'checking' && index === checkIndex;
                    const pending = !done && !running;
                    return (
                      <li key={check.label} className="flex items-center gap-3.5">
                        <StatusDot state={done ? 'done' : running ? 'running' : 'pending'} />
                        <span
                          className={cn(
                            'font-mono text-xs tracking-wide transition-colors duration-slow',
                            pending ? 'text-steel-300' : done ? 'text-steel-500' : 'text-ink'
                          )}
                        >
                          {check.label}
                          {running ? <AnimatedDots /> : done ? ' — ok' : ''}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <AnimatePresence>
                  {phase === 'listing' ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 border-t border-steel-200 pt-6">
                        <p className="font-mono text-xs text-brand-600">1 private project found.</p>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="project"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-x-0 top-0 overflow-hidden rounded-panel border border-sky-200/60 bg-white [background:radial-gradient(circle_at_82%_12%,rgba(126,200,255,0.16),transparent_34%),radial-gradient(circle_at_15%_100%,rgba(247,241,232,0.9),transparent_45%),white] shadow-lift"
              >
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px origin-left bg-gradient-to-r from-brand-500 via-sky-400 to-champagne"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />

                <motion.span
                  aria-hidden="true"
                  className="absolute -right-7 top-16 font-display text-[11rem] font-light leading-none text-sky-400 sm:right-1 sm:text-[13rem]"
                  initial={{ opacity: 0.055 }}
                  animate={{ opacity: phase === 'leaving' ? 0.22 : 0.11 }}
                  transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  {anniversary.project.milestone}
                </motion.span>
                <span
                  aria-hidden="true"
                  className="absolute -right-16 top-11 h-72 w-72 rounded-full border border-sky-400/10 sm:-right-10 sm:h-80 sm:w-80"
                />
                <span
                  aria-hidden="true"
                  className="absolute right-12 top-20 h-24 w-24 rounded-full bg-[radial-gradient(circle,rgba(126,200,255,0.16),transparent_70%)] blur-xl"
                />

                <div className="relative p-6 sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-steel-400">
                      Private project
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-50 px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.1em] text-brand-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                      {anniversary.project.yearOneComplete ? 'YEAR 01 · COMPLETE' : anniversary.project.status}
                    </span>
                  </div>

                  <motion.h1
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 1.2,
                      delay: receivedMemoryGate ? 0.78 : 0.25,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    className="mt-7 font-display text-[clamp(2.35rem,5.5vw,3rem)] font-light uppercase leading-[0.9] tracking-[0.01em] text-navy-800 sm:whitespace-nowrap sm:leading-none"
                  >
                    <span className="block sm:inline">{anniversary.couple.nameA}</span>{' '}
                    <span className="block py-1 text-[0.72em] italic text-sky-700 sm:inline sm:py-0">&amp;</span>{' '}
                    <span className="block sm:inline">{anniversary.couple.nameB}</span>
                  </motion.h1>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: receivedMemoryGate ? 1.12 : 0.36,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    className="relative mt-8 overflow-hidden rounded-card border border-sky-200/70 bg-white/65 p-5 backdrop-blur-sm sm:p-6"
                  >
                    <div className="flex items-end justify-between gap-5">
                      <div>
                        <p className="font-display text-[4.8rem] font-light leading-[0.72] text-navy-700 sm:text-[5.75rem]">
                          {anniversary.project.milestone}
                        </p>
                        <p className="mt-4 font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-sky-700/75">
                          {anniversary.project.milestoneLabel}
                        </p>
                      </div>
                      <div className="pb-0.5 text-right">
                        <p className="font-mono text-sm tabular-nums text-navy-700">
                          {anniversary.project.days} / {anniversary.project.milestone}
                        </p>
                        <p className="mt-1 text-[0.5rem] uppercase tracking-[0.18em] text-steel-400">
                          {anniversary.project.yearOneComplete ? 'Year 01 complete' : 'Anniversary progress'}
                        </p>
                      </div>
                    </div>

                    <div
                      className="mt-5 h-px overflow-hidden bg-sky-100"
                      role="progressbar"
                      aria-label="Progress toward 365 days"
                      aria-valuemin={0}
                      aria-valuemax={anniversary.project.milestone}
                      aria-valuenow={Math.min(anniversary.project.days, anniversary.project.milestone)}
                    >
                      <motion.span
                        className="block h-full origin-left bg-gradient-to-r from-brand-500 via-sky-500 to-champagne"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: anniversaryProgress / 100 }}
                        transition={{ duration: 1.4, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </motion.div>

                  <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-steel-200 bg-steel-200 sm:grid-cols-3">
                    <Meta label="Duration" value={anniversary.project.duration} delay={0.4} />
                    <Meta label="Users" value={String(anniversary.project.users)} delay={0.48} />
                    <Meta
                      label="Access"
                      value={anniversary.project.access}
                      delay={0.56}
                      className="col-span-2 sm:col-span-1"
                    />
                  </dl>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="mt-6"
                  >
                    <Button size="lg" className="w-full" magnetic onClick={onOpen}>
                      {anniversary.project.openLabel}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-5 text-center font-mono text-[0.625rem] tracking-wide text-steel-300">
          session cached locally · not synced
        </p>
      </motion.div>

      {/*
        The receiving half of the login handoff. Login dims out, this dims in
        from the same darkness and clears - so the two screens are joined by one
        continuous fade instead of a white flash between them. It is aria-hidden
        and pointer-events-none, so it never delays or blocks anything; if the
        animation is skipped entirely the page is simply already visible.
      */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[90] bg-[radial-gradient(circle_at_50%_45%,rgba(9,26,20,0.55),rgba(4,12,9,0.92))]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: receivedMemoryGate ? 1.45 : 0.75, ease: [0.16, 1, 0.3, 1] }}
      />

      <PortalTransition active={phase === 'leaving'} onComplete={onTransitionComplete} />
    </div>
  );
}

function Meta({
  label,
  value,
  delay,
  className
}: {
  label: string;
  value: string;
  delay: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      className={cn('bg-white p-4', className)}
    >
      <dt className="text-[0.5625rem] font-medium uppercase tracking-[0.16em] text-steel-400">
        {label}
      </dt>
      <dd className="mt-1.5 font-mono text-sm text-ink">{value}</dd>
    </motion.div>
  );
}

function StatusDot({ state }: { state: 'pending' | 'running' | 'done' }) {
  if (state === 'done') {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
          <path
            d="M2.5 6.2 5 8.7l4.5-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }

  if (state === 'running') {
    return (
      <span className="flex h-4 w-4 items-center justify-center">
        <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-steel-200 border-t-brand-500" />
      </span>
    );
  }

  return (
    <span className="flex h-4 w-4 items-center justify-center">
      <span className="h-1.5 w-1.5 rounded-full bg-steel-200" />
    </span>
  );
}

function AnimatedDots() {
  return (
    <span className="inline-flex">
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.18 }}
        >
          .
        </motion.span>
      ))}
    </span>
  );
}
