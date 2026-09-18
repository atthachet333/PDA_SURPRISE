import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/shared/Layout';
import { ArrowIcon } from '@/components/shared/Button';
import { ProjectVisual } from './ProjectVisual';
import { portfolio, type PortfolioItem } from '@/data/portfolio';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

/**
 * SELECTED WORK — near-full-width, editorial, one project per band.
 *
 * Driven by `data/portfolio.ts`, which holds the REAL systems. There are no
 * outcome figures anywhere in this section because none have been measured:
 * what a visitor gets is the system, what it does, and what it is built on.
 *
 * Interaction
 *   - the visual parallaxes against the page as the band scrolls
 *   - hovering lifts the plate and animates the metadata in
 *   - the cursor reads "ดูโปรเจกต์" over a project (see CorporateCursor)
 *
 * Alternating sides keep it from reading as a list; on mobile every band
 * stacks visual-over-text, which is a different composition rather than a
 * narrowed one.
 */

interface WorkShowcaseProps {
  /** Defaults to every portfolio item. */
  items?: PortfolioItem[];
  code?: string;
  title?: React.ReactNode;
  lead?: string;
  showAllLink?: boolean;
}

export function WorkShowcase({
  items = portfolio,
  code = '05 / WORK',
  title = (
    <>
      ระบบที่เราสร้าง
      <br />
      <span className="text-brand-400">และยังทำงานอยู่จริง</span>
    </>
  ),
  lead = 'ระบบด้านล่างคือระบบที่พัฒนาและส่งมอบแล้ว ภาพหน้าจอบางส่วนยังไม่เผยแพร่เพราะมีข้อมูลของลูกค้าและพนักงานอยู่',
  showAllLink = false
}: WorkShowcaseProps) {
  return (
    <section id="work" className="sect sect--deep relative overflow-hidden py-section text-white">
      <div
        className="sect-layer opacity-40"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(53,201,111,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(53,201,111,0.06) 1px, transparent 1px)',
          backgroundSize: '72px 72px'
        }}
      />

      <Container className="relative">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="section-code text-brand-400">{code}</p>
            <h2 className="thai-display mt-4 text-mega font-bold text-white">{title}</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-brand-100/60">{lead}</p>
        </div>
      </Container>

      <div className="mt-16 space-y-20 sm:mt-20 sm:space-y-28">
        {items.map((item, index) => (
          <WorkBand key={item.id} item={item} index={index} flipped={index % 2 === 1} />
        ))}
      </div>

      {showAllLink ? (
        <Container className="relative mt-20">
          <Link
            to="/work"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-300 transition-colors hover:text-white"
          >
            ดูผลงานทั้งหมด
            <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1" />
          </Link>
        </Container>
      ) : null}
    </section>
  );
}

function WorkBand({
  item,
  index,
  flipped
}: {
  item: PortfolioItem;
  index: number;
  flipped: boolean;
}) {
  const bandRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: bandRef,
    offset: ['start end', 'end start']
  });
  // Gentle counter-movement: the plate drifts against the page, never enough to
  // detach from its caption.
  const visualY = useTransform(scrollYProgress, [0, 1], ['6%', '-6%']);
  const visualScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.04, 1, 1.04]);

  return (
    <div ref={bandRef}>
      <Container>
        <Link
          to={`/work/${item.id}`}
          data-cursor="project"
          className="group grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-14"
        >
          {/* ------------------------------------------------------ visual -- */}
          <div className={cn('relative', flipped && 'lg:order-2')}>
            <div className="relative aspect-[16/10] overflow-hidden rounded-panel border border-brand-400/20 shadow-lift-lg transition-transform duration-slow ease-smooth group-hover:-translate-y-1.5">
              <motion.div
                className="absolute inset-[-8%]"
                style={reduced ? undefined : { y: visualY, scale: visualScale }}
              >
                <ProjectVisual item={item} />
              </motion.div>

              {/* Reveal mask that lifts on first view */}
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 origin-bottom bg-ink"
                initial={reduced ? false : { scaleY: 1 }}
                whileInView={{ scaleY: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
              />

              {/* Hover sheen */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-slow group-hover:opacity-100"
                style={{
                  background:
                    'linear-gradient(120deg, transparent 40%, rgba(53,201,111,0.14) 60%, transparent 80%)'
                }}
              />
            </div>

            {/* Oversized index, crossing the plate edge */}
            <span
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute -top-8 font-mono text-[clamp(2.5rem,6vw,5rem)] font-medium leading-none text-white/10 sm:-top-10',
                flipped ? '-right-2 lg:-right-6' : '-left-2 lg:-left-6'
              )}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          {/* -------------------------------------------------------- text -- */}
          <div className={cn(flipped && 'lg:order-1')}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-pill border border-brand-400/30 px-3 py-1 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-brand-300">
                {item.titleEn}
              </span>
              {item.verified ? (
                <span className="font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-brand-400/70">
                  live
                </span>
              ) : null}
            </div>

            <h3 className="thai-display mt-5 text-statement font-bold text-white">
              {item.titleTh}
            </h3>

            <p className="mt-4 max-w-lg text-[0.975rem] leading-relaxed text-brand-100/70">
              {item.summary}
            </p>

            {/* Features animate in on hover, and are always present for a11y */}
            <ul className="mt-6 space-y-1.5">
              {item.features.slice(0, 3).map((feature, featureIndex) => (
                <motion.li
                  key={feature}
                  initial={reduced ? false : { opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 + featureIndex * 0.06 }}
                  className="flex items-start gap-2.5 text-sm text-brand-100/60"
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-400" />
                  {feature}
                </motion.li>
              ))}
            </ul>

            <ul className="mt-6 flex flex-wrap gap-1.5">
              {item.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-pill border border-brand-400/20 px-2.5 py-1 font-mono text-[0.5rem] uppercase tracking-[0.1em] text-brand-200/80"
                >
                  {tech}
                </li>
              ))}
            </ul>

            <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-white">
              ดูรายละเอียด
              <ArrowIcon className="transition-transform duration-base group-hover:translate-x-1.5" />
            </span>
          </div>
        </Link>
      </Container>
    </div>
  );
}
