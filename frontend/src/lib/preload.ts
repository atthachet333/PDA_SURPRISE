type Status = 'pending' | 'loaded' | 'failed';

const cache = new Map<string, Status>();
const inflight = new Map<string, Promise<boolean>>();

/**
 * Decodes an image off the main thread and resolves whether it is usable.
 * Failures resolve `false` rather than rejecting: a missing photo is an
 * expected state here, not an error.
 */
export function preloadImage(src: string): Promise<boolean> {
  if (!src) return Promise.resolve(false);

  const status = cache.get(src);
  if (status === 'loaded') return Promise.resolve(true);
  if (status === 'failed') return Promise.resolve(false);

  const existing = inflight.get(src);
  if (existing) return existing;

  const task = new Promise<boolean>((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      cache.set(src, 'loaded');
      resolve(true);
    };
    image.onerror = () => {
      cache.set(src, 'failed');
      resolve(false);
    };
    image.src = src;
  }).finally(() => {
    inflight.delete(src);
  });

  cache.set(src, 'pending');
  inflight.set(src, task);
  return task;
}

/**
 * Preloads a batch with a small concurrency cap so a large memory set never
 * saturates the connection ahead of the assets the current scene needs.
 */
export async function preloadImages(sources: (string | undefined)[], concurrency = 4): Promise<void> {
  const queue = sources.filter(
    (src): src is string => typeof src === 'string' && src.length > 0 && cache.get(src) !== 'loaded'
  );
  if (queue.length === 0) return;

  let cursor = 0;
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (cursor < queue.length) {
      const index = cursor;
      cursor += 1;
      const src = queue[index];
      if (src) await preloadImage(src);
    }
  });

  await Promise.all(workers);
}

export function isKnownBroken(src?: string): boolean {
  return Boolean(src) && cache.get(src as string) === 'failed';
}

/** Runs work when the browser is idle, falling back to a short timeout. */
export function whenIdle(task: () => void, timeout = 1200): () => void {
  const idle = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number })
    .requestIdleCallback;

  if (typeof idle === 'function') {
    const handle = idle(task, { timeout });
    return () => {
      const cancel = (window as Window & { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;
      cancel?.(handle);
    };
  }

  const handle = window.setTimeout(task, 200);
  return () => window.clearTimeout(handle);
}
