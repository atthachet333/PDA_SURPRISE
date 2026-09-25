import { motion } from 'framer-motion';
import { Container } from '@/components/shared/Layout';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { RevealLines } from '@/components/shared/RevealLines';
import { cn } from '@/lib/cn';
import { VisualAtmosphere, type AtmosphereVariant } from './atmosphere/VisualAtmosphere';

interface PageHeaderProps {
  /** Section code, e.g. '01 / SERVICES'. */
  eyebrow: string;
  /** Pass Thai headline lines as an array so wrapping is controlled, not guessed. */
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  /** 'dark' inverts onto the deep green ground, for Work. */
  tone?: 'light' | 'dark';
  /** EP43 background composition; defaults to a quiet editorial field. */
  atmosphere?: AtmosphereVariant;
}

/**
 * PAGE HEADER — the opening composition for inner pages.
 *
 * Oversized Thai type that masks and rises, on the hero ground rather than a
 * plain white band, with the section code set in mono above it. Matches the
 * homepage hero's typographic scale so inner pages do not feel like a different
 * website.
 */
export function PageHeader({ eyebrow, title, lead, children, tone = 'light', atmosphere }: PageHeaderProps) {
  const reduced = useReducedMotion();
  const dark = tone === 'dark';

  return (
    <section
      className={cn(
        'sect relative overflow-hidden pb-16 pt-32 sm:pb-20 sm:pt-40',
        dark ? 'sect--deep text-white' : 'sect--hero'
      )}
    >
      <VisualAtmosphere variant={atmosphere ?? (dark ? 'evidence' : 'editorial')} />

      <Container className="relative">
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={cn('section-code', dark && 'text-brand-400')}
        >
          {eyebrow}
        </motion.p>

        <RevealLines
          as="h1"
          className={cn(
            'thai-display mt-6 max-w-5xl text-mega font-bold',
            dark ? 'text-white' : 'text-ink'
          )}
          lines={[title]}
          duration={1000}
        />

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
