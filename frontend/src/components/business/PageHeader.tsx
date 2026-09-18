import { motion } from 'framer-motion';
import { Container } from '@/components/shared/Layout';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
  /** Section code, e.g. '01 / SERVICES'. */
  eyebrow: string;
  /** Pass Thai headline lines as an array so wrapping is controlled, not guessed. */
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  /** 'dark' inverts onto the deep green ground, for Work. */
  tone?: 'light' | 'dark';
}

/**
 * PAGE HEADER — the opening composition for inner pages.
 *
 * Oversized Thai type that masks and rises, on the hero ground rather than a
 * plain white band, with the section code set in mono above it. Matches the
 * homepage hero's typographic scale so inner pages do not feel like a different
 * website.
 */
export function PageHeader({ eyebrow, title, lead, children, tone = 'light' }: PageHeaderProps) {
  const reduced = useReducedMotion();
  const dark = tone === 'dark';

  return (
    <section
      className={cn(
        'sect relative overflow-hidden pb-16 pt-32 sm:pb-20 sm:pt-40',
        dark ? 'sect--deep text-white' : 'sect--hero'
      )}
    >
      <div className="sect-layer" aria-hidden="true">
        <span
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage: dark
              ? 'linear-gradient(rgba(53,201,111,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(53,201,111,0.08) 1px, transparent 1px)'
              : 'linear-gradient(rgba(6,59,42,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(6,59,42,0.045) 1px, transparent 1px)',
            backgroundSize: '84px 84px',
            maskImage: 'radial-gradient(70% 90% at 25% 0%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(70% 90% at 25% 0%, black, transparent)'
          }}
        />
        <span
          className={cn(
            'absolute -right-28 -top-28 h-[32rem] w-[32rem] rounded-full blur-2xl',
            dark
              ? 'bg-[radial-gradient(circle,rgba(53,201,111,0.22),transparent_66%)]'
              : 'bg-[radial-gradient(circle,rgba(53,201,111,0.16),transparent_66%)]'
          )}
        />
      </div>

      <Container className="relative">
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={cn('section-code', dark && 'text-brand-400')}
        >
          {eyebrow}
        </motion.p>

        <h1
          className={cn(
            'thai-display mt-6 max-w-5xl text-mega font-bold',
            dark ? 'text-white' : 'text-ink'
          )}
        >
          <span className="block overflow-hidden py-[0.04em]">
            <motion.span
              className="block"
              initial={reduced ? false : { y: '106%' }}
              animate={{ y: 0 }}
              transition={{ duration: 1, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              {title}
            </motion.span>
          </span>
        </h1>

        {lead ? (
          <motion.p
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={cn('mt-8 max-w-2xl text-lead', dark ? 'text-brand-100/70' : 'text-steel-600')}
          >
            {lead}
          </motion.p>
        ) : null}

        {children ? (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-11"
          >
            {children}
          </motion.div>
        ) : null}
      </Container>
    </section>
  );
}
