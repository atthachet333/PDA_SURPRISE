import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { SceneLabel, SceneSection, SceneTitle } from '@/components/surprise/SceneSection';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { anniversary, type Place } from '@/data/anniversary';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { usePageVisible } from '@/hooks/usePageVisible';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useAudio } from '@/app/audioContext';
import { cn } from '@/lib/cn';

/**
 * Scene 05 — the map of us.
 *
 * Emotional job: TRAVEL. Camera language is glide: the globe turns to bring the
 * selected place to the front, and the route between places is drawn as light
 * rather than as a road.
 *
 * Deliberately not a tile map. Coastlines are irrelevant here — the places are
 * the content, so the globe is a luminous wireframe and the pins carry all the
 * weight. Coordinates are real, so the geometry between them is honest.
 */

const RADIUS = 1.6;
const places = anniversary.locations;

function latLngToVector(lat: number, lng: number, radius = RADIUS): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/** Rotation that brings a lat/lng round to face the camera. */
function facingRotation(lat: number, lng: number): [number, number] {
  return [(lat * Math.PI) / 180, -((lng + 90) * Math.PI) / 180];
}

function Globe({
  selectedIndex,
  onSelect,
  paused
}: {
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  paused: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const reduced = useReducedMotion();
  const target = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (selectedIndex === null) {
      target.current = null;
      return;
    }
    const place = places[selectedIndex];
    if (!place) return;
    const [x, y] = facingRotation(place.lat, place.lng);
    target.current = { x, y };
  }, [selectedIndex]);

  useFrame((_, delta) => {
    if (!group.current || paused) return;

    if (target.current) {
      // Glide, not snap: ease in rotation and always take the short way round.
      group.current.rotation.x += (target.current.x - group.current.rotation.x) * 0.05;
      const diff = ((target.current.y - group.current.rotation.y + Math.PI) % (Math.PI * 2)) - Math.PI;
      group.current.rotation.y += diff * 0.05;
    } else if (!reduced) {
      group.current.rotation.y += delta * 0.062;
      group.current.rotation.x += (0.2 - group.current.rotation.x) * 0.02;
    }
  });

  const arcs = useMemo(() => {
    const visited = places.filter((place) => place.status !== 'future');
    const lines: { points: THREE.Vector3[]; dashed: boolean }[] = [];

    const build = (from: Place, to: Place, dashed: boolean) => {
      const start = latLngToVector(from.lat, from.lng);
      const end = latLngToVector(to.lat, to.lng);
      // Lift the control point so the arc reads as a flight path.
      const mid = start
        .clone()
        .add(end)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(RADIUS * (1 + start.distanceTo(end) * 0.17));
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      lines.push({ points: curve.getPoints(56), dashed });
    };

    for (let i = 0; i < visited.length - 1; i += 1) {
      const from = visited[i];
      const to = visited[i + 1];
      if (from && to) build(from, to, false);
    }

    const last = visited[visited.length - 1];
    const future = places.find((place) => place.status === 'future');
    if (last && future) build(last, future, true);

    return lines;
  }, []);

  return (
    <group ref={group} rotation={[0.2, 0, 0]}>
      {/* Core: deep navy glass so the pins and arcs read against it */}
      <mesh>
        <sphereGeometry args={[RADIUS * 0.985, 48, 48]} />
        <meshBasicMaterial color="#112538" transparent opacity={0.78} />
      </mesh>

      {/* Graticule */}
      <mesh>
        <sphereGeometry args={[RADIUS, 30, 20]} />
        <meshBasicMaterial color="#7EC8FF" wireframe transparent opacity={0.15} />
      </mesh>

      {/* Atmosphere */}
      <mesh scale={1.11}>
        <sphereGeometry args={[RADIUS, 32, 32]} />
        <meshBasicMaterial color="#7EC8FF" transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>

      {arcs.map((arc, index) => (
        <Arc key={index} points={arc.points} dashed={arc.dashed} />
      ))}

      {places.map((place, index) => (
        <Pin
          key={place.id}
          place={place}
          selected={selectedIndex === index}
          onSelect={() => onSelect(index)}
        />
      ))}
    </group>
  );
}

function Arc({ points, dashed }: { points: THREE.Vector3[]; dashed: boolean }) {
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: dashed ? '#EBD9BC' : '#7EC8FF',
      transparent: true,
      opacity: dashed ? 0.34 : 0.6
    });
    return new THREE.Line(geometry, material);
  }, [dashed, points]);

  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [line]
  );

  return <primitive object={line} />;
}

