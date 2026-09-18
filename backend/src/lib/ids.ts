import { randomUUID } from 'node:crypto';

/** Short, human-quotable reference used in confirmations and support threads. */
export function createReference(prefix = 'PDA'): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const noise = randomUUID().replace(/-/g, '').slice(0, 4).toUpperCase();
  return `${prefix}-${stamp}-${noise}`;
}

export const createId = (): string => randomUUID();
