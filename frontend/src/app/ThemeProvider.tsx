import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyTheme,
  DARK_QUERY,
  readStoredMode,
  resolveTheme,
  systemPrefersDark,
  writeStoredMode,
  type ThemeMode
} from '@/lib/theme';
import { ThemeContext } from './ThemeContext';

/**
 * Owns the corporate theme for the session.
 *
 * The inline bootstrap in index.html has already painted the right colour by
 * the time this mounts; this provider takes over so the choice can change, and
 * re-applies on every change rather than trusting the DOM to already agree.
 *
 * DEVICE CHANGES
 *   The `(prefers-color-scheme: dark)` listener stays subscribed in every mode
 *   so `systemDark` is always current, but it only repaints while the mode is
 *   System. Picking Light or Dark explicitly outranks the OS until the visitor
 *   chooses System again — which is the whole point of storing the mode rather
 *   than the resolved colour.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredMode());
  const [systemDark, setSystemDark] = useState<boolean>(() => systemPrefersDark());

  useEffect(() => {
    const media = window.matchMedia?.(DARK_QUERY);
    if (!media) return;

    const sync = () => setSystemDark(media.matches);
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);

    media.addEventListener('change', onChange);

    /*
     * `change` is the primary signal, but it is not guaranteed to arrive: a
     * backgrounded tab can miss the event entirely, and some embedded
     * webviews alter the query result without dispatching at all. Re-reading
     * whenever the page becomes visible or regains focus closes that gap, and
     * costs one boolean comparison — React bails out when it is unchanged.
     */
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);

    /* The OS may also have changed between the bootstrap and this mount. */
    sync();

    return () => {
      media.removeEventListener('change', onChange);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('focus', sync);
    };
  }, []);

  const resolved = resolveTheme(mode, systemDark);

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    writeStoredMode(next);
  }, []);

  useStaleTokenWarning();

  const value = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Dev-only: shout if the colour utilities are not resolving through the tokens.
 *
 * `tailwind.config.ts` is loaded through jiti and cached in the running dev
 * server's module registry, so a server started before the config changed keeps
 * emitting the OLD literal colours. The token stylesheet is plain CSS and
 * reloads fine, which produces the nastiest possible symptom: the page
 * background flips to dark correctly while every piece of text keeps its
 * light-theme colour, and the site becomes unreadable with nothing in the
 * console to explain it. Restarting vite is the fix, so the warning says so.
 *
 * `import.meta.env.DEV` is statically replaced with `false` in a production
 * build, so this whole hook — probe included — is dead code and never ships.
 */
function useStaleTokenWarning(): void {
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const probe = document.createElement('span');
    probe.className = 'text-ink';
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:absolute;opacity:0;pointer-events:none';
    document.body.appendChild(probe);
    const painted = getComputedStyle(probe).color;
    const token = getComputedStyle(document.body).getPropertyValue('--c-ink').trim();
    probe.remove();

    /* `--c-ink` is "r g b"; a themed utility paints exactly those channels. */
    const expected = token.split(/\s+/).map(Number);
    const actual = (painted.match(/\d+/g) ?? []).slice(0, 3).map(Number);
    const agrees =
      expected.length === 3 &&
      actual.length === 3 &&
      expected.every((c, i) => Math.abs(c - (actual[i] ?? NaN)) <= 1);

    if (!agrees) {
      console.error(
        '[theme] Colour utilities are NOT resolving through the theme tokens.\n' +
          `  --c-ink is "${token}" but .text-ink paints ${painted}.\n` +
          '  This dev server cached an older tailwind.config.ts. Restart vite.\n' +
          '  Until then dark mode will show light-theme text on a dark background.'
      );
    }
  }, []);
}