function Pin({ place, selected, onSelect }: { place: Place; selected: boolean; onSelect: () => void }) {
  const position = useMemo(() => latLngToVector(place.lat, place.lng, RADIUS * 1.012), [place]);
  const halo = useRef<THREE.Mesh>(null);
  const future = place.status === 'future';

  useFrame((state) => {
    if (!halo.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.7 + position.x * 3) * 0.24;
    halo.current.scale.setScalar(selected ? pulse * 1.65 : pulse);
  });

  return (
    <group position={position} onClick={onSelect} onPointerOver={onSelect}>
      <mesh>
        <sphereGeometry args={[0.028, 12, 12]} />
        <meshBasicMaterial color={future ? '#EBD9BC' : '#FFFFFF'} />
      </mesh>
      <mesh ref={halo}>
        <sphereGeometry args={[0.058, 12, 12]} />
        <meshBasicMaterial
          color={future ? '#EBD9BC' : '#7EC8FF'}
          transparent
          opacity={selected ? 0.55 : 0.24}
        />
      </mesh>
    </group>
  );
}

/** Caps the renderer DPR without re-creating the canvas. */
function Rig({ maxDpr }: { maxDpr: number }) {
  const { gl } = useThree();
  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
  }, [gl, maxDpr]);
  return null;
}

export function Scene05Map() {
  const [index, setIndex] = useState<number | null>(null);
  const device = useDeviceProfile();
  const pageVisible = usePageVisible();
  const [ref, inView] = useInViewOnce<HTMLElement>({ threshold: 0.2 });
  const { play, triggerCue } = useAudio();
  const selected = index === null ? null : (places[index] ?? null);

  useEffect(() => {
    if (inView) triggerCue('journey');
  }, [inView, triggerCue]);

  const select = (next: number) => {
    if (next === index) return;
    play('hover');
    setIndex(next);
  };

  return (
    <SceneSection id="map" ref={ref} label="The map of us">
      <div className="flex w-full max-w-6xl flex-col items-center">
        <div className="text-center">
          <SceneLabel>The map of us</SceneLabel>
          <SceneTitle className="mt-5">Places that became ours.</SceneTitle>
        </div>

        <div className="mt-14 grid w-full items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div className="relative aspect-square w-full max-w-[30rem] justify-self-center">
            <span
              aria-hidden="true"
              className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle,rgba(126,200,255,0.26),transparent_68%)] blur-3xl"
            />
            <Canvas
              dpr={[1, device.maxDpr]}
              // 'demand' rather than 'never': R3F still performs its initial render
              // and resize, so a canvas mounted into a hidden tab is sized correctly,
              // but no frames are drawn while the page is not visible.
              frameloop={pageVisible ? 'always' : 'demand'}
              gl={{ antialias: device.tier !== 'low', alpha: true }}
              camera={{ position: [0, 0, 4.4], fov: 45 }}
            >
              <Rig maxDpr={device.maxDpr} />
              <Globe selectedIndex={index} onSelect={select} paused={!pageVisible} />
            </Canvas>
          </div>

          <div>
            <ul className="space-y-px overflow-hidden rounded-panel border border-sky-200/12">
              {places.map((place, placeIndex) => {
                const active = index === placeIndex;
                return (
                  <li key={place.id}>
                    <button
                      type="button"
                      onPointerEnter={() => play('hover')}
                      onClick={() => select(placeIndex)}
                      data-cursor="interactive"
                      className={cn(
                        'flex w-full items-center gap-4 px-5 py-4 text-left transition-colors duration-base',
                        active ? 'bg-sky-400/14' : 'bg-navy-800/40 hover:bg-sky-400/10'
                      )}
                    >
                      <span
                        className={cn(
                          'h-2 w-2 shrink-0 rounded-full transition-all duration-base',
                          place.status === 'future'
                            ? 'border border-champagne bg-transparent'
                            : active
                              ? 'scale-125 bg-ivory shadow-glow-sm'
                              : 'bg-sky-300/60'
                        )}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-mono text-[0.5rem] uppercase tracking-[0.22em] text-sky-100/60">
                          {place.label}
                        </span>
                        <span className="mt-1 block truncate text-sm text-ivory/90">{place.title}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block font-mono text-[0.5rem] tracking-[0.14em] text-ivory/40">
                          {place.date}
                        </span>
                        <span className="mt-0.5 block font-mono text-[0.5rem] tracking-[0.1em] text-sky-100/40">
                          {place.location}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 min-h-[11rem]">
              <AnimatePresence mode="wait">
                {selected ? (
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="ai-glass flex gap-4 overflow-hidden rounded-panel p-4"
                  >
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-card">
                      <MemoryImage
                        photo={selected.image}
                        alt={selected.title}
                        tone={selected.status === 'future' ? 'champagne' : 'sky'}
                        label={selected.label}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-sky-100/65">
                        {selected.location} · {selected.date}
                      </p>
                      <p className="mt-2 font-display text-lg font-light leading-tight text-ivory">
                        {selected.title}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-ivory/65">{selected.caption}</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.p
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-1 font-mono text-[0.5rem] uppercase tracking-[0.28em] text-ivory/30"
                  >
                    select a place to turn the globe
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </SceneSection>
  );
}
