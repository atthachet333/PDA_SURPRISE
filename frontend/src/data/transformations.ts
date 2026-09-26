import { primaryServices } from '@/data/services';

/**
 * BUSINESS TRANSFORMATIONS — Home's "problem → PDA BLISS SOLUTION → result"
 * showcase (EP46.6.2). The pure half: which scenarios, their order, the timing
 * and the state machine. No React, no DOM, so tests can hold all of it.
 *
 * WHAT A SCENARIO IS MADE OF — and where each part comes from
 *   problem   the service's own canonical `problem` line, plus two of its
 *             `problems` (data/services.ts, localized by the EP39 content packs)
 *   solution  the service's own title, plus two of its `deliverables`
 *   result    the only new copy: i18n/home.ts `transformationItems`, keyed by
 *             scenario id, qualitative and traceable to those deliverables
 * So there is no second service record: a scenario is an id and a serviceId.
 *
 * WHY SIX, NOT EIGHT. The strongest business stories. File management (NAS)
 * and mobile applications stay fully on /services; they do not need their own
 * before/after here. The system map lives on /solutions and is not repeated.
 */
export interface TransformationScenario {
  id: string;
  /** Canonical EP38 service id (data/services.ts). */
  serviceId: string;
}

export const transformationScenarios: readonly TransformationScenario[] = [
  { id: 'erp', serviceId: 'business-systems' },
  { id: 'payroll', serviceId: 'payroll' },
  { id: 'hr-line', serviceId: 'hr-line-bot' },
  { id: 'documents', serviceId: 'document-management' },
  { id: 'web-app', serviceId: 'web-applications' },
  { id: 'website', serviceId: 'websites' }
];

export const SCENARIO_COUNT = transformationScenarios.length;

/** Fail loudly at import if a scenario ever points at a service that is not there. */
for (const scenario of transformationScenarios) {
  if (!primaryServices.some((service) => service.id === scenario.serviceId)) {
    throw new Error(`transformation ${scenario.id} points at unknown service ${scenario.serviceId}`);
  }
}

/** Locale-neutral CTA target: the service's own block on /services. */
export const serviceHref = (serviceId: string): string => `/services#${serviceId}`;

/* --------------------------------------------------------------- stages -- */

export const STAGES = ['problem', 'solution', 'result'] as const;
export type Stage = (typeof STAGES)[number];

/**
 * The 5-second story of one scenario. Each value is how long that stage is
 * held before the next step: problem 1.4s → solution 1.4s → result 2.2s →
 * the next scenario. 1.4 + 1.4 + 2.2 = 5.0s per scenario.
 */
export const STAGE_HOLD_MS: Readonly<Record<Stage, number>> = { problem: 1400, solution: 1400, result: 2200 };
export const SCENARIO_PERIOD_MS = STAGE_HOLD_MS.problem + STAGE_HOLD_MS.solution + STAGE_HOLD_MS.result;

/** After the visitor picks a stage, the story waits this long before it moves again. */
export const MANUAL_HOLD_MS = 5000;

/**
 * The very first step waits a little longer, so the first scenario change
 * does not land on the hero drift's 5-second pose boundaries (styles/brand.css).
 */
export const FIRST_EXTRA_MS = 1500;

/* ---------------------------------------------------------- state machine -- */

export interface ShowcaseState {
  scenario: number;
  stage: Stage;
  /** The visitor chose the stage: hold it for MANUAL_HOLD_MS before moving on. */
  manual: boolean;
}

export const initialState: ShowcaseState = { scenario: 0, stage: 'problem', manual: false };

export type ShowcaseAction =
  | { type: 'tick' }
  | { type: 'select'; scenario: number }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'stage'; stage: Stage };

const wrap = (index: number) => ((index % SCENARIO_COUNT) + SCENARIO_COUNT) % SCENARIO_COUNT;

/**
 * Every input lands on exactly one valid state — there is no "transitioning"
 * state to get stuck in, which is what made rapid clicks safe (EP46.6.1 could
 * stack fading titles; here a click simply replaces the state).
 */
export function reduce(state: ShowcaseState, action: ShowcaseAction): ShowcaseState {
  switch (action.type) {
    case 'tick': {
      const index = STAGES.indexOf(state.stage);
      if (index < STAGES.length - 1) return { scenario: state.scenario, stage: STAGES[index + 1] as Stage, manual: false };
      return { scenario: wrap(state.scenario + 1), stage: 'problem', manual: false };
    }
    case 'select':
      return { scenario: wrap(action.scenario), stage: 'problem', manual: false };
    case 'next':
      return { scenario: wrap(state.scenario + 1), stage: 'problem', manual: false };
    case 'prev':
      return { scenario: wrap(state.scenario - 1), stage: 'problem', manual: false };
    case 'stage':
      return { scenario: state.scenario, stage: action.stage, manual: true };
    default:
      return state;
  }
}

/** How long to wait before the next automatic `tick` from this state. */
export function delayFor(state: ShowcaseState, firstRun = false): number {
  const base = state.manual ? MANUAL_HOLD_MS : STAGE_HOLD_MS[state.stage];
  return firstRun ? base + FIRST_EXTRA_MS : base;
}

/** "01 / 06" */
export const counterLabel = (index: number): string =>
  `${String(index + 1).padStart(2, '0')} / ${String(SCENARIO_COUNT).padStart(2, '0')}`;

/** Scenario tablist keys: arrows wrap, Home / End jump. */
export function keyToScenario(key: string, index: number): number | null {
  switch (key) {
    case 'ArrowRight':
    case 'ArrowDown':
      return wrap(index + 1);
    case 'ArrowLeft':
    case 'ArrowUp':
      return wrap(index - 1);
    case 'Home':
      return 0;
    case 'End':
      return SCENARIO_COUNT - 1;
    default:
      return null;
  }
}

/** A horizontal swipe of at least this many px changes scenario. */
export const SWIPE_PX = 48;

/** 'next' / 'prev' for a clearly horizontal swipe; null for taps and vertical scrolls. */
export function swipeDirection(dx: number, dy: number): 'next' | 'prev' | null {
  if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.2) return null;
  return dx < 0 ? 'next' : 'prev';
}
