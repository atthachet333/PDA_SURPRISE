import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useLocale } from '@/app/LocaleContext';
import { ArrowIcon } from '@/components/shared/Button';
import { Container } from '@/components/shared/Layout';
import { LocaleLink } from '@/components/shared/LocaleLink';
import {
  GRAPH,
  SHOWCASE_FIRST_DELAY_MS,
  SHOWCASE_PERIOD_MS,
  SHOWCASE_TRANSITION,
  counterLabel,
  graphNodes,
  keyToIndex,
  serviceHref,
  swipeToIndex
} from '@/data/capabilityShowcase';
import { usePageVisible } from '@/hooks/usePageVisible';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { showcase, showcaseItems } from '@/i18n/home';
import { usePrimaryServices } from '@/i18n/useContent';
import { cn } from '@/lib/cn';
import { SectionBackdrop } from './SectionBackdrop';

/**
 * CAPABILITY SHOWCASE (EP46.6.1) — replaces the kinetic marquee.
 *
 * One capability in focus at a time, a stable architecture map that shifts its
 * emphasis to that capability, and a quiet selector to choose one by hand.
 *
 * TIMING. The capability hands over every 5s, measured from its arrival; the
 * title cross-fade takes the last ~0.9s, so the next one has settled by the
 * boundary. The first hand-over waits 6.5s so it never turns over in step with
 * the hero drift above. One `setTimeout` per state, cleared by the effect — no
 * interval, so a remount, a locale or theme change can never leave a second
 * loop running.
 *
 * PAUSES. Reduced motion (never auto-advances), a hidden tab, the section off
 * screen, and while the visitor's pointer or keyboard focus is on the
 * selector (hover previews there; it never changes the focus by itself). A
 * manual choice restarts the full 5s.
 *
 * ACCESSIBILITY. The selector is a WAI-ARIA tablist (arrows, Home/End, Enter/
 * Space); the panel is its tabpanel. There is no live region: an automatic
 * change every 5s would be announced forever. The map is decorative.
 *
 * COST. Only this section re-renders, once per hand-over. Motion is transform,
 * opacity and a short text blur during the cross-fade; the ambient signal is a
 * single SVG dot.
 */
