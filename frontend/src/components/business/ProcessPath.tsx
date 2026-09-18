import { motion, useScroll, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Container } from '@/components/shared/Layout';
import { process } from '@/data/company';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

/**
 * PROCESS — a scroll-driven path, not a row of circles.
 *
 * A single vertical line runs the height of the section and fills as the visitor
 * reads. Each step's numeral grows as it activates, and a sticky side visual
 * changes to show what is actually happening at that stage.
 *
 * The progress line is driven by `useScroll` + `useSpring` on a transform, so it
 * animates on the compositor. The active step is tracked by IntersectionObserver
 * rather than by comparing scroll offsets per frame.
 */

/** What the side visual shows at each stage. */
type StageVisual = 'discover' | 'map' | 'design' | 'build' | 'test' | 'ship' | 'care';

const STAGE_VISUALS: StageVisual[] = ['discover', 'map', 'design', 'build', 'test', 'ship', 'care'];

export function ProcessPath({ code = '06 / PROCESS' }: { code?: string } = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 70%', 'end 60%']
  });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.4 });

  useEffect(() => {
    const nodes = stepRefs.current.filter((node): node is HTMLLIElement => Boolean(node));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = nodes.indexOf(visible.target as HTMLLIElement);
        if (index >= 0) setActiveIndex(index);
      },
      { rootMargin: '-40% 0px -45% 0px', threshold: [0, 0.4, 1] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="sect sect--blueprint relative overflow-hidden py-section">
      <div className="sect-layer blueprint-lines opacity-70" aria-hidden="true" />

      <Container className="relative">
        <div className="max-w-3xl">
          <p className="section-code">{code}</p>
          <h2 className="thai-display mt-4 text-mega font-bold text-ink">
            จากไอเดีย
            <br />
            <span className="text-brand-600">สู่ระบบที่ใช้งานได้จริง</span>
          </h2>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          {/* ------------------------------------------------------- steps -- */}
          <div className="relative">
            {/* The path */}
            <div
              aria-hidden="true"
              className="absolute bottom-0 left-[1.0625rem] top-2 w-px bg-steel-200 sm:left-[1.4375rem]"
            >
              <motion.span
                className="block h-full w-full origin-top bg-brand-500"
                style={reduced ? { scaleY: 1 } : { scaleY: fill }}
              />
            </div>

            <ol className="relative space-y-12 sm:space-y-16">
              {process.map((step, index) => {
                const isActive = index === activeIndex;
                const isPast = index < activeIndex;
                return (
                  <li
                    key={step.step}
                    ref={(node) => {
                      stepRefs.current[index] = node;
                    }}
                    className="relative pl-12 sm:pl-16"
                  >
                    {/* Node on the path */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute left-0 top-1 flex h-[2.125rem] w-[2.125rem] items-center justify-center rounded-full border bg-white transition-all duration-slow ease-smooth sm:h-[1.875rem] sm:w-[1.875rem]',
                        isActive
                          ? 'scale-110 border-brand-500 shadow-brand-glow'
                          : isPast
                            ? 'border-brand-300'
                            : 'border-steel-300'
                      )}
                    >
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full transition-colors duration-slow',
                          isActive || isPast ? 'bg-brand-500' : 'bg-steel-300'
                        )}
                      />
                    </span>

                    <div className="flex items-baseline gap-4">
                      <motion.span
                        className={cn(
                          'font-mono tabular-nums leading-none transition-colors duration-slow',
                          isActive ? 'text-brand-500' : 'text-steel-300'
                        )}
                        animate={
                          reduced
                            ? undefined
                            : { fontSize: isActive ? '2.25rem' : '1.25rem' }
                        }
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      >
                        {step.step}
                      </motion.span>
                      <h3
                        className={cn(
                          'thai-display text-xl font-bold transition-colors duration-slow sm:text-2xl',
                          isActive ? 'text-ink' : 'text-steel-400'
                        )}
                      >
                        {step.title}
                      </h3>
                    </div>

                    <motion.p
                      className={cn(
                        'mt-4 max-w-xl text-[0.975rem] leading-relaxed transition-colors duration-slow',
                        isActive ? 'text-steel-600' : 'text-steel-400'
                      )}
                      animate={reduced ? undefined : { opacity: isActive ? 1 : 0.6 }}
                      transition={{ duration: 0.4 }}
                    >
                      {step.body}
                    </motion.p>

                    {/* Mobile stage visual */}
                    <div className="plane-light mt-5 overflow-hidden rounded-card lg:hidden">
                      <div className="h-28 p-4">
                        <StageVisualiser
                          stage={STAGE_VISUALS[index] ?? 'build'}
                          active
                          reduced={reduced}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* --------------------------------------------- sticky side visual -- */}
          <div className="hidden lg:block">
            <div className="sticky top-1/2 -translate-y-1/2">
              <div className="plane-light overflow-hidden rounded-panel shadow-lift">
                <div className="flex items-center justify-between border-b border-steel-100 bg-steel-50/70 px-5 py-3">
                  <span className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-steel-400">
                    stage {process[activeIndex]?.step ?? '01'}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                </div>
                <div className="h-56 p-7">
                  <motion.div
                    key={activeIndex}
                    initial={reduced ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full"
                  >
                    <StageVisualiser
                      stage={STAGE_VISUALS[activeIndex] ?? 'build'}
                      active
                      reduced={reduced}
                    />
                  </motion.div>
                </div>
                <div className="border-t border-steel-100 px-5 py-3">
                  <div className="flex gap-1.5">
                    {process.map((step, index) => (
                      <span
                        key={step.step}
                        className={cn(
                          'h-1 rounded-pill transition-all duration-slow ease-smooth',
                          index === activeIndex
                            ? 'w-6 bg-brand-500'
                            : index < activeIndex
                              ? 'w-1.5 bg-brand-300'
                              : 'w-1.5 bg-steel-200'
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------ stage visuals -- */

/** Abstract diagrams of what happens at each stage. */
function StageVisualiser({
  stage,
  active,
  reduced
}: {
  stage: StageVisual;
  active: boolean;
  reduced: boolean;
}) {
  const line = 'rounded-pill bg-steel-200';

  if (stage === 'discover') {
    // Scattered notes being gathered.
    return (
      <div className="grid h-full grid-cols-3 content-center gap-2.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <motion.span
            key={index}
            className={cn(
              'flex h-10 flex-col justify-end gap-1 rounded-[5px] border p-1.5',
              index % 4 === 0 ? 'border-brand-300 bg-brand-50' : 'border-steel-200'
            )}
            initial={reduced ? false : { opacity: 0, rotate: index % 2 ? -4 : 4 }}
            animate={active ? { opacity: 1, rotate: 0 } : undefined}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            <span className={cn(line, 'h-1 w-full')} />
          </motion.span>
        ))}
      </div>
    );
  }

  if (stage === 'map') {
    // A workflow being drawn out.
    return (
      <div className="flex h-full flex-col justify-center gap-3">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex items-center gap-2">
            {[0, 1, 2, 3].map((node) => (
              <span key={node} className="flex flex-1 items-center gap-2">
                <motion.span
                  className={cn(
                    'h-5 flex-1 rounded-[4px] border',
                    row === 1 && node === 2 ? 'border-brand-400 bg-brand-50' : 'border-steel-200'
                  )}
                  initial={reduced ? false : { scaleX: 0 }}
                  animate={active ? { scaleX: 1 } : undefined}
                  transition={{ duration: 0.4, delay: (row * 4 + node) * 0.03 }}
                  style={{ originX: 0 }}
                />
                {node < 3 ? <span className="h-px w-1.5 bg-steel-300" /> : null}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (stage === 'design') {
    // A schema / wireframe.
    return (
      <div className="flex h-full gap-3">
        <div className="flex w-1/3 flex-col gap-1.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <span key={index} className={cn(line, 'h-2 w-full')} />
          ))}
        </div>
        <div className="flex-1 rounded-[6px] border border-brand-200 bg-brand-50/40 p-3">
          <span className="block h-2 w-2/3 rounded-pill bg-brand-300" />
          <span className="mt-2 block h-1.5 w-full rounded-pill bg-brand-200/70" />
          <span className="mt-1.5 block h-1.5 w-5/6 rounded-pill bg-brand-200/70" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <span className="h-6 rounded-[4px] border border-brand-200" />
            <span className="h-6 rounded-[4px] border border-brand-200" />
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'build') {
    // Commits stacking up.
    return (
      <div className="flex h-full flex-col justify-center gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2.5"
            initial={reduced ? false : { opacity: 0, x: -12 }}
            animate={active ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.4, delay: index * 0.07 }}
          >
            <span
              className={cn(
                'h-2 w-2 shrink-0 rounded-full',
                index === 0 ? 'bg-brand-500' : 'bg-steel-300'
              )}
            />
            <span className={cn(line, 'h-1.5', index === 0 ? 'w-3/4 bg-brand-200' : 'w-1/2')} />
            <span className="ml-auto font-mono text-[0.5rem] text-steel-400">
              +{(5 - index) * 14}
            </span>
          </motion.div>
        ))}
      </div>
    );
  }

  if (stage === 'test') {
    // A checklist resolving to pass.
    return (
      <div className="flex h-full flex-col justify-center gap-2.5">
        {Array.from({ length: 4 }).map((_, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2.5"
            initial={reduced ? false : { opacity: 0 }}
            animate={active ? { opacity: 1 } : undefined}
            transition={{ duration: 0.3, delay: index * 0.12 }}
          >
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border border-brand-300 bg-brand-50">
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-brand-600" fill="none">
                <path
                  d="M2.5 6.2 5 8.7l4.5-5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className={cn(line, 'h-1.5 flex-1')} />
            <span className="font-mono text-[0.5rem] uppercase tracking-[0.1em] text-brand-600">
              pass
            </span>
          </motion.div>
        ))}
      </div>
    );
  }

  if (stage === 'ship') {
    // A deploy pipeline.
    return (
      <div className="flex h-full items-center gap-2">
        {['build', 'test', 'stage', 'prod'].map((label, index) => (
          <span key={label} className="flex flex-1 items-center gap-2">
            <motion.span
              className={cn(
                'flex h-14 flex-1 flex-col items-center justify-center gap-1.5 rounded-[6px] border',
                index === 3 ? 'border-brand-400 bg-brand-50' : 'border-steel-200'
              )}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={active ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  index === 3 ? 'bg-brand-500' : 'bg-steel-300'
                )}
              />
              <span className="font-mono text-[0.4375rem] uppercase tracking-[0.1em] text-steel-400">
                {label}
              </span>
            </motion.span>
            {index < 3 ? <span className="h-px w-2 shrink-0 bg-steel-300" /> : null}
          </span>
        ))}
      </div>
    );
  }

  // care — uptime + a response clock.
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <div className="flex items-end gap-1">
        {Array.from({ length: 16 }).map((_, index) => (
          <motion.span
            key={index}
            className={cn(
              'flex-1 rounded-t-[2px]',
              index === 15 ? 'bg-brand-500' : 'bg-brand-200'
            )}
            initial={reduced ? false : { height: '20%' }}
            animate={active ? { height: `${60 + ((index * 7) % 35)}%` } : undefined}
            transition={{ duration: 0.6, delay: index * 0.02 }}
            style={{ minHeight: 8 }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-steel-100 pt-3">
        <span className="font-mono text-[0.5rem] uppercase tracking-[0.14em] text-steel-400">
          monitoring
        </span>
        <span className="flex items-center gap-1.5 font-mono text-[0.5rem] uppercase tracking-[0.14em] text-brand-600">
          <span className={cn('h-1.5 w-1.5 rounded-full bg-brand-500', !reduced && 'animate-status-blink')} />
          active
        </span>
      </div>
    </div>
  );
}
