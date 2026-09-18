import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '@/components/business/Logo';
import { Button } from '@/components/shared/Button';
import { PortalTransition } from '@/components/surprise/PortalTransition';
import { anniversary } from '@/data/anniversary';
import { useAudio } from '@/app/audioContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

type Phase = 'checking' | 'listing' | 'project' | 'leaving';

const CHECKS = [
  { label: 'Checking device', ms: 900 },
  { label: 'Verifying access', ms: 1100 },
  { label: 'Loading private workspace', ms: 1200 }
];

export default function Workspace() {
  const [phase, setPhase] = useState<Phase>('checking');
  const [checkIndex, setCheckIndex] = useState(0);
  const navigate = useNavigate();
  const { play, unlock } = useAudio();
  const reduced = useReducedMotion();

  useEffect(() => {
    void unlock();
  }, [unlock]);

  // Sequential access checks, then the single private project.
  useEffect(() => {
    if (phase !== 'checking') return;
    const speed = reduced ? 0.4 : 1;
    const current = CHECKS[checkIndex];
    if (!current) return;

    const timer = window.setTimeout(() => {
      play('hover');
      if (checkIndex === CHECKS.length - 1) setPhase('listing');
      else setCheckIndex((index) => index + 1);
    }, current.ms * speed);

    return () => window.clearTimeout(timer);
  }, [checkIndex, phase, play, reduced]);

  useEffect(() => {
    if (phase !== 'listing') return;
    const timer = window.setTimeout(
      () => {
        play('transition');
        setPhase('project');
      },
      reduced ? 500 : 1400
    );
    return () => window.clearTimeout(timer);
  }, [phase, play, reduced]);

  const onOpen = useCallback(() => {
    setPhase('leaving');
  }, []);

  const onTransitionComplete = useCallback(() => {
    navigate('/us', { replace: true });
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hairline-grid opacity-50 [mask-image:radial-gradient(70%_60%_at_50%_20%,black,transparent)]"
      />

      <motion.div
        className="relative mx-auto flex min-h-screen w-full max-w-[34rem] flex-col justify-center px-6 py-16"
        animate={
          phase === 'leaving' && !reduced
            ? { scale: 1.06, opacity: 0, filter: 'blur(14px)' }
            : { scale: 1, opacity: 1, filter: 'blur(0px)' }
        }
        transition={{ duration: 1.4, ease: [0.7, 0, 0.84, 0] }}
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
        <div className="relative mt-10 min-h-[22rem]">
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
                className="absolute inset-x-0 top-0 overflow-hidden rounded-panel border border-steel-200 bg-white"
              >
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-px origin-left bg-brand-500"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                />

                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-steel-400">
                      Private project
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-50 px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.1em] text-brand-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                      {anniversary.project.status}
                    </span>
                  </div>

                  <motion.h1
                    initial={{ opacity: 0, letterSpacing: '0.4em' }}
                    animate={{ opacity: 1, letterSpacing: '0.06em' }}
                    transition={{ duration: 1.2, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-6 font-mono text-[clamp(1.75rem,5vw,2.5rem)] font-semibold text-ink"
                  >
                    {anniversary.project.codename}
                  </motion.h1>

                  <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-steel-200 bg-steel-200 sm:grid-cols-3">
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
                    className="mt-8"
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

        <p className="mt-8 text-center font-mono text-[0.625rem] tracking-wide text-steel-300">
          session cached locally · not synced
        </p>
      </motion.div>

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
