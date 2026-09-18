import { motion } from 'framer-motion';
import { Container } from '@/components/shared/Layout';

interface PageHeaderProps {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, lead, children }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden border-b border-steel-200 pb-16 pt-32 sm:pb-20 sm:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hairline-grid opacity-60 [mask-image:radial-gradient(60%_80%_at_30%_0%,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-brand-100/40 blur-3xl"
      />
      <Container className="relative">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="eyebrow"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5 max-w-4xl text-display font-semibold text-ink"
        >
          {title}
        </motion.h1>
        {lead ? (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 max-w-2xl text-lead text-steel-600"
          >
            {lead}
          </motion.p>
        ) : null}
        {children ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10"
          >
            {children}
          </motion.div>
        ) : null}
      </Container>
    </section>
  );
}
