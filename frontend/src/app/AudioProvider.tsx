import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AudioManager, type SoundEffect } from '@/lib/audio';
import { anniversary } from '@/data/anniversary';
import { AudioCtx, type AudioContextValue, type AudioState } from './audioContext';

const { audio } = anniversary;

/**
 * The routes the anniversary music belongs to. `/login` is deliberately absent:
 * the gateway arms the audio context but does not carry the song.
 */
const AI_ROUTES = ['/workspace', '/us'];

const inExperience = (pathname: string) =>
  AI_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const managerRef = useRef<AudioManager | null>(null);
  if (!managerRef.current) {
    managerRef.current = new AudioManager({
      musicSrc: audio.musicSrc,
      sfxDir: audio.sfxDir,
      sfxFiles: audio.sfxFiles,
      cues: audio.cues.map((cue) => ({ id: cue.id, time: cue.time })),
      defaults: {
        volume: audio.defaultMasterVolume,
        musicVolume: audio.defaultMusicVolume,
        sfxVolume: audio.defaultSfxVolume
      }
    });
  }
  const manager = managerRef.current;
  const location = useLocation();

  const snapshot = useCallback(
    (): AudioState => ({
      unlocked: manager.unlocked,
      musicEnabled: manager.prefs.musicEnabled,
      sfxEnabled: manager.prefs.sfxEnabled,
      musicAvailable: manager.musicAvailable,
      status: manager.status,
      volume: manager.prefs.volume,
      musicVolume: manager.prefs.musicVolume,
      sfxVolume: manager.prefs.sfxVolume
    }),
    [manager]
  );

  const [state, setState] = useState<AudioState>(snapshot);

  useEffect(() => manager.subscribe(() => setState(snapshot())), [manager, snapshot]);

  /**
   * Backgrounding, screen lock and app switching all arrive here.
   *
   * The pause is IMMEDIATE rather than faded: a hidden tab throttles the timers a
   * fade is stepped with, so a faded pause could be left half-applied and the
   * track would keep playing quietly into a screen nobody is looking at. Nobody
   * can hear a cut they are not listening to, and the position is preserved
   * either way — so returning resumes from where it left off with a short fade,
   * on the same instance. Never a second track.
   */
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') manager.handleHidden();
      else manager.handleVisible();
    };
    // Mobile Safari fires pagehide on app switch without always firing
    // visibilitychange first.
    const onHide = () => manager.handleHidden();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onHide);
    };
  }, [manager]);

  /**
   * Leaving the experience fades the track down and stops it, so anniversary
   * music can never continue indefinitely under the corporate site. Moving
   * BETWEEN experience routes (/workspace -> /us) deliberately does nothing:
   * that is one continuous journey on one instance.
   */
  const wasInside = useRef(inExperience(location.pathname));
  useEffect(() => {
    const inside = inExperience(location.pathname);
    if (wasInside.current && !inside) manager.fadeOutAndStop(1500);
    wasInside.current = inside;
  }, [location.pathname, manager]);

  // Note: no dispose-on-unmount. This provider is mounted at the app root for
  // the lifetime of the document, and a StrictMode remount would otherwise tear
  // down the AudioContext and the single track the whole experience depends on.

  const value = useMemo<AudioContextValue>(
    () => ({
      ...state,
      unlock: () => manager.unlock(),
      prepare: () => manager.prepare(),
      start: () => manager.start(),
      pause: () => manager.pause(),
      resume: () => manager.resume(),
      toggleMusic: () => manager.setMusicEnabled(!manager.prefs.musicEnabled),
      toggleSfx: () => manager.setSfxEnabled(!manager.prefs.sfxEnabled),
      setMusicEnabled: (enabled: boolean) => manager.setMusicEnabled(enabled),
      setSfxEnabled: (enabled: boolean) => manager.setSfxEnabled(enabled),
      setVolume: (volume: number, bus?: 'master' | 'music' | 'sfx') => manager.setVolume(volume, bus),
      setSceneMix: (level: number, duration?: number) => manager.setSceneMix(level, duration),
      fadeOutAndStop: (duration?: number) => manager.fadeOutAndStop(duration),
      restart: (onReset?: () => void) => manager.restart(onReset),
      play: (effect: SoundEffect) => manager.playSfx(effect),
      onCue: (id: string, handler: (name: string) => void) => manager.onCue(id, handler),
      triggerCue: (id: string) => manager.triggerCue(id)
    }),
    [manager, state]
  );

  return <AudioCtx.Provider value={value}>{children}</AudioCtx.Provider>;
}
