import { Howl, Howler } from 'howler';

/**
 * A&I audio engine.
 *
 * DESIGN RULES THIS ENFORCES
 *
 *  1. ONE authoritative music instance. `prepare()` creates the single Howl and
 *     every later call reuses it. Scenes, routes, visibility changes, fullscreen
 *     and replay all mutate that one instance — nothing here ever constructs a
 *     second track, so the song can never double up on itself.
 *
 *  2. The song is never a timeline controller. Scenes influence the MIX only.
 *     Changing scene never seeks, restarts or reloads; the optional cue map
 *     fires from the track when one is playing but every scene also triggers its
 *     own cue directly, so the story is identical with audio off.
 *
 *  3. Nothing is ever hard-cut. Level changes go through a ramp; stopping goes
 *     through a fade; the first play climbs from near-silence over ~3.4s.
 *
 *  4. Every failure is silent to the visitor. A missing file, a blocked
 *     autoplay, a suspended context — each resolves to a calm control state, not
 *     an error surface and not a retry loop.
 */

// ---------------------------------------------------------------- effects --

/**
 * The A&I palette: air, light, space, memory. Deliberately not game UI or
 * terminal bleeps — every shape is soft-attack and short.
 */
export type SoundEffect =
  | 'softClick'
  | 'airWhoosh'
  | 'memoryFocus'
  | 'lightSparkle'
  | 'softImpact'
  | 'orbitPass'
  | 'transitionRise';