export function CapabilityShowcase({ className }: { className?: string }) {
  const { t } = useLocale();
  const services = usePrimaryServices();
  const reduced = useReducedMotion();
  const pageVisible = usePageVisible();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: '-12% 0px -12% 0px' });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const firstRun = useRef(true);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const [active, setActive] = useState(0);
  /** Bumped by a manual choice so the timer and progress restart even on the same tab. */
  const [cycle, setCycle] = useState(0);
  const [holding, setHolding] = useState(false);

  const count = services.length;
  const running = !reduced && pageVisible && inView && !holding;
  const delay = firstRun.current ? SHOWCASE_FIRST_DELAY_MS : SHOWCASE_PERIOD_MS;

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setTimeout(() => {
      firstRun.current = false;
      setActive((index) => (index + 1) % count);
    }, delay);
    return () => window.clearTimeout(timer);
  }, [running, active, cycle, count, delay]);

  const choose = useCallback((index: number, focus = false) => {
    firstRun.current = false;
    setActive(index);
    setCycle((value) => value + 1);
    if (focus) tabRefs.current[index]?.focus();
  }, []);

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const next = keyToIndex(event.key, active, count);
    if (next === null) return;
    event.preventDefault();
    choose(next, true);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') swipeStart.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: PointerEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const next = swipeToIndex(event.clientX - start.x, event.clientY - start.y, active, count);
    if (next !== null) choose(next);
  };

  const service = services[active];
  const item = service ? showcaseItems[service.id as keyof typeof showcaseItems] : undefined;
  if (!service || !item) return null;

  const tabId = (id: string) => `showcase-tab-${id}`;
  const panelId = 'showcase-panel';

  return (
    <section
      ref={sectionRef}
      className={cn('sect sect--grid relative overflow-hidden border-y border-steel-200 py-14 sm:py-16 lg:py-20', className)}
      aria-label={t(showcase.label)}
    >
      <SectionBackdrop variant="light-grid" intensity={0.55} />

      <Container wide className="relative">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
          {/* -------------------------------------------- foreground: focus -- */}
          <div
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId(service.id)}
            className="touch-pan-y"
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={() => (swipeStart.current = null)}
          >
            <div className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.18em]">
              <span className="tabular-nums text-brand-600">{counterLabel(active, count)}</span>
              <span aria-hidden="true" className="h-px w-8 bg-brand-400/50" />
              <h2 className="thai-display text-steel-500">{t(showcase.eyebrow)}</h2>
            </div>

            {/* Reserved two-line box: the page never moves when a short title
                replaces a long one. 2.7em, not 2.44: a fallback font (web fonts
                blocked or slow) sets taller line boxes than IBM Plex. */}
            <div className="relative mt-5 h-[2.7em] text-[1.75rem] font-bold sm:text-[2.25rem] lg:text-[2.125rem] xl:text-[2.5rem] 2xl:text-[2.875rem]">
              <AnimatePresence initial={false}>
                <motion.h3
                  key={service.id}
                  className="thai-display absolute inset-x-0 top-0 text-balance leading-[1.22] text-ink"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14, filter: 'blur(4px)' }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: reduced
                      ? { duration: 0.15 }
                      : { duration: SHOWCASE_TRANSITION.enterS, delay: SHOWCASE_TRANSITION.enterDelayS, ease: [0.22, 1, 0.36, 1] }
                  }}
                  exit={
                    reduced
                      ? { opacity: 0, transition: { duration: 0.1 } }
                      : { opacity: 0, y: -10, filter: 'blur(3px)', transition: { duration: SHOWCASE_TRANSITION.exitS, ease: [0.4, 0, 1, 1] } }
                  }
                >
                  {service.title}
                </motion.h3>
              </AnimatePresence>
            </div>

            {/* The four terms, as a small pipeline. Fixed height: wraps to two
                rows on phones, never pushes the page. */}
            <ol className="mt-5 flex min-h-[4.75rem] flex-wrap content-start items-center gap-x-1.5 gap-y-2 xl:min-h-[2.25rem]" aria-label={service.nameEn}>
              {t(item.terms).map((term, index) => (
                <li key={`${service.id}-${term}`} className="flex items-center gap-1.5">
                  {index > 0 ? <span aria-hidden="true" className="h-px w-3 bg-brand-400/60 sm:w-5" /> : null}
                  <motion.span
                    initial={reduced ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: reduced ? 0 : 0.35 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="thai-display inline-flex items-center gap-1.5 rounded-pill border border-steel-200 bg-white/70 px-2.5 py-1 text-xs font-medium text-steel-600 backdrop-blur-sm"
                  >
                    <span aria-hidden="true" className="font-mono text-[0.5625rem] text-brand-600">{String(index + 1).padStart(2, '0')}</span>
                    {term}
                  </motion.span>
                </li>
              ))}
            </ol>

            <LocaleLink
              to={serviceHref(service.id)}
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-600"
            >
              <span className="thai-display">{t(showcase.view)}</span>
              <span className="sr-only">: {service.title}</span>
              <ArrowIcon />
            </LocaleLink>
          </div>

          {/* ----------------------------------------------- midground: map -- */}
          <SystemMap activeId={service.id} labels={services.map((entry) => t(showcaseItems[entry.id as keyof typeof showcaseItems].short))} hub={t(showcase.hub)} animate={running} reduced={reduced} />
        </div>

        {/* -------------------------------------------------- selector ------ */}
        <div
          role="tablist"
          aria-label={t(showcase.selector)}
          className="mt-8 flex items-stretch justify-between gap-0 border-t border-steel-200/80 pt-3 sm:mt-10 sm:justify-start sm:gap-1 lg:mt-12"
          onPointerEnter={(event) => event.pointerType === 'mouse' && setHolding(true)}
          onPointerLeave={(event) => event.pointerType === 'mouse' && setHolding(false)}
          onFocus={() => setHolding(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHolding(false);
          }}
        >
          {services.map((entry, index) => {
            const selected = index === active;
            const short = t(showcaseItems[entry.id as keyof typeof showcaseItems].short);
            return (
              <button
                key={entry.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                id={tabId(entry.id)}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                aria-label={entry.title}
                tabIndex={selected ? 0 : -1}
                onClick={() => choose(index)}
                onKeyDown={onTabKey}
                className={cn(
                  'group relative flex h-11 w-[2.625rem] shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:w-auto sm:px-3 lg:px-3.5',
                  selected ? 'text-ink' : 'text-steel-400 hover:bg-steel-100/70 hover:text-steel-700'
                )}
              >
                {/* Phones: a dot per capability. Wider screens: the short name. */}
                <span
                  aria-hidden="true"
                  className={cn('h-2 rounded-full transition-all duration-500 sm:hidden', selected ? 'w-5 bg-brand-500' : 'w-2 bg-steel-300 group-hover:bg-steel-400')}
                />
                <span aria-hidden="true" className="thai-display hidden whitespace-nowrap text-xs font-semibold uppercase tracking-[0.08em] sm:inline">
                  {short}
                </span>
                {/* Time left on this capability: a hairline that fills over 5s. */}
                {selected ? (
                  <span aria-hidden="true" className="absolute inset-x-1.5 -top-3 h-px overflow-hidden bg-steel-200 sm:inset-x-3">
                    {running ? (
                      <span
                        key={`${active}-${cycle}`}
                        className="showcase-progress block h-full origin-left bg-brand-500"
                        style={{ animationDuration: `${delay}ms` }}
                      />
                    ) : (
                      <span className="block h-full bg-brand-500/70" />
                    )}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/**
 * One stable architecture map. Nothing is rebuilt on a hand-over: the active
 * node grows and fills, its link brightens, one signal dot runs hub → node,
 * and the rest dim. Decorative: the selector and the panel carry the meaning.
 */
function SystemMap({
  activeId,
  labels,
  hub,
  animate,
  reduced
}: {
  activeId: string;
  labels: string[];
  hub: string;
  animate: boolean;
  reduced: boolean;
}) {
  const activeNode = graphNodes.find((node) => node.id === activeId);
  return (
    <div aria-hidden="true" className="pointer-events-none relative mx-auto w-full max-w-[34rem] lg:max-w-none">
      {/* Soft light behind the hub only — never behind the text column. */}
      <span className="absolute left-1/2 top-1/2 -z-10 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(53,201,111,0.16),rgba(56,120,190,0.06)_45%,transparent_70%)] blur-2xl" />
      <svg viewBox={`0 0 ${GRAPH.width} ${GRAPH.height}`} className="h-auto w-full overflow-visible" role="presentation">
        {/* Orbit: the system boundary, its dashes flowing very slowly. */}
        <ellipse
          cx={GRAPH.hub.x}
          cy={GRAPH.hub.y}
          rx={GRAPH.rx}
          ry={GRAPH.ry}
          fill="none"
          strokeWidth="1"
          strokeDasharray="2 7"
          className={cn('text-steel-300', !reduced && 'showcase-orbit')}
          stroke="currentColor"
        />
        <ellipse cx={GRAPH.hub.x} cy={GRAPH.hub.y} rx={GRAPH.rx * 0.52} ry={GRAPH.ry * 0.52} fill="none" stroke="currentColor" strokeWidth="1" className="text-steel-200" />

        {/* Links */}
        {graphNodes.map((node) => {
          const on = node.id === activeId;
          return (
            <path
              key={`link-${node.id}`}
              d={node.path}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              className={cn('showcase-fade', on ? 'text-brand-500' : 'text-steel-300')}
              strokeWidth={on ? 2 : 1}
              strokeOpacity={on ? 0.95 : 0.55}
            />
          );
        })}

        {/* Signal: one dot travelling hub → active node while the map is live. */}
        {animate && activeNode ? (
          <circle key={`signal-${activeId}`} r="3.5" className="text-brand-400" fill="currentColor">
            <animateMotion dur="2.6s" repeatCount="indefinite" path={activeNode.path} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1" />
          </circle>
        ) : null}

        {/* Hub */}
        <circle cx={GRAPH.hub.x} cy={GRAPH.hub.y} r="40" className="text-brand-500" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.35" />
        <circle cx={GRAPH.hub.x} cy={GRAPH.hub.y} r="6" className="text-brand-600" fill="currentColor" />
        <text x={GRAPH.hub.x} y={GRAPH.hub.y + 60} textAnchor="middle" className="fill-current font-mono text-[11px] uppercase tracking-[0.14em] text-steel-400">
          {hub}
        </text>

        {/* Nodes + labels */}
        {graphNodes.map((node, index) => {
          const on = node.id === activeId;
          return (
            <g key={node.id}>
              {on && !reduced ? (
                <circle cx={node.x} cy={node.y} r="20" className="showcase-halo text-brand-400" fill="currentColor" fillOpacity="0.16" />
              ) : null}
              <circle
                cx={node.x}
                cy={node.y}
                r={on ? 9 : 5.5}
                strokeWidth="1.5"
                stroke="currentColor"
                className={cn('showcase-fade', on ? 'fill-brand-500 text-brand-600' : 'fill-white text-steel-300')}
              />
              <text
                x={node.label.x}
                y={node.label.y}
                textAnchor={node.label.anchor}
                className={cn(
                  'showcase-fade hidden fill-current font-mono text-[12px] uppercase tracking-[0.1em] sm:inline',
                  on ? 'font-semibold text-brand-700' : 'text-steel-400'
                )}
              >
                {labels[index]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
