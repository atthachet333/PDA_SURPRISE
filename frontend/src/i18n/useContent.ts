import { useMemo } from 'react';
import { useLocale } from '@/app/LocaleContext';
import { caseStudies, type CaseStudy } from '@/data/caseStudies';
import {
  homeServicePreview,
  primaryServices,
  serviceDistinctions,
  supportingServices,
  type PrimaryService,
  type Service
} from '@/data/services';
import { localizeCaseStudy } from './caseStudies';
import { localizeService } from './services';
import { solutions, type Solution } from '@/data/solutions';
import { localizeSolution } from './solutions';
import { businessSystems, type BusinessSystem } from '@/data/systemUniverse';
import { localizeSystem } from './systemUniverse';

/**
 * Canonical records with their customer-facing text in the active locale.
 *
 * Components read content through these hooks instead of importing the Thai
 * data directly, so ids, slugs, relationships and ordering always come from
 * the one source while the words follow the URL.
 */

export function useCaseStudies(items: readonly CaseStudy[] = caseStudies): readonly CaseStudy[] {
  const { content } = useLocale();
  return useMemo(() => items.map((study) => localizeCaseStudy(study, content)), [items, content]);
}

export function useCaseStudy(study: CaseStudy): CaseStudy;
export function useCaseStudy(study: CaseStudy | undefined): CaseStudy | undefined;
export function useCaseStudy(study: CaseStudy | undefined): CaseStudy | undefined {
  const { content } = useLocale();
  return useMemo(() => (study ? localizeCaseStudy(study, content) : undefined), [study, content]);
}

export function usePrimaryServices(items: readonly PrimaryService[] = primaryServices): PrimaryService[] {
  const { content } = useLocale();
  return useMemo(() => items.map((service) => localizeService(service, content)), [items, content]);
}

export function useHomeServices(): PrimaryService[] {
  return usePrimaryServices(homeServicePreview);
}

export function useSupportingServices(): Service[] {
  const { content } = useLocale();
  return useMemo(() => supportingServices.map((service) => localizeService(service, content)), [content]);
}

export function useSolutions(): Solution[] {
  const { content } = useLocale();
  return useMemo(() => solutions.map((solution) => localizeSolution(solution, content)), [content]);
}

export function useSystems(): readonly BusinessSystem[] {
  const { content } = useLocale();
  return useMemo(() => businessSystems.map((system) => localizeSystem(system, content)), [content]);
}

export function useServiceDistinctions(): typeof serviceDistinctions {
  const { content } = useLocale();
  return useMemo(
    () => (content ? serviceDistinctions.map((entry) => ({ ...entry, ...content.distinctions[entry.id] })) : serviceDistinctions),
    [content]
  );
}
