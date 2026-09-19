import { motion } from 'framer-motion';
import { Container } from '@/components/shared/Layout';
import { Icon } from '@/components/shared/Icon';
import { strengths } from '@/data/company';
import type { IconName } from '@/data/services';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';
import { SectionBackdrop } from './SectionBackdrop';

/**
 * WHY PDA BLISS — oversized statements, alternating sides.
 *
 * Each of the five locked strengths is reduced to ONE enormous Thai word, with
 * the full commitment underneath it. The single word is what a visitor
 * remembers; the sentence is what holds us to it.
 *
 * The wording in `strengths` is truth-locked — deliberately free of absolute
 * claims like "ไม่มีข้อผิดพลาด" or "เร็วที่สุด". The keyword below is a display
 * treatment of that copy, never a stronger claim than it makes.
 */

/** The one-word headline for each strength, in the order they are stored. */
const KEYWORDS = ['เร็ว', 'ชัดเจน', 'ตรงเวลา', 'ละเอียด', 'ดูแลต่อ'];

export function StrengthStatements({ code = '07 / WHY US' }: { code?: string } = {}) {
  const reduced = useReducedMotion();

  return (
    <section className="sect sect--bright relative overflow-hidden py-section">
      <SectionBackdrop variant="topographic" />

      <Container className="relative">
        <div className="max-w-3xl">
          <p className="section-code">{code}</p>
          <h2 className="thai-display mt-3 text-statement font-bold text-ink">
            ทำไมต้อง
            <br />
            <span className="text-brand-600">PDA BLISS</span>
          </h2>
        </div>

        <div className="mt-10 space-y-12 sm:mt-12 sm:space-y-14">
          {strengths.map((strength, index) => {
            const flipped = index % 2 === 1;
            const keyword = KEYWORDS[index] ?? strength.title;

            return (
              <div
                key={strength.title}
                className={cn(
                  'grid items-center gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16',
                  flipped && 'lg:[&>*:first-child]:order-2'
                )}
              >
                {/* The one word */}
                <div className={cn(flipped && 'lg:text-right')}>
                  <div className="flex items-baseline gap-4 lg:gap-6">
                    {!flipped ? (
                      <span className="font-mono text-[0.6875rem] tabular-nums text-brand-500">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    ) : null}
                    <motion.h3
                      className="thai-display text-mega font-bold text-ink"
                      initial={reduced ? false : { opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.5 }}
                      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {keyword}
                    </motion.h3>
                    {flipped ? (
                      <span className="font-mono text-[0.6875rem] tabular-nums text-brand-500">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    ) : null}
                  </div>

                  {/* Underline that draws in */}
                  <motion.span
                    aria-hidden="true"
                    className={cn('mt-4 block h-0.5 bg-brand-500', flipped && 'ml-auto')}
                    initial={reduced ? false : { width: 0 }}
                    whileInView={{ width: '5rem' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>

                {/* The commitment */}
                <motion.div
                  initial={reduced ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-card border border-brand-200 bg-brand-50 text-brand-600">
                      <Icon name={strength.icon as IconName} className="h-4 w-4" />
                    </span>
                    <h4 className="thai-display text-lg font-bold text-ink sm:text-xl">
                      {strength.title}
                    </h4>
                  </div>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-steel-600">{strength.body}</p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
