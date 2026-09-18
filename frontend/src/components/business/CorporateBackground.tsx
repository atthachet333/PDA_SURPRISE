import { motion, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/** Quiet, reusable atmosphere for public business pages only. */
export function CorporateBackground() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const orbY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);

  return (
    <div className="corporate-background" aria-hidden="true">
      <div className="corporate-grid" />
      <motion.div className="corporate-orb corporate-orb--one" style={reduced ? undefined : { y: orbY }} />
      <div className="corporate-orb corporate-orb--two" />
      <div className="corporate-noise" />
    </div>
  );
}
