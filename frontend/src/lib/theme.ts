/**
 * ============================================================================
 * CORPORATE THEME — Light / Dark / System
 * ============================================================================
 * Pure logic, no React and no DOM beyond the two small appliers at the bottom,
 * so the rules that actually matter — what a stored value means, how System
 * resolves, what happens to a corrupt preference — are testable in node.
 *
 * SCOPE
 *   The corporate site only. The A&I experience pins its own palette under
 *   `body[data-theme='ai']` and is unaffected by whatever mode is stored here.
 *
 * WHAT IS PERSISTED
 *   The MODE the visitor chose ('light' | 'dark' | 'system'), never the
 *   resolved colour. Storing 'dark' because the OS was dark at the time would
 *   freeze a System visitor into dark forever.
 */

export const THEME_MODES = ['light', 'dark', 'system'] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

/** What actually gets painted. `system` is never a resolved value. */
export type ResolvedTheme = 'light' | 'dark';

/** Default for a visitor who has never chosen: follow the device. */
export const DEFAULT_THEME_MODE: ThemeMode = 'system';

export const THEME_STORAGE_KEY = 'pdabliss.theme';

export const DARK_QUERY = '(prefers-color-scheme: dark)';

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (THEME_MODES as readonly string[]).includes(value);
}

/**
 * Anything unrecognised — a stale key, a hand-edited value, a half-written
 * string — resolves to the default rather than throwing or painting nothing.
 */
export function parseThemeMode(value: unknown): ThemeMode {
  return isThemeMode(value) ? value : DEFAULT_THEME_MODE;
}

/** The colour a mode paints, given what the device currently reports. */
export function resolveTheme(mode: ThemeMode, systemPrefersDark: boolean): ResolvedTheme {
  if (mode === 'light') return 'light';
  if (mode === 'dark') return 'dark';
  return systemPrefersDark ? 'dark' : 'light';
}

/**
 * Whether a device preference change should repaint. Only System follows the
 * OS; an explicit Light or Dark choice outranks it until the visitor picks
 * System again.
 */
export function followsSystem(mode: ThemeMode): boolean {
  return mode === 'system';
}

/* --------------------------------------------------------------- storage -- */

/**
 * Storage can throw outright in a privacy mode that blocks site data, so every
 * access is guarded. A visitor with storage disabled still gets a working site,
 * they just start from System on each visit.
 */
export function readStoredMode(storage?: Pick<Storage, 'getItem'>): ThemeMode {
  try {
    const store = storage ?? globalThis.localStorage;
    return parseThemeMode(store?.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME_MODE;
  }
}

export function writeStoredMode(mode: ThemeMode, storage?: Pick<Storage, 'setItem'>): void {
  try {
    const store = storage ?? globalThis.localStorage;
    store?.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* A preference we cannot persist is not worth breaking the page over. */
  }
}

/* ----------------------------------------------------------------- apply -- */

/**
 * The single place the resolved theme reaches the document.
 *
 * `data-theme` on <html> drives the token layer in global.css; `color-scheme`
 * tells the browser to render form controls, scrollbars and the canvas
 * background to match, which is what stops a white flash between paints.
 *
 * The inline bootstrap in index.html does exactly this before first paint —
 * keep the two in step.
 */
export function applyTheme(resolved: ResolvedTheme, root?: HTMLElement): void {
  const element = root ?? globalThis.document?.documentElement;
  if (!element) return;
  element.dataset.theme = resolved;
  element.style.colorScheme = resolved;
}

/** What the OS reports right now, or light where matchMedia is unavailable. */
export function systemPrefersDark(): boolean {
  return globalThis.matchMedia?.(DARK_QUERY).matches ?? false;
}
