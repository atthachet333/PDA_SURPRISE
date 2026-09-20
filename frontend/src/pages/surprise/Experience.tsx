import { useCallback, useEffect, useMemo, useState } from 'react';
import { CelestialBackground, type CameraLanguage } from '@/components/surprise/CelestialBackground';
import { SurpriseNav } from '@/components/surprise/SurpriseNav';
import { AICursor } from '@/components/surprise/AICursor';
import { FullscreenHint, MusicUnlockPrompt, SoundPrompt } from '@/components/surprise/SoundPrompt';
import { SecretStar } from '@/components/surprise/SecretStar';
import { ShootingStars } from '@/components/surprise/ShootingStars';
import { Scene01Entry } from '@/scenes/surprise/Scene01Entry';
import { Scene02Days } from '@/scenes/surprise/Scene02Days';
import { Scene03Journey } from '@/scenes/surprise/Scene03Journey';
import { Scene04Universe } from '@/scenes/surprise/Scene04Universe';
import { Scene05Map } from '@/scenes/surprise/Scene05Map';
import { Scene06Gallery } from '@/scenes/surprise/Scene06Gallery';
import { Scene07Life } from '@/scenes/surprise/Scene07Life';
import { Scene08Timeline } from '@/scenes/surprise/Scene08Timeline';
import { Scene09Stats } from '@/scenes/surprise/Scene09Stats';
import { Scene10Quiet } from '@/scenes/surprise/Scene10Quiet';
import { Scene11Converge } from '@/scenes/surprise/Scene11Converge';
import { Scene12Final } from '@/scenes/surprise/Scene12Final';
import { Scene12Letter } from '@/scenes/surprise/Scene12Letter';
import { useLenis } from '@/hooks/useLenis';
import { useAudio } from '@/app/audioContext';
import { anniversary, featuredMemories } from '@/data/anniversary';
import { preloadImages, whenIdle } from '@/lib/preload';
import { usePageMeta } from '@/hooks/usePageMeta';
import { privateMeta } from '@/lib/seo';

/**
 * The A&I experience — one continuous scroll over a single persistent backdrop.
 *
 * This component is the director. Scenes never mount their own backdrop and
 * never decide the mood; they declare their id, and the table below maps that
 * id to the emotional arc:
 *
 *   CALM -> BUILD -> WOW -> WARM -> EMOTIONAL -> HUGE WOW -> QUIET FINALE
 *
 * `mood` warms the sky, `camera` sets the movement language, `alive` stills
 * everything for the pause, and `immersive` hides the navigation.
 */

interface SceneDirection {
  /** Which of the five nav entries owns this scene. */
  nav: string;
  /** 0 = deep night, 1 = sunrise horizon. */
  mood: number;
  camera: CameraLanguage;
  /** False stills the backdrop almost completely. */
  alive?: boolean;
  /** True hides the navigation for the duration. */
  immersive?: boolean;
}

const DIRECTION: Record<string, SceneDirection> = {
  entry: { nav: 'beginning', mood: 0.18, camera: 'push' },
  days: { nav: 'beginning', mood: 0.5, camera: 'push', immersive: true },
  beginning: { nav: 'beginning', mood: 0.38, camera: 'still' },
  'little-moments': { nav: 'little-moments', mood: 0.5, camera: 'circle' },
  journey: { nav: 'journey', mood: 0.54, camera: 'glide' },
  memories: { nav: 'little-moments', mood: 0.33, camera: 'orbit' },
  places: { nav: 'places', mood: 0.42, camera: 'glide' },
  life: { nav: 'places', mood: 0.6, camera: 'still' },
  stats: { nav: 'places', mood: 0.5, camera: 'still' },
  quiet: { nav: 'letter', mood: 0.08, camera: 'still', alive: false, immersive: true },
  converge: { nav: 'letter', mood: 0.74, camera: 'push', immersive: true },
  letter: { nav: 'letter', mood: 0.5, camera: 'still' },
  final: { nav: 'letter', mood: 1, camera: 'pull' }
};

const SECTION_IDS = Object.keys(DIRECTION);

const DEFAULT_DIRECTION: SceneDirection = { nav: 'story', mood: 0.35, camera: 'glide' };

