import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/shared/Layout';
import { Icon } from '@/components/shared/Icon';
import { ArrowIcon } from '@/components/shared/Button';
import { PREVIEWS, type PreviewKind } from './UIPreview';
import { primaryServices, services, type Service } from '@/data/services';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

/**
 * SERVICES — a three-column explorer, not a card grid.
 *
 *   LEFT    01-07 numbered index; the active row expands
 *   CENTRE  Thai headline, description, deliverables
 *   RIGHT   a product visual that swaps with the selection
 *
 * Desktop selects on hover AND on focus, so a keyboard user gets exactly the
 * same behaviour as a mouse user — the list is a real listbox-style set of
 * buttons, never a hover-only affordance.
 *
 * Under 1024px this becomes a premium accordion: the numbered rows stay, and the
 * body opens underneath the active one. That is a different composition rather
 * than a squashed version of the desktop layout.
 */

/** Maps a service's `preview` onto the shared UIPreview family. */
const PREVIEW_FOR: Record<string, PreviewKind> = {
  dashboard: 'chart',
  table: 'table',
  flow: 'flow',
  mobile: 'cards',
  chart: 'chart',
  nodes: 'flow'
};

interface ServiceExplorerProps {
  /** Which services to show. Defaults to the seven primary ones. */
  items?: Service[];
  /** Section eyebrow code, e.g. '03 / SERVICES'. */
  code?: string;
  title?: React.ReactNode;
  lead?: string;
  /** Shows a link through to the full /services page. */
  showAllLink?: boolean;
}

