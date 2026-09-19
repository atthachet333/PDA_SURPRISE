import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

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
        'relative flex w-full flex-col items-center justify-center px-6 py-24 sm:px-8',
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
  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
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
  return (
    <motion.h2
      initial={{ opacity: 0, y: 18 }}
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
  return (
    <motion.p
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -18% 0px' }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn('ai-body', className)}
    >
      {children}
    </motion.p>
  );
}
