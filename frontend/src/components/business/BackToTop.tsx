import { AnimatePresence, motion, useScroll } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { ContactIcon } from './Footer';

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 600);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          aria-label="กลับด้านบน"
          title="กลับด้านบน"
          onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}
          initial={reduced ? { opacity: 0 } : { opacity: 0, scale: .8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, scale: .85 }}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-40 flex h-11 w-11 items-center justify-center rounded-full border border-brand-700/15 bg-white/90 text-brand-800 shadow-lift backdrop-blur-md transition-colors hover:bg-brand-50 sm:bottom-[calc(5.75rem+env(safe-area-inset-bottom))] sm:right-[max(1.75rem,env(safe-area-inset-right))]"
        >
          {!reduced ? <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden="true"><circle cx="22" cy="22" r="20" fill="none" stroke="rgba(29,170,97,.12)" strokeWidth="1.5" /><motion.circle cx="22" cy="22" r="20" fill="none" stroke="#1DAA61" strokeWidth="1.5" strokeLinecap="round" pathLength="1" style={{ pathLength: scrollYProgress }} /></svg> : null}
          <ContactIcon name="up" />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
