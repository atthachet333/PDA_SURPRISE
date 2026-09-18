import { useEffect, useRef } from 'react';

export interface NormalizedPointer {
  x: number;
  y: number;
}

/**
 * Normalized (-1..1) pointer position kept in a ref so consumers can read it
 * inside animation frames without triggering React renders.
 */
export function useMousePosition(): React.MutableRefObject<NormalizedPointer> {
  const pointer = useRef<NormalizedPointer>({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return pointer;
}
