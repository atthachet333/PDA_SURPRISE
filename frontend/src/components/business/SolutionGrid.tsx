import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { solutionCategories, solutions, type SolutionCategory } from '@/data/solutions';
import { cn } from '@/lib/cn';
import { PREVIEWS } from './UIPreview';
import { useAudio } from '@/app/audioContext';

export function SolutionGrid() {
  const [active, setActive] = useState<SolutionCategory | 'all'>('all');
  const { play } = useAudio();

  const visible = useMemo(
    () => (active === 'all' ? solutions : solutions.filter((item) => item.category === active)),
    [active]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Solution categories">
        {solutionCategories.map((category) => {
          const selected = active === category.id;
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onPointerEnter={() => play('hover')}
              onClick={() => {
                play('click');
                setActive(category.id);
              }}
              className={cn(
                'relative rounded-pill px-4 py-2 text-sm font-medium transition-colors duration-base',
                selected ? 'text-white' : 'text-steel-500 hover:text-ink'
              )}
            >
              {selected ? (
                <motion.span
                  layoutId="solution-filter"
                  className="absolute inset-0 rounded-pill bg-ink"
                  transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                />
              ) : null}
              <span className="relative">{category.label}</span>
            </button>
          );
        })}
      </div>

      <motion.div layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((solution) => {
            const Preview = PREVIEWS[solution.preview];
            return (
              <motion.article
                key={solution.id}
                layout
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -8 }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col overflow-hidden rounded-panel border border-steel-200 bg-white transition-all duration-slow ease-smooth hover:-translate-y-1 hover:border-steel-300 hover:shadow-lift"
              >
                <div className="h-32 border-b border-steel-200 bg-steel-50 p-4 transition-colors duration-slow group-hover:bg-white">
                  <Preview />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-base font-semibold text-ink">{solution.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-steel-500">{solution.summary}</p>
                  <div className="mt-5 rounded-card bg-brand-50 p-4"><p className="text-2xs font-semibold uppercase tracking-wider text-brand-700">ประโยชน์ที่ออกแบบไว้</p><ul className="mt-2 space-y-1.5">{solution.benefits.map((benefit)=><li key={benefit} className="text-xs text-brand-800">• {benefit}</li>)}</ul></div>
                  <ul className="mt-5 space-y-2 border-t border-steel-100 pt-4">
                    {solution.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2.5 text-xs text-steel-500">
                        <svg viewBox="0 0 12 12" className="mt-0.5 h-3 w-3 shrink-0 text-brand-500" fill="none">
                          <path
                            d="M2.5 6.2 5 8.7l4.5-5"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
