import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container } from '@/components/shared/Layout';
import { Icon } from '@/components/shared/Icon';
import { ArrowIcon } from '@/components/shared/Button';
import { ProductPanel } from './ProductPanel';
import { primaryServices, services, type Service } from '@/data/services';
import { visualForService } from '@/data/visuals';
import { SectionBackdrop } from './SectionBackdrop';
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
  const { hash } = useLocation();
  const reduced = useReducedMotion();
  const active = items[activeIndex] ?? items[0];

  // Keep the selection valid if the caller swaps the list.
  useEffect(() => {
    setActiveIndex((current) => (current < items.length ? current : 0));
  }, [items.length]);

  // Service links can address a specific catalogue entry without introducing
  // another detail route. The hash also makes the selected service shareable.
  useEffect(() => {
    const serviceId = hash.slice(1);
    const index = items.findIndex((item) => item.id === serviceId);
    if (index >= 0) setActiveIndex(index);
  }, [hash, items]);

  const select = useCallback((index: number) => setActiveIndex(index), []);

  if (!active) return null;

  const visual = visualForService(active.id);

  return (
    <section id="services" className="sect sect--grid relative overflow-hidden py-section">
      <span aria-hidden="true" className="sect-edge-top" />
      <SectionBackdrop variant="light-grid" pointer />

      <Container wide className="relative">
        <div aria-hidden="true" className="absolute -top-24">
          {items.map((service) => <span key={service.id} id={service.id} />)}
        </div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-code">{code}</p>
            <h2 className="thai-display mt-3 text-statement font-bold text-ink">{title}</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-steel-500">{lead}</p>
        </div>

        {/*
          Desktop columns: nav ~25% / copy ~30% / visual ~45%. The visual carries
          the section — the earlier split gave copy the widest track and left a
          large empty region under an oversized headline.
        */}
        <div className="mt-10 hidden lg:grid lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.68fr)_minmax(0,1fr)] lg:gap-8 xl:gap-10">
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
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-card border border-brand-200 bg-brand-50 text-brand-600">
                    <Icon name={active.icon} className="h-4 w-4" />
                  </span>
                  <p className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-steel-400">
                    {active.nameEn}
                  </p>
                </div>

                <h3 className="thai-display mt-4 text-xl font-bold text-ink xl:text-2xl">
                  {active.title}
                </h3>

                <p className="mt-3 text-[0.9375rem] leading-relaxed text-steel-600">
                  {active.summary}
                </p>

                {/* Three capabilities only; the full list lives on /services. */}
                <ul className="mt-5 space-y-2">
                  {active.deliverables.slice(0, 3).map((item, index) => (
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

                <div className="mt-5 flex flex-wrap items-center gap-1.5">
                  {active.tech.map((item) => (
                    <span
                      key={item}
                      className="rounded-pill border border-steel-200 px-2.5 py-1 font-mono text-[0.5rem] uppercase tracking-[0.1em] text-steel-500"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <Link
                  to="/contact"
                  className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand-600"
                >
                  ปรึกษาเรื่องบริการนี้
                  <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* right — the product itself */}
          <div className="relative">
            <div className="sticky top-28">
              <motion.div
                key={active.id}
                initial={reduced ? false : { opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  'overflow-hidden rounded-card shadow-lift-lg ring-1 ring-black/5',
                  visual.mock === 'hrLine' ? 'mx-auto aspect-[10/15] max-w-[16rem]' : 'aspect-[16/11]'
                )}
              >
                <ProductPanel slot={visual} className="h-full" showMockNotice />
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
            const mobileVisual = visualForService(service.id);
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

                        <div
                          className={cn(
                            'mt-5 overflow-hidden rounded-card shadow-soft ring-1 ring-black/5',
                            mobileVisual.mock === 'hrLine'
                              ? 'mx-auto aspect-[10/15] max-w-[13rem]'
                              : 'aspect-[16/11]'
                          )}
                        >
                          <ProductPanel slot={mobileVisual} className="h-full" />
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
