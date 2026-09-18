import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Shared layout primitives.
 *
 * Deliberately small. The redesign gives every section its own composition and
 * its own ground (`.sect--*` in global.css), so a generic `Section` wrapper and a
 * one-size `SectionHeading` would only pull things back towards a uniform
 * template — both were removed rather than left as a second way to build a
 * section. What remains is the page gutter and one reveal.
 */

export function Container({
  className,
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('container-page', className)}>{children}</div>;
}

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'span' | 'li';
}

/** Scroll-triggered entrance. Fires once, and does nothing at all under reduced motion. */
export function Reveal({ children, delay = 0, y = 26, className, as = 'div' }: RevealProps) {
  const [ref, inView] = useInViewOnce<HTMLDivElement>();
  const reduced = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      ref={ref as React.RefObject<HTMLDivElement & HTMLSpanElement & HTMLLIElement>}
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      animate={inView || reduced ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.75, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Component>
  );
}
