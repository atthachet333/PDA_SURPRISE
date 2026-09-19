import { createContext, useContext } from 'react';

export interface CookiePreferences {
  essential: true;
  analytics: boolean;
  preferences: boolean;
}

export interface CookieContextValue extends CookiePreferences {
  hasConsent: boolean;
  openSettings: () => void;
}

export const CookieContext = createContext<CookieContextValue | null>(null);

export function useCookieConsent() {
  const value = useContext(CookieContext);
  if (!value) throw new Error('useCookieConsent must be used inside CookieConsentProvider');
  return value;
}
