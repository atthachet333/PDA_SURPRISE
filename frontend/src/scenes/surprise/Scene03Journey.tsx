import { motion } from 'framer-motion';
import { SceneLabel, SceneSection } from '@/components/surprise/SceneSection';
import { MemoryFrame } from '@/components/surprise/MemoryFrame';
import { anniversary } from '@/data/anniversary';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * The beginning — and then the day it became official. Two beats, not one.
 *
 * THESE ARE DIFFERENT THINGS, and the owner has been explicit about it:
 *
 *   ร้าน Peak        — จุดเริ่มต้น. Where they first met. Both supplied photos
 *                      are owner-confirmed as this venue; no date was given.
 *   ร้าน TURR เกษตร  — 12 OCT 2025. The night he asked her to be his partner.
 *                      This remains a distinct, text-only milestone.
 *
 * An earlier pass collapsed the two, putting "จุดเริ่มต้น · 12 OCT 2025" over a
 * Peak photograph mislabelled as TURR. Keeping them apart is the point of this scene's shape: the
 * beginning carries the Peak image; TURR does not borrow it.
 */
export function Scene03Journey() {
  const reduced = useReducedMotion();
  /* First real photograph in the experience, so it does not wait for an
     observer. It is the owner-confirmed Peak frame — see the note above. */
  const hero = anniversary.heroImages[0];
  const beginning = anniversary.memories.find((memory) => memory.id === 'm00');

  return (
    <SceneSection id="beginning" label="จุดเริ่มต้น" className="overflow-hidden">
      <div className="flex w-full max-w-6xl flex-col gap-20 lg:gap-28">
        {/* ── BEAT ONE: the photographed beginning at Peak. ───────────────── */}
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <motion.div
            initial={reduced ? false : { opacity: 0, x: -36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '0px 0px -18% 0px' }}
            transition={{ duration: 1.25, ease: EASE }}
            /* Text leads on narrow screens. With the photograph first, jumping
               to this scene on a phone landed on the image and pushed the
               heading to y=807 on an 844px viewport — effectively below the
               fold. The two-column order is unchanged from `lg` up. */
            className="lg:order-1"
          >
            <SceneLabel>02 · จุดเริ่มต้น</SceneLabel>
            <h2 className="thai-display ai-legible mt-5 font-thai text-[clamp(1.9rem,4.4vw,3.4rem)] font-light text-ivory">
              ครั้งแรกที่เราได้เจอกัน
            </h2>
            <p className="ai-one-line-desktop mt-6 font-thai text-[clamp(0.95rem,1.35vw,1.075rem)] leading-8 text-ivory/70">
              {beginning?.title} — {beginning?.caption}
            </p>
            <div className="mt-10 flex items-center gap-5">
              <span className="font-display text-4xl font-light text-ivory">{anniversary.couple.shortA}</span>
              <span
                aria-hidden="true"
                className="h-px w-16 bg-gradient-to-r from-sky-200/20 via-sky-200/80 to-sky-200/20"
              />
              <span className="font-display text-4xl font-light text-ivory">{anniversary.couple.shortB}</span>
            </div>
          </motion.div>

          <motion.figure
            initial={reduced ? false : { opacity: 0, y: 44, rotate: 2 }}
            whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
            viewport={{ once: true, margin: '0px 0px -18% 0px' }}
            transition={{ duration: 1.45, delay: 0.12, ease: EASE }}
            className="ai-frame-cinematic ai-photo-spill relative mx-auto w-full max-w-md overflow-hidden shadow-glow-lg lg:order-2 lg:max-w-lg"
          >
            {/* Portrait photograph, portrait frame: `MemoryFrame` takes the
                aspect from the file rather than imposing one on it. */}
            <MemoryFrame
              photo={hero?.image}
              alt="ร้าน Peak — ร้านที่เราเจอกันครั้งแรก"
              shape="editorial"
              label="จุดเริ่มต้น"
              tone="cream"
              loading="eager"
              objectPosition={hero?.objectPosition}
            />
            <figcaption className="flex items-center justify-between border-t border-sky-200/10 px-5 py-4 font-mono text-[0.5rem] uppercase tracking-[0.2em] text-ivory/50">
              <span>{anniversary.couple.initials}</span>
              <span>ร้าน Peak</span>
            </figcaption>
          </motion.figure>
        </div>

        {/* ── BEAT TWO: the distinct, text-only TURR milestone. ───────────── */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -18% 0px' }}
          transition={{ duration: 1.25, ease: EASE }}
          className="relative mx-auto w-full max-w-5xl py-8 text-center sm:py-16"
        >
          <span aria-hidden="true" className="absolute left-1/2 top-0 h-px w-[min(76vw,42rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-champagne/65 to-transparent" />
          <p className="font-display text-[clamp(3.25rem,10vw,8.5rem)] font-light leading-none tracking-[-0.04em] text-champagne">
            12 OCT
          </p>
          <p className="mt-2 font-display text-[clamp(2rem,6vw,5rem)] font-light leading-none text-ivory/85">2025</p>
          <p className="mt-7 font-mono text-[0.625rem] uppercase tracking-[0.34em] text-sky-100/65">TURR · KASET</p>
          <h3 className="thai-display ai-legible mt-6 font-thai text-[clamp(2.2rem,5.2vw,4.25rem)] font-light text-ivory">
            วันที่เราเริ่มเป็น “เรา”
          </h3>
          <p className="mx-auto mt-7 max-w-2xl font-thai text-[clamp(1rem,1.6vw,1.2rem)] leading-9 text-ivory/72">
            ร้าน TURR เกษตร — คืนที่เขาชวนเธอมาเป็นแฟน
            <br />
            และเป็นวันที่เรานับมาตลอดตั้งแต่นั้น
          </p>
          <span aria-hidden="true" className="mx-auto mt-10 block h-2 w-2 rounded-full bg-champagne shadow-[0_0_32px_rgba(235,217,188,0.85)]" />
        </motion.div>
      </div>
    </SceneSection>
  );
}
