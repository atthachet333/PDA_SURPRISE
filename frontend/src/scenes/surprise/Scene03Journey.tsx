import { motion } from 'framer-motion';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { SceneSection } from '@/components/surprise/SceneSection';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const EASE = [0.16, 1, 0.3, 1] as const;
const PEAK_PHOTO = '/images/memories/peak-01.webp';
/* Owner-confirmed 2026-09-22: this purple venue photograph is the night the
   relationship began at TURR Kaset. The historical filename is intentionally
   left alone so this focused prototype does not churn the media archive. */
const TURR_PHOTO = '/images/memories/peak-02.webp';

/** Two editorial scenes grouped under the existing "เรื่องของเรา" navigation. */
export function Scene03Journey() {
  const reduced = useReducedMotion();

  return (
    <SceneSection
      id="beginning"
      label="จุดเริ่มต้น"
      fullHeight={false}
      className="overflow-hidden px-0 py-0 sm:px-0"
    >
      <PeakScene reduced={reduced} />
      <TurrScene reduced={reduced} />
    </SceneSection>
  );
}

function PeakScene({ reduced }: { reduced: boolean }) {
  return (
    <article id="peak" className="ai-prototype-peak relative flex min-h-[100svh] w-full items-center overflow-hidden px-6 py-24 sm:px-8 lg:px-12">
      <span aria-hidden="true" className="ai-peak-orbit absolute -left-48 top-[12%] h-[34rem] w-[34rem] rounded-full border border-sky-200/10" />
      <span aria-hidden="true" className="absolute right-[8%] top-[16%] h-px w-28 bg-gradient-to-r from-transparent via-champagne/60 to-transparent" />

      <div className="relative mx-auto grid w-full max-w-[86rem] items-center gap-11 lg:grid-cols-[minmax(0,1.58fr)_minmax(20rem,0.92fr)] lg:gap-16 xl:gap-20">
        <motion.figure
          initial={reduced ? false : { opacity: 0, x: -48, scale: 1.035 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, margin: '0px 0px -12% 0px' }}
          transition={{ duration: 1.45, ease: EASE }}
          className="relative order-1 mx-auto w-full max-w-[46rem] lg:mx-0 lg:max-w-none"
        >
          <div className="ai-prototype-photo ai-peak-photo relative aspect-[4/5] max-h-[74svh] overflow-hidden lg:aspect-[6/5] lg:max-h-[68svh]">
            <MemoryImage
              photo={PEAK_PHOTO}
              alt="ร้าน Peak — ร้านที่เราเจอกันครั้งแรก"
              tone="champagne"
              loading="eager"
              objectPosition="50% 43%"
              className="ai-peak-image"
            />
            <span aria-hidden="true" className="ai-peak-highlight absolute inset-0" />
            <span className="absolute bottom-5 left-5 font-mono text-[0.5rem] uppercase tracking-[0.28em] text-ivory/65 sm:bottom-7 sm:left-7">
              A&amp;I · THE FIRST PAGE
            </span>
          </div>
          <span aria-hidden="true" className="absolute -bottom-5 left-0 h-px w-[82%] bg-gradient-to-r from-champagne/80 via-champagne/25 to-transparent" />
          <span aria-hidden="true" className="absolute -bottom-8 left-0 font-display text-[0.65rem] tracking-[0.28em] text-champagne/55">01 / PEAK</span>
        </motion.figure>

        <motion.div
          initial={reduced ? false : { opacity: 0, x: 38 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '0px 0px -12% 0px' }}
          transition={{ duration: 1.2, delay: 0.14, ease: EASE }}
          className="order-2 pb-3 lg:pb-0"
        >
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.34em] text-sky-100/70">FIRST MEETING · จุดเริ่มต้น</p>
          <span aria-hidden="true" className="mt-5 block h-px w-20 bg-champagne/70" />
          <h2 className="thai-display mt-7 font-thai text-[clamp(3.1rem,6.8vw,6.5rem)] font-light leading-[0.94] text-ivory">ร้าน Peak</h2>
          <p className="mt-7 font-thai text-[clamp(1.05rem,1.45vw,1.25rem)] leading-8 text-champagne">ร้านที่เราเจอกันครั้งแรก</p>
          <p className="mt-8 max-w-md whitespace-pre-line font-thai text-[clamp(1rem,1.25vw,1.125rem)] leading-9 text-ivory/72">
            {'ตอนนั้นเรายังไม่รู้เลยว่า\nการเจอกันธรรมดาในวันนั้น\nจะพาเรามาไกลถึงขนาดนี้'}
          </p>
          <div aria-hidden="true" className="mt-10 flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-champagne shadow-[0_0_18px_rgba(235,217,188,0.8)]" />
            <span className="font-display text-xs italic tracking-[0.18em] text-ivory/42">where everything quietly started</span>
          </div>
        </motion.div>
      </div>
    </article>
  );
}

