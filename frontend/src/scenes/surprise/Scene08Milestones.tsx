import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { SceneSection } from '@/components/surprise/SceneSection';
import { ChapterMark } from '@/components/surprise/ChapterMark';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { anniversary, type TimelineMoment } from '@/data/anniversary';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

const EASE = [0.16, 1, 0.3, 1] as const;

function beat(id: string): TimelineMoment {
  const moment = anniversary.timeline.find((entry) => entry.id === id);
  if (!moment) throw new Error(`missing timeline beat ${id}`);
  return moment;
}

/**
 * The commitments, each with its own visual identity and energy:
 *
 *   PRE-WEDDING   anticipation — a hero print with two frames waiting behind
 *   WEDDING       ceremonial — the one chapter printed on album paper
 *   20 DEC 2025   the decision — two frames from one afternoon, side by side
 *   28 JUL 2026   registration — quiet, documentary, a ruled ledger
 *
 * Order is the story's established relative order. The ceremony preceded the
 * legal registration; its date is not asserted anywhere.
 */
export function Scene08Milestones() {
  const reduced = useReducedMotion();
  return (
    <SceneSection id="milestones" label="วันสำคัญของเรา" fullHeight={false} className="overflow-visible px-0 py-0 sm:px-0">
      <PreWedding moment={beat('t8b')} reduced={reduced} />
      <Wedding moment={beat('t8c')} reduced={reduced} />
      <Decision moment={beat('t7b')} reduced={reduced} />
      <Registration moment={beat('t8')} reduced={reduced} />
    </SceneSection>
  );
}

