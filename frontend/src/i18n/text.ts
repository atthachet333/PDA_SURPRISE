import type { Locale } from './locales';

/**
 * ============================================================================
 * LOCALISED VALUES
 * ============================================================================
 * Every customer-facing string that is not canonical Thai data lives as a
 * `Localized` triple. The type is a `Record<Locale, T>`, so a missing EN or ZH
 * value is a COMPILE error, not a silent fallback to Thai at runtime.
 *
 *   const label: LocalizedText = { th: 'ผลงาน', en: 'Work', zh: '案例' };
 *   pick(label, locale)
 *
 * Canonical Thai data files (services, case studies, solutions …) stay the
 * source of truth. Their EN/ZH counterparts are typed overlays in this folder,
 * checked field-by-field by tests/i18n.test.mjs.
 * ============================================================================
 */

export type Localized<T> = Record<Locale, T>;
export type LocalizedText = Localized<string>;
export type LocalizedList = Localized<readonly string[]>;

/** The value for the active locale. Never falls back — the type guarantees one. */
export function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale];
}

/**
 * Overlay translations for canonical Thai records. Thai needs no overlay — it
 * IS the record — so only EN and ZH are listed.
 */
export type Translations<T> = Record<Exclude<Locale, 'th'>, T>;
