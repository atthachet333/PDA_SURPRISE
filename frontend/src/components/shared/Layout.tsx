import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('container-page', className)}>{children}</div>;
}

interface SectionProps {
  id?: string;
  className?: string;
  children: React.ReactNode;
  tone?: 'default' | 'muted' | 'dark';
}

export function Section({ id, className, children, tone = 'default' }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        'relative py-section',
        tone === 'muted' && 'bg-steel-50',
        tone === 'dark' && 'bg-ink text-white',
        className
      )}
    >
      {children}
    </section>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  tone = 'light',
  className
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className
      )}
    >
      {eyebrow ? (
        <Reveal>
          <p className={cn('eyebrow', tone === 'dark' && 'text-brand-300')}>{eyebrow}</p>
        </Reveal>
      ) : null}
      <Reveal delay={0.06}>
        <h2
          className={cn(
            'mt-4 text-headline font-semibold',
            tone === 'dark' ? 'text-white' : 'text-ink'
          )}
        >
          {title}
        </h2>
      </Reveal>
      {lead ? (
        <Reveal delay={0.12}>
          <p className={cn('mt-5 text-lead', tone === 'dark' ? 'text-steel-300' : 'text-steel-600')}>
            {lead}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: 'div' | 'span' | 'li';
}

/** Scroll-triggered entrance used across the corporate site. Fires once. */
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

export function Divider({ className }: { className?: string }) {
  return <div className={cn('rule', className)} aria-hidden="true" />;
}