export interface TrackCue {
  /** Seconds into the main track. Optional enhancement only. */
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

/**
 * What the controls are allowed to say. These are derived from the engine, never
 * guessed by the UI.
 *
 *   idle         nothing prepared yet
 *   loading      fetching metadata / first bytes
 *   ready        loaded, not started
 *   playing      audible (possibly mid fade)
 *   paused       position held, will resume from here
 *   blocked      the browser refused playback; needs a gesture
 *   unavailable  no file — the control disables itself
 */
export type MusicStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'blocked'
  | 'unavailable';

export interface AudioManagerOptions {
  musicSrc: string;
  sfxDir: string;
  /**
   * Recorded effect files that actually exist, without extension. Empty means
   * "synthesise everything" — nothing is fetched, so a bare `public/audio/sfx`
   * produces no 404s at all.
   */
  sfxFiles?: readonly string[];
  cues?: TrackCue[];
  defaults?: Partial<AudioPreferences>;
}

type Listener = () => void;

const PREFS_KEY = 'ai:audio';

/** Default ramp for a scene mix change. */
const MIX_MS = 1400;

/**
 * Cinematic first entry: near-silence, then two landings, then the target.
 * Fractions of the configured level, so the shape holds at any volume.
 */
const INTRO_CURVE: { to: number; ms: number }[] = [
  { to: 0.15, ms: 900 },
  { to: 0.4, ms: 1100 },
  { to: 1, ms: 1400 }
];

/** Nominal length of the whole climb, plus slack, for the intro watchdog. */
const INTRO_TOTAL_MS = INTRO_CURVE.reduce((total, stage) => total + stage.ms, 0) + 1200;

/** Synthesised fallbacks, used whenever a recorded file is absent. */
type EffectShape =
  | {
      kind: 'tone';
      wave: OscillatorType;
      frequency: number;
      slideTo?: number;
      duration: number;
      gain: number;
      attack?: number;
    }
  | { kind: 'noise'; frequency: number; q?: number; duration: number; gain: number; attack?: number };

/**
 * Tuned by listening against the track rather than by picking round numbers.
 * Attacks are long enough that nothing clicks, and the gains sit well under the
 * music so an effect colours the moment instead of interrupting it.
 */
const EFFECT_SHAPES: Record<SoundEffect, EffectShape> = {
  /** A fingertip, not a button. */
  softClick: {
    kind: 'tone',
    wave: 'sine',
    frequency: 780,
    slideTo: 520,
    duration: 0.16,
    gain: 0.05,
    attack: 0.012
  },
  /** Air moving past, for the portal and scene thresholds. */
  airWhoosh: { kind: 'noise', frequency: 780, q: 0.6, duration: 0.85, gain: 0.07, attack: 0.16 },
  /** A memory coming into focus: one breath of a bell. */
  memoryFocus: {
    kind: 'tone',
    wave: 'sine',
    frequency: 1320,
    slideTo: 1180,
    duration: 0.5,
    gain: 0.03,
    attack: 0.05
  },
  /** Light, not glitter. */
  lightSparkle: {
    kind: 'tone',
    wave: 'sine',
    frequency: 1720,
    slideTo: 2480,
    duration: 0.46,
    gain: 0.028,
    attack: 0.03
  },
  /** Weight without a bang — a low swell that decays into the music. */
  softImpact: {
    kind: 'tone',
    wave: 'sine',
    frequency: 132,
    slideTo: 46,
    duration: 1.5,
    gain: 0.11,
    attack: 0.09
  },
  /** Something passing through space, once, when the Universe opens. */
  orbitPass: { kind: 'noise', frequency: 420, q: 1.6, duration: 1.4, gain: 0.05, attack: 0.42 },
  /** A rising floor under a transition. */
  transitionRise: { kind: 'noise', frequency: 560, q: 0.9, duration: 1.3, gain: 0.055, attack: 0.55 }
};

const EFFECT_NAMES = Object.keys(EFFECT_SHAPES) as SoundEffect[];

const DEFAULT_PREFS: AudioPreferences = {
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.62,
  sfxVolume: 0.32,
  volume: 0.75
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

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

export class AudioManager {
  private readonly musicSrc: string;
  private readonly sfxDir: string;
  private readonly sfxFiles: Set<string>;
  private readonly cues: TrackCue[];

  private music: Howl | null = null;
  private sfx = new Map<SoundEffect, Howl | null>();
  private ctx: AudioContext | null = null;
  /** True when `ctx` is Howler's context rather than one we created. */
  private ctxIsShared = false;

  private firedCues = new Set<string>();
  private cueListeners = new Map<string, Set<(id: string) => void>>();
  private changeListeners = new Set<Listener>();
  private cueTimer: number | null = null;
  private stopTimer: number | null = null;
  private introTimer: number | null = null;

  /** Scene-driven multiplier (0-1) layered on top of musicVolume. */
  private mix = 1;
  /** Independent duck multiplier owned by the video layer, never by a scene. */
  private videoDuck = 1;
  /** True from the first play until the intro curve has landed. */
  private intro = false;
  /** Set while the tab is hidden, so resume knows whether to restart audio. */
  private pausedByVisibility = false;
  /** A play() the engine has issued but that has not been confirmed audible. */
  private starting = false;

  unlocked = false;
  status: MusicStatus = 'idle';
  prefs: AudioPreferences;

  constructor({ musicSrc, sfxDir, sfxFiles = [], cues = [], defaults }: AudioManagerOptions) {
    this.musicSrc = musicSrc;
    this.sfxDir = sfxDir.replace(/\/$/, '');
    this.sfxFiles = new Set(sfxFiles);
    this.cues = [...cues].sort((a, b) => a.time - b.time);
    this.prefs = readPreferences({ ...DEFAULT_PREFS, ...defaults });
    // Buses are mixed here, not globally; Howler stays out of the way.
    Howler.volume(1);
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

  private setStatus(next: MusicStatus): void {
    if (this.status === next) return;
    this.status = next;
    this.emit();
  }

  private persist(): void {
    try {
      window.localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs));
    } catch {
      // Private mode: preferences simply do not survive the session.
    }
  }

  get musicAvailable(): boolean {
    return this.status !== 'unavailable';
  }

  get playing(): boolean {
    return this.status === 'playing';
  }

  // ---- unlock -------------------------------------------------------------

  /**
   * Arms playback. MUST be called from a real user gesture: the AudioContext is
   * resumed synchronously inside the gesture chain, because iOS Safari only
   * honours a resume that originates there — a later `setTimeout` is refused.
   *
   * This deliberately does NOT start the music. It only makes starting legal.
   */
  unlock(): void {
    if (this.unlocked) {
      // The context can be re-suspended by the OS (call, screen lock, another
      // app taking audio focus), so every later gesture gets a chance to revive it.
      if (!this.ctx && Howler.ctx) {
        this.ctx = Howler.ctx;
        this.ctxIsShared = true;
      }
      if (this.ctx?.state === 'suspended') void this.ctx.resume().catch(() => undefined);
      return;
    }
    this.unlocked = true;

    try {
      /*
       * Prefer Howler's own AudioContext for the synthesised effects rather than
       * opening a second one. Browsers cap how many a page may hold and warn
       * well before that, and two contexts on one page would also mean two
       * independent output graphs to keep unlocked after an interruption.
       */
      if (Howler.ctx) {
        this.ctx = Howler.ctx;
        this.ctxIsShared = true;
      } else {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (Ctor) this.ctx = new Ctor();
      }
      // Fire-and-forget: awaiting here would leave the gesture chain, and iOS
      // only honours a resume that originates inside it.
      if (this.ctx?.state === 'suspended') void this.ctx.resume().catch(() => undefined);
    } catch {
      this.ctx = null;
    }

    this.loadSfx();
    this.emit();
  }

  private loadSfx(): void {
    if (this.sfx.size > 0) return;
    EFFECT_NAMES.forEach((name) => {
      this.sfx.set(name, null);
      // Only fetch what the config says exists. With no manifest entries this
      // loop requests nothing at all, so a bare sfx directory is silent rather
      // than a wall of 404s.
      if (!this.sfxFiles.has(name)) return;
      const howl = new Howl({
        src: [`${this.sfxDir}/${name}.mp3`],
        volume: this.effectiveSfxVolume(),
        preload: true,
        onload: () => this.sfx.set(name, howl),
        onloaderror: () => this.sfx.set(name, null)
      });
    });
  }

  // ---- music lifecycle ----------------------------------------------------

  /**
   * Creates the single music instance and begins buffering, without playing.
   * Safe to call repeatedly and safe to call before any gesture — `metadata`
   * preload keeps this to a few kilobytes until playback actually starts, so
   * the full track is never pulled down speculatively.
   */
  prepare(): void {
    if (this.music) return;

    this.setStatus('loading');
    this.music = new Howl({
      src: [this.musicSrc],
      loop: true,
      volume: 0,
      html5: true,
      preload: 'metadata',
      onload: () => {
        // A start requested while still loading resolves here.
        if (this.starting) this.beginPlayback();
        else if (this.status === 'loading') this.setStatus('ready');
      },
      onloaderror: () => {
        // No track present — expected in a clean checkout. The controls show an
        // unavailable state and every scene continues exactly as before.
        this.starting = false;
        this.setStatus('unavailable');
      },
      onplayerror: () => {
        // Autoplay refused, or the context is still suspended. Do NOT retry in a
        // loop: surface `blocked` and wait for a gesture.
        this.starting = false;
        this.setStatus('blocked');
      },
      onplay: () => {
        this.starting = false;
        this.pausedByVisibility = false;
        this.setStatus('playing');
        this.startCueLoop();
      },
      onpause: () => {
        this.stopCueLoop();
        if (this.status === 'playing') this.setStatus('paused');
      }
    });
  }

  /**
   * Starts the journey. Call this synchronously inside the gesture that should
   * open the story — it never awaits anything before attempting playback.
   *
   * Navigation must not wait on this: if the file is still loading the play is
   * remembered and resolves on load, and if it never loads nothing happens.
   */
  start(): void {
    if (!this.prefs.musicEnabled) return;
    this.prepare();
    if (this.status === 'unavailable' || this.status === 'playing') return;

    this.starting = true;
    if (this.music?.state() === 'loaded') this.beginPlayback();
    // Otherwise `onload` picks it up. Either way the caller returns immediately.
  }

  /**
   * Issues the actual play and arms the level ramp.
   *
   * THE RAMP STARTS FROM THE `play` EVENT, NOT FROM HERE.
   *
   * Howler holds a `_playLock` for as long as the HTML5 `play()` promise is
   * pending. A `fade()` requested inside that window is not applied — it is
   * pushed onto Howler's internal queue under a `'fade'` event, and the play
   * handler only ever drains a `'play'` entry. The fade therefore sits in that
   * queue indefinitely and the track plays at volume ZERO for the whole visit:
   * audible nowhere, with no error and `playing() === true`.
   *
   * Howler clears the lock immediately before it emits `play`, so a ramp armed
   * on that event always lands.
   */
  private beginPlayback(): void {
    const track = this.music;
    if (!track) return;

    // A visibility resume should feel like the sound coming back into the room,
    // not like the story starting over.
    const resuming = this.pausedByVisibility || this.status === 'paused';
    const ramp = () => {
      if (resuming) this.rampTo(this.targetVolume(), 900);
      else this.runIntro();
    };

    // Already audible: no new play event is coming, so ramp directly.
    if (track.playing()) {
      ramp();
      return;
    }

    track.volume(0);
    track.once('play', ramp);
    track.play();
  }

  /**
   * Near-silence to target over ~3.4s in three landings. Chained on Howler's
   * own fade completion rather than wall-clock timers, so a throttled tab lands
   * late instead of stopping halfway.
   */
  private runIntro(): void {
    const track = this.music;
    if (!track) return;

    this.intro = true;
    let step = 0;

    /**
     * WATCHDOG. `intro` suppresses scene-mix ramps so the climb is not fought
     * mid-flight, which means a climb that never finishes would freeze the music
     * at whatever level it reached and ignore every scene for the rest of the
     * visit. The chain is driven by Howler's `fade` event, and an event is not
     * something correctness may depend on, so the flag is released on a timer
     * too — whichever comes first. After this the scene mix always has the bus.
     */
    window.clearTimeout(this.introTimer ?? undefined);
    this.introTimer = window.setTimeout(() => {
      if (!this.intro) return;
      this.intro = false;
      this.rampTo(this.targetVolume(), 900);
    }, INTRO_TOTAL_MS);

    const settle = () => {
      this.intro = false;
      window.clearTimeout(this.introTimer ?? undefined);
      // Settle on the LIVE target: the scene may well have moved during the
      // climb, and each stage aimed at the target as it was when that stage began.
      this.rampTo(this.targetVolume(), 600);
    };

    const advance = () => {
      const stage = INTRO_CURVE[step];
      if (!stage || !track.playing()) {
        settle();
        return;
      }
      step += 1;
      const to = clamp01(this.targetVolume() * stage.to);
      track.once('fade', () => {
        if (step >= INTRO_CURVE.length) {
          settle();
          return;
        }
        advance();
      });
      track.fade(track.volume(), to, stage.ms);
    };

    advance();
  }

  // ---- levels -------------------------------------------------------------

  /** Where the music bus should sit right now, before any fade. */
  private targetVolume(): number {
    return clamp01(this.prefs.musicVolume * this.prefs.volume * this.mix * this.videoDuck);
  }

  private effectiveSfxVolume(): number {
    return clamp01(this.prefs.sfxVolume * this.prefs.volume);
  }

  /** Ramps the music bus. Never sets a level instantly. */
  private rampTo(target: number, duration = MIX_MS): void {
    const track = this.music;
    if (!track || this.status === 'unavailable') return;
    const from = track.volume();
    const to = clamp01(target);
    if (Math.abs(from - to) < 0.004) return;
    track.fade(from, to, Math.max(80, duration));
  }

  /**
   * Scene-level mix multiplier. This is the ONLY thing a scene may do to the
   * music: no seeking, no restarting, no stopping. Quiet lands near 0.42,
   * Convergence rises to 0.98, and the ramp between them is always audible as a
   * move rather than a cut.
   */
  setSceneMix(level: number, duration = MIX_MS): void {
    this.mix = clamp01(level);

    /*
     * Deliberately NO early return on "the level did not change".
     *
     * `mix` records what was REQUESTED, not what was applied. A request that
     * arrives at a moment it cannot be acted on - during the intro climb, or
     * before playback has actually begun - still updates this field, so a
     * cheap intent-vs-intent comparison would treat every later request for
     * that same level as redundant and the bus would stay where it was for the
     * rest of the visit.
     *
     * So every scene re-asserts its level, and `rampTo` decides whether there
     * is anything to do by comparing against the ACTUAL bus volume. That is the
     * only honest check, and it makes the mix self-correcting: one skipped ramp
     * is repaired by the next scene rather than persisting.
     */
    // While the intro curve is climbing, let it finish and settle on the new
    // target itself — two overlapping fades would fight each other.
    if (!this.intro && this.status === 'playing') this.rampTo(this.targetVolume(), duration);
  }

  /**
   * Ducks the music under a memory clip's own audio.
   *
   * This is a SEPARATE multiplier from `mix` on purpose. A scene owns `mix` and
   * re-asserts it freely; if ducking wrote into that field, the next scene
   * assertion would erase the duck, and restoring afterwards would mean
   * remembering a number and writing it back — which is exactly how a restore
   * ends up hardcoded and wrong. Composing instead means "stop ducking" is
   * `setVideoDuck(1)`, and whatever level the scene currently wants is what the
   * music returns to, with no bookkeeping.
   */
  setVideoDuck(level: number, duration = MIX_MS): void {
    this.videoDuck = clamp01(level);
    if (!this.intro && this.status === 'playing') this.rampTo(this.targetVolume(), duration);
  }

  setMusicEnabled(enabled: boolean): void {
    this.prefs.musicEnabled = enabled;
    this.persist();
    if (enabled) this.start();
    else this.pause();
    this.emit();
  }

  setSfxEnabled(enabled: boolean): void {
    this.prefs.sfxEnabled = enabled;
    this.persist();
    this.emit();
  }

  /** Master volume, or one bus with `setVolume(v, 'music' | 'sfx')`. */
  setVolume(value: number, bus: 'master' | 'music' | 'sfx' = 'master'): void {
    const next = clamp01(value);
    if (bus === 'music') this.prefs.musicVolume = next;
    else if (bus === 'sfx') this.prefs.sfxVolume = next;
    else this.prefs.volume = next;

    this.persist();
    // Short, so dragging a slider tracks the hand without stepping.
    if (!this.intro && this.status === 'playing') this.rampTo(this.targetVolume(), 220);
    this.sfx.forEach((howl) => howl?.volume(this.effectiveSfxVolume()));
    this.emit();
  }

  // ---- pause / resume -----------------------------------------------------

  /**
   * Holds the position. `immediate` skips the fade — used when the tab is
   * hidden, where a fade cannot be trusted to finish and nobody can hear it
   * anyway. Position is always preserved; this never resets to zero.
   */
  pause(immediate = false): void {
    const track = this.music;
    if (!track || !track.playing()) return;

    this.intro = false;
    window.clearTimeout(this.introTimer ?? undefined);
    if (immediate) {
      track.pause();
      this.setStatus('paused');
      return;
    }

    this.rampTo(0, 600);
    window.clearTimeout(this.stopTimer ?? undefined);
    this.stopTimer = window.setTimeout(() => {
      // Pause regardless of where the fade actually got to: leaving a silent
      // track running would keep the cue loop alive for no reason.
      if (track.playing()) track.pause();
      this.setStatus('paused');
    }, 660);
  }

  /** Resumes from the held position with a short fade. Never re-creates. */
  resume(): void {
    if (!this.prefs.musicEnabled || this.status === 'unavailable') return;
    window.clearTimeout(this.stopTimer ?? undefined);
    this.start();
  }

  /** Called on `visibilitychange`. */
  handleHidden(): void {
    if (this.status !== 'playing') return;
    this.pausedByVisibility = true;
    this.pause(true);
  }

  handleVisible(): void {
    if (!this.pausedByVisibility) return;
    this.pausedByVisibility = false;
    this.resume();
  }

  /**
   * Leaving the experience. Fades over 1-2s and only then stops, so the
   * anniversary track never bleeds into the corporate site — and never cuts.
   */
  fadeOutAndStop(duration = 1500): void {
    const track = this.music;
    if (!track) return;
    this.intro = false;
    this.pausedByVisibility = false;

    // Already silent (paused, or never started): stop straight away. Nothing to
    // fade, and leaving a held position behind would make a later return to the
    // experience resume from the middle of the song instead of the top.
    if (!track.playing()) {
      track.stop();
      this.stopCueLoop();
      this.firedCues.clear();
      if (track.state() === 'loaded') this.setStatus('ready');
      return;
    }

    this.rampTo(0, duration);
    window.clearTimeout(this.stopTimer ?? undefined);
    this.stopTimer = window.setTimeout(() => {
      track.stop();
      this.stopCueLoop();
      this.firedCues.clear();
      this.setStatus('ready');
    }, duration + 80);
  }

  /**
   * Replay: fade out, return to the top, fade back in. Deliberately not
   * `currentTime = 0` at full volume. The story reset runs in the callback, so
   * it happens even when there is no music to fade.
   */
  restart(onReset?: () => void): void {
    const track = this.music;
    if (!track || !track.playing()) {
      onReset?.();
      return;
    }

    this.intro = false;
    this.rampTo(0, 900);
    window.clearTimeout(this.stopTimer ?? undefined);
    this.stopTimer = window.setTimeout(() => {
      this.firedCues.clear();
      try {
        track.seek(0);
      } catch {
        // Seeking an html5 stream can throw before it is seekable; the story
        // reset below still happens, which is the part that matters.
      }
      onReset?.();
      if (this.prefs.musicEnabled) {
        // Same `_playLock` rule as beginPlayback: arm the climb on the play
        // event, never synchronously after play().
        if (track.playing()) {
          this.runIntro();
        } else {
          track.once('play', () => this.runIntro());
          track.play();
        }
      }
    }, 960);
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
      const track = this.music;
      if (!track?.playing()) return;
      const seconds = track.seek();
      if (typeof seconds !== 'number' || Number.isNaN(seconds)) return;
      for (const cue of this.cues) {
        if (seconds >= cue.time && !this.firedCues.has(cue.id)) {
          this.firedCues.add(cue.id);
          this.cueListeners.get(cue.id)?.forEach((handler) => handler(cue.id));
        }
      }
      if (seconds < 0.5) this.firedCues.clear();
    }, 250);
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
    if (!this.ctx || this.ctx.state !== 'running') return;

    const ctx = this.ctx;
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    const shape = EFFECT_SHAPES[effect];
    const peak = Math.max(0.0002, shape.gain * this.effectiveSfxVolume());
    const attack = shape.attack ?? 0.02;

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
      filter.Q.value = shape.q ?? 0.8;
      source.connect(filter);
      filter.connect(gain);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peak, now + attack);
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
    gain.gain.exponentialRampToValueAtTime(peak, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + shape.duration);
    osc.start(now);
    osc.stop(now + shape.duration);
    osc.onended = () => gain.disconnect();
  }

  // ---- teardown -----------------------------------------------------------

  dispose(): void {
    this.stopCueLoop();
    window.clearTimeout(this.stopTimer ?? undefined);
    window.clearTimeout(this.introTimer ?? undefined);
    this.music?.unload();
    this.music = null;
    this.sfx.forEach((howl) => howl?.unload());
    this.sfx.clear();
    // Never close Howler's context - it is not ours to close.
    if (!this.ctxIsShared) void this.ctx?.close().catch(() => undefined);
    this.ctx = null;
    this.ctxIsShared = false;
    this.changeListeners.clear();
    this.cueListeners.clear();
    this.status = 'idle';
    this.unlocked = false;
  }
}
