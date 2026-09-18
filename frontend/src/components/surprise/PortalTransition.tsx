import { Canvas, useFrame } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAudio } from '@/app/audioContext';

/**
 * The bridge between the two design systems.
 *
 * A shader plane carries the colour from brand green to A&I blue while a ring
 * of particles collapses inward and the camera pushes through it. The page
 * underneath is blurred and scaled out by the caller, so the corporate UI is
 * visibly dismantled rather than simply covered.
 */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uAspect;

  // PDA BLISS green -> A&I sky (#7EC8FF) -> white, over A&I navy (#17324D)
  const vec3 GREEN = vec3(0.071, 0.565, 0.337);
  const vec3 SKY   = vec3(0.494, 0.784, 1.000);
  const vec3 IVORY = vec3(1.000, 1.000, 1.000);
  const vec3 NAVY  = vec3(0.067, 0.145, 0.220);

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 uv = (vUv - 0.5) * uAspect;
    float dist = length(uv);

    // Expanding light core.
    float core = smoothstep(0.9, 0.0, dist / max(uProgress * 1.65, 0.0001));

    // Collapsing then exploding ring.
    float ringRadius = mix(0.75, 0.02, smoothstep(0.0, 0.55, uProgress))
                     + smoothstep(0.55, 1.0, uProgress) * 1.9;
    float ring = smoothstep(0.075, 0.0, abs(dist - ringRadius));

    // Radial streaks, strongest mid-transition.
    float angle = atan(uv.y, uv.x);
    float streak = pow(abs(sin(angle * 26.0 + uTime * 1.6)), 8.0)
                 * smoothstep(0.1, 0.5, uProgress)
                 * smoothstep(1.0, 0.6, uProgress)
                 * smoothstep(0.1, 0.8, dist);

    float grain = hash(vUv * 420.0 + uTime) * 0.025;

    vec3 base = mix(NAVY, SKY, smoothstep(0.35, 1.0, uProgress));
    vec3 color = base;
    color = mix(color, GREEN, ring * smoothstep(0.5, 0.0, uProgress));
    color = mix(color, SKY, ring * smoothstep(0.3, 0.9, uProgress));
    color = mix(color, IVORY, core * 0.95);
    color += streak * 0.35;
    color += grain;

    // Fade the whole overlay in at the start and hold opaque at the end.
    float alpha = smoothstep(0.0, 0.12, uProgress);
    gl_FragColor = vec4(color, alpha);
  }
`;

function PortalPlane({ progress }: { progress: React.MutableRefObject<number> }) {
  const material = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uProgress: { value: 0 },
      uTime: { value: 0 },
      uAspect: { value: new THREE.Vector2(1, 1) }
    }),
    []
  );

  useFrame((state, delta) => {
    if (!material.current) return;
    uniforms.uProgress.value = progress.current;
    uniforms.uTime.value += delta;
    const { width, height } = state.size;
    uniforms.uAspect.value.set(Math.max(1, width / height), Math.max(1, height / width));
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthTest={false}
      />
    </mesh>
  );
}

function ConvergingParticles({
  progress,
  count
}: {
  progress: React.MutableRefObject<number>;
  count: number;
}) {
  const points = useRef<THREE.Points>(null);

  const { geometry, origins } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.85 + Math.random() * 0.9;
      seeds[i * 3] = Math.cos(angle) * radius;
      seeds[i * 3 + 1] = Math.sin(angle) * radius * 0.62;
      seeds[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
      positions[i * 3] = seeds[i * 3] as number;
      positions[i * 3 + 1] = seeds[i * 3 + 1] as number;
      positions[i * 3 + 2] = seeds[i * 3 + 2] as number;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return { geometry: geo, origins: seeds };
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state) => {
    if (!points.current) return;
    const p = progress.current;
    const attribute = geometry.getAttribute('position') as THREE.BufferAttribute;
    const collapse = 1 - Math.min(1, p / 0.55);
    const burst = Math.max(0, (p - 0.55) / 0.45);
    const spin = state.clock.elapsedTime * 0.5;

    for (let i = 0; i < count; i += 1) {
      const ox = origins[i * 3] as number;
      const oy = origins[i * 3 + 1] as number;
      const oz = origins[i * 3 + 2] as number;
      const scale = collapse * 0.9 + burst * burst * 5.5 + 0.06;
      const cos = Math.cos(spin);
      const sin = Math.sin(spin);
      attribute.setXYZ(
        i,
        (ox * cos - oy * sin) * scale,
        (ox * sin + oy * cos) * scale,
        oz * scale
      );
    }
    attribute.needsUpdate = true;

    const material = points.current.material as THREE.PointsMaterial;
    material.opacity = Math.min(1, p * 3) * (1 - burst * 0.75);
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.012}
        color="#DCEFFF"
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

const STEPS = ['Releasing workspace theme', 'Loading private environment', 'Opening'];

interface PortalTransitionProps {
  active: boolean;
  onComplete: () => void;
  /** Total duration in ms. */
  duration?: number;
}

export function PortalTransition({ active, onComplete, duration = 3600 }: PortalTransitionProps) {
  const progress = useRef(0);
  const [step, setStep] = useState(0);
  const device = useDeviceProfile();
  const reduced = useReducedMotion();
  const { play } = useAudio();
  const completed = useRef(false);

  useEffect(() => {
    if (!active) {
      progress.current = 0;
      completed.current = false;
      setStep(0);
      return;
    }

    const total = reduced ? 900 : duration;
    const began = performance.now();
    let frame = 0;

    play('whoosh');
    const impact = window.setTimeout(() => play('impact'), total * 0.55);

    // This overlay gates navigation, so it must never be able to strand the
    // visitor. requestAnimationFrame is throttled (or stopped) whenever the
    // window is backgrounded or the compositor pauses, so a wall-clock timer
    // completes the transition even if no frame ever lands.
    const failsafe = window.setTimeout(() => {
      if (completed.current) return;
      completed.current = true;
      progress.current = 1;
      onComplete();
    }, total + 1200);

    const tick = (now: number) => {
      const value = Math.min(1, (now - began) / total);
      progress.current = value;
      setStep(value < 0.35 ? 0 : value < 0.7 ? 1 : 2);

      if (value >= 1 && !completed.current) {
        completed.current = true;
        onComplete();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(impact);
      window.clearTimeout(failsafe);
    };
  }, [active, duration, onComplete, play, reduced]);

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          className="fixed inset-0 z-[120]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          role="status"
          aria-live="polite"
        >
          <Canvas
            dpr={[1, device.maxDpr]}
            gl={{ antialias: false, alpha: true }}
            camera={{ position: [0, 0, 1], fov: 50 }}
            className="absolute inset-0"
          >
            <PortalPlane progress={progress} />
            <ConvergingParticles
              progress={progress}
              count={device.tier === 'low' ? 500 : device.tier === 'medium' ? 1400 : 2600}
            />
          </Canvas>

          <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-24">
            <AnimatePresence mode="wait">
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.85, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="font-mono text-[0.6875rem] uppercase tracking-[0.28em] text-ivory/85"
              >
                {STEPS[step]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