function TurrScene({ reduced }: { reduced: boolean }) {
  return (
    <article id="relationship-start" className="ai-prototype-turr relative flex min-h-[100svh] w-full items-center overflow-hidden border-y border-sky-200/10 px-6 py-24 sm:px-8 lg:px-12">
      <span aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_78%_48%,rgba(176,82,210,0.16),transparent_42%),radial-gradient(circle_at_20%_65%,rgba(126,200,255,0.08),transparent_40%)]" />
      <ConvergingTrails />

      <div className="relative mx-auto grid w-full max-w-[86rem] items-center gap-10 lg:grid-cols-[minmax(20rem,0.88fr)_minmax(0,1.12fr)] lg:gap-16">
        <motion.div
          initial={reduced ? false : { opacity: 0, x: -34 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '0px 0px -12% 0px' }}
          transition={{ duration: 1.25, ease: EASE }}
          className="order-2 relative z-10 lg:order-1"
        >
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.32em] text-fuchsia-100/70">OUR BEGINNING · 12 OCT 2025</p>
          <div className="mt-6 font-display font-light leading-[0.78] text-ivory" aria-label="12 October 2025">
            <span className="block text-[clamp(5.25rem,11vw,10rem)] tracking-[-0.055em]">12 OCT</span>
            <span className="ml-1 mt-4 block text-[clamp(2.75rem,6vw,5.5rem)] tracking-[0.04em] text-champagne">2025</span>
          </div>
          <span aria-hidden="true" className="mt-8 block h-px w-full max-w-sm bg-gradient-to-r from-champagne/75 via-fuchsia-200/35 to-transparent" />
          <h2 className="thai-display mt-8 max-w-xl font-thai text-[clamp(2.25rem,4.5vw,4.4rem)] font-light leading-[1.12] text-ivory">วันที่เราเริ่มเป็น “เรา”</h2>
          <p className="mt-6 font-thai text-[clamp(1rem,1.35vw,1.15rem)] leading-8 text-champagne">ร้าน TURR เกษตร · คืนที่ขอเธอเป็นแฟน</p>
          <p className="mt-7 max-w-lg whitespace-pre-line font-thai text-[clamp(1rem,1.2vw,1.1rem)] leading-9 text-ivory/72">
            {'จากคนสองคนในคืนนั้น\nกลายเป็นคำว่า “เรา”\nตั้งแต่วันนั้นเป็นต้นมา'}
          </p>
        </motion.div>

        <motion.figure
          initial={reduced ? false : { opacity: 0, x: 42, scale: 1.04 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, margin: '0px 0px -12% 0px' }}
          transition={{ duration: 1.5, delay: 0.08, ease: EASE }}
          className="order-1 relative mx-auto w-full max-w-[34rem] lg:order-2 lg:mr-0"
        >
          <div className="ai-prototype-photo ai-turr-photo relative aspect-[4/5] max-h-[76svh] overflow-hidden">
            <MemoryImage
              photo={TURR_PHOTO}
              alt="คืนที่ขอเธอเป็นแฟนที่ร้าน TURR เกษตร 12 ตุลาคม 2025"
              tone="navy"
              loading="eager"
              objectPosition="50% 45%"
              className="ai-turr-image"
            />
            <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0c1226]/70 via-transparent to-fuchsia-950/10" />
            <figcaption className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-5 sm:bottom-8 sm:left-8 sm:right-8">
              <span className="font-mono text-[0.5rem] uppercase tracking-[0.26em] text-ivory/65">TURR · KASET</span>
              <span className="font-display text-sm italic text-champagne/75">the night we became us</span>
            </figcaption>
          </div>
          <span aria-hidden="true" className="ai-turr-pulse absolute -left-2 top-[61%] h-3 w-3 rounded-full bg-champagne" />
        </motion.figure>
      </div>
    </article>
  );
}

function ConvergingTrails() {
  return (
    <svg aria-hidden="true" viewBox="0 0 1440 900" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full opacity-70">
      <defs>
        <linearGradient id="turr-trail-a" x1="0" x2="1"><stop offset="0" stopColor="#7ec8ff" stopOpacity="0" /><stop offset="0.62" stopColor="#7ec8ff" stopOpacity="0.38" /><stop offset="1" stopColor="#ebd9bc" stopOpacity="0.78" /></linearGradient>
        <linearGradient id="turr-trail-b" x1="0" x2="1"><stop offset="0" stopColor="#d99bea" stopOpacity="0" /><stop offset="0.62" stopColor="#d99bea" stopOpacity="0.35" /><stop offset="1" stopColor="#ebd9bc" stopOpacity="0.78" /></linearGradient>
      </defs>
      <path className="ai-turr-trail ai-turr-trail-one" d="M -80 155 C 285 170, 430 410, 790 530" fill="none" stroke="url(#turr-trail-a)" strokeWidth="1.2" />
      <path className="ai-turr-trail ai-turr-trail-two" d="M -80 760 C 280 720, 480 600, 790 530" fill="none" stroke="url(#turr-trail-b)" strokeWidth="1.2" />
      <circle className="ai-turr-convergence" cx="790" cy="530" r="5" fill="#ebd9bc" />
    </svg>
  );
}
