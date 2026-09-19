/**
 * Optional discoveries.
 *
 * WHAT THIS IS NOT
 *   Not a game, not an achievement system, not a progress meter. Nothing here
 *   is ever counted, scored or shown as "found 2 of 5". A visitor who discovers
 *   none of these sees the complete story exactly as designed; a visitor who
 *   finds all of them sees the same story with a few private moments in it.
 *
 * WHY sessionStorage
 *   The only job of this store is to stop a discovery repeating while someone is
 *   still reading. A new tab should be able to find them again — that is the
 *   point of a secret — so nothing is persisted beyond the session, nothing is
 *   sent anywhere, and no account or analytics is involved.
 */

const KEY = 'ai-discovered-secrets';

type Listener = () => void;

const listeners = new Set<Listener>();
/** Mirrors sessionStorage so a blocked or unavailable store still behaves. */
let discovered: Set<string> | null = null;

function load(): Set<string> {
  if (discovered) return discovered;
  discovered = new Set<string>();
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((id) => typeof id === 'string' && discovered?.add(id));
      }
    }
  } catch {
    // Private mode, or storage disabled. The in-memory set still works for this
    // page view, which is all a secret actually needs.
  }
  return discovered;
}

function persist(): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify([...load()]));
  } catch {
    // See above: the in-memory set remains authoritative.
  }
}

export function hasDiscovered(id: string): boolean {
  return load().has(id);
}

/** Returns true when this was a NEW discovery, false when already found. */
export function markDiscovered(id: string): boolean {
  const set = load();
  if (set.has(id)) return false;
  set.add(id);
  persist();
  listeners.forEach((listener) => listener());
  return true;
}

export function subscribeToDiscoveries(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
