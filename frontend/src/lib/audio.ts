import { Howl, Howler } from 'howler';

export type SoundEffect = 'hover' | 'click' | 'whoosh' | 'impact' | 'sparkle' | 'transition';

export interface TrackCue {
  /** Seconds into the main track. */
  time: number;
  /** Cue id scenes subscribe to. */
  id: string;
}

export interface AudioPreferences {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  /** Master multiplier applied to both buses. */
  volume: number;
}

export interface AudioManagerOptions {
  musicSrc: string;
  sfxDir: string;
  cues?: TrackCue[];
  defaults?: Partial<AudioPreferences>;
}

type Listener = () => void;

const PREFS_KEY = 'ai:audio';
const FADE_MS = 1400;

/** Synthesised fallbacks, used whenever a recorded file is absent. */
type EffectShape =
  | { kind: 'tone'; wave: OscillatorType; frequency: number; slideTo?: number; duration: number; gain: number }
  | { kind: 'noise'; frequency: number; duration: number; gain: number };

const EFFECT_SHAPES: Record<SoundEffect, EffectShape> = {
  hover: { kind: 'tone', wave: 'sine', frequency: 1180, duration: 0.09, gain: 0.035 },
  click: { kind: 'tone', wave: 'triangle', frequency: 640, slideTo: 340, duration: 0.14, gain: 0.07 },
  whoosh: { kind: 'noise', frequency: 900, duration: 0.7, gain: 0.09 },
  impact: { kind: 'tone', wave: 'sine', frequency: 180, slideTo: 42, duration: 1.1, gain: 0.16 },
  sparkle: { kind: 'tone', wave: 'sine', frequency: 1560, slideTo: 2600, duration: 0.42, gain: 0.05 },
  transition: { kind: 'noise', frequency: 520, duration: 1.1, gain: 0.08 }
};

const EFFECT_NAMES = Object.keys(EFFECT_SHAPES) as SoundEffect[];

const DEFAULT_PREFS: AudioPreferences = {
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.45,
  sfxVolume: 0.6,
  volume: 1
};

function readPreferences(fallback: AudioPreferences): AudioPreferences {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<AudioPreferences>;
    return {
      musicEnabled: typeof parsed.musicEnabled === 'boolean' ? parsed.musicEnabled : fallback.musicEnabled,
      sfxEnabled: typeof parsed.sfxEnabled === 'boolean' ? parsed.sfxEnabled : fallback.sfxEnabled,
      musicVolume: clamp01(parsed.musicVolume ?? fallback.musicVolume),
      sfxVolume: clamp01(parsed.sfxVolume ?? fallback.sfxVolume),
      volume: clamp01(parsed.volume ?? fallback.volume)
    };
  } catch {
    return fallback;
  }
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Central audio controller.
 *
 * Design rules this enforces:
 *  - nothing plays before `unlock()` runs inside a real user gesture;
 *  - every missing file degrades silently (no track, no sfx file, no console noise);
 *  - music never starts or stops abruptly — everything goes through a fade;
 *  - preferences persist across visits;
 *  - the cue timeline is optional, so animation never depends on the music.
 */
export class AudioManager {
  private readonly musicSrc: string;
  private readonly sfxDir: string;
  private readonly cues: TrackCue[];

  private music: Howl | null = null;
  private sfx = new Map<SoundEffect, Howl | null>();
  private ctx: AudioContext | null = null;

  private firedCues = new Set<string>();
  private cueListeners = new Map<string, Set<(id: string) => void>>();
  private changeListeners = new Set<Listener>();
  private cueTimer: number | null = null;
  private fadeTimer: number | null = null;

  /** Scene-driven attenuation (0-1) layered on top of musicVolume. */
  private duck = 1;

  unlocked = false;
  musicAvailable = false;
  prefs: AudioPreferences;

