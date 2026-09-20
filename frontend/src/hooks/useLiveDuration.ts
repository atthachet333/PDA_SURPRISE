import { useEffect, useRef, useState } from 'react';

export interface LiveDuration {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * Bangkok is UTC+7 with no daylight saving, ever. A fixed offset is therefore
 * exact here, and avoids pulling in a timezone database for one calculation.
 */
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * The relationship began on 2025-10-12 — but nobody has said at what TIME, and
 * inventing one would put a fabricated number on screen down to the second.
 *
 * So the count runs from the START OF THAT DAY in Bangkok, 2025-10-12 00:00 ICT
 * (= 2025-10-11 17:00 UTC). That is a stated convention rather than a guess,
 * and it keeps the day figure identical to the one the rest of the experience
 * already derives from the date alone.
 */
export function bangkokStartOfDay(isoDate: string): number {
  const [y, m, d] = isoDate.split('-').map(Number);
  return Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1) - BANGKOK_OFFSET_MS;
}

export function durationSince(startMs: number, nowMs: number): LiveDuration {
  const total = Math.max(0, nowMs - startMs);
  const seconds = Math.floor(total / 1000);
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60
  };
}

/**
 * A live day / hour / minute / second count.
 *
 * PERFORMANCE: the interval is aligned to the wall clock so the display changes
 * on the second rather than drifting, and state is only set when the rendered
 * value actually differs — so a tab that has been throttled and wakes up does
 * one update, not a burst of them. Only the component that calls this hook
 * re-renders; the WebGL scene above it is untouched.
 *
 * It also stops entirely while the page is hidden. Nobody is reading a counter
 * they cannot see, and a background tab should not be waking once a second.
 */
export function useLiveDuration(startIso: string): LiveDuration {
  const startMs = useRef(bangkokStartOfDay(startIso)).current;
  const [value, setValue] = useState<LiveDuration>(() => durationSince(startMs, Date.now()));
  // Absolute second, not `value.seconds` (0-59): if the main thread is paused
  // for exactly a minute, the visible seconds field can match while minutes
  // have changed.
  const lastTick = useRef(Math.floor(Date.now() / 1000));

  useEffect(() => {
    let timer = 0;

    const tick = () => {
      const nowMs = Date.now();
      const stamp = Math.floor(nowMs / 1000);
      const next = durationSince(startMs, nowMs);
      if (stamp !== lastTick.current) {
        lastTick.current = stamp;
        setValue(next);
      }
      // Re-aim at the next whole second instead of assuming 1000ms elapsed.
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 8);
    };

    const start = () => {
      window.clearTimeout(timer);
      const nowMs = Date.now();
      const now = durationSince(startMs, nowMs);
      lastTick.current = Math.floor(nowMs / 1000);
      setValue(now);
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 8);
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') window.clearTimeout(timer);
      else start();
    };

    start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [startMs]);

  return value;
}
