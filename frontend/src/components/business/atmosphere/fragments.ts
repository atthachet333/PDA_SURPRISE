/**
 * Decorative code fragments for the ghost interface panels (EP43).
 *
 * These are texture, not content: they are aria-hidden, never translated, and
 * deliberately generic — component names, route-like strings, API verbs and
 * data types that any web product could contain. They must never carry a real
 * secret, environment variable, host, IP, file path, email or client name;
 * tests/atmosphere.test.mjs enforces that.
 *
 * Kept in one language (code) on purpose: a Thai, English or Chinese page all
 * show the same fragments, so decoration never becomes mixed-language copy.
 */

/** k = keyword · t = type · m = muted · '' = plain */
export type Tone = 'k' | 't' | 'm' | '';
export type CodeLine = ReadonlyArray<readonly [Tone, string]>;

export const EDITOR_FILE = 'workflow.ts';

export const EDITOR_LINES: readonly CodeLine[] = [
  [['k', 'type '], ['t', 'Workflow'], ['', ' = {']],
  [['', '  id: '], ['t', 'string']],
  [['', '  status: '], ['m', '"ready" | "review"']],
  [['', '  steps: '], ['t', 'Step'], ['', '[]']],
  [['', '}']],
  [['m', ' ']],
  [['k', 'export function '], ['', 'validate(input: '], ['t', 'Request'], ['', ') {']],
  [['k', '  return '], ['', 'schema.parse(input)']],
  [['', '}']]
];

export const TERMINAL_LINES: readonly CodeLine[] = [
  [['k', '› '], ['', 'build()']],
  [['k', '✓ '], ['', 'validate'], ['m', '  checks passed']],
  [['k', '✓ '], ['', 'typecheck']],
  [['k', '› '], ['', 'deploy()']],
  [['m', '  status: '], ['t', '"ready"']]
];

export const API_LINES: readonly CodeLine[] = [
  [['k', 'POST '], ['', '/api/project']],
  [['k', 'GET  '], ['', '/api/status']],
  [['m', '200  '], ['', '{ status: '], ['t', '"ready"'], ['', ' }']]
];

export const TREE_LINES: readonly CodeLine[] = [
  [['t', '<App>']],
  [['m', '  ├ '], ['t', '<Router>']],
  [['m', '  │  ├ '], ['', '<Dashboard />']],
  [['m', '  │  ├ '], ['', '<Approvals />']],
  [['m', '  │  └ '], ['', '<Reports />']],
  [['m', '  └ '], ['t', '<DataLayer>']]
];

/** Pipeline stage names for the Services workflow graph. */
export const PIPELINE_STAGES = ['INPUT', 'PROCESS', 'DATA', 'OUTPUT'] as const;

/** Short labels on topology nodes. Generic roles, never product names. */
export const NODE_LABELS = ['api', 'queue', 'db', 'auth', 'report', 'sync'] as const;

/** Every decorative string, for the safety test. */
export const ALL_FRAGMENTS: readonly string[] = [
  EDITOR_FILE,
  ...[EDITOR_LINES, TERMINAL_LINES, API_LINES, TREE_LINES].flatMap((lines) =>
    lines.map((line) => line.map(([, text]) => text).join(''))
  ),
  ...PIPELINE_STAGES,
  ...NODE_LABELS
];