  constructor({ musicSrc, sfxDir, cues = [], defaults }: AudioManagerOptions) {
    this.musicSrc = musicSrc;
    this.sfxDir = sfxDir.replace(/\/$/, '');
    this.cues = [...cues].sort((a, b) => a.time - b.time);
    this.prefs = readPreferences({ ...DEFAULT_PREFS, ...defaults });
  }

  // ---- subscription -------------------------------------------------------

  subscribe(listener: Listener): () => void {
    this.changeListeners.add(listener);
    return () => {
      this.changeListeners.delete(listener);
    };
  }

  private emit(): void {
    this.changeListeners.forEach((listener) => listener());
  }

  private persist(): void {
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs));
    } catch {
      // Private mode: preferences simply do not survive the session.
    }
  }

  // ---- lifecycle ----------------------------------------------------------

  /** Must be called from a user gesture (click / tap / keydown). */
  async unlock(): Promise<void> {
    if (this.unlocked) return;
    this.unlocked = true;

    try {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor) {
        this.ctx = new Ctor();
        if (this.ctx.state === 'suspended') await this.ctx.resume();
      }
    } catch {
      this.ctx = null;
    }

    this.loadSfx();
    this.loadMusic();
    this.emit();
  }

  private loadSfx(): void {
    if (this.sfx.size > 0) return;
    EFFECT_NAMES.forEach((name) => {
      // Marked as unavailable up front; the onload handler promotes it.
      this.sfx.set(name, null);
      const howl = new Howl({
        src: [`${this.sfxDir}/${name}.mp3`],
        volume: this.effectiveSfxVolume(),
        preload: true,
        onload: () => this.sfx.set(name, howl),
        onloaderror: () => this.sfx.set(name, null)
      });
    });
  }

  private loadMusic(): void {
    if (this.music) return;

    this.music = new Howl({
      src: [this.musicSrc],
      loop: true,
      volume: 0,
      html5: true,
      preload: true,
      onloaderror: () => {
        // No track shipped — expected in a clean checkout.
        this.musicAvailable = false;
        this.emit();
      },
      onload: () => {
        this.musicAvailable = true;
        this.emit();
        if (this.prefs.musicEnabled) this.playMusic();
      }
    });
  }

  // ---- music --------------------------------------------------------------

  private effectiveMusicVolume(): number {
    return clamp01(this.prefs.musicVolume * this.prefs.volume * this.duck);
  }

  private effectiveSfxVolume(): number {
    return clamp01(this.prefs.sfxVolume * this.prefs.volume);
  }

  playMusic(): void {
    if (!this.music || !this.musicAvailable || !this.prefs.musicEnabled) return;
    if (!this.music.playing()) this.music.play();
    this.fadeMusic(this.effectiveMusicVolume(), FADE_MS);
    this.startCueLoop();
  }

  pauseMusic(): void {
    if (!this.music?.playing()) return;
    const track = this.music;
    this.fadeMusic(0, 600);
    window.clearTimeout(this.fadeTimer ?? undefined);
    this.fadeTimer = window.setTimeout(() => {
      if (track.volume() < 0.01) track.pause();
    }, 660);
    this.stopCueLoop();
  }

  /** Ramps the music bus to a target volume. Safe to call at any time. */
  fadeMusic(target: number, duration = FADE_MS): void {
    if (!this.music || !this.musicAvailable) return;
    const from = this.music.volume();
    const to = clamp01(target);
    if (Math.abs(from - to) < 0.005) return;
    this.music.fade(from, to, Math.max(60, duration));
  }

  /**
   * Scene-level attenuation. The quiet scene ducks to ~0.35 and the finale
   * opens back up, without touching the visitor's own volume setting.
   */
  setDuck(level: number, duration = 1600): void {
    const next = clamp01(level);
    if (Math.abs(next - this.duck) < 0.01) return;
    this.duck = next;
    if (this.music?.playing()) this.fadeMusic(this.effectiveMusicVolume(), duration);
  }

  setMusicEnabled(enabled: boolean): void {
    this.prefs.musicEnabled = enabled;
    this.persist();
    if (enabled) {
      this.loadMusic();
      this.playMusic();
    } else {
      this.pauseMusic();
    }
    this.emit();
  }

  setSfxEnabled(enabled: boolean): void {
    this.prefs.sfxEnabled = enabled;
    this.persist();
    this.emit();
  }

  /** Master volume. `setVolume(v, 'music' | 'sfx')` targets one bus. */
  setVolume(value: number, bus: 'master' | 'music' | 'sfx' = 'master'): void {
    const next = clamp01(value);
    if (bus === 'music') this.prefs.musicVolume = next;
    else if (bus === 'sfx') this.prefs.sfxVolume = next;
    else this.prefs.volume = next;

    this.persist();
    Howler.volume(1);
    if (this.music?.playing()) this.fadeMusic(this.effectiveMusicVolume(), 240);
    this.sfx.forEach((howl) => howl?.volume(this.effectiveSfxVolume()));
    this.emit();
  }

  // ---- cue timeline -------------------------------------------------------

  onCue(id: string, handler: (id: string) => void): () => void {
    const set = this.cueListeners.get(id) ?? new Set();
    set.add(handler);
    this.cueListeners.set(id, set);
    return () => {
      set.delete(handler);
    };
  }

  /** Fires a cue directly, so scenes work identically with music disabled. */
  triggerCue(id: string): void {
    this.cueListeners.get(id)?.forEach((handler) => handler(id));
  }

  private startCueLoop(): void {
    if (this.cueTimer !== null || this.cues.length === 0) return;
    this.cueTimer = window.setInterval(() => {
      if (!this.music?.playing()) return;
      const seconds = this.music.seek() as number;
      for (const cue of this.cues) {
        if (seconds >= cue.time && !this.firedCues.has(cue.id)) {
          this.firedCues.add(cue.id);
          this.cueListeners.get(cue.id)?.forEach((handler) => handler(cue.id));
        }
      }
      if (seconds < 0.5) this.firedCues.clear();
    }, 120);
  }

  private stopCueLoop(): void {
    if (this.cueTimer === null) return;
    window.clearInterval(this.cueTimer);
    this.cueTimer = null;
  }

  // ---- effects ------------------------------------------------------------

  playSfx(effect: SoundEffect): void {
    if (!this.prefs.sfxEnabled || !this.unlocked) return;

    const recorded = this.sfx.get(effect);
    if (recorded) {
      recorded.volume(this.effectiveSfxVolume());
      recorded.play();
      return;
    }

    this.synthesise(effect);
  }

  private synthesise(effect: SoundEffect): void {
    if (!this.ctx) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    const shape = EFFECT_SHAPES[effect];
    const peak = Math.max(0.0002, shape.gain * this.effectiveSfxVolume());

    if (shape.kind === 'noise') {
      const length = Math.floor(ctx.sampleRate * shape.duration);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / length);
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = shape.frequency;
      filter.Q.value = 0.8;
      source.connect(filter);
      filter.connect(gain);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + shape.duration);
      source.start(now);
      source.stop(now + shape.duration);
      source.onended = () => gain.disconnect();
      return;
    }

    const osc = ctx.createOscillator();
    osc.type = shape.wave;
    osc.frequency.setValueAtTime(shape.frequency, now);
    if (shape.slideTo) osc.frequency.exponentialRampToValueAtTime(shape.slideTo, now + shape.duration);
    osc.connect(gain);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + shape.duration);
    osc.start(now);
    osc.stop(now + shape.duration);
    osc.onended = () => gain.disconnect();
  }

  // ---- teardown -----------------------------------------------------------

  dispose(): void {
    this.stopCueLoop();
    if (this.fadeTimer !== null) window.clearTimeout(this.fadeTimer);
    this.music?.unload();
    this.music = null;
    this.sfx.forEach((howl) => howl?.unload());
    this.sfx.clear();
    void this.ctx?.close();
    this.ctx = null;
    this.changeListeners.clear();
    this.cueListeners.clear();
  }
}
