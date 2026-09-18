import { useCallback, useEffect, useMemo, useState } from 'react';
import { CelestialBackground, type CameraLanguage } from '@/components/surprise/CelestialBackground';
import { SurpriseNav } from '@/components/surprise/SurpriseNav';
import { AICursor } from '@/components/surprise/AICursor';
import { FullscreenHint, SoundPrompt } from '@/components/surprise/SoundPrompt';
import { Scene01Entry } from '@/scenes/surprise/Scene01Entry';
import { Scene02Days } from '@/scenes/surprise/Scene02Days';
import { Scene03Journey } from '@/scenes/surprise/Scene03Journey';
import { Scene04Universe } from '@/scenes/surprise/Scene04Universe';
import { Scene05Map } from '@/scenes/surprise/Scene05Map';
import { Scene06Gallery } from '@/scenes/surprise/Scene06Gallery';
import { Scene07Tunnel } from '@/scenes/surprise/Scene07Tunnel';
import { Scene08Timeline } from '@/scenes/surprise/Scene08Timeline';
import { Scene09Stats } from '@/scenes/surprise/Scene09Stats';
import { Scene10Quiet } from '@/scenes/surprise/Scene10Quiet';
import { Scene11Converge } from '@/scenes/surprise/Scene11Converge';
import { Scene12Final } from '@/scenes/surprise/Scene12Final';
import { useLenis } from '@/hooks/useLenis';
import { useAudio } from '@/app/audioContext';
import { featuredMemories } from '@/data/anniversary';
import { preloadImages, whenIdle } from '@/lib/preload';

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
  // Act I — calm
  entry: { nav: 'story', mood: 0.34, camera: 'push' },
  // Act II — build to the first wow
  story: { nav: 'story', mood: 0.58, camera: 'push', immersive: true },
  journey: { nav: 'story', mood: 0.44, camera: 'still' },
  // Act III — warm, interactive
  memories: { nav: 'memories', mood: 0.38, camera: 'orbit' },
  map: { nav: 'journey', mood: 0.32, camera: 'glide' },
  gallery: { nav: 'memories', mood: 0.42, camera: 'circle' },
  tunnel: { nav: 'memories', mood: 0.48, camera: 'push', immersive: true },
  // Act IV — narrative
  timeline: { nav: 'moments', mood: 0.5, camera: 'glide' },
  stats: { nav: 'moments', mood: 0.44, camera: 'still' },
  // Act V — the pause
  quiet: { nav: 'final', mood: 0.1, camera: 'still', alive: false, immersive: true },
  // Act VI — the second wow, then the calm finale
  converge: { nav: 'final', mood: 0.72, camera: 'push', immersive: true },
  final: { nav: 'final', mood: 1, camera: 'pull' }
};

const SECTION_IDS = Object.keys(DIRECTION);

const DEFAULT_DIRECTION: SceneDirection = { nav: 'story', mood: 0.35, camera: 'glide' };

export default function Experience() {
  const [current, setCurrent] = useState('entry');
  const { unlock } = useAudio();

  useLenis({ lerp: 0.085 });

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

  // Audio is normally unlocked by the gesture that opened the project; re-arm
  // here in case the visitor landed on /us directly.
  useEffect(() => {
    const arm = () => void unlock();
    window.addEventListener('pointerdown', arm, { once: true });
    window.addEventListener('keydown', arm, { once: true });
    return () => {
      window.removeEventListener('pointerdown', arm);
      window.removeEventListener('keydown', arm);
    };
  }, [unlock]);

  // Warm only the featured photographs up front, once the browser is idle.
  // Each scene preloads its own set as it approaches.
  useEffect(() => whenIdle(() => {
    void preloadImages(featuredMemories().map((memory) => memory.image), 3);
  }), []);

  // Track which scene owns the middle of the viewport.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setCurrent(visible.target.id);
      },
      { threshold: [0.2, 0.5, 0.8], rootMargin: '-20% 0px -20% 0px' }
    );

    SECTION_IDS.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  const onEnter = useCallback(() => {
    document.getElementById('story')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const direction = useMemo(() => DIRECTION[current] ?? DEFAULT_DIRECTION, [current]);

  return (
    <div className="relative min-h-screen bg-navy-800 text-ivory">
      <CelestialBackground
        mood={direction.mood}
        camera={direction.camera}
        alive={direction.alive ?? true}
      />

      <SurpriseNav activeSection={direction.nav} dimmed={direction.immersive ?? false} />
      <AICursor />
      <SoundPrompt />
      <FullscreenHint />

      <main id="main">
        <Scene01Entry onEnter={onEnter} />
        <Scene02Days />
        <Scene03Journey />
        <Scene04Universe />
        <Scene05Map />
        <Scene06Gallery />
        <Scene07Tunnel />
        <Scene08Timeline />
        <Scene09Stats />
        <Scene10Quiet />
        <Scene11Converge />
        <Scene12Final />
      </main>
    </div>
  );
}
