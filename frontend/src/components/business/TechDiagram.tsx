import { motion } from 'framer-motion';
import { useState } from 'react';
import { Container } from '@/components/shared/Layout';
import { techStack } from '@/data/company';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import { SectionBackdrop } from './SectionBackdrop';
import { useLocale } from '@/app/LocaleContext';
import { techCopy, techText } from '@/i18n/home';

/**
 * TECHNOLOGY — a capability diagram, not a logo wall.
 *
 * The four layers are drawn as a stack with data moving down through them,
 * because that is the actual relationship: infrastructure carries data, data
 * serves the backend, the backend serves the frontend. A row of logos would say
 * nothing about how any of it fits together.
 *
 * No "trusted by" language anywhere — these are our tools, not our clients.
 * Each item's `note` from the locked data is the reason we chose it, shown on
 * hover and focus rather than hidden in a `title` attribute.
 */

/** Layer order, top of the stack first. */
const LAYER_ORDER = ['Frontend', 'Backend', 'Data', 'Infrastructure'];

const ORDERED = LAYER_ORDER.map((name) =>
  techStack.find((group) => group.group === name)
).filter((group): group is (typeof techStack)[number] => Boolean(group));

export function TechDiagram({ code = '09 / STACK' }: { code?: string } = {}) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>({ threshold: 0.25 });
  /* The whole active tool, so the read-out can name its layer as well as the
     reason we chose it. */
  const [active, setActive] = useState<{ name: string; note: string; layer: string } | null>(null);
  const reduced = useReducedMotion();
  const { t } = useLocale();
  const note = (group: string, name: string, fallback: string) => {
    const text = techText[group]?.notes[name];
    return text ? t(text) : fallback;
  };

  return (
    <section className="sect sect--technical relative overflow-hidden py-section">
      <span aria-hidden="true" className="sect-edge-top" />
      <SectionBackdrop variant="light-grid" intensity={0.9} />

      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div>
            <p className="section-code">{code}</p>
            <h2 className="thai-display mt-3 text-statement font-bold text-ink">
              {t(techCopy.title)[0]}
              <br />
              <span className="text-brand-600">{t(techCopy.title)[1]}</span>
            </h2>
            <p className="mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-steel-600">
              {t(techCopy.lead)}
            </p>

            {/* Read-out for the focused tool: which layer, and why we use it */}
            <div className="mt-8 min-h-[7rem] rounded-panel border border-steel-200/80 bg-white/70 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-steel-400">
                  why this
                </p>
                {active ? (
                  <span className="rounded-pill border border-brand-200 bg-brand-50 px-2.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.12em] text-brand-700">
                    {active.layer}
                  </span>
                ) : null}
              </div>
              {active ? (
                <p className="mt-3 font-mono text-[0.8125rem] font-medium text-ink">{active.name}</p>
              ) : null}
              <motion.p
                key={active?.name ?? 'idle'}
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-2 text-sm leading-relaxed text-steel-600"
              >
                {active ? note(active.layer, active.name, active.note) : t(techCopy.idle)}
              </motion.p>
            </div>
          </div>

          {/* ------------------------------------------------- the diagram -- */}
          <div ref={ref} className="relative">
            {/* Vertical data spine */}
            <div
              aria-hidden="true"
              className="absolute bottom-6 left-6 top-6 w-px bg-steel-200 sm:left-8"
            >
              <motion.span
                className="block h-full w-full origin-top bg-gradient-to-b from-brand-500 via-brand-400 to-brand-200"
                initial={reduced ? false : { scaleY: 0 }}
                animate={inView || reduced ? { scaleY: 1 } : undefined}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Data packet travelling down the spine */}
              {!reduced ? (
                <motion.span
                  className="absolute left-1/2 h-8 w-0.5 -translate-x-1/2 rounded-pill bg-brand-400"
                  animate={{ top: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.15, 0.85, 1] }}
                />
              ) : null}
            </div>

            <div className="space-y-4">
              {ORDERED.map((group, groupIndex) => (
                <motion.div
                  key={group.group}
                  initial={reduced ? false : { opacity: 0, x: 18 }}
                  animate={inView || reduced ? { opacity: 1, x: 0 } : undefined}
                  transition={{ duration: 0.6, delay: groupIndex * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="relative pl-16 sm:pl-20"
                >
                  {/* Node on the spine */}
                  <span
                    aria-hidden="true"
                    className="absolute left-[1.125rem] top-6 flex h-3 w-3 items-center justify-center rounded-full border border-brand-400 bg-white sm:left-[1.625rem]"
                  >
                    <span className="h-1 w-1 rounded-full bg-brand-500" />
                  </span>

                  {/* Not interactive: the chips inside are the buttons. */}
                  <div
                    className={cn(
                      'rounded-card border bg-white p-5 transition-colors duration-base',
                      active?.layer === group.group
                        ? 'border-brand-300 bg-brand-50/40'
                        : 'border-steel-200'
                    )}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-sm font-semibold text-ink">{group.group}</h3>
                      <span className="thai-display text-xs text-steel-400">{techText[group.group] ? t(techText[group.group]!.group) : group.groupTh}</span>
                    </div>

                    <ul className="mt-4 flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <li key={item.name}>
                          <button
                            type="button"
                            onPointerEnter={() =>
                              setActive({ name: item.name, note: item.note, layer: group.group })
                            }
                            onFocus={() =>
                              setActive({ name: item.name, note: item.note, layer: group.group })
                            }
                            onBlur={() => setActive(null)}
                            onClick={() =>
                              setActive((current) =>
                                current?.name === item.name
                                  ? null
                                  : { name: item.name, note: item.note, layer: group.group }
                              )
                            }
                            className={cn(
                              'rounded-pill border px-3.5 py-1.5 font-mono text-[0.625rem] uppercase tracking-[0.08em] transition-all duration-base',
                              active?.name === item.name
                                ? 'border-brand-400 bg-brand-500 text-white shadow-brand-glow'
                                : 'border-steel-200 text-steel-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'
                            )}
                          >
                            {item.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
