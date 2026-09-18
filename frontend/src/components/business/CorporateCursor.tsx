import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function CorporateCursor() {
  const reduced = useReducedMotion();
  const x = useMotionValue(-40);
  const y = useMotionValue(-40);
  const springX = useSpring(x, { stiffness: 650, damping: 42, mass: 0.25 });
  const springY = useSpring(y, { stiffness: 650, damping: 42, mass: 0.25 });
  const [visible, setVisible] = useState(false);
  const [interactive, setInteractive] = useState(false);
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(pointer: fine) and (hover: hover)');
    const sync = () => setFinePointer(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!finePointer || reduced) return;
    document.body.classList.add('corporate-cursor-active');
    const move = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
      setInteractive(Boolean((event.target as Element | null)?.closest('a,button,input,select,textarea,[role="button"]')));
    };
    const leave = () => setVisible(false);
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('mouseleave', leave);
    return () => {
      document.body.classList.remove('corporate-cursor-active');
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('mouseleave', leave);
    };
  }, [finePointer, reduced, x, y]);

  if (!finePointer || reduced) return null;
  return (
    <motion.span
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-3 w-3 rounded-full bg-brand-500 mix-blend-multiply lg:block"
      style={{ x: springX, y: springY }}
      animate={{ opacity: visible ? 1 : 0, scale: interactive ? 2.2 : 1 }}
      transition={{ opacity: { duration: 0.15 }, scale: { duration: 0.2 } }}
    />
  );
}
