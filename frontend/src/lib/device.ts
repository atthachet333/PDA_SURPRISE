export type DeviceTier = 'low' | 'medium' | 'high';

export interface DeviceProfile {
  /** Resolved quality tier: 'high' | 'medium' | 'low'. */
  tier: DeviceTier;
  isTouch: boolean;
  isMobile: boolean;
  maxDpr: number;
  particleCount: number;
  /** Star count for the persistent celestial backdrop. */
  starCount: number;
  /** Extra cloud octaves in the sky shader. */
  cloudDetail: number;
  enableHeavyPostFx: boolean;
  enablePhotoTunnel: boolean;
  /** Depth fog + light-at-the-end in the tunnel. */
  enableFog: boolean;
  /** Custom cursor is desktop + pointer:fine only. */
  enableCursor: boolean;
  /** True when the tier came from a manual override rather than detection. */
  overridden: boolean;
}

const OVERRIDE_KEY = 'ai:quality';

const TIERS: Record<DeviceTier, Omit<DeviceProfile, 'isTouch' | 'isMobile' | 'maxDpr' | 'overridden'>> = {
  low: {
    tier: 'low',
    particleCount: 260,
    starCount: 420,
    cloudDetail: 3,
    enableHeavyPostFx: false,
    enablePhotoTunnel: false,
    enableFog: false,
    enableCursor: false
  },
  medium: {
    tier: 'medium',
    particleCount: 900,
    starCount: 900,
    cloudDetail: 4,
    enableHeavyPostFx: false,
    enablePhotoTunnel: true,
    enableFog: true,
    enableCursor: true
  },
  high: {
    tier: 'high',
    particleCount: 2200,
    starCount: 1600,
    cloudDetail: 5,
    enableHeavyPostFx: true,
    enablePhotoTunnel: true,
    enableFog: true,
    enableCursor: true
  }
};

/** Manual override, set from the dev preview route or the console. */
export function getQualityOverride(): DeviceTier | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(OVERRIDE_KEY);
    return value === 'low' || value === 'medium' || value === 'high' ? value : null;
  } catch {
    return null;
  }
}

export function setQualityOverride(tier: DeviceTier | null): void {
  try {
    if (tier) window.localStorage.setItem(OVERRIDE_KEY, tier);
    else window.localStorage.removeItem(OVERRIDE_KEY);
  } catch {
    // Storage can be unavailable (private mode); detection still works.
  }
}

/**
 * Cheap, synchronous capability probe. It intentionally errs on the
 * conservative side: a wrong "high" guess costs frames, a wrong "low" guess
 * only costs a few particles.
 */
export function detectDevice(): DeviceProfile {
  if (typeof window === 'undefined') {
    return { ...TIERS.low, isTouch: true, isMobile: true, maxDpr: 1, overridden: false };
  }

  const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const width = window.innerWidth;
  const isMobile = width < 768 || isTouch;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const dpr = window.devicePixelRatio ?? 1;

  const override = getQualityOverride();

  let tier: DeviceTier = 'medium';
  if (isMobile || cores <= 4 || memory <= 4) tier = 'low';
  if (!isMobile && cores >= 8 && memory >= 8 && width >= 1280) tier = 'high';
  if (override) tier = override;

  const preset = TIERS[tier];
  const maxDpr = tier === 'high' ? Math.min(dpr, 2) : tier === 'medium' ? Math.min(dpr, 1.5) : Math.min(dpr, 1.25);

  return {
    ...preset,
    isTouch,
    isMobile,
    maxDpr,
    // Never show a custom cursor on a device without a fine pointer, whatever
    // the tier override says.
    enableCursor: preset.enableCursor && finePointer && !isTouch,
    overridden: Boolean(override)
  };
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