/* ---------------------------------------------------------- PRE-WEDDING -- */
function PreWedding({ moment, reduced }: { moment: TimelineMoment; reduced: boolean }) {
  const [back, side] = moment.images ?? [];
  return (
    <article id="prewedding" className="ai-prewed relative w-full overflow-hidden px-5 pb-20 pt-20 sm:px-8 lg:px-12 lg:py-28">
      <span aria-hidden="true" className="ai-prewed-sky pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid w-full max-w-[82rem] gap-12 lg:grid-cols-12 lg:items-center">
        <div className="relative lg:col-span-7">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[36rem] lg:ml-0">
            {back ? (
              <motion.figure
                initial={reduced ? false : { opacity: 0, x: 40, rotate: 0 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '0px 0px -12% 0px' }}
                transition={{ duration: 1.8, delay: 0.5, ease: EASE }}
                className="ai-prewed-back absolute -right-4 top-[6%] hidden w-[46%] overflow-hidden sm:block lg:-right-24"
              >
                <div className="aspect-[2/3]"><MemoryImage photo={back} alt="ภาพก่อนงานแต่ง ป้ายต้อนรับ" tone="cream" loading="lazy" objectPosition="50% 45%" /></div>
              </motion.figure>
            ) : null}
            <motion.figure
              initial={reduced ? false : { opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -12% 0px' }}
              transition={{ duration: 1.6, ease: EASE }}
              className="ai-prewed-hero relative z-10 h-full w-[84%] overflow-hidden sm:w-[72%]"
            >
              <MemoryImage photo={moment.image} alt="ภาพถ่ายก่อนงานแต่งของเรา" tone="cream" loading="lazy" objectPosition="50% 30%" className="ai-prewed-image" />
              <span aria-hidden="true" className="ai-prewed-leak absolute inset-0" />
            </motion.figure>
            {side ? (
              <motion.figure
                initial={reduced ? false : { opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -12% 0px' }}
                transition={{ duration: 1.8, delay: 0.8, ease: EASE }}
                className="ai-prewed-side absolute -bottom-10 right-0 z-20 w-[40%] overflow-hidden sm:right-[4%] sm:w-[34%] lg:-right-6"
              >
                <div className="aspect-[2/3]"><MemoryImage photo={side} alt="อีกหนึ่งภาพจากวันถ่ายภาพก่อนงานแต่ง" tone="cream" loading="lazy" objectPosition="50% 30%" /></div>
              </motion.figure>
            ) : null}
          </div>
        </div>
        <div className="relative lg:col-span-5">
          <ChapterMark index="06" label={`${moment.label} · ${moment.title}`} />
          <h2 className="thai-display mt-6 font-thai text-[clamp(2.6rem,5.2vw,4.8rem)] font-light leading-[1.1] text-ivory">{moment.title}</h2>
          <p className="mt-5 font-thai text-[clamp(1.05rem,1.35vw,1.22rem)] leading-8 text-champagne">{moment.body}</p>
          <p aria-hidden="true" className="mt-10 font-display text-lg italic tracking-[0.08em] text-ivory/45">the days just before</p>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------- WEDDING -- */
function Wedding({ moment, reduced }: { moment: TimelineMoment; reduced: boolean }) {
  const supports = moment.images ?? [];
  return (
    <article id="wedding" className="ai-wedding relative w-full overflow-hidden">
      <div className="relative px-5 pb-28 pt-40 sm:px-8 lg:px-12 lg:pb-36 lg:pt-48">
        <span aria-hidden="true" className="ai-wedding-veil pointer-events-none absolute inset-0" />
        <div className="relative mx-auto w-full max-w-[80rem]">
          <div className="text-center">
            <ChapterMark index="07" label={`${moment.label} · พิธีมงคลสมรส`} tone="ink" className="items-center" />
            <h2 className="thai-display mt-6 font-thai text-[clamp(2.8rem,6vw,5.6rem)] font-light leading-[1.08] text-[#17324d]">{moment.title}</h2>
            <p className="mt-4 font-thai text-[clamp(1rem,1.3vw,1.18rem)] leading-8 text-[#17324d]/75">{moment.body}</p>
            <motion.span
              aria-hidden="true"
              initial={reduced ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 2.2, delay: 0.4, ease: EASE }}
              className="mx-auto mt-8 block h-px w-48 origin-center bg-gradient-to-r from-transparent via-[#b8976a] to-transparent"
            />
          </div>

          {/* The album opens: the hero print is revealed from the centre seam
              outward, as if the two pages were parting. */}
          <div className="relative mx-auto mt-14 grid max-w-[68rem] items-center gap-6 lg:mt-20 lg:grid-cols-[1fr_1.5fr_1fr] lg:gap-10">
            <div className="order-2 grid grid-cols-2 gap-4 lg:order-1 lg:grid-cols-1 lg:gap-8">
              {supports.slice(0, 2).map((src, index) => (
                <AlbumPrint key={src} src={src} index={index} reduced={reduced} alt={index === 0 ? 'พิธีของเรา' : 'ช่วงหนึ่งในพิธีมงคลสมรส'} />
              ))}
            </div>
            <motion.figure
              initial={reduced ? false : { clipPath: 'inset(0 50% 0 50%)' }}
              whileInView={{ clipPath: 'inset(0 0% 0 0%)' }}
              viewport={{ once: true, margin: '0px 0px -15% 0px' }}
              transition={{ duration: 2.4, ease: [0.65, 0, 0.35, 1] }}
              className="ai-wedding-hero relative order-1 mx-auto w-full max-w-[34rem] lg:order-2"
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                <MemoryImage photo={moment.image} alt="วันแต่งงานของเรา" tone="cream" loading="lazy" objectPosition="50% 30%" className="ai-wedding-image" />
                <span aria-hidden="true" className="ai-wedding-glow absolute inset-0" />
              </div>
              <figcaption className="mt-4 text-center font-display text-base italic tracking-[0.1em] text-[#17324d]/70">our wedding</figcaption>
            </motion.figure>
            <div className="order-3 grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-8">
              {supports.slice(2, 4).map((src, index) => (
                <AlbumPrint key={src} src={src} index={index + 2} reduced={reduced} alt="ช่วงหนึ่งในวันแต่งงานของเรา" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function AlbumPrint({ src, index, reduced, alt }: { src: string; index: number; reduced: boolean; alt: string }) {
  return (
    <motion.figure
      initial={reduced ? false : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 1.8, delay: 0.9 + index * 0.25, ease: EASE }}
      className={cn('ai-album-print bg-[#fbf8f2] p-2 sm:p-2.5', index % 2 ? 'lg:ml-10' : 'lg:mr-10')}
    >
      <div className="aspect-[2/3] overflow-hidden">
        <MemoryImage photo={src} alt={alt} tone="cream" loading="lazy" objectPosition="50% 32%" />
      </div>
    </motion.figure>
  );
}

/* --------------------------------------------------------------- 20 DEC -- */
function Decision({ moment, reduced }: { moment: TimelineMoment; reduced: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const nearY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [40, -40]);
  const farY = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-10, 30]);
  const second = moment.images?.[0];
  return (
    <article ref={ref} id="decision" className="ai-decision relative w-full overflow-hidden px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div className="relative mx-auto grid w-full max-w-[80rem] gap-12 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-5">
          <ChapterMark index="08" label="OUR DECISION · อนาคตเดียวกัน" />
          <p aria-label="20 December 2025" className="mt-6 font-display text-[clamp(3.6rem,8.5vw,7.5rem)] font-light leading-[0.9] tracking-[-0.03em] text-ivory">
            20<span className="text-champagne">.</span>12<span className="block text-[0.42em] tracking-[0.14em] text-champagne">2025</span>
          </p>
          <h2 className="thai-display mt-8 font-thai text-[clamp(2rem,3.6vw,3.3rem)] font-light leading-[1.2] text-ivory">{moment.title}</h2>
          <p className="mt-4 font-thai text-[clamp(1rem,1.25vw,1.14rem)] leading-8 text-champagne">{moment.body}</p>
        </div>
        <div className="relative lg:col-span-7">
          <div className="relative mx-auto grid max-w-[40rem] grid-cols-[1.1fr_1fr] items-start gap-4 sm:gap-6">
            <motion.figure style={{ y: farY }} className="ai-decision-frame relative mt-12 overflow-hidden">
              <div className="aspect-[9/16]"><MemoryImage photo={moment.image} alt="วันที่เราตัดสินใจจดทะเบียนสมรสด้วยกัน" tone="champagne" loading="lazy" objectPosition="50% 40%" /></div>
            </motion.figure>
            {second ? (
              <motion.figure style={{ y: nearY }} className="ai-decision-frame relative overflow-hidden">
                <div className="aspect-[9/16]"><MemoryImage photo={second} alt="อีกภาพจากบ่ายวันเดียวกัน" tone="champagne" loading="lazy" objectPosition="50% 35%" /></div>
              </motion.figure>
            ) : null}
            <span aria-hidden="true" className="ai-decision-link pointer-events-none absolute left-[46%] top-1/2 h-px w-[12%] bg-champagne/70" />
          </div>
          <p className="mt-6 text-center font-mono text-[0.55rem] uppercase tracking-[0.3em] text-ivory/55">ONE AFTERNOON · TWO FRAMES</p>
        </div>
      </div>
    </article>
  );
}

/* --------------------------------------------------------- REGISTRATION -- */
function Registration({ moment, reduced }: { moment: TimelineMoment; reduced: boolean }) {
  return (
    <article id="registration" className="ai-registration relative w-full overflow-hidden px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
      <div className="relative mx-auto w-full max-w-[76rem]">
        <div className="ai-registration-sheet relative grid gap-10 px-5 py-10 sm:px-10 sm:py-12 lg:grid-cols-12 lg:gap-14 lg:px-14 lg:py-16">
          <span aria-hidden="true" className="absolute left-5 right-5 top-5 flex justify-between font-mono text-[0.5rem] uppercase tracking-[0.28em] text-ivory/45 sm:left-10 sm:right-10 lg:left-14 lg:right-14">
            <span>A&amp;I · RECORD</span>
            <span>28.07.2026</span>
          </span>
          <motion.figure
            initial={reduced ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '0px 0px -12% 0px' }}
            transition={{ duration: 1.6, ease: EASE }}
            className="relative mt-6 lg:col-span-6"
          >
            <div className="ai-registration-photo relative mx-auto aspect-[3/4] max-w-[30rem] overflow-hidden">
              <MemoryImage photo={moment.image} alt="วันจดทะเบียนสมรสของเรา ภาพที่ปิดรายละเอียดเอกสารแล้ว" tone="cream" loading="lazy" objectPosition="50% 45%" className="ai-registration-image" />
            </div>
          </motion.figure>
          <div className="relative flex flex-col justify-center lg:col-span-6">
            <ChapterMark index="09" label="REGISTRATION · จดทะเบียนสมรส" />
            <p aria-label="28 July 2026" className="mt-6 font-display text-[clamp(2.6rem,5vw,4.4rem)] font-light leading-none tracking-[0.02em] text-ivory">
              28 JUL 2026
            </p>
            <h2 className="thai-display mt-6 font-thai text-[clamp(2.1rem,3.8vw,3.4rem)] font-light leading-[1.2] text-ivory">{moment.title}</h2>
            <dl className="mt-8 border-t border-ivory/15">
              <LedgerRow term="วันที่" value="28 กรกฎาคม 2026" />
              <LedgerRow term="ก่อนหน้านั้น" value="พิธีมงคลสมรสของเรา" />
              <LedgerRow term="ความหมาย" value={moment.body} />
            </dl>
          </div>
        </div>
      </div>
    </article>
  );
}

function LedgerRow({ term, value }: { term: string; value: string }) {
  return (
    <div className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-ivory/15 py-4 sm:grid-cols-[8rem_1fr]">
      <dt className="font-mono text-[0.58rem] uppercase tracking-[0.24em] text-ivory/50">{term}</dt>
      <dd className="font-thai text-[0.98rem] leading-7 text-ivory/85">{value}</dd>
    </div>
  );
}
