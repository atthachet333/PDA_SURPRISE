/**
 * Types and pure helpers for the system mock library.
 *
 * Kept out of `components/business/SystemMock.tsx` so that file exports only
 * components — react-refresh cannot hot-reload a module that mixes components
 * with other exports, and the lint rule enforces it.
 */

/** Every interface mock available in the library. */
export type MockKind =
  | 'erp'
  | 'payroll'
  | 'documents'
  | 'hrLine'
  | 'website'
  | 'nas'
  | 'workflow'
  | 'tracking'
  | 'analytics';

/** Which chrome a mock should wear. Only the HR bot is phone-shaped. */
export function isPhoneMock(kind: MockKind): boolean {
  return kind === 'hrLine';
}
