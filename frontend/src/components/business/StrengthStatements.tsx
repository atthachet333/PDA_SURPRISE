import { motion } from 'framer-motion';
import { Container } from '@/components/shared/Layout';
import { Icon } from '@/components/shared/Icon';
import { SectionBackdrop } from './SectionBackdrop';
import { strengths } from '@/data/company';
import type { IconName } from '@/data/services';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * WHY US — given its own world.
 *
 * WHAT CHANGED
 *   This was five oversized words on plain white, wedged between other white
 *   sections, so it had no edges of its own. It now sits on a cream / pale green
 *   ground with a large PDA BLISS monogram watermark, a drifting contour field,
 *   a vertical light down the gutter, and a small system-map visual — so the
 *   section clearly begins and ends.
 *
 * TRUTH
 *   The sentences come from `strengths` in data/company.ts and are truth-locked
 *   — deliberately free of absolutes like "ไม่มีข้อผิดพลาด" or "เร็วที่สุด".
 *   The single keyword is a display treatment of that copy, never a stronger
 *   claim than the sentence beside it.
 */

/** One-word headline per strength, in stored order. */
const KEYWORDS = ['เร็ว', 'คุ้มค่า', 'ตรงเวลา', 'ละเอียด', 'ดูแลต่อ'];

export function StrengthStatements({ code = '08 / WHY US' }: { code?: string } = {}) {
  const reduced = useReducedMotion();

  return (
    <section className="sect sect--cream relative overflow-hidden py-section">
      <span aria-hidden="true" className="sect-edge-top" />
      <SectionBackdrop variant="topographic" pointer />

      {/* Oversized monogram watermark, cropped by the right edge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-[5%] top-1/2 hidden -translate-y-1/2 select-none text-[26rem] font-bold leading-none tracking-[-0.06em] text-brand-800/[0.05] lg:block"
      >
        PB
      </span>

      {/* Vertical light down the left gutter */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[7%] hidden w-px bg-[linear-gradient(to_bottom,transparent,rgba(29,170,97,0.3),transparent)] lg:block"
      />

      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
          {/* -------------------------------------------------- left: intro -- */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="section-code">{code}</p>
            <h2 className="thai-display mt-3 text-statement font-bold text-ink">
              ทำไมต้อง
              <br />
              <span className="text-brand-600">PDA BLISS</span>
            </h2>
            <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-steel-600">
              ห้าเรื่องที่เรายึดกับทุกโปรเจกต์ ไม่ใช่คำโฆษณา
              แต่เป็นสิ่งที่คุณใช้วัดเราได้ตั้งแต่การคุยครั้งแรกจนถึงการดูแลหลังส่งมอบ
            </p>

            {/* Small system map — the section's visual anchor */}
            <div className="mt-8 hidden max-w-xs rounded-panel border border-brand-200/70 bg-white/70 p-5 backdrop-blur-sm lg:block">
              <p className="font-mono text-[0.5rem] uppercase tracking-[0.18em] text-steel-400">
                how we work
              </p>
              <svg viewBox="0 0 100 58" className="mt-3 w-full" aria-hidden="true">
                <path
                  d="M8 46 L 30 46 L 42 30 L 64 30 L 76 14 L 94 14"
                  fill="none"
                  stroke="rgba(29,170,97,0.45)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
                {!reduced ? (
                  <path
                    d="M8 46 L 30 46 L 42 30 L 64 30 L 76 14 L 94 14"
                    fill="none"
                    stroke="#1DAA61"
                    strokeWidth="2"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray="4 116"
                    className="animate-data-run"
                    style={{ animationDuration: '5.5s' }}
                  />
                ) : null}
                {[
                  [8, 46],
                  [42, 30],
                  [76, 14],
                  [94, 14]
                ].map(([cx, cy]) => (
                  <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" className="fill-brand-500" />
                ))}
              </svg>
              <div className="mt-3 flex justify-between font-mono text-[0.4375rem] uppercase tracking-[0.12em] text-steel-400">
                <span>brief</span>
                <span>build</span>
                <span>care</span>
              </div>
            </div>
          </div>

          {/* ----------------------------------------------- right: the five -- */}
          <ul className="border-t border-brand-200/60">
            {strengths.map((strength, index) => {
              const keyword = KEYWORDS[index] ?? strength.title;
              return (
                <motion.li
                  key={strength.title}
                  initial={reduced ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="grid items-start gap-x-6 gap-y-3 border-b border-brand-200/60 py-7 sm:grid-cols-[auto_minmax(0,1fr)] sm:py-8"
                >
                  {/* Wide enough that "ตรงเวลา" and "ดูแลต่อ" stay on one line. */}
                  <div className="flex items-baseline gap-3 sm:w-[12rem]">
                    <span className="font-mono text-[0.625rem] tabular-nums text-brand-600">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="thai-display whitespace-nowrap text-[clamp(1.75rem,3vw,2.75rem)] font-bold leading-none text-ink">
                      {keyword}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span /* No group-hover: the row is not interactive, so it must not look it. */
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-card border border-brand-200 bg-white text-brand-600">
                        <Icon name={strength.icon as IconName} className="h-3.5 w-3.5" />
                      </span>
                      <h3 className="thai-display text-[0.9375rem] font-bold text-ink">
                        {strength.title}
                      </h3>
                    </div>
                    <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-steel-600">
                      {strength.body}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
