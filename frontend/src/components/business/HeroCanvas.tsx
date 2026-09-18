import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { usePageVisible } from '@/hooks/usePageVisible';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useMousePosition } from '@/hooks/useMousePosition';

/**
 * Hero backdrop: three concentric infrastructure rings, a node cloud and a soft
 * brand-green light. Deliberately restrained — it sits behind the headline and
 * the product panels, so it reads as depth, not decoration.
 */

function Rings({ pointer }: { pointer: React.MutableRefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);
  const reduced = useReducedMotion();

  const rings = useMemo(
    () => [
      { radius: 2.2, tube: 0.006, tilt: 0.42, speed: 0.06, color: '#129056', opacity: 0.55 },
      { radius: 3.05, tube: 0.005, tilt: -0.28, speed: -0.042, color: '#35AE76', opacity: 0.38 },
      { radius: 3.95, tube: 0.004, tilt: 0.16, speed: 0.028, color: '#0A7544', opacity: 0.22 }
    ],
    []
  );

  useFrame((_, delta) => {
    if (!group.current) return;
    if (!reduced) {
      group.current.children.forEach((child, index) => {
        const config = rings[index];
        if (config) child.rotation.z += delta * config.speed;
      });
    }
    const target = group.current;
    target.rotation.x += (pointer.current.y * 0.16 - target.rotation.x) * 0.04;
    target.rotation.y += (pointer.current.x * 0.22 - target.rotation.y) * 0.04;
  });

  return (
    <group ref={group}>
      {rings.map((ring) => (
        <mesh key={ring.radius} rotation={[Math.PI / 2 + ring.tilt, 0, 0]}>
          <torusGeometry args={[ring.radius, ring.tube, 8, 160]} />
          <meshBasicMaterial color={ring.color} transparent opacity={ring.opacity} />
        </mesh>
      ))}
    </group>
  );
}

function NodeField({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null);
  const reduced = useReducedMotion();

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      const radius = 2 + Math.random() * 5;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
      positions[i * 3 + 2] = Math.sin(angle) * radius * 0.6 - 1;
      scales[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    return geo;
  }, [count]);

  useFrame((state, delta) => {
    if (!points.current || reduced) return;
    points.current.rotation.y += delta * 0.018;
    const material = points.current.material as THREE.PointsMaterial;
    material.opacity = 0.32 + Math.sin(state.clock.elapsedTime * 0.5) * 0.06;
  });

  // three disposes geometries attached to removed meshes only when asked to.
  useMemo(() => () => geometry.dispose(), [geometry]);

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.028}
        color="#129056"
        transparent
        opacity={0.35}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Rig({ maxDpr }: { maxDpr: number }) {
  const { gl } = useThree();
  useMemo(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
  }, [gl, maxDpr]);
  return null;
}

export function HeroCanvas({ className }: { className?: string }) {
  const device = useDeviceProfile();
  const visible = usePageVisible();
  const pointer = useMousePosition();

  return (
    <div className={className} aria-hidden="true">
      <Canvas
        dpr={[1, device.maxDpr]}
        // 'demand' rather than 'never': R3F still performs its initial render
        // and resize, so a canvas mounted into a hidden tab is sized correctly,
        // but no frames are drawn while the page is not visible.
        frameloop={visible ? 'always' : 'demand'}
        gl={{ antialias: device.tier !== 'low', alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.4, 7.2], fov: 42 }}
        style={{ pointerEvents: 'none' }}
      >
        <Rig maxDpr={device.maxDpr} />
        <ambientLight intensity={0.8} />
        <Rings pointer={pointer} />
        <NodeField count={Math.min(device.particleCount, 900)} />
      </Canvas>
    </div>
  );
}
