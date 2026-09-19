import { useEffect, useRef, useState } from 'react';
import { useDeviceProfile } from '@/hooks/useDeviceProfile';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type CursorMode = 'default' | 'interactive' | 'open' | 'drag' | 'read';

const LABELS: Record<CursorMode, string> = {
  default: '',
  interactive: '',
  open: 'OPEN',
  drag: 'DRAG',
  read: 'READ'
};

/**
 * Desktop-only cursor for the A&I experience.
 *
 * The native cursor is kept for anything the keyboard or a screen reader cares
 * about — this is purely additive, drawn on top, and it disables itself
 * entirely on touch, coarse pointers and reduced-motion.
 *
 * Elements opt in with `data-cursor="open" | "drag" | "interactive"`; buttons
 * and links get the interactive state automatically.
 */
export function AICursor() {
  const device = useDeviceProfile();
  const reduced = useReducedMotion();
  const enabled = device.enableCursor && !reduced;

  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<CursorMode>('default');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let frame = 0;
    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPosition = { ...pointer };

    const render = () => {
      // The dot tracks exactly; the ring lags for weight.
      ringPosition.x += (pointer.x - ringPosition.x) * 0.16;
      ringPosition.y += (pointer.y - ringPosition.y) * 0.16;

      if (dot.current) {
        dot.current.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPosition.x}px, ${ringPosition.y}px, 0) translate(-50%, -50%)`;
      }
      frame = requestAnimationFrame(render);
    };

    const resolveMode = (target: EventTarget | null): CursorMode => {
      if (!(target instanceof Element)) return 'default';
      const tagged = target.closest('[data-cursor]');
      if (tagged) {
        const value = tagged.getAttribute('data-cursor');
        if (value === 'open' || value === 'drag' || value === 'read' || value === 'interactive') return value;
      }
      return target.closest('a, button, [role="button"], input, select, textarea') ? 'interactive' : 'default';
    };

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!visible) setVisible(true);
      setMode((current) => {
        const next = resolveMode(event.target);
        return next === current ? current : next;
      });
    };

    const onLeave = () => setVisible(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [enabled, visible]);

  // Hide the native cursor only while ours is actually running.
  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add('ai-cursor-active');
    return () => document.body.classList.remove('ai-cursor-active');
  }, [enabled]);

  if (!enabled) return null;

  const expanded = mode !== 'default';
  const label = LABELS[mode];

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[200]">
      <div
        ref={dot}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-sky-200 transition-opacity duration-300"
        style={{ opacity: visible && !expanded ? 1 : 0, boxShadow: '0 0 12px rgba(126,200,255,0.9)' }}
      />
      <div
        ref={ring}
        className="absolute left-0 top-0 flex items-center justify-center rounded-full border border-sky-200/70 transition-[width,height,opacity,background-color] duration-300 ease-entrance"
        style={{
          width: expanded ? 48 : 24,
          height: expanded ? 48 : 24,
          opacity: visible ? (expanded ? 1 : 0.55) : 0,
          backgroundColor: expanded ? 'rgba(126,200,255,0.10)' : 'transparent'
        }}
      >
        <span
          className="font-mono text-[0.5rem] uppercase tracking-[0.16em] text-ivory transition-opacity duration-200"
          style={{ opacity: label ? 1 : 0 }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
