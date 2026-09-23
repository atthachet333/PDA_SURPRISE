import { createContext, useContext } from 'react';
import { DEFAULT_THEME_MODE, type ResolvedTheme, type ThemeMode } from '@/lib/theme';

export interface ThemeState {
  /** What the visitor chose. Persisted. */
  mode: ThemeMode;
  /** What is actually painted right now. Never 'system'. */
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

/**
 * Split from the provider so the context object is not part of a module that
 * exports components — that keeps react-refresh able to hot-reload the
 * provider without remounting every consumer.
 */
export const ThemeContext = createContext<ThemeState>({
  mode: DEFAULT_THEME_MODE,
  resolved: 'light',
  setMode: () => undefined
});

export const useTheme = (): ThemeState => useContext(ThemeContext);
