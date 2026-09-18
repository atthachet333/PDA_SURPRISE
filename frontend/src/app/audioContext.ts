import { createContext, useContext, useEffect } from 'react';
import type { SoundEffect } from '@/lib/audio';

export interface AudioState {
  unlocked: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicAvailable: boolean;
  volume: number;
  musicVolume: number;
  sfxVolume: number;
}

export interface AudioContextValue extends AudioState {
  unlock: () => Promise<void>;
  toggleMusic: () => void;
  toggleSfx: () => void;
  setMusicEnabled: (enabled: boolean) => void;
  setSfxEnabled: (enabled: boolean) => void;
  setVolume: (value: number, bus?: 'master' | 'music' | 'sfx') => void;
  /** Scene-level music attenuation, 0-1. */
  duck: (level: number, duration?: number) => void;
  play: (effect: SoundEffect) => void;
  onCue: (id: string, handler: (id: string) => void) => () => void;
  triggerCue: (id: string) => void;
}

export const AudioCtx = createContext<AudioContextValue | null>(null);

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudio must be used inside <AudioProvider>');
  return ctx;
}

/**
 * Subscribes to a music cue for the lifetime of a component. Cues fire from the
 * track when one is loaded, and can also be triggered directly by a scene, so
 * behaviour is identical with audio disabled.
 */
export function useAudioCue(id: string, handler: (id: string) => void): void {
  const { onCue } = useAudio();
  useEffect(() => onCue(id, handler), [handler, id, onCue]);
}

/** Ducks the music while a scene is active, restoring the level on exit. */
export function useMusicDuck(active: boolean, level: number, duration = 1800): void {
  const { duck } = useAudio();
  useEffect(() => {
    if (!active) return;
    duck(level, duration);
    return () => duck(1, duration);
  }, [active, duck, duration, level]);
}
