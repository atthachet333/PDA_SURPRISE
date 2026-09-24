import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import { useLocale } from '@/app/LocaleContext';
import { ui } from '@/i18n/ui';

/**
 * CORPORATE CURSOR — a green dot that becomes a label over meaningful targets.
 *
 * States, driven by what is under the pointer:
 *   default      small solid green dot
 *   interactive  expands into a ring (links, buttons, inputs)
 *   project      a filled disc reading "ดูโปรเจกต์"   (`data-cursor="project"`)
 *   cta          a disc with an arrow                 (`data-cursor="cta"`)
 *   drag         a disc reading "DRAG"                (`data-cursor="drag"`)
 *
 * Accessibility
 *   - Only mounts for fine pointers with hover, so touch is untouched.
 *   - Disabled entirely under `prefers-reduced-motion`.
 *   - `cursor: none` is applied by a body class only while this is live, and
 *     global CSS restores the native cursor for `:focus-visible`, so a keyboard
 *     user never loses the pointer.
 *   - Fully `aria-hidden`; it is decoration over real, focusable targets.
 */

type CursorState = 'default' | 'interactive' | 'project' | 'cta' | 'drag';

const INTERACTIVE_SELECTOR = 'a,button,input,select,textarea,[role="button"],[tabindex]:not([tabindex="-1"])';

export function CorporateCursor() {
  const reduced = useReducedMotion();
  const { t } = useLocale();
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 620, damping: 40, mass: 0.25 });
  const springY = useSpring(y, { stiffness: 620, damping: 40, mass: 0.25 });

  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<CursorState>('default');
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

      const target = event.target as Element | null;
      // An explicit data-cursor wins; otherwise fall back to "is it clickable".
      const tagged = target?.closest<HTMLElement>('[data-cursor]');
      const hint = tagged?.dataset.cursor;

      if (hint === 'project' || hint === 'cta' || hint === 'drag') setState(hint);
      else if (target?.closest(INTERACTIVE_SELECTOR)) setState('interactive');
      else setState('default');
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

  const labelled = state === 'project' || state === 'drag';
  const isCta = state === 'cta';

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden lg:block"
      style={{ x: springX, y: springY }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.16 }}
    >
      <motion.div
        className={cn(
          'flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full',
          labelled || isCta
            ? 'bg-brand-500 text-white'
            : state === 'interactive'
              ? 'border border-brand-500 bg-brand-500/10'
              : 'bg-brand-500'
        )}
        animate={{
          width: labelled ? 84 : isCta ? 46 : state === 'interactive' ? 34 : 10,
          height: labelled ? 84 : isCta ? 46 : state === 'interactive' ? 34 : 10
        }}
        transition={{ type: 'spring', stiffness: 380, damping: 30, mass: 0.5 }}
      >
        {state === 'project' ? (
          <span className="thai-display whitespace-nowrap text-[0.5625rem] font-semibold">
            {t(ui.viewProject)}
          </span>
        ) : null}
        {state === 'drag' ? (
          <span className="font-mono text-[0.5rem] uppercase tracking-[0.14em]">drag</span>
        ) : null}
        {isCta ? (
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden="true">
            <path
              d="M3 8h9.5M8.5 3.5 13 8l-4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
