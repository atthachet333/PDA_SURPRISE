import { useCallback, useEffect, useState } from 'react';
import { hasDiscovered, markDiscovered, subscribeToDiscoveries } from '@/lib/secrets';
import { useAudio } from '@/app/audioContext';

export interface SecretHandle {
  /** Already found during this session. */
  discovered: boolean;
  /** Currently showing its reveal. */
  revealing: boolean;
  /**
   * Trigger the discovery. Returns true when it actually fired — false when it
   * was already found this session, so callers can stay silent on a repeat.
   */
  discover: () => boolean;
}

/**
 * One optional discovery.
 *
 * The reveal is time-boxed and self-closing: a secret must never sit on screen
 * waiting to be dismissed, because the story continues underneath it and the
 * visitor may simply keep scrolling. Repeats are suppressed for the session so
 * a moment stays a moment.
 *
 * `sound` is played once, through the normal effects bus, so a visitor who
 * turned sound off discovers the same things in silence.
 */
export function useSecret(
  id: string,
  { duration = 3000, sound = true }: { duration?: number; sound?: boolean } = {}
): SecretHandle {
  const [discovered, setDiscovered] = useState(() => hasDiscovered(id));
  const [revealing, setRevealing] = useState(false);
  const { play } = useAudio();

  useEffect(() => subscribeToDiscoveries(() => setDiscovered(hasDiscovered(id))), [id]);

  useEffect(() => {
    if (!revealing) return;
    const timer = window.setTimeout(() => setRevealing(false), duration);
    return () => window.clearTimeout(timer);
  }, [duration, revealing]);

  const discover = useCallback(() => {
    if (!markDiscovered(id)) return false;
    setRevealing(true);
    // One effect per discovery, never looped. `play` already no-ops when the
    // visitor has effects switched off.
    if (sound) play('lightSparkle');
    return true;
  }, [id, play, sound]);

  return { discovered, revealing, discover };
}
