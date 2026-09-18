import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Container } from '@/components/shared/Layout';
import { solutionCategories, solutions, type SolutionCategory } from '@/data/solutions';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import { PREVIEWS } from './UIPreview';

/**
 * SOLUTION INDEX — the full catalogue, filterable.
 *
 * The homepage and the top of /solutions make the argument with the sticky
 * showcase; this is the reference list underneath it, for a visitor who arrived
 * knowing the name of what they want. Hairline rows on a shared bleed rather
 * than twelve floating cards, so it reads as an index and does not compete with
 * the showcase above.
 */
export function SolutionGrid({ code = '03 / INDEX' }: { code?: string } = {}) {
  const [active, setActive] = useState<SolutionCategory | 'all'>('all');
  const reduced = useReducedMotion();

  const visible = useMemo(
    () => (active === 'all' ? solutions : solutions.filter((item) => item.category === active)),
    [active]
  );

  return (
    <section className="sect sect--grid relative overflow-hidden py-section">
      <div className="sect-layer grid-lines opacity-60" aria-hidden="true" />

      <Container className="relative">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-code">{code}</p>
            <h2 className="thai-display mt-4 text-statement font-bold text-ink">
              โซลูชันทั้งหมด
            </h2>
          </div>

          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="หมวดโซลูชัน">
            {solutionCategories.map((category) => {
              const selected = active === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActive(category.id)}
                  className={cn(
                    'relative rounded-pill px-4 py-2 text-xs font-medium transition-colors duration-base',
                    selected ? 'text-white' : 'text-steel-500 hover:text-ink'
                  )}
                >
                  {selected ? (
                    <motion.span
                      layoutId="solution-filter"
                      className="absolute inset-0 rounded-pill bg-ink"
                      transition={
                        reduced ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 34 }
                      }
                    />
                  ) : null}
                  <span className="relative">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <motion.div
          layout={!reduced}
          className="mt-12 grid gap-px overflow-hidden border border-steel-200 bg-steel-200 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((solution) => {
              const Preview = PREVIEWS[solution.preview];
              return (
                <motion.article
                  key={solution.id}
                  layout={!reduced}
                  initial={reduced ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? undefined : { opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                  className="group relative flex flex-col bg-white p-6 transition-colors duration-slow hover:bg-steel-50 sm:p-7"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-brand-500 transition-transform duration-slow ease-smooth group-hover:scale-x-100"
                  />

                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-brand-600">
                      {solution.eyebrow}
                    </span>
                  </div>

                  <h3 className="thai-display mt-5 text-base font-bold text-ink">
                    {solution.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-steel-500">{solution.summary}</p>

                  <div className="mt-6 h-24 rounded-card border border-steel-100 bg-steel-50/60 p-3.5 transition-colors duration-slow group-hover:border-brand-100 group-hover:bg-white">
                    <Preview className="h-full" />
                  </div>

                  <ul className="mt-5 space-y-1.5">
                    {solution.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-start gap-2 text-xs leading-relaxed text-steel-500"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                        {highlight}
                      </li>
                    ))}
                  </ul>

                  <ul className="mt-5 flex flex-wrap gap-1.5 border-t border-steel-100 pt-4">
                    {solution.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="rounded-pill bg-brand-50 px-2.5 py-1 text-[0.625rem] text-brand-700"
                      >
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </Container>
    </section>
  );
}
