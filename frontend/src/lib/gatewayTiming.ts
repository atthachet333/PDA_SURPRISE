/**
 * The timing contract for the crossing: world gateway → portal → arrival.
 *
 * These tables live together, in a plain module rather than inside either
 * component, because the thing worth protecting is the RELATIONSHIP between
 * them. Measured on the running site before this was enforced, pressing the
 * gateway's button led to nine seconds before anything in /us was actionable:
 * a four-second gateway sequence, a three-and-a-half-second portal, and then
 * the arrival replaying its full staged intro on top. Three ceremonies in a
 * row for one crossing.
 *
 * Keeping the numbers here means a regression is a failing test rather than a
 * feeling someone has to notice.
 */

/** A step to reach, and how many milliseconds after mount to reach it. */
export type Cue = readonly [step: number, ms: number];

/* ── THE GATEWAY ──────────────────────────────────────────────────────────── */

export const GATEWAY_STEP = {
  /** PDA WORLD is on screen, calm. */
  ORIGIN: 0,
  /** The first route opens and the signal crosses. */
  LINK_A: 1,
  /** OUR WORLD comes up. */
  CORE: 2,
  /** The second route opens. */
  LINK_B: 3,
  /** A&I WORLD is live and the button becomes the point of the screen. */
  READY: 4
} as const;

export const GATEWAY_CUES: readonly Cue[] = [
  [GATEWAY_STEP.LINK_A, 700],
  [GATEWAY_STEP.CORE, 1900],
  [GATEWAY_STEP.LINK_B, 2900],
  [GATEWAY_STEP.READY, 4200]
];

/** Everything is static from here, whatever happened to the timers. */
export const GATEWAY_SETTLE_MS = 6000;

/**
 * Semantic route nodes, never percentages.
 *
 * These must only ever move FORWARD. Both segments used to share the label
 * "LINKING WORLDS", which put linking back on screen a second after
 * "PRIVATE LINK ESTABLISHED" — reading as a dropped connection being retried
 * rather than as one crossing making progress.
 */
export const GATEWAY_STATUS: Readonly<Record<number, string>> = {
  [GATEWAY_STEP.ORIGIN]: 'MEMORY GATE VERIFIED',
  [GATEWAY_STEP.LINK_A]: 'LINKING WORLDS',
  [GATEWAY_STEP.CORE]: 'PRIVATE LINK ESTABLISHED',
  [GATEWAY_STEP.LINK_B]: 'OPENING A&I',
  [GATEWAY_STEP.READY]: 'A&I READY'
};

/* ── THE ARRIVAL ──────────────────────────────────────────────────────────── */

export const ARRIVAL_STEP = {
  MARK: 0,
  ORBIT: 1,
  WORDMARK: 2,
  WHISPER: 3,
  TITLE: 4,
  READY: 5
} as const;

/** Opening /us directly: the full arrival, unchanged. */
export const ARRIVAL_CUES: readonly Cue[] = [
  [ARRIVAL_STEP.ORBIT, 500],
  [ARRIVAL_STEP.WORDMARK, 1400],
  [ARRIVAL_STEP.WHISPER, 2200],
  [ARRIVAL_STEP.TITLE, 2900],
  [ARRIVAL_STEP.READY, 3700]
];

/**
 * Arriving through the world gateway.
 *
 * The visitor has already had the ceremony, so the mark and the names are
 * ALREADY THERE as the portal's white clears (the sequence starts at
 * `WORDMARK`) and only the last beats play. Starting past `ORBIT` also means
 * the arrival's own opening flash never renders — the portal ended on white,
 * and a second white frame on top of it is one flash too many.
 */
export const ARRIVAL_CUES_FROM_GATEWAY: readonly Cue[] = [
  [ARRIVAL_STEP.WHISPER, 300],
  [ARRIVAL_STEP.TITLE, 800],
  [ARRIVAL_STEP.READY, 1400]
];

/** Where the gateway path joins the sequence. Must be past `ORBIT`. */
export const ARRIVAL_ENTRY_FROM_GATEWAY = ARRIVAL_STEP.WORDMARK;

export const ARRIVAL_SETTLE_MS = 5600;
export const ARRIVAL_SETTLE_FROM_GATEWAY_MS = 2600;

/** Last cue time in a table, or 0 for an empty one. */
export function lastCueMs(cues: readonly Cue[]): number {
  return cues.reduce((latest, [, ms]) => Math.max(latest, ms), 0);
}
