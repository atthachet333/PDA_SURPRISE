export const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;
export const DAY_MS = 86_400_000;

export type RelationshipYearId = `year-${string}`;
export type YearReleaseState = 'released' | 'preview' | 'future';

export interface RelationshipYear {
  id: RelationshipYearId;
  number: number;
  startDate: string;
  endDate: string;
  title: string;
  subtitle: string;
  releaseState: YearReleaseState;
}

export const RELATIONSHIP_START_DATE = '2025-10-12';
export const STORY_RELEASE_YEAR_ID: RelationshipYearId = 'year-01';
export const DEFAULT_ARCHIVE_YEAR_ID = STORY_RELEASE_YEAR_ID;

const parseDate = (iso: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`Invalid local date: ${iso}`);
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
};

const isoFromUtc = (value: number) => new Date(value).toISOString().slice(0, 10);
const dateOrdinal = (iso: string) => {
  const { year, month, day } = parseDate(iso);
  return Math.floor(Date.UTC(year, month - 1, day) / DAY_MS);
};

export function bangkokDate(instant: Date | number | string): string {
  if (typeof instant === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(instant)) return instant;
  const value = instant instanceof Date ? instant.getTime() : new Date(instant).getTime();
  if (!Number.isFinite(value)) throw new Error(`Invalid instant: ${String(instant)}`);
  return isoFromUtc(value + BANGKOK_OFFSET_MS);
}

export function bangkokStartOfDay(iso: string): number {
  return dateOrdinal(iso) * DAY_MS - BANGKOK_OFFSET_MS;
}

export function relationshipYearId(number: number): RelationshipYearId {
  return `year-${String(Math.max(1, Math.floor(number))).padStart(2, '0')}`;
}

export function deriveRelationshipYear(
  number: number,
  releaseState: YearReleaseState = 'future',
  copy?: Pick<RelationshipYear, 'title' | 'subtitle'>
): RelationshipYear {
  const safeNumber = Math.max(1, Math.floor(number));
  const start = parseDate(RELATIONSHIP_START_DATE);
  const startMs = Date.UTC(start.year + safeNumber - 1, start.month - 1, start.day);
  const nextMs = Date.UTC(start.year + safeNumber, start.month - 1, start.day);
  return {
    id: relationshipYearId(safeNumber),
    number: safeNumber,
    startDate: isoFromUtc(startMs),
    endDate: isoFromUtc(nextMs - DAY_MS),
    title: copy?.title ?? `YEAR ${String(safeNumber).padStart(2, '0')}`,
    subtitle: copy?.subtitle ?? 'บทต่อไปของเรา',
    releaseState
  };
}

export const relationshipYears: RelationshipYear[] = [
  deriveRelationshipYear(1, 'released', {
    title: 'YEAR 01',
    subtitle: 'เรื่องราวที่เราได้ใช้ชีวิตมาด้วยกัน'
  }),
  deriveRelationshipYear(2, 'preview', {
    title: 'YEAR 02',
    subtitle: 'กำลังเขียนอยู่'
  })
];

export function relationshipYearAt(instant: Date | number | string) {
  const localDate = bangkokDate(instant);
  const current = dateOrdinal(localDate);
  const start = dateOrdinal(RELATIONSHIP_START_DATE);
  if (current < start) {
    return { number: 0, id: null, localDate, progress: 0, startDate: RELATIONSHIP_START_DATE, endDate: RELATIONSHIP_START_DATE };
  }

  const local = parseDate(localDate);
  const origin = parseDate(RELATIONSHIP_START_DATE);
  const anniversaryPassed = local.month > origin.month || (local.month === origin.month && local.day >= origin.day);
  const number = local.year - origin.year + (anniversaryPassed ? 1 : 0);
  const period = deriveRelationshipYear(number);
  const elapsed = current - dateOrdinal(period.startDate);
  const span = dateOrdinal(period.endDate) - dateOrdinal(period.startDate) + 1;
  return {
    number,
    id: period.id,
    localDate,
    progress: Math.min(100, Math.max(0, (elapsed / span) * 100)),
    startDate: period.startDate,
    endDate: period.endDate
  };
}

export function relationshipDaysAt(instant: Date | number | string): number {
  return Math.max(0, dateOrdinal(bangkokDate(instant)) - dateOrdinal(RELATIONSHIP_START_DATE));
}

export function nextAnniversaryAt(instant: Date | number | string): string {
  const state = relationshipYearAt(instant);
  return state.number === 0 ? RELATIONSHIP_START_DATE : deriveRelationshipYear(state.number + 1).startDate;
}

export const releasedArchiveYear = relationshipYears.find((year) => year.id === DEFAULT_ARCHIVE_YEAR_ID)!;
export const yearTwoPreview = relationshipYears.find((year) => year.id === 'year-02')!;

/** A preview is not elapsed-time telemetry. It remains truthful until released. */
export function finaleProgress(year: RelationshipYear, instant: Date | number | string): number {
  return year.releaseState === 'released' ? Math.round(relationshipYearAt(instant).progress) : 0;
}