export function ServiceExplorer({
  items = primaryServices,
  code = '03 / SERVICES',
  title = (
    <>
      เจ็ดบริการหลัก
      <br />
      <span className="text-brand-600">ที่ธุรกิจไทยใช้งานจริง</span>
    </>
  ),
  lead = 'เลือกหัวข้อเพื่อดูสิ่งที่ส่งมอบและเทคโนโลยีที่ใช้ งานส่วนใหญ่ใช้หลายบริการร่วมกัน',
  showAllLink = false
}: ServiceExplorerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduced = useReducedMotion();
  const active = items[activeIndex] ?? items[0];

  // Keep the selection valid if the caller swaps the list.
  useEffect(() => {
    setActiveIndex((current) => (current < items.length ? current : 0));
  }, [items.length]);

  const select = useCallback((index: number) => setActiveIndex(index), []);

  if (!active) return null;

  const Preview = PREVIEWS[PREVIEW_FOR[active.preview] ?? 'chart'];

  return (
    <section id="services" className="sect sect--grid relative overflow-hidden py-section">
      <div className="sect-layer grid-lines" aria-hidden="true" />

      <Container className="relative">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-code">{code}</p>
            <h2 className="thai-display mt-4 text-mega font-bold text-ink">{title}</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-steel-500">{lead}</p>
        </div>

        {/* ------------------------------------------------------ desktop -- */}
        <div className="mt-14 hidden lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.25fr)_minmax(0,0.85fr)] lg:gap-10">
          {/* index */}
          <ul className="border-t border-steel-200">
            {items.map((service, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={service.id} className="border-b border-steel-200">
                  <button
                    type="button"
                    onPointerEnter={() => select(index)}
                    onFocus={() => select(index)}
                    onClick={() => select(index)}
                    aria-pressed={isActive}
                    className="group flex w-full items-center gap-4 py-4 text-left"
                  >
                    <span
                      className={cn(
                        'font-mono text-[0.6875rem] tabular-nums transition-colors duration-base',
                        isActive ? 'text-brand-500' : 'text-steel-300'
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'thai-display block truncate text-base font-semibold transition-colors duration-base',
                          isActive ? 'text-ink' : 'text-steel-500 group-hover:text-ink'
                        )}
                      >
                        {service.title}
                      </span>
                      <AnimatePresence initial={false}>
                        {isActive ? (
                          <motion.span
                            initial={reduced ? false : { opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="block overflow-hidden"
                          >
                            <span className="mt-1 block font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-brand-600">
                              {service.nameEn}
                            </span>
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </span>
                    <span
                      className={cn(
                        'h-px shrink-0 bg-brand-500 transition-all duration-slow ease-smooth',
                        isActive ? 'w-6' : 'w-0'
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* centre */}
          <div className="min-h-[24rem]">
            {/*
              Keyed remount rather than `AnimatePresence mode="wait"`.
              With mode="wait" the incoming panel is blocked until the outgoing
              one finishes exiting — and a paused animation (backgrounded tab,
              or reduced motion with no exit transition) never finishes, leaving
              the panel stuck on a stale service. It also added ~400ms of dead
              time to every row hover. A keyed remount cannot stall.
            */}
            <div>
              <motion.div
                key={active.id}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-card border border-brand-200 bg-brand-50 text-brand-600">
                  <Icon name={active.icon} className="h-5 w-5" />
                </span>

                <h3 className="thai-display mt-6 text-statement font-bold text-ink">
                  {active.title}
                </h3>
                <p className="mt-2 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-steel-400">
                  {active.nameEn}
                </p>

                <p className="mt-5 text-lead text-steel-600">{active.summary}</p>
                <p className="mt-4 text-sm leading-relaxed text-steel-500">{active.detail}</p>

                <ul className="mt-7 grid gap-2 sm:grid-cols-2">
                  {active.deliverables.map((item, index) => (
                    <motion.li
                      key={item}
                      initial={reduced ? false : { opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.1 + index * 0.05 }}
                      className="flex items-start gap-2.5 text-sm text-steel-600"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                      {item}
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-7 flex flex-wrap items-center gap-2">
                  {active.tech.map((item) => (
                    <span
                      key={item}
                      className="rounded-pill border border-steel-200 px-3 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-steel-500"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <Link
                  to="/contact"
                  className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand-600"
                >
                  ปรึกษาเรื่องบริการนี้
                  <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* right — product visual */}
          <div className="relative">
            <div className="sticky top-28">
              <motion.div
                  key={active.id}
                  initial={reduced ? false : { opacity: 0, scale: 0.97, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="plane-light overflow-hidden rounded-panel shadow-lift"
                >
                  <div className="flex items-center justify-between border-b border-steel-100 bg-steel-50/70 px-4 py-2.5">
                    <span className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-steel-400">
                      {active.nameEn}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                  </div>
                  <div className="h-52 p-5">
                    <Preview className="h-full" />
                  </div>
                </motion.div>

              <div className="mt-4 flex items-center justify-between font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-steel-400">
                <span>
                  {String(activeIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                </span>
                <span>{active.primary ? 'PRIMARY SERVICE' : 'CAPABILITY'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------- mobile -- */}
        <div className="mt-10 border-t border-steel-200 lg:hidden">
          {items.map((service, index) => {
            const isOpen = index === activeIndex;
            const MobilePreview = PREVIEWS[PREVIEW_FOR[service.preview] ?? 'chart'];
            return (
              <div key={service.id} className="border-b border-steel-200">
                <button
                  type="button"
                  onClick={() => setActiveIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 py-5 text-left"
                >
                  <span
                    className={cn(
                      'font-mono text-[0.6875rem] tabular-nums transition-colors',
                      isOpen ? 'text-brand-500' : 'text-steel-300'
                    )}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="thai-display min-w-0 flex-1 text-base font-semibold text-ink">
                    {service.title}
                  </span>
                  <span
                    className={cn(
                      'relative h-3 w-3 shrink-0 transition-transform duration-base ease-smooth',
                      isOpen && 'rotate-45'
                    )}
                    aria-hidden="true"
                  >
                    <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-brand-500" />
                    <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-brand-500" />
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-7">
                        <p className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-brand-600">
                          {service.nameEn}
                        </p>
                        <p className="mt-3 text-[0.95rem] leading-relaxed text-steel-600">
                          {service.summary}
                        </p>

                        <div className="plane-light mt-5 overflow-hidden rounded-card">
                          <div className="h-36 p-4">
                            <MobilePreview className="h-full" />
                          </div>
                        </div>

                        <ul className="mt-5 space-y-2">
                          {service.deliverables.map((item) => (
                            <li key={item} className="flex items-start gap-2.5 text-sm text-steel-600">
                              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                              {item}
                            </li>
                          ))}
                        </ul>

                        <div className="mt-5 flex flex-wrap gap-1.5">
                          {service.tech.map((item) => (
                            <span
                              key={item}
                              className="rounded-pill border border-steel-200 px-2.5 py-1 font-mono text-[0.5rem] uppercase tracking-[0.1em] text-steel-500"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {showAllLink ? (
          <div className="mt-12">
            <Link
              to="/services"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand-600"
            >
              ดูบริการทั้งหมด ({services.length})
              <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
            </Link>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
