import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { LocaleLink as Link } from '@/components/shared/LocaleLink';
import { Container } from '@/components/shared/Layout';
import { ArrowIcon } from '@/components/shared/Button';
import { solutionCategories, solutions, type Solution, type SolutionCategory } from '@/data/solutions';
import { visualForSolution } from '@/data/visuals';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import { ProductPanel } from './ProductPanel';
import { contactHref, solutionToContactService, solutionToSourceSystem } from '@/data/contactRouting';

/*
 * Card grounds are token gradients, not literals: a hardcoded `#fff` stays
 * white in dark mode while the text on it turns light, which is the
 * light-on-light half of the inversion bug. Each category keeps its tint by
 * picking a different second stop.
 */
const categorySurface: Record<SolutionCategory, string> = {
  operations: 'border-brand-200 bg-[linear-gradient(145deg,rgb(var(--c-white)),rgb(var(--c-brand-50)))]',
  people: 'border-steel-300 bg-[linear-gradient(145deg,rgb(var(--c-white)),rgb(var(--c-steel-50)))]',
  revenue: 'border-brand-300/70 bg-[linear-gradient(145deg,rgb(var(--c-white)),rgb(var(--c-brand-100)))]',
  insight: 'border-steel-300 bg-[linear-gradient(145deg,rgb(var(--c-white)),rgb(var(--c-steel-100)))]'
};

function isDocumentSolution(solution: Solution) {
  return solution.id === 'document-workflow' || solution.id === 'approval';
}

