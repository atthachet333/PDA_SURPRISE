import { createContext, useContext, useEffect } from 'react';
import type { MusicStatus, SoundEffect } from '@/lib/audio';

export interface AudioState {
  unlocked: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicAvailable: boolean;
  /** The engine's own account of the music, never inferred by the UI. */
  status: MusicStatus;
  volume: number;
  musicVolume: number;
  sfxVolume: number;
}

export interface AudioContextValue extends AudioState {
  /** Arm playback. Must be called synchronously inside a user gesture. */
  unlock: () => void;
  /** Create the single track and begin buffering, without playing. */
  prepare: () => void;
  /** Begin the journey. Call inside the gesture; returns immediately. */
  start: () => void;
  /** Hold the position (never resets to zero). */
  pause: () => void;
  /** Resume from the held position. */
  resume: () => void;
  toggleMusic: () => void;
  toggleSfx: () => void;
  setMusicEnabled: (enabled: boolean) => void;
  setSfxEnabled: (enabled: boolean) => void;
  setVolume: (value: number, bus?: 'master' | 'music' | 'sfx') => void;
  /** Scene-level music level, 0-1, always reached by a ramp. */
  setSceneMix: (level: number, duration?: number) => void;
  /** Fade down and stop — for leaving the experience. */
  fadeOutAndStop: (duration?: number) => void;
  /** Fade out, return to the top, fade back in, resetting the story between. */
  restart: (onReset?: () => void) => void;
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
