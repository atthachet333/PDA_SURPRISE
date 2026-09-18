import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Container } from '@/components/shared/Layout';
import { PREVIEWS, type PreviewKind } from './UIPreview';
import { solutions, type Solution } from '@/data/solutions';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

/**
 * SOLUTIONS — a sticky product showcase.
 *
 * The visual pins while the stories scroll past it, and the UI preview morphs
 * as each story takes over. That is the argument the section is making: these
 * are not eight unrelated offers, they are one product surface configured
 * differently per business function.
 *
 * How the active story is tracked
 *   An IntersectionObserver with a centre-band rootMargin, rather than a scroll
 *   handler doing maths on every frame. One observer, no layout reads during
 *   scroll, and it stays correct when the rows are different heights.
 */

const FEATURED_IDS = [
  'erp',
  'hr-payroll',
  'sales-inventory',
  'document-workflow',
  'tracking',
  'automation'
];

const FEATURED: Solution[] = FEATURED_IDS.map(
  (id) => solutions.find((solution) => solution.id === id)
).filter((solution): solution is Solution => Boolean(solution));

const PREVIEW_FOR: Record<Solution['preview'], PreviewKind> = {
  table: 'table',
  kanban: 'kanban',
  chart: 'chart',
  calendar: 'calendar',
  flow: 'flow',
  cards: 'cards'
};

export function SolutionShowcase({ code = '04 / SOLUTIONS' }: { code?: string } = {}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });
  // A single hairline that fills as the section is read.
  const progressScale = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);

  useEffect(() => {
    const nodes = rowRefs.current.filter((node): node is HTMLDivElement => Boolean(node));
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the centre band, so fast scrolling does not
        // leave the visual on a story that has already left the viewport.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = nodes.indexOf(visible.target as HTMLDivElement);
        if (index >= 0) setActiveIndex(index);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.5, 1] }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const active = FEATURED[activeIndex] ?? FEATURED[0];
  if (!active) return null;

  const Preview = PREVIEWS[PREVIEW_FOR[active.preview]];

  return (
    <section
      ref={sectionRef}
      id="solutions"
      className="sect sect--field relative overflow-hidden py-section"
    >
      <div className="sect-layer field-lines" aria-hidden="true" />

      <Container className="relative">
        <div className="max-w-3xl">
          <p className="section-code">{code}</p>
          <h2 className="thai-display mt-4 text-mega font-bold text-ink">
            ไม่ใช่แค่เขียนโปรแกรม
            <br />
            <span className="text-brand-600">แต่เราออกแบบระบบให้ธุรกิจทำงานง่ายขึ้น</span>
          </h2>
        </div>

        {/* Progress hairline */}
        <div className="relative mt-12 h-px w-full bg-steel-300/60" aria-hidden="true">
          <motion.span
            className="absolute inset-y-0 left-0 block w-full origin-left bg-brand-500"
            style={reduced ? { scaleX: 1 } : { scaleX: progressScale }}
          />
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          {/* ------------------------------------------------- the stories -- */}
          <div>
            {FEATURED.map((solution, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={solution.id}
                  ref={(node) => {
                    rowRefs.current[index] = node;
                  }}
                  className="border-b border-steel-300/50 py-10 last:border-b-0 lg:py-16"
                >
                  <div className="flex items-baseline gap-4">
                    <span
                      className={cn(
                        'font-mono text-[0.6875rem] tabular-nums transition-colors duration-slow',
                        isActive ? 'text-brand-600' : 'text-steel-400'
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-steel-400">
                      {solution.eyebrow}
                    </span>
                  </div>

                  <h3
                    className={cn(
                      'thai-display mt-4 text-statement font-bold transition-colors duration-slow',
                      isActive ? 'text-ink' : 'text-steel-400'
                    )}
                  >
                    {solution.title}
                  </h3>

                  <p
                    className={cn(
                      'mt-4 max-w-lg text-lead transition-colors duration-slow',
                      isActive ? 'text-steel-600' : 'text-steel-400'
                    )}
                  >
                    {solution.summary}
                  </p>

                  {/* Mobile visual, inline with its own story */}
                  <div className="plane-light mt-6 overflow-hidden rounded-card lg:hidden">
                    <div className="h-36 p-4">
                      <InlinePreview solution={solution} />
                    </div>
                  </div>

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {solution.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className={cn(
                          'rounded-pill border px-3 py-1.5 text-xs transition-colors duration-slow',
                          isActive
                            ? 'border-brand-200 bg-brand-50 text-brand-700'
                            : 'border-steel-300/60 text-steel-400'
                        )}
                      >
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <ul className="mt-5 space-y-1.5">
                    {solution.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className={cn(
                          'flex items-start gap-2.5 text-sm transition-colors duration-slow',
                          isActive ? 'text-steel-600' : 'text-steel-400'
                        )}
                      >
                        <span
                          className={cn(
                            'mt-2 h-1 w-1 shrink-0 rounded-full transition-colors duration-slow',
                            isActive ? 'bg-brand-500' : 'bg-steel-300'
                          )}
                        />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* -------------------------------------------- the sticky visual -- */}
          <div className="hidden lg:block">
            <div className="sticky top-1/2 -translate-y-1/2">
              <div className="plane-light overflow-hidden rounded-panel shadow-lift-lg">
                <div className="flex items-center justify-between border-b border-steel-100 bg-steel-50/70 px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-steel-300" />
                    <span className="h-2 w-2 rounded-full bg-steel-300" />
                    <span className="h-2 w-2 rounded-full bg-steel-300" />
                  </div>
                  <motion.span
                    key={active.id}
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-steel-400"
                  >
                    {active.title}
                  </motion.span>
                  <span className="h-2 w-2 rounded-full bg-brand-400" />
                </div>

                <div className="relative h-[19rem] p-7">
                  <motion.div
                    key={active.id}
                    initial={reduced ? false : { opacity: 0, y: 14, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full"
                  >
                    <Preview className="h-full" />
                  </motion.div>
                </div>

                <div className="flex items-center justify-between border-t border-steel-100 px-5 py-3">
                  <span className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-steel-400">
                    {String(activeIndex + 1).padStart(2, '0')} /{' '}
                    {String(FEATURED.length).padStart(2, '0')}
                  </span>
                  <div className="flex gap-1.5">
                    {FEATURED.map((solution, index) => (
                      <span
                        key={solution.id}
                        className={cn(
                          'h-1 rounded-pill transition-all duration-slow ease-smooth',
                          index === activeIndex ? 'w-6 bg-brand-500' : 'w-1.5 bg-steel-300'
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

function InlinePreview({ solution }: { solution: Solution }) {
  const Preview = PREVIEWS[PREVIEW_FOR[solution.preview]];
  return <Preview className="h-full" />;
}