/** Filterable catalogue whose cards are real controls for the detail panel below. */
export function SolutionGrid({ code = '03 / INDEX' }: { code?: string } = {}) {
  const [activeCategory, setActiveCategory] = useState<SolutionCategory | 'all'>('all');
  const [selectedId, setSelectedId] = useState(solutions[0]?.id ?? 'erp');
  const detailRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const visible = useMemo(
    () => activeCategory === 'all' ? solutions : solutions.filter((item) => item.category === activeCategory),
    [activeCategory]
  );
  const selected = solutions.find((item) => item.id === selectedId) ?? visible[0];
  const selectedContactService = selected ? solutionToContactService[selected.id] : undefined;
  const selectedSourceSystem = selected ? solutionToSourceSystem[selected.id] : undefined;
  const selectedContactHref = selectedContactService && selectedSourceSystem
    ? contactHref(selectedContactService, `solutions:${selectedSourceSystem}`)
    : '/contact';

  const selectSolution = (id: string) => {
    setSelectedId(id);
    window.requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' }));
  };

  const selectCategory = (category: SolutionCategory | 'all') => {
    setActiveCategory(category);
    if (category !== 'all') {
      const first = solutions.find((item) => item.category === category);
      if (first) setSelectedId(first.id);
    }
  };

  return (
    <section id="solution-catalogue" className="sect sect--grid relative overflow-hidden py-section">
      <div className="sect-layer grid-lines opacity-70" aria-hidden="true" />
      <Container wide className="relative">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-code">{code}</p>
            <h2 className="thai-display mt-4 text-statement font-bold text-ink">เลือกจากงานที่ต้องการแก้</h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-steel-600">กรองตามทีม แล้วเลือกการ์ดเพื่อดูรายละเอียด ฟีเจอร์ และหน้าจอระบบในมุมที่ใหญ่ขึ้น</p>
          </div>

          <div className="no-scrollbar -mx-1 flex max-w-full gap-1 overflow-x-auto rounded-pill border border-steel-200 bg-white/90 p-1 shadow-soft" role="tablist" aria-label="หมวดโซลูชัน">
            {solutionCategories.map((category) => {
              const selectedCategory = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory}
                  onClick={() => selectCategory(category.id)}
                  className={cn('relative shrink-0 rounded-pill px-4 py-2.5 text-xs font-medium transition-colors duration-base', selectedCategory ? 'text-white' : 'text-steel-600 hover:text-ink focus-visible:text-ink')}
                >
                  {selectedCategory ? <motion.span layoutId="solution-filter" className="absolute inset-0 rounded-pill bg-brand-700" transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }} /> : null}
                  <span className="relative">{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <motion.div layout={!reduced} className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((solution) => {
              const active = selected?.id === solution.id;
              return (
                <motion.button
                  key={solution.id}
                  type="button"
                  layout={!reduced}
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => selectSolution(solution.id)}
                  aria-expanded={active}
                  aria-controls="solution-detail"
                  className={cn(
                    'group relative flex min-h-[31rem] flex-col overflow-hidden rounded-card border p-5 text-left shadow-soft transition duration-slow hover:-translate-y-1 hover:shadow-lift focus-visible:-translate-y-1 focus-visible:shadow-lift sm:p-6',
                    categorySurface[solution.category],
                    isDocumentSolution(solution) && 'bg-[linear-gradient(145deg,rgb(var(--c-white)),rgb(var(--c-brand-100)))]',
                    active && 'border-brand-500 ring-1 ring-brand-500/20'
                  )}
                >
                  <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-brand-500 transition-transform duration-slow group-hover:scale-x-100 group-focus-visible:scale-x-100" />
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-brand-700">{solution.eyebrow}</span>
                    <span className="font-mono text-[0.5rem] uppercase tracking-[0.14em] text-steel-400">{isDocumentSolution(solution) ? 'DOCUMENTS' : solution.category}</span>
                  </div>
                  <h3 className="thai-display mt-4 text-lg font-bold text-ink">{solution.title}</h3>
                  <p className="mt-2 min-h-[3.25rem] text-sm leading-relaxed text-steel-600">{solution.summary}</p>

                  <div className="relative mt-5 h-44 overflow-hidden rounded-card border border-steel-200/80 bg-white p-2 shadow-ring sm:h-48">
                    <div className="h-full transition-transform duration-slow ease-smooth group-hover:scale-[1.025] group-focus-visible:scale-[1.025]">
                      <ProductPanel slot={visualForSolution(solution.id)} className="h-full" frame="none" />
                    </div>
                    <span aria-hidden="true" className="absolute inset-y-0 -left-1 w-px bg-[linear-gradient(transparent,rgba(29,170,97,.7),transparent)] transition-transform duration-slow group-hover:translate-x-[19rem] group-focus-visible:translate-x-[19rem]" />
                  </div>

                  <ul className="mt-5 space-y-1.5">
                    {solution.benefits.slice(0, 3).map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2 text-xs leading-relaxed text-steel-600"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-500" />{benefit}</li>
                    ))}
                  </ul>
                  <span className="mt-auto inline-flex items-center gap-2 pt-5 text-xs font-semibold text-brand-700">ดูรายละเอียด<ArrowIcon className="h-3.5 w-3.5 transition-transform duration-base group-hover:translate-x-1.5 group-focus-visible:translate-x-1.5" /></span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {selected ? (
          <div ref={detailRef} id="solution-detail" className="mt-8 scroll-mt-28" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={selected.id}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.38 }}
                className="grid overflow-hidden rounded-panel border border-brand-300/70 bg-brand-900 text-white shadow-lift-lg lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)]"
              >
                <div className="p-7 sm:p-9">
                  <p className="font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-brand-300">SELECTED · {selected.eyebrow}</p>
                  <h3 className="thai-display mt-4 text-title font-bold">{selected.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-brand-100/70">{selected.summary}</p>
                  <ul className="mt-6 space-y-2">
                    {selected.highlights.map((highlight) => <li key={highlight} className="flex items-start gap-2.5 text-sm text-brand-100/75"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-400" />{highlight}</li>)}
                  </ul>
                  <Link to={selectedContactHref} className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-200">ปรึกษาโซลูชันนี้<ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" /></Link>
                </div>
                <div className="min-h-[22rem] bg-brand-800 p-5 sm:p-7">
                  <div className="h-full min-h-[20rem] overflow-hidden rounded-card shadow-lift-lg ring-1 ring-brand-300/20"><ProductPanel slot={visualForSolution(selected.id)} className="h-full" frame="none" showMockNotice /></div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
