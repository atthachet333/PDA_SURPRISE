import { useEffect, useState } from 'react';
import { detectDevice, type DeviceProfile } from '@/lib/device';

let cached: DeviceProfile | null = null;

export function useDeviceProfile(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>(() => cached ?? detectDevice());

  useEffect(() => {
    cached = profile;
    const onResize = () => {
      const next = detectDevice();
      cached = next;
      setProfile((current) =>
        current.tier === next.tier && current.isMobile === next.isMobile ? current : next
      );
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [profile]);

  return profile;
}
