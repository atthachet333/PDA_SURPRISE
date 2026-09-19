import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Container } from '@/components/shared/Layout';
import { SectionBackdrop } from './SectionBackdrop';
import { StageVisual } from './StageVisual';
import { STAGE_VISUALS } from '@/lib/processStages';
import { process } from '@/data/company';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

/**
 * PROCESS — seven stages in one compact section.
 *
 * WHAT THIS REPLACED
 *   A scroll-driven path that pinned the visitor for ~1325px and revealed one
 *   stage at a time. All seven are now listed at once; picking one swaps the
 *   panel beside it, and the section fits in roughly one screen.
 *
 * AUTO-PROGRESS
 *   When the section is on screen it advances by itself every few seconds, so
 *   the sequence still reads as a sequence. It stops permanently the moment the
 *   visitor interacts — nobody should ever have to wait for an animation to
 *   reach the stage they wanted, and a list that keeps moving under the cursor
 *   is worse than one that never moved.
 */
export function ProcessPath({ code = '07 / PROCESS' }: { code?: string } = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [inView, setInView] = useState(false);
  const [userTook, setUserTook] = useState(false);
  const reduced = useReducedMotion();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setInView(entry.intersectionRatio > 0.4);
      },
      { threshold: [0, 0.4, 0.75] }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Auto-advance, but only while unattended.
  useEffect(() => {
    if (!inView || userTook || reduced) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % process.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [inView, userTook, reduced]);

  const select = useCallback((index: number) => {
    setUserTook(true);
    setActiveIndex(index);
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      setUserTook(true);
      setActiveIndex((current) => {
        const last = process.length - 1;
        let next = current;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = current === last ? 0 : current + 1;
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = current === 0 ? last : current - 1;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = last;
        tabRefs.current[next]?.focus();
        return next;
      });
    },
    []
  );

  const active = process[activeIndex] ?? process[0];
  if (!active) return null;

  return (
    <section ref={sectionRef} className="sect sect--blueprint relative overflow-hidden py-section">
      <span aria-hidden="true" className="sect-edge-top" />
      <SectionBackdrop variant="system-lines" />

      <Container className="relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-code">{code}</p>
            <h2 className="thai-display mt-3 text-statement font-bold text-ink">
              จากไอเดีย
              <br />
              <span className="text-brand-600">สู่ระบบที่ใช้งานได้จริง</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-steel-500">
            เจ็ดขั้นตอนที่ใช้กับทุกโปรเจกต์ เลือกดูรายละเอียดแต่ละขั้นได้
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12">
          {/* ------------------------------------------------------- timeline -- */}
          <div
            role="tablist"
            aria-label="ขั้นตอนการทำงาน"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="relative border-t border-steel-200"
          >
            {process.map((step, index) => {
              const isActive = index === activeIndex;
              const isPast = index < activeIndex;
              return (
                <button
                  key={step.step}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="process-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => select(index)}
                  onPointerEnter={() => select(index)}
                  className="group relative flex w-full items-center gap-4 border-b border-steel-200 py-3.5 text-left"
                >
                  {/* Connector + node */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-white transition-all duration-base',
                      isActive
                        ? 'border-brand-500 shadow-brand-glow'
                        : isPast
                          ? 'border-brand-300'
                          : 'border-steel-300'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full transition-colors duration-base',
                        isActive || isPast ? 'bg-brand-500' : 'bg-steel-300'
                      )}
                    />
                  </span>

                  <span
                    className={cn(
                      'font-mono text-[0.6875rem] tabular-nums transition-colors duration-base',
                      isActive ? 'text-brand-600' : 'text-steel-300'
                    )}
                  >
                    {step.step}
                  </span>

                  <span
                    className={cn(
                      'thai-display min-w-0 flex-1 truncate text-[0.9375rem] font-semibold transition-colors duration-base',
                      isActive ? 'text-ink' : 'text-steel-500 group-hover:text-ink'
                    )}
                  >
                    {step.title}
                  </span>

                  {/* Auto-progress bar on the active row only */}
                  {isActive && !userTook && !reduced && inView ? (
                    <motion.span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 h-0.5 bg-brand-400"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3.2, ease: 'linear' }}
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute bottom-0 left-0 h-0.5 bg-brand-500 transition-all duration-base',
                        isActive ? 'w-full' : 'w-0'
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* --------------------------------------------------- active stage -- */}
          <div id="process-panel" role="tabpanel" aria-live="polite">
            <motion.div
              key={active.step}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="plane-light overflow-hidden rounded-panel shadow-soft"
            >
              <div className="flex items-center justify-between border-b border-steel-100 bg-steel-50/70 px-5 py-2.5">
                <span className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-steel-400">
                  stage {active.step} / {String(process.length).padStart(2, '0')}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
              </div>

              <div className="h-44 px-6 py-5 sm:h-48">
                <StageVisual
                  stage={STAGE_VISUALS[activeIndex] ?? 'build'}
                  active
                  reduced={reduced}
                />
              </div>

              <div className="border-t border-steel-100 px-6 py-5">
                <h3 className="thai-display text-lg font-bold text-ink">{active.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-steel-600">{active.body}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}
