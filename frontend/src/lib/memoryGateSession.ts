export const MEMORY_GATE_SESSION_KEY = 'ai-memory-gate-unlocked-v1';

export interface MemoryGateStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

let memoryUnlocked = false;

function sessionStorageIfAvailable(): MemoryGateStorage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readMemoryGateUnlock(storage: MemoryGateStorage | null, fallback = false): boolean {
  try {
    return storage?.getItem(MEMORY_GATE_SESSION_KEY) === '1' || fallback;
  } catch {
    return fallback;
  }
}

export function writeMemoryGateUnlock(storage: MemoryGateStorage | null): boolean {
  try {
    storage?.setItem(MEMORY_GATE_SESSION_KEY, '1');
  } catch {
    // The module-level fallback below still keeps the current visit unlocked.
  }
  return true;
}

export function isMemoryGateUnlocked(): boolean {
  return readMemoryGateUnlock(sessionStorageIfAvailable(), memoryUnlocked);
}

export function unlockMemoryGate(): void {
  memoryUnlocked = writeMemoryGateUnlock(sessionStorageIfAvailable());
}
