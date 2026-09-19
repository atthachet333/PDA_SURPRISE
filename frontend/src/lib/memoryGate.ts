export interface MemoryDateParts {
  day: number;
  month: number;
  /** The year exactly as entered (Gregorian or Buddhist Era). */
  enteredYear: number;
  gregorianYear: number;
  iso: string;
}

export interface MemoryDateDisplay {
  day: string;
  month: string;
  gregorianYear: string;
  buddhistYear: string;
  english: string;
  thai: string;
  dotted: string;
}

const ENGLISH_MONTHS = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER'
] as const;

const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม'
] as const;

function gregorianYear(year: number): number {
  return year >= 2400 && year <= 2999 ? year - 543 : year;
}

function isActualDate(day: number, month: number, year: number): boolean {
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

function fromNumbers(day: number, month: number, enteredYear: number): MemoryDateParts | null {
  const year = gregorianYear(enteredYear);
  if (!isActualDate(day, month, year)) return null;

  return {
    day,
    month,
    enteredYear,
    gregorianYear: year,
    iso: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  };
}

/** Parse the deliberately narrow set of date formats accepted by the gate. */
export function parseMemoryDateInput(input: string): MemoryDateParts | null {
  const value = input.trim();
  const compact = value.match(/^(\d{2})(\d{2})(\d{4})$/);
  const separated = value.match(/^(\d{2})([./-])(\d{2})\2(\d{4})$/);
  const match = compact
    ? [compact[1], compact[2], compact[3]]
    : separated
      ? [separated[1], separated[3], separated[4]]
      : null;

  if (!match?.[0] || !match[1] || !match[2]) return null;
  return fromNumbers(Number(match[0]), Number(match[1]), Number(match[2]));
}

/** Parse the three visible fields without making the UI concatenate strings. */
export function parseMemoryDateParts(day: string, month: string, year: string): MemoryDateParts | null {
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year)) {
    return null;
  }
  return fromNumbers(Number(day), Number(month), Number(year));
}

export function isWeddingDateAnswer(parts: MemoryDateParts | null, weddingDate: string): boolean {
  return parts?.iso === weddingDate;
}

/** All visible variants derive from the same ISO value, including the BE year. */
export function formatMemoryDate(iso: string): MemoryDateDisplay {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match?.[1] || !match[2] || !match[3]) {
    throw new Error(`Invalid canonical date: ${iso}`);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isActualDate(day, month, year)) throw new Error(`Invalid canonical date: ${iso}`);

  const monthIndex = month - 1;
  const englishMonth = ENGLISH_MONTHS[monthIndex];
  const thaiMonth = THAI_MONTHS[monthIndex];
  if (!englishMonth || !thaiMonth) throw new Error(`Invalid canonical date: ${iso}`);

  const dayText = String(day).padStart(2, '0');
  const monthText = String(month).padStart(2, '0');
  const yearText = String(year);
  const buddhistYear = String(year + 543);

  return {
    day: dayText,
    month: monthText,
    gregorianYear: yearText,
    buddhistYear,
    english: `${dayText} ${englishMonth} ${yearText}`,
    thai: `${dayText} ${thaiMonth} ${buddhistYear}`,
    dotted: `${dayText} · ${monthText} · ${yearText}`
  };
}
