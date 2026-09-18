import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Container } from '@/components/shared/Layout';
import { ArrowIcon } from '@/components/shared/Button';
import { caseStudies, caseStudiesVerified, unverifiedResultLabel } from '@/data/work';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * APPROACH EXAMPLES — the illustrative case studies, unmistakably labelled.
 *
 * These describe the SHAPE of work we do; they are not records of named client
 * projects, and `caseStudiesVerified` is false so no figure from them is ever
 * rendered. That distinction is the whole reason this is a separate section with
 * its own heading and its own badge, sitting below the real systems on /work
 * rather than mixed in with them.
 *
 * Treated as an index — compact rows, not big hero plates — so it reads as
 * supporting reference material next to the real work above it.
 */
export function ApproachExamples() {
  const reduced = useReducedMotion();

  return (
    <section className="sect sect--field relative overflow-hidden py-section">
      <div className="sect-layer field-lines opacity-70" aria-hidden="true" />

      <Container className="relative">
        <div className="max-w-2xl">
          <p className="section-code">03 / APPROACH</p>
          <h2 className="thai-display mt-4 text-statement font-bold text-ink">
            ตัวอย่างแนวทางการพัฒนา
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-steel-500">
            หัวข้อด้านล่างอธิบายรูปแบบของงานที่เราออกแบบ ไม่ใช่โปรเจกต์ที่ระบุชื่อลูกค้าได้
            และไม่มีการแสดงตัวเลขผลลัพธ์ เพราะยังไม่ผ่านการยืนยัน
          </p>
          <span className="mt-6 inline-flex items-center gap-2 rounded-pill border border-steel-300 bg-white px-3.5 py-1.5 font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-steel-500">
            <span className="h-1.5 w-1.5 rounded-full bg-steel-400" />
            {unverifiedResultLabel}
          </span>
        </div>

        <ul className="mt-14 border-t border-steel-300/60">
          {caseStudies.map((study, index) => (
            <motion.li
              key={study.slug}
              initial={reduced ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index % 3) * 0.06 }}
              className="border-b border-steel-300/60"
            >
              <Link
                to={`/work/${study.slug}`}
                className="group grid gap-3 py-7 sm:grid-cols-[3rem_minmax(0,1fr)_9rem_2rem] sm:items-center sm:gap-6"
              >
                <span className="font-mono text-[0.6875rem] tabular-nums text-steel-400">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="min-w-0">
                  <h3 className="thai-display text-lg font-bold text-ink transition-colors duration-base group-hover:text-brand-600 sm:text-xl">
                    {study.title}
                  </h3>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-steel-500">
                    {study.summary}
                  </p>
                </div>

                <span className="font-mono text-[0.5625rem] uppercase tracking-[0.14em] text-steel-400">
                  {study.projectType}
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-steel-300 text-steel-500 transition-all duration-base group-hover:border-brand-300 group-hover:bg-brand-50 group-hover:text-brand-600 sm:justify-self-end">
                  <ArrowIcon className="h-4 w-4" />
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>

        {/* If the flag is ever flipped, this is where measured results belong. */}
        {caseStudiesVerified ? (
          <p className="mt-8 text-xs text-steel-400">
            ตัวเลขผลลัพธ์แสดงอยู่ในหน้ารายละเอียดของแต่ละงาน
          </p>
        ) : null}
      </Container>
    </section>
  );
}
