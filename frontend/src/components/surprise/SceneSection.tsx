import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/*
 * ENTRANCES MUST NEVER GATE CONTENT.
 *
 * These three helpers open at `opacity: 0` and rely on `whileInView` to bring
 * them back. Under reduced motion that entrance is suppressed, and the headings
 * were simply staying invisible — scrolled fully into view, `opacity: 0`, with
 * no way to recover. Four scene titles were unreadable that way.
 *
 * `initial={false}` tells framer to skip the entrance and mount at the animate
 * state, so the resting state is the readable one. Every other scene in the
 * experience already guards its entrances this way; these did not.
 */

interface SceneSectionProps {
  id: string;
  className?: string;
  children: React.ReactNode;
  /** Full-height scenes are the default; set false for scenes that size to content. */
  fullHeight?: boolean;
  label?: string;
}

export const SceneSection = forwardRef<HTMLElement, SceneSectionProps>(function SceneSection(
  { id, className, children, fullHeight = true, label },
  ref
) {
  return (
    <section
      id={id}
      ref={ref}
      aria-label={label}
      className={cn(
        /* `ai-scene-anchor` owns the scroll offset; see --nav-height. Hard-coded
           scroll-mt classes used to duplicate the bar's height and drifted from
           it the moment the bar changed. */
        'ai-scene-anchor relative flex w-full flex-col items-center justify-center px-6 py-24 sm:px-8',
        fullHeight && 'min-h-[100svh]',
        className
      )}
    >
      {children}
    </section>
  );
});

/** Small caption used at the top of most scenes. */
export function SceneLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.p
      initial={reduced ? false : { opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -20% 0px' }}
      transition={{ duration: 0.8 }}
      className={cn(
        'font-mono text-[0.625rem] uppercase tracking-[0.34em] text-sky-200/60',
        className
      )}
    >
      {children}
    </motion.p>
  );
}

export function SceneTitle({
  children,
  className,
  delay = 0.1
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.h2
      initial={reduced ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -18% 0px' }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'ai-scene-title',
        className
      )}
    >
      {children}
    </motion.h2>
  );
}

export function SceneText({
  children,
  className,
  delay = 0.2
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.p
      initial={reduced ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -18% 0px' }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn('ai-body', className)}
    >
      {children}
    </motion.p>
  );
}
