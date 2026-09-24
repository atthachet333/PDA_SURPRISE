import type { CaseSlug, CaseStudyText } from '../caseStudies';
import type { DistinctionText, ServiceText } from '../services';
import type { SolutionText } from '../solutions';
import type { SystemText } from '../systemUniverse';
import type { InsightText } from '../insights';

/**
 * One locale's overlays for the canonical Thai records.
 *
 * Kept out of the entry bundle: the LocaleProvider imports `en.ts` or `zh.ts`
 * only when that locale is active, so the Thai default pays nothing for the
 * other two languages' long-form content. Short UI copy stays in the eager
 * `Localized` triples (ui.ts, home.ts, work.ts …).
 */
export interface ContentPack {
  caseStudies: Record<CaseSlug, CaseStudyText>;
  /** Keyed by service id — all 16, core and supporting. */
  services: Record<string, ServiceText>;
  /** Keyed by distinction id in `serviceDistinctions`. */
  distinctions: Record<string, DistinctionText>;
  /** Keyed by solution id. */
  solutions: Record<string, SolutionText>;
  /** Keyed by System Universe id. */
  systems: Record<string, SystemText>;
  /** Keyed by insight slug. */
  insights: Record<string, InsightText>;
}

export type OtherLocale = 'en' | 'zh';

/** The locales that need a content pack — everything but Thai. */
export const needsPack = (locale: string): locale is OtherLocale => locale === 'en' || locale === 'zh';

/** The only place a pack is loaded; Vite emits one chunk per locale. */
export function loadContentPack(locale: OtherLocale): Promise<ContentPack> {
  return locale === 'en'
    ? import('./en').then((module) => module.default)
    : import('./zh').then((module) => module.default);
}
