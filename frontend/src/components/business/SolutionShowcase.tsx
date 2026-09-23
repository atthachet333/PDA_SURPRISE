import { motion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/shared/Layout';
import { ArrowIcon } from '@/components/shared/Button';
import { ProductPanel } from './ProductPanel';
import { SectionBackdrop } from './SectionBackdrop';
import { solutions, type Solution } from '@/data/solutions';
import { visualForSolution } from '@/data/visuals';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

/**
 * SOLUTIONS — a compact selector, not a scroll journey.
 *
 * WHAT THIS REPLACED
 *   Six sticky story panels, one viewport-height each: ~2150px of section that
 *   made a visitor wheel through several screens just to discover six options.
 *   All six are now visible at once beside one large product visual, and the
 *   section is roughly a screen and a half.
 *
 * INTERACTION
 *   The rail is a real tablist: click or arrow-key to switch, and the visual and
 *   copy cross-fade. Hover also selects on desktop, so mouse and keyboard reach
 *   the same state.
 */

const FEATURED_IDS = [
  'erp',
  'hr-payroll',
  'document-workflow',
  'sales-inventory',
  'tracking',
  'automation'
];

/** One-line statement of what each solution is actually for. */
const PROBLEM: Record<string, string> = {
  erp: 'รวมข้อมูลธุรกิจไว้ในระบบเดียว',
  'hr-payroll': 'ลดเวลาจัดทำเงินเดือนและตรวจสอบย้อนหลัง',
  'document-workflow': 'จัดเก็บ ค้นหา และควบคุมเอกสารจากจุดเดียว',
  'sales-inventory': 'ยอดสต็อกตรงกับของจริงทุกช่องทาง',
  tracking: 'รู้ว่างานอยู่ขั้นตอนไหน โดยไม่ต้องโทรถาม',
  automation: 'ตัดงานซ้ำที่กินเวลาทุกเดือนออกไป'
};

const FEATURED: Solution[] = FEATURED_IDS.map((id) =>
  solutions.find((solution) => solution.id === id)
).filter((solution): solution is Solution => Boolean(solution));

export function SolutionShowcase({ code = '05 / SOLUTIONS' }: { code?: string } = {}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduced = useReducedMotion();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const active = FEATURED[activeIndex] ?? FEATURED[0];

  /** Roving arrow-key navigation, as a tablist should have. */
  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    setActiveIndex((current) => {
      const last = FEATURED.length - 1;
      let next = current;
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = current === last ? 0 : current + 1;
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = current === 0 ? last : current - 1;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = last;
      tabRefs.current[next]?.focus();
      return next;
    });
  }, []);

  if (!active) return null;
  const visual = visualForSolution(active.id);

  return (
    <section id="solutions" className="sect sect--field relative overflow-hidden py-section">
      <span aria-hidden="true" className="sect-edge-top" />
      <SectionBackdrop variant="aurora" pointer />

      <Container wide className="relative">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-code">{code}</p>
            <h2 className="thai-display mt-3 text-statement font-bold text-ink">
              ไม่ใช่แค่เขียนโปรแกรม
              <br />
              <span className="text-brand-600">แต่ออกแบบให้ธุรกิจทำงานง่ายขึ้น</span>
            </h2>
          </div>
          <Link
            to="/solutions"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand-600"
          >
            ดูโซลูชันทั้งหมด
            <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
          </Link>
        </div>

        {/* --------------------------------------------- desktop: visual + rail -- */}
        <div className="mt-8 hidden gap-8 lg:grid lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] xl:gap-10">
          <div>
            <motion.div
              key={active.id}
              initial={reduced ? false : { opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden rounded-panel shadow-lift-lg ring-1 ring-black/5"
            >
              <div className="aspect-[16/10]">
                <ProductPanel slot={visual} className="h-full" frame="none" showMockNotice />
              </div>
            </motion.div>

            {/* Detail sits under the visual so the rail stays short. */}
            <motion.div
              key={`${active.id}-copy`}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-6 grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
            >
              <div>
                <p className="thai-display text-lg font-bold text-ink">{active.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-steel-600">{active.summary}</p>
              </div>
              <ul className="space-y-1.5">
                {active.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2.5 text-sm text-steel-600">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <div
            role="tablist"
            aria-label="เลือกโซลูชัน"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="self-start border-t border-steel-300/60"
          >
            {FEATURED.map((solution, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={solution.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="solution-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setActiveIndex(index)}
                  onPointerEnter={() => setActiveIndex(index)}
                  className={cn(
                    'group relative flex w-full items-start gap-3.5 border-b border-steel-300/60 py-4 text-left transition-colors duration-base',
                    isActive ? 'text-ink' : 'text-steel-500 hover:text-ink'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute left-0 top-0 h-full w-0.5 origin-top bg-brand-500 transition-transform duration-base ease-smooth',
                      isActive ? 'scale-y-100' : 'scale-y-0'
                    )}
                  />
                  <span
                    className={cn(
                      'pl-3 font-mono text-[0.625rem] tabular-nums transition-colors duration-base',
                      isActive ? 'text-brand-600' : 'text-steel-400'
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="thai-display block text-sm font-semibold">{solution.title}</span>
                    <span className="mt-1 block text-xs leading-relaxed text-steel-500">
                      {PROBLEM[solution.id] ?? solution.summary}
                    </span>
                  </span>
                  <ArrowIcon
                    className={cn(
                      'mt-0.5 h-3.5 w-3.5 shrink-0 transition-all duration-base',
                      isActive ? 'text-brand-500 opacity-100' : 'opacity-0 group-hover:opacity-50'
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------------------------------------------------- mobile: tabs -- */}
        <div className="mt-8 lg:hidden">
          <div
            role="tablist"
            aria-label="เลือกโซลูชัน"
            className="no-scrollbar -mx-gutter flex snap-x gap-2 overflow-x-auto px-gutter pb-1"
          >
            {FEATURED.map((solution, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={solution.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    'thai-display shrink-0 snap-start rounded-pill border px-4 py-2 text-xs font-semibold transition-colors duration-base',
                    isActive
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-steel-300 bg-white text-steel-600'
                  )}
                >
                  {solution.title}
                </button>
              );
            })}
          </div>

          <motion.div
            key={active.id}
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-5"
          >
            <div className="overflow-hidden rounded-card shadow-lift ring-1 ring-black/5">
              <div className="aspect-[16/11]">
                <ProductPanel slot={visual} className="h-full" frame="none" />
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-steel-600">{active.summary}</p>
            <ul className="mt-3 space-y-1.5">
              {active.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2.5 text-sm text-steel-600">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                  {highlight}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Announced to assistive tech, not just repainted. */}
        <div id="solution-panel" role="tabpanel" aria-live="polite" className="sr-only">
          {active.title} — {active.summary}
        </div>
      </Container>
    </section>
  );
}
