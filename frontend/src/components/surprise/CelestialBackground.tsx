import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { usePageVisible } from '@/hooks/usePageVisible';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMousePosition } from '@/hooks/useMousePosition';

/**
 * The single persistent backdrop for the whole A&I experience.
 *
 * Three motion layers move at different speeds so the frame is never static:
 *   BACKGROUND  graded sky + horizon glow (slowest)
 *   MIDGROUND   two drifting cloud banks
 *   FOREGROUND  star field + orbital rings, both pointer-parallaxed
 *
 * Scenes drive it through three props rather than mounting their own canvases:
 *   `mood`   0 = deep night, 1 = sunrise horizon
 *   `camera` the movement language for the current scene
 *   `calm`   collapses all motion for the emotional pause
 */

export type CameraLanguage = 'push' | 'orbit' | 'glide' | 'circle' | 'still' | 'pull';

/** Depth offset and drift rate per camera language. */
const CAMERA: Record<CameraLanguage, { z: number; drift: number; spin: number }> = {
  push: { z: 3.35, drift: 1.35, spin: 1 },
  orbit: { z: 3.9, drift: 0.85, spin: 1.7 },
  glide: { z: 3.7, drift: 1.15, spin: 0.7 },
  circle: { z: 3.8, drift: 0.9, spin: 1.35 },
  still: { z: 4.25, drift: 0.3, spin: 0.25 },
  pull: { z: 5.1, drift: 0.55, spin: 0.6 }
};

const skyVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const skyFragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uMood;      // 0 night -> 1 sunrise
  uniform float uCalm;      // 1 = full motion, 0 = frozen
  uniform float uDrift;     // cloud speed multiplier
  uniform vec2  uPointer;
  uniform int   uOctaves;

  // A&I palette
  const vec3 NAVY  = vec3(0.090, 0.196, 0.302);  // #17324D
  const vec3 DEEP  = vec3(0.047, 0.106, 0.161);  // #0C1B29
  const vec3 SKY   = vec3(0.494, 0.784, 1.000);  // #7EC8FF
  const vec3 PALE  = vec3(0.863, 0.937, 1.000);  // #DCEFFF
  const vec3 CREAM = vec3(0.969, 0.945, 0.910);  // #F7F1E8
  const vec3 WARM  = vec3(0.992, 0.906, 0.788);

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  float fbm(vec2 p) {
    float total = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 6; i++) {
      if (i >= uOctaves) break;
      total += noise(p) * amplitude;
      p *= 2.03;
      amplitude *= 0.5;
    }
    return total;
  }

  void main() {
    vec2 uv = vUv;
    vec2 parallax = uPointer * 0.018;
    float y = clamp(uv.y + parallax.y, 0.0, 1.0);
    float t = uTime * uCalm;

    // --- vertical grade: navy above, sky through the middle, light at the base
    vec3 color = mix(DEEP, NAVY, smoothstep(0.98, 0.52, y));
    color = mix(color, SKY, smoothstep(0.62, 0.12, y) * (0.62 + uMood * 0.22));
    color = mix(color, PALE, smoothstep(0.34, 0.02, y) * (0.55 + uMood * 0.3));

    // --- horizon band: cream at rest, warming toward sunrise
    float band = exp(-pow((y - 0.10) * 5.2, 2.0));
    vec3 horizon = mix(CREAM, WARM, uMood);
    color = mix(color, horizon, band * (0.34 + uMood * 0.42));

    // --- midground cloud banks, two layers at different speeds
    vec2 cloudUv = vec2(uv.x * 2.2 + t * 0.006 * uDrift, y * 1.35) + parallax;
    float bankA = fbm(cloudUv);
    float bankB = fbm(cloudUv * 1.85 - vec2(t * 0.011 * uDrift, 0.0));
    float clouds = smoothstep(0.50, 0.95, bankA * 0.62 + bankB * 0.48)
                 * smoothstep(0.015, 0.42, y)
                 * smoothstep(0.95, 0.40, y);
    color = mix(color, mix(PALE, CREAM, uMood * 0.7), clouds * (0.3 + uMood * 0.22));

    // --- high thin cirrus, much slower, adds depth without noise
    float cirrus = smoothstep(0.62, 0.98, fbm(vec2(uv.x * 1.1 - t * 0.0025 * uDrift, y * 2.6)))
                 * smoothstep(0.45, 0.95, y);
    color = mix(color, PALE, cirrus * 0.12);

    // --- readability: hold the middle band back so white type always reads
    float contentBand = exp(-pow((y - 0.52) * 2.05, 2.0));
    color *= mix(1.0, 0.70, contentBand * 0.82);

    // --- gentle edge vignette
    float vignette = smoothstep(1.30, 0.34, length(vec2((uv.x - 0.5) * 1.05, y - 0.5)));
    color *= mix(0.80, 1.0, vignette);

    color += (hash(uv * 900.0 + t) - 0.5) * 0.010;

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface LayerProps {
  mood: number;
  calm: number;
  camera: CameraLanguage;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
}

function SkyDome({ mood, calm, camera, pointer, octaves }: LayerProps & { octaves: number }) {
  const reduced = useReducedMotion();
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMood: { value: mood },
      uCalm: { value: calm },
      uDrift: { value: CAMERA[camera].drift },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uOctaves: { value: octaves }
    }),
    // Uniform objects are mutated in the frame loop; only rebuild on octaves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [octaves]
  );

  useFrame((_, delta) => {
    if (!reduced) uniforms.uTime.value += delta;
    // Everything eases rather than snapping, so scene changes feel directed.
    uniforms.uMood.value += (mood - uniforms.uMood.value) * 0.018;
    uniforms.uCalm.value += (calm - uniforms.uCalm.value) * 0.03;
    uniforms.uDrift.value += (CAMERA[camera].drift - uniforms.uDrift.value) * 0.02;
    uniforms.uPointer.value.x += (pointer.current.x - uniforms.uPointer.value.x) * 0.03;
    uniforms.uPointer.value.y += (-pointer.current.y - uniforms.uPointer.value.y) * 0.03;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={skyVertex}
        fragmentShader={skyFragment}
        uniforms={uniforms}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

function Stars({ count, calm, camera, pointer }: LayerProps & { count: number }) {
  const group = useRef<THREE.Group>(null);
  const reduced = useReducedMotion();

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 13;
      // Bias stars toward the upper sky where the backdrop is darkest.
      positions[i * 3 + 1] = (Math.random() ** 0.7 - 0.25) * 7;
      positions[i * 3 + 2] = -Math.random() * 6 - 1;
      sizes[i] = 0.6 + Math.random() * 0.9;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [count]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    if (!group.current) return;
    const spin = CAMERA[camera].spin;
    if (!reduced) group.current.rotation.z += delta * 0.005 * spin * calm;

    group.current.position.x += (pointer.current.x * -0.24 - group.current.position.x) * 0.028;
    group.current.position.y += (pointer.current.y * 0.17 - group.current.position.y) * 0.028;

    const points = group.current.children[0] as THREE.Points | undefined;
    if (points) {
      const material = points.material as THREE.PointsMaterial;
      material.opacity = (0.5 + Math.sin(state.clock.elapsedTime * 0.4) * 0.1) * (0.45 + calm * 0.55);
    }
  });

  return (
    <group ref={group}>
      <points geometry={geometry}>
        <pointsMaterial
          size={0.019}
          color="#DCEFFF"
          transparent
          opacity={0.6}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

function OrbitRings({ calm, camera, pointer }: LayerProps) {
  const group = useRef<THREE.Group>(null);
  const reduced = useReducedMotion();

  useFrame((_, delta) => {
    if (!group.current) return;
    const spin = CAMERA[camera].spin;
    if (!reduced) {
      const [a, b, c] = group.current.children;
      if (a) a.rotation.z += delta * 0.026 * spin * calm;
      if (b) b.rotation.z -= delta * 0.017 * spin * calm;
      if (c) c.rotation.z += delta * 0.009 * spin * calm;
    }
    group.current.rotation.x += (pointer.current.y * 0.09 + 0.26 - group.current.rotation.x) * 0.028;
    group.current.rotation.y += (pointer.current.x * 0.13 - group.current.rotation.y) * 0.028;
    // Rings recede as the camera pulls back at the finale.
    const target = -2 - (CAMERA[camera].z - 3.9) * 0.9;
    group.current.position.z += (target - group.current.position.z) * 0.02;
  });

  return (
    <group ref={group} position={[0, 0, -2]}>
      <mesh>
        <torusGeometry args={[2.55, 0.0042, 8, 180]} />
        <meshBasicMaterial color="#7EC8FF" transparent opacity={0.26} />
      </mesh>
      <mesh rotation={[0.58, 0.2, 0]}>
        <torusGeometry args={[3.55, 0.0032, 8, 180]} />
        <meshBasicMaterial color="#DCEFFF" transparent opacity={0.16} />
      </mesh>
      <mesh rotation={[-0.34, -0.16, 0]}>
        <torusGeometry args={[4.6, 0.0026, 8, 160]} />
        <meshBasicMaterial color="#EBD9BC" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

/** Eases the camera toward the depth implied by the current scene. */
function CameraRig({ camera }: { camera: CameraLanguage }) {
  useFrame((state) => {
    const target = CAMERA[camera].z;
    state.camera.position.z += (target - state.camera.position.z) * 0.016;
  });
  return null;
}

interface CelestialBackgroundProps {
  mood?: number;
  camera?: CameraLanguage;
  /** Set false during the emotional pause to still almost everything. */
  alive?: boolean;
}

export function CelestialBackground({
  mood = 0.35,
  camera = 'glide',
  alive = true
}: CelestialBackgroundProps) {
  const device = useDeviceProfile();
  const visible = usePageVisible();
  const pointer = useMousePosition();
  const reduced = useReducedMotion();

  const calm = alive ? 1 : 0.18;
  const layer = { mood, calm, camera, pointer };

  return (
    <div className="fixed inset-0 -z-10" aria-hidden="true">
      <Canvas
        dpr={[1, device.maxDpr]}
        // 'demand' rather than 'never': R3F still performs its initial render
        // and resize, so a canvas mounted into a hidden tab is sized correctly,
        // but no frames are drawn while the page is not visible.
        frameloop={visible ? 'always' : 'demand'}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 3.9], fov: 55 }}
      >
        <CameraRig camera={camera} />
        <SkyDome {...layer} octaves={device.cloudDetail} />
        <Stars {...layer} count={device.starCount} />
        {!reduced ? <OrbitRings {...layer} /> : null}
      </Canvas>
    </div>
  );
}
