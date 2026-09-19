/**
 * Stage identifiers for the delivery process.
 *
 * Kept out of `components/business/StageVisual.tsx` so that file exports only
 * components — react-refresh cannot hot-reload a module mixing components with
 * other exports, and the lint rule enforces it.
 */

/** The seven stages, in delivery order. */
export type StageKind = 'discover' | 'map' | 'design' | 'build' | 'test' | 'ship' | 'care';

/** Index-aligned with `process` in data/company.ts. */
export const STAGE_VISUALS: StageKind[] = [
  'discover',
  'map',
  'design',
  'build',
  'test',
  'ship',
  'care'
];
