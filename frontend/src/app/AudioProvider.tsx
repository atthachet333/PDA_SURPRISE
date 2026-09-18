import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AudioManager, type SoundEffect } from '@/lib/audio';
import { anniversary } from '@/data/anniversary';
import { AudioCtx, type AudioContextValue, type AudioState } from './audioContext';

const { audio } = anniversary;

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const managerRef = useRef<AudioManager | null>(null);
  if (!managerRef.current) {
    managerRef.current = new AudioManager({
      musicSrc: audio.musicSrc,
      sfxDir: audio.sfxDir,
      cues: audio.cues.map((cue) => ({ id: cue.id, time: cue.time })),
      defaults: {
        musicVolume: audio.defaultMusicVolume,
        sfxVolume: audio.defaultSfxVolume
      }
    });
  }
  const manager = managerRef.current;

  const snapshot = useCallback(
    (): AudioState => ({
      unlocked: manager.unlocked,
      musicEnabled: manager.prefs.musicEnabled,
      sfxEnabled: manager.prefs.sfxEnabled,
      musicAvailable: manager.musicAvailable,
      volume: manager.prefs.volume,
      musicVolume: manager.prefs.musicVolume,
      sfxVolume: manager.prefs.sfxVolume
    }),
    [manager]
  );

  const [state, setState] = useState<AudioState>(snapshot);

  useEffect(() => manager.subscribe(() => setState(snapshot())), [manager, snapshot]);

  // Never keep playing into a backgrounded tab.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') manager.pauseMusic();
      else if (manager.prefs.musicEnabled) manager.playMusic();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [manager]);

  useEffect(() => () => manager.dispose(), [manager]);

  const value = useMemo<AudioContextValue>(
    () => ({
      ...state,
      unlock: () => manager.unlock(),
      toggleMusic: () => manager.setMusicEnabled(!manager.prefs.musicEnabled),
      toggleSfx: () => manager.setSfxEnabled(!manager.prefs.sfxEnabled),
      setMusicEnabled: (enabled: boolean) => manager.setMusicEnabled(enabled),
      setSfxEnabled: (enabled: boolean) => manager.setSfxEnabled(enabled),
      setVolume: (volume: number, bus?: 'master' | 'music' | 'sfx') => manager.setVolume(volume, bus),
      duck: (level: number, duration?: number) => manager.setDuck(level, duration),
      play: (effect: SoundEffect) => manager.playSfx(effect),
      onCue: (id: string, handler: (name: string) => void) => manager.onCue(id, handler),
      triggerCue: (id: string) => manager.triggerCue(id)
    }),
    [manager, state]
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}