export default function Experience() {
  usePageMeta(privateMeta);

  const [current, setCurrent] = useState('entry');
  const { unlock, start, musicEnabled, status, setSceneMix } = useAudio();

  useLenis({ lerp: 0.105 });

  // The A&I palette is a separate design system; flag it on <body> so global
  // styles (background, selection, focus ring) switch with it.
  useEffect(() => {
    document.body.dataset.theme = 'ai';
    const meta = document.querySelector('meta[name="theme-color"]');
    const previous = meta?.getAttribute('content');
    meta?.setAttribute('content', '#112538');
    return () => {
      delete document.body.dataset.theme;
      if (previous) meta?.setAttribute('content', previous);
    };
  }, []);

  // Config validation is a development aid; the import is dead code in a
  // production build, so the validator never ships.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    void import('@/lib/anniversaryValidation').then((module) => module.reportConfigInDev());
  }, []);

  /**
   * DIRECT ENTRY to /us, without passing through the workspace gateway.
   *
   * There has been no gesture, so the browser will refuse to play. Rather than
   * calling play() in a loop and collecting rejections, the first real gesture
   * arms the context and — only if the visitor has music enabled — starts the
   * track with the usual fade. Both handlers run synchronously inside the
   * gesture, which is what iOS Safari requires. If the visitor chose silence,
   * this arms the context and nothing more.
   *
   * These are NOT `once: true`: a gesture that arrives while the track is still
   * loading, or one the browser still refuses, should be followed by another
   * chance rather than being the only chance. The handlers detach as soon as the
   * music is actually playing.
   */
  useEffect(() => {
    // Already playing (the usual case, arriving from the gateway): nothing to arm.
    if (status === 'playing') return;
    const arm = () => {
      unlock();
      if (musicEnabled) start();
    };
    window.addEventListener('pointerdown', arm);
    window.addEventListener('keydown', arm);
    return () => {
      window.removeEventListener('pointerdown', arm);
      window.removeEventListener('keydown', arm);
    };
  }, [musicEnabled, start, status, unlock]);

  // Warm only the featured photographs up front, once the browser is idle.
  // Each scene preloads its own set as it approaches.
  useEffect(() => whenIdle(() => {
    void preloadImages(featuredMemories().map((memory) => memory.image), 3);
  }), []);

  // Deep links are useful for private review and photo curation. React mounts
  // after the browser's native anchor pass, so resolve the hash once here.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id || !SECTION_IDS.includes(id)) return;
    window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
  }, []);

  // Track which scene owns the middle of the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setCurrent(visible.target.id);
      },
      // Tall scroll-choreographed scenes can never occupy 20% of their own
      // height inside the viewport. A low first threshold lets Quiet and
      // Convergence own the director state while their sticky frame is active.
      { threshold: [0.04, 0.12, 0.3, 0.6], rootMargin: '-20% 0px -20% 0px' }
    );

    SECTION_IDS.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  const onEnter = useCallback(() => {
    document.getElementById('days')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const direction = useMemo(() => DIRECTION[current] ?? DEFAULT_DIRECTION, [current]);

  /**
   * SCENE-AWARE MIXING — the director's only channel into the music.
   *
   * Whichever section owns the middle of the viewport sets the music level, and
   * the ramp comes from the same table. Nothing here seeks, restarts, reloads or
   * stops anything: the song is one continuous journey and this only decides how
   * present it is. A scene the table does not name leaves the level alone rather
   * than resetting it, so an unmapped section can never punch a hole in the mix.
   *
   * This is also why scrolling backwards works: the level follows the section
   * under the viewport, not a position in the song.
   */
  useEffect(() => {
    const mix = anniversary.audio.sceneMix[current];
    if (!mix) return;
    setSceneMix(mix.level, mix.ms);
  }, [current, setSceneMix]);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-navy-800 text-ivory">
      <CelestialBackground
        mood={direction.mood}
        camera={direction.camera}
        alive={direction.alive ?? true}
      />

      <SurpriseNav
        activeSection={direction.nav}
        dimmed={direction.immersive ?? false}
        sceneNumber={Math.max(0, SECTION_IDS.indexOf(current))}
        sceneCount={SECTION_IDS.length}
      />
      <AICursor />
      <SoundPrompt />
      <MusicUnlockPrompt />
      <FullscreenHint />
      {/* Belongs to the sky rather than to any scene, so it stays put while the
          story scrolls past it. */}
      <SecretStar />
      <ShootingStars />

      <main id="main" className="relative z-10">
        <Scene01Entry onEnter={onEnter} />
        <Scene02Days />
        <Scene03Journey />
        <Scene06Gallery />
        <Scene08Timeline />
        <Scene04Universe />
        <Scene05Map />
        <Scene07Life />
        <Scene09Stats />
        <Scene10Quiet />
        <Scene11Converge />
        <Scene12Letter />
        <Scene12Final />
      </main>
    </div>
  );
}
