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
 *   ร้าน Peak        — จุดเริ่มต้น. Where the story starts. No photograph exists,
 *                      and no date was ever given, so it is carried by words.
 *   ร้าน TURR เกษตร  — 12 OCT 2025. The night he asked her to be his partner.
 *                      This one has photographs and a date.
 *
 * An earlier pass collapsed the two, putting "จุดเริ่มต้น · 12 OCT 2025" over a
 * TURR photograph. Keeping them apart is the point of this scene's shape: the
 * beginning has no image on purpose, and the milestone is what the image is of.
 */
export function Scene03Journey() {
  const reduced = useReducedMotion();
  /* First real photograph in the experience, so it does not wait for an
     observer. It is the TURR frame — see the note above. */
  const hero = anniversary.heroImages[0];
  const beginning = anniversary.memories.find((memory) => memory.id === 'm00');

  return (
    <SceneSection id="beginning" label="จุดเริ่มต้น" className="overflow-hidden">
      <div className="flex w-full max-w-6xl flex-col gap-20 lg:gap-28">
        {/* ── BEAT ONE: the beginning. Words only. ────────────────────────── */}
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -18% 0px' }}
          transition={{ duration: 1.25, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <SceneLabel>02 · จุดเริ่มต้น</SceneLabel>
          <h2 className="thai-display ai-legible mt-6 font-thai text-[clamp(2.25rem,5.5vw,4.25rem)] font-light text-ivory">
            ทุกอย่างเริ่มจากร้านเล็ก ๆ ร้านหนึ่ง
          </h2>
          <p className="mt-7 font-thai text-[clamp(1rem,1.7vw,1.2rem)] leading-8 text-ivory/70">
            {beginning?.title} — {beginning?.caption}
            <br />
            ไม่มีรูปของคืนนั้น มีแค่เราสองคนที่จำได้
          </p>
          <span
            aria-hidden="true"
            className="mx-auto mt-12 block h-16 w-px bg-gradient-to-b from-sky-200/50 to-transparent"
          />
        </motion.div>

        {/* ── BEAT TWO: the milestone. This is what 12 OCT 2025 means. ────── */}
        <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <motion.div
            initial={reduced ? false : { opacity: 0, x: -36 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '0px 0px -18% 0px' }}
            transition={{ duration: 1.25, ease: EASE }}
            className="order-2 lg:order-1"
          >
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.3em] text-sky-100/70">
              12 OCT 2025
            </p>
            <h3 className="thai-display ai-legible mt-5 font-thai text-[clamp(1.9rem,4.4vw,3.4rem)] font-light text-ivory">
              วันที่เราเริ่มเป็น “เรา”
            </h3>
            <p className="mt-6 font-thai text-[clamp(0.95rem,1.5vw,1.1rem)] leading-8 text-ivory/70">
              ร้าน TURR เกษตร — คืนที่เขาชวนเธอมาเป็นแฟน
              <br />
              และเป็นวันที่เรานับมาตลอดตั้งแต่นั้น
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
            className="ai-frame-cinematic ai-photo-spill relative order-1 mx-auto w-full max-w-md overflow-hidden shadow-glow-lg lg:order-2 lg:max-w-lg"
          >
            {/* Portrait photograph, portrait frame: `MemoryFrame` takes the
                aspect from the file rather than imposing one on it. */}
            <MemoryFrame
              photo={hero?.image}
              alt="คืนที่ร้าน TURR เกษตร"
              shape="editorial"
              label="12 OCT 2025"
              tone="cream"
              loading="eager"
              objectPosition={hero?.objectPosition}
            />
            <figcaption className="flex items-center justify-between border-t border-sky-200/10 px-5 py-4 font-mono text-[0.5rem] uppercase tracking-[0.2em] text-ivory/50">
              <span>{anniversary.couple.initials}</span>
              <span>DAY 001</span>
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </SceneSection>
  );
}
