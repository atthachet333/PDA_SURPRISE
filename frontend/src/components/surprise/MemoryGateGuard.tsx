import { Navigate, useLocation } from 'react-router-dom';
import { isMemoryGateUnlocked, unlockMemoryGate } from '@/lib/memoryGateSession';

export function MemoryGateGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const explicitDevBypass =
    import.meta.env.DEV &&
    new URLSearchParams(location.search).get('memory-gate-bypass') === '1';

  if (explicitDevBypass) {
    unlockMemoryGate();
    return children;
  }

  if (isMemoryGateUnlocked()) return children;

  return <Navigate to="/memory-gate" replace state={{ requestedPath: location.pathname }} />;
}
