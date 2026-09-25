/** EP43 atmosphere compositions. Every variant has a Light, Dark and dark-island rendering via tokens. */
export type AtmosphereVariant =
  | 'hero'
  | 'systems'
  | 'workflow'
  | 'portfolio'
  | 'evidence'
  | 'topology'
  | 'blueprint'
  | 'contact'
  | 'closing'
  | 'universe'
  | 'editorial';

export const ATMOSPHERE_VARIANTS: readonly AtmosphereVariant[] = [
  'hero',
  'systems',
  'workflow',
  'portfolio',
  'evidence',
  'topology',
  'blueprint',
  'contact',
  'closing',
  'universe',
  'editorial'
];
