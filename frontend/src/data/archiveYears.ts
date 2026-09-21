import {
  DEFAULT_ARCHIVE_YEAR_ID,
  relationshipYearAt,
  relationshipYears,
  type RelationshipYearId
} from '@/data/relationshipYears';
import type { MemoryArchiveGroup } from '@/data/memoryArchive';
import type { ArchiveMediaFilter } from '@/data/memoryVideos';

export const ARCHIVE_YEAR_EVENT = 'ai:archive-year';
export const ARCHIVE_PAGE_SIZE = 24;

export interface ArchiveFilterState {
  yearId: RelationshipYearId;
  media: ArchiveMediaFilter;
  group: MemoryArchiveGroup | 'all';
}

export function sanitizeArchiveFilters(state: ArchiveFilterState): ArchiveFilterState {
  const year = relationshipYears.find((entry) => entry.id === state.yearId);
  if (!year || year.releaseState !== 'released') {
    return { ...state, media: 'all', group: 'all' };
  }
  return state.media === 'video' ? { ...state, group: 'all' } : state;
}

export function isArchiveYearReleased(yearId: RelationshipYearId): boolean {
  return relationshipYears.some((year) => year.id === yearId && year.releaseState === 'released');
}

export function resetArchiveView(yearId: RelationshipYearId): ArchiveFilterState & { visibleCount: number } {
  return { yearId, media: 'all', group: 'all', visibleCount: ARCHIVE_PAGE_SIZE };
}

export function resolveMediaYear({
  captureDate,
  ownerOverride,
  fallbackYearId
}: {
  captureDate?: string | null;
  ownerOverride?: RelationshipYearId | null;
  fallbackYearId?: RelationshipYearId | null;
}): { yearId: RelationshipYearId | 'unassigned'; source: 'owner-override' | 'capture-date' | 'release-default' } {
  if (ownerOverride) return { yearId: ownerOverride, source: 'owner-override' };
  if (captureDate) {
    const localDate = captureDate.slice(0, 10);
    const derived = relationshipYearAt(localDate).id;
    if (derived) return { yearId: derived, source: 'capture-date' };
  }
  if (fallbackYearId) return { yearId: fallbackYearId, source: 'release-default' };
  return { yearId: 'unassigned', source: 'release-default' };
}

export const currentArchiveDefault = resetArchiveView(DEFAULT_ARCHIVE_YEAR_ID);
