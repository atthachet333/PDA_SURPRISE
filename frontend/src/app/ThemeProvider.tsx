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

  const value = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
