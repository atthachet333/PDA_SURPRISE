import { useInView } from 'framer-motion';
import { useEffect, useMemo, useReducer, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { useLocale } from '@/app/LocaleContext';
import { ArrowIcon } from '@/components/shared/Button';
import { Container } from '@/components/shared/Layout';
import { LocaleLink } from '@/components/shared/LocaleLink';
import {
  counterLabel,
  delayFor,
  initialState,
  keyToScenario,
  reduce,
  serviceHref,
  swipeDirection,
  transformationScenarios,
  type ShowcaseAction,
  type ShowcaseState,
  type Stage
} from '@/data/transformations';
import { usePageVisible } from '@/hooks/usePageVisible';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { transformation, transformationItems } from '@/i18n/home';
import { usePrimaryServices } from '@/i18n/useContent';
import { cn } from '@/lib/cn';
import { SectionBackdrop } from './SectionBackdrop';
import { SolutionLogo } from './SolutionLogo';

/**
 * BUSINESS TRANSFORMATION SHOWCASE (EP46.6.2) — problem → PDA BLISS SOLUTION →
 * result, one business scenario at a time. Replaces the EP46.6.1 capability
 * map: the system map belongs to /solutions, and Home's job is "this is my
 * problem, here is the system, here is what gets better".
 *
 * THE 5-SECOND STORY. A signal runs problem → solution → result (1.4s, 1.4s,
 * then 2.2s on the result) and the next scenario begins: 5s per scenario. One
 * `setTimeout` at a time, scheduled from the current state and cleared on every
 * change — no interval, so nothing can drift or double up.
 *
 * INTERACTION. Every stage card is a button: it takes the focus and holds it
 * for 5s before the story moves on. Scenario tabs, Previous / Next and a
 * horizontal swipe change scenario at once, back at the problem stage. The
 * pure state machine (data/transformations.ts) turns any input into exactly
 * one valid state; the cards swap which stacked copy is visible rather than
 * mounting and unmounting, so rapid input can never stack fading text.
 *
 * PAUSES. Reduced motion (no auto cycle, no signal motion), a hidden tab, the
 * section off screen, a mouse resting on the scenario controls, and keyboard
 * focus inside the section. A clicked stage is held for 5s, then the story
 * carries on from it.
 *
 * NO LIVE REGION. Automatic changes are not announced; the tabs and stage
 * buttons expose the current state when a visitor goes looking.
 */

interface ScenarioView {
  id: string;
  serviceId: string;
  short: string;
  problem: string;
  problemPoints: string[];
  solutionTitle: string;
  solutionPoints: string[];
  result: string;
  resultPoints: string[];
  href: string;
}

function useScenarios(): ScenarioView[] {
  const { t } = useLocale();
  const services = usePrimaryServices();
  return useMemo(
    () =>
      transformationScenarios.map(({ id, serviceId }) => {
        const service = services.find((entry) => entry.id === serviceId);
        const item = transformationItems[id as keyof typeof transformationItems];
        if (!service || !item) throw new Error(`transformation ${id} is incomplete`);
        return {
          id,
          serviceId,
          short: t(item.short),
          problem: service.problem,
          problemPoints: service.problems.slice(0, 2),
          solutionTitle: service.title,
          solutionPoints: service.deliverables.slice(0, 2),
          result: t(item.result),
          resultPoints: [...t(item.resultPoints)],
          href: serviceHref(serviceId)
        };
      }),
    [services, t]
  );
}

/**
 * The scenario the visitor was on, kept across a remount. A locale switch
 * re-renders Home under a new URL; without this the story would jump back to
 * the first scenario mid-read. Module scope: a full reload starts fresh.
 */
let rememberedScenario = 0;

export function TransformationShowcase({ className }: { className?: string }) {
  const { t } = useLocale();
  const scenarios = useScenarios();
  const reduced = useReducedMotion();
  const pageVisible = usePageVisible();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: '-10% 0px -10% 0px' });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const firstRun = useRef(true);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swallowClick = useRef(false);

  const [state, rawDispatch] = useReducer(reduce, { ...initialState, scenario: rememberedScenario });
  useEffect(() => {
    rememberedScenario = state.scenario;
  }, [state.scenario]);
  /** Bumped by every visitor action so the timer restarts even when the state is unchanged. */
  const [nonce, setNonce] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [focusInside, setFocusInside] = useState(false);

  const act = (action: ShowcaseAction) => {
    firstRun.current = false;
    rawDispatch(action);
    setNonce((value) => value + 1);
  };

  const running = !reduced && pageVisible && inView && !hovering && !focusInside;

  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setTimeout(() => {
      firstRun.current = false;
      rawDispatch({ type: 'tick' });
    }, delayFor(state, firstRun.current));
    return () => window.clearTimeout(timer);
  }, [running, state, nonce]);

  const scenario = scenarios[state.scenario];
  if (!scenario) return null;

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    const next = keyToScenario(event.key, state.scenario);
    if (next === null) return;
    event.preventDefault();
    act({ type: 'select', scenario: next });
    tabRefs.current[next]?.focus();
  };

  const onPointerDown = (event: PointerEvent) => {
    swallowClick.current = false;
    if (event.pointerType !== 'mouse') swipeStart.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: PointerEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const direction = swipeDirection(event.clientX - start.x, event.clientY - start.y);
    if (!direction) return;
    swallowClick.current = true; // the finger lifted over a card: that is a swipe, not a tap
    act({ type: direction });
  };

  const hoverHandlers = {
    onPointerEnter: (event: PointerEvent) => event.pointerType === 'mouse' && setHovering(true),
    onPointerLeave: (event: PointerEvent) => event.pointerType === 'mouse' && setHovering(false)
  };
  /*
   * Keyboard focus pauses the story; a mouse click does not (the clicked card
   * keeps focus, and that must not freeze the showcase — the click already
   * holds its stage for 5s).
   */
  const focusHandlers = {
    onFocus: (event: FocusEvent<HTMLElement>) => setFocusInside((event.target as HTMLElement).matches(':focus-visible')),
    onBlur: (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusInside(false);
    }
  };

  const stageIndex = ['problem', 'solution', 'result'].indexOf(state.stage);
  const panelId = 'transformation-panel';
  const tabId = (id: string) => `transformation-tab-${id}`;

  return (
    <section
      ref={sectionRef}
      aria-label={t(transformation.label)}
      className={cn('sect sect--grid relative overflow-hidden border-y border-steel-200 py-14 sm:py-16 lg:py-20', className)}
    >
      <SectionBackdrop variant="light-grid" intensity={0.45} />
      <TransformBackground />

      <Container wide className="relative" {...focusHandlers}>
        {/* ------------------------------------------------------- header -- */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 font-mono text-[0.625rem] uppercase tracking-[0.18em]">
              <span className="tabular-nums text-brand-600">{counterLabel(state.scenario)}</span>
              <span aria-hidden="true" className="h-px w-8 bg-brand-400/50" />
              <span className="text-steel-400">{scenario.short}</span>
            </div>
            <h2 className="thai-display mt-3 text-2xl font-bold text-ink sm:text-3xl">{t(transformation.eyebrow)}</h2>
          </div>
          <div className="hidden items-center gap-2 lg:flex" {...hoverHandlers}>
            <StepButton direction="prev" label={t(transformation.prev)} onClick={() => act({ type: 'prev' })} />
            <StepButton direction="next" label={t(transformation.next)} onClick={() => act({ type: 'next' })} />
          </div>
        </div>

        {/* -------------------------------------------------- the story ---- */}
        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={tabId(scenario.id)}
          className="relative mt-8 grid touch-pan-y gap-0 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1.18fr)_3.5rem_minmax(0,1fr)] lg:items-stretch"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipeStart.current = null)}
          onClickCapture={(event) => {
            if (!swallowClick.current) return;
            swallowClick.current = false;
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <StageCard
            stage="problem"
            label={t(transformation.problem)}
            number="01"
            state={state}
            reduced={reduced}
            onSelect={() => act({ type: 'stage', stage: 'problem' })}
          >
            <Stack scenarios={scenarios} active={state.scenario} reduced={reduced}>
              {(item) => (
                <>
                  <span className="thai-display block text-base font-semibold leading-relaxed text-steel-700 sm:text-[1.0625rem]">{item.problem}</span>
                  <span className="mt-4 flex flex-col items-start gap-2">
                    {item.problemPoints.map((point, index) => (
                      <span
                        key={point}
                        className={cn(
                          'thai-display inline-block rounded-md border border-dashed border-steel-300 bg-steel-50/70 px-2.5 py-1.5 text-xs leading-snug text-steel-500',
                          index === 1 && 'ml-3 sm:ml-5'
                        )}
                      >
                        {point}
                      </span>
                    ))}
                  </span>
                </>
              )}
            </Stack>
          </StageCard>

          <Connector filled={stageIndex >= 1} reduced={reduced} />

          <StageCard
            stage="solution"
            label={t(transformation.solution)}
            number="02"
            state={state}
            reduced={reduced}
            onSelect={() => act({ type: 'stage', stage: 'solution' })}
            marker={<SolutionLogo variant="mark" decorative className="h-5" />}
          >
            <Stack scenarios={scenarios} active={state.scenario} reduced={reduced}>
              {(item) => (
                <>
                  <span className="thai-display block text-xl font-bold leading-snug text-ink sm:text-2xl">{item.solutionTitle}</span>
                  <span className="mt-4 block divide-y divide-brand-200/60 border-y border-brand-200/60">
                    {item.solutionPoints.map((point, index) => (
                      <span key={point} className="thai-display flex gap-2.5 py-2 text-xs leading-snug text-steel-600">
                        <span aria-hidden="true" className="font-mono text-[0.5625rem] leading-5 text-brand-600">{String(index + 1).padStart(2, '0')}</span>
                        {point}
                      </span>
                    ))}
                  </span>
                </>
              )}
            </Stack>
          </StageCard>

          <Connector filled={stageIndex >= 2} reduced={reduced} />

          <StageCard
            stage="result"
            label={t(transformation.result)}
            number="03"
            state={state}
            reduced={reduced}
            onSelect={() => act({ type: 'stage', stage: 'result' })}
          >
            <Stack scenarios={scenarios} active={state.scenario} reduced={reduced}>
              {(item) => (
                <>
                  <span className="thai-display block text-base font-semibold leading-relaxed text-ink sm:text-[1.0625rem]">{item.result}</span>
                  <span className="mt-4 flex flex-col gap-2">
                    {item.resultPoints.map((point) => (
                      <span key={point} className="thai-display flex items-start gap-2.5 text-xs leading-snug text-steel-600">
                        <span aria-hidden="true" className="mt-[0.4rem] h-px w-3 shrink-0 bg-brand-500" />
                        {point}
                      </span>
                    ))}
                  </span>
                </>
              )}
            </Stack>
          </StageCard>
        </div>

        {/* -------------------------------------------------- controls ----- */}
        <div className="mt-8 flex flex-col gap-5 border-t border-steel-200/80 pt-4 lg:mt-10 lg:flex-row lg:items-center lg:justify-between">
          {/* Phones keep the whole row clear of the floating contact button
              (fixed bottom-right, ~76px): left-aligned and at most ~270px. */}
          <div className="flex items-center gap-1 pr-16 sm:pr-0" {...hoverHandlers}>
            <StepButton direction="prev" label={t(transformation.prev)} onClick={() => act({ type: 'prev' })} className="lg:hidden" />
            <div role="tablist" aria-label={t(transformation.scenarios)} className="flex items-center">
              {scenarios.map((item, index) => {
                const selected = index === state.scenario;
                return (
                  <button
                    key={item.id}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                    id={tabId(item.id)}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls={panelId}
                    aria-label={item.solutionTitle}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => act({ type: 'select', scenario: index })}
                    onKeyDown={onTabKey}
                    className={cn(
                      'group relative flex h-11 w-7 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:w-auto sm:px-3',
                      selected ? 'text-ink' : 'text-steel-400 hover:bg-steel-100/70 hover:text-steel-700'
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn('h-2 rounded-full transition-all duration-500 sm:hidden', selected ? 'w-4 bg-brand-500' : 'w-2 bg-steel-300')}
                    />
                    <span aria-hidden="true" className="thai-display hidden whitespace-nowrap text-xs font-semibold uppercase tracking-[0.08em] sm:inline">
                      {item.short}
                    </span>
                    {selected ? <span aria-hidden="true" className="absolute inset-x-2 -top-[1.0625rem] hidden h-0.5 rounded-full bg-brand-500 sm:block" /> : null}
                  </button>
                );
              })}
            </div>
            <StepButton direction="next" label={t(transformation.next)} onClick={() => act({ type: 'next' })} className="lg:hidden" />
          </div>

          <LocaleLink
            to={scenario.href}
            className="group inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-brand-700 transition-colors hover:text-brand-600 lg:self-auto"
          >
            <span className="thai-display">{t(transformation.view)}</span>
            <span className="sr-only">: {scenario.solutionTitle}</span>
            <ArrowIcon className="transition-transform duration-300 group-hover:translate-x-1" />
          </LocaleLink>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------ building ---- */

/**
 * All six scenarios stacked in one grid cell: the cell is as tall as the
 * tallest in this language at this width, so nothing below ever moves. Only
 * the active one is visible (and in the accessibility tree); switching is a
 * class change, so there is never more than one visible copy.
 */
function Stack({
  scenarios,
  active,
  reduced,
  children
}: {
  scenarios: ScenarioView[];
  active: number;
  reduced: boolean;
  children: (item: ScenarioView) => ReactNode;
}) {
  return (
    <span className="grid">
      {scenarios.map((item, index) => {
        const on = index === active;
        return (
          <span
            key={item.id}
            aria-hidden={on ? undefined : true}
            className={cn('col-start-1 row-start-1 block', on ? (reduced ? '' : 'tx-enter') : 'invisible')}
          >
            {children(item)}
          </span>
        );
      })}
    </span>
  );
}

const STAGE_STYLE: Record<Stage, { card: string; label: string }> = {
  problem: {
    card: 'border-dashed border-steel-300 bg-steel-50/60',
    label: 'text-steel-500'
  },
  solution: {
    card: 'tx-solution-grid border-brand-400/70 bg-brand-50/70 shadow-soft',
    label: 'text-brand-700'
  },
  result: {
    card: 'border-steel-200 bg-white/85',
    label: 'text-brand-700'
  }
};

function StageCard({
  stage,
  label,
  number,
  state,
  reduced,
  onSelect,
  marker,
  children
}: {
  stage: Stage;
  label: string;
  number: string;
  state: ShowcaseState;
  reduced: boolean;
  onSelect: () => void;
  marker?: ReactNode;
  children: ReactNode;
}) {
  const active = state.stage === stage;
  return (
    <div
      className={cn(
        'group relative rounded-card border p-5 transition-[opacity,box-shadow,border-color] duration-500 sm:p-6',
        STAGE_STYLE[stage].card,
        active ? 'opacity-100' : reduced ? 'opacity-100' : 'opacity-[.8] hover:opacity-95',
        active && 'ring-1 ring-brand-500/35'
      )}
    >
      {/* The whole card is the control; the text stays plain, readable content. */}
      <button
        type="button"
        aria-pressed={active}
        aria-label={label}
        onClick={onSelect}
        className="absolute inset-0 z-10 rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
      />
      <span className="flex items-center gap-2.5 font-mono text-[0.625rem] uppercase tracking-[0.16em]">
        <span aria-hidden="true" className="text-steel-400">{number}</span>
        {marker}
        <span className={cn('font-semibold', STAGE_STYLE[stage].label)}>{label}</span>
        {stage === 'problem' ? (
          <span aria-hidden="true" className="ml-auto flex gap-1">
            {[0, 1, 2].map((dash) => (
              <span key={dash} className={cn('h-px bg-steel-300', dash === 1 ? 'w-2' : 'w-4')} />
            ))}
          </span>
        ) : null}
      </span>
      <span className="mt-4 block">{children}</span>
      {stage === 'result' ? (
        <span aria-hidden="true" className="absolute inset-x-5 bottom-0 h-0.5 overflow-hidden rounded-full sm:inset-x-6">
          <span className={cn('tx-confirm block h-full origin-left bg-brand-500', active ? 'scale-x-100' : 'scale-x-0', reduced && 'transition-none')} />
        </span>
      ) : null}
    </div>
  );
}

/**
 * The signal between two stages: a hairline that fills — with a small light at
 * its head — when the story reaches the next stage. Horizontal on desktop,
 * vertical when the cards stack. Pure transform; decorative.
 */
function Connector({ filled, reduced }: { filled: boolean; reduced: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none relative flex h-10 items-center justify-center lg:h-auto">
      {/* phones / tablets: vertical */}
      <span className="relative h-full w-px overflow-hidden bg-steel-300/70 lg:hidden">
        <span className={cn('tx-fill-y absolute inset-0 bg-brand-500', filled ? 'translate-y-0' : '-translate-y-full', reduced && 'transition-none')}>
          <span className="absolute -bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(53,201,111,.8)]" />
        </span>
      </span>
      {/* desktop: horizontal */}
      <span className="relative hidden h-px w-full overflow-hidden bg-steel-300/70 lg:block">
        <span className={cn('tx-fill-x absolute inset-0 bg-brand-500', filled ? 'translate-x-0' : '-translate-x-full', reduced && 'transition-none')}>
          <span className="absolute -right-0.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-brand-400 shadow-[0_0_8px_rgba(53,201,111,.8)]" />
        </span>
      </span>
      <svg viewBox="0 0 12 12" className="absolute h-3 w-3 rotate-90 text-steel-400 lg:right-1 lg:rotate-0" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function StepButton({ direction, label, onClick, className }: { direction: 'prev' | 'next'; label: string; onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-steel-200 bg-white/70 text-steel-600 transition-colors hover:border-brand-300 hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600',
        className
      )}
    >
      <svg viewBox="0 0 16 16" className={cn('h-4 w-4 transition-transform duration-300', direction === 'prev' ? 'rotate-180 group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5')} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/**
 * The section's own ground, reading left → right like the story: broken,
 * scattered strokes behind the problem, an even grid behind the solution,
 * a few clean resolved lines behind the result. Static and faint.
 */
function TransformBackground() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full text-steel-300" preserveAspectRatio="none" viewBox="0 0 1200 600">
      <g stroke="currentColor" strokeWidth="1" opacity="0.5">
        {[140, 230, 330, 430].map((y, index) => (
          <path key={y} d={`M0 ${y} h${90 + index * 20} m26 0 h${60 + index * 12} m34 0 h${40 + index * 8}`} strokeDasharray={index % 2 ? '3 6' : undefined} />
        ))}
      </g>
      <g stroke="currentColor" strokeWidth="1" opacity="0.28">
        {[440, 480, 520, 560, 600, 640, 680, 720, 760].map((x) => (
          <path key={x} d={`M${x} 120 V480`} />
        ))}
        {[160, 220, 280, 340, 400, 460].map((y) => (
          <path key={y} d={`M440 ${y} H760`} />
        ))}
      </g>
      <g stroke="currentColor" strokeWidth="1" opacity="0.45">
        {[200, 300, 400].map((y) => (
          <path key={y} d={`M860 ${y} H1200`} />
        ))}
      </g>
    </svg>
  );
}
