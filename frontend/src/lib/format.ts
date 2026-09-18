export const pad = (value: number, length = 3): string => String(Math.max(0, Math.floor(value))).padStart(length, '0');

export const formatNumber = (value: number): string => new Intl.NumberFormat('en-US').format(Math.round(value));

export function daysBetween(from: Date, to: Date = new Date()): number {
  const MS_PER_DAY = 86_400_000;
  const start = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const end = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.max(0, Math.round((end - start) / MS_PER_DAY));
}

export const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
