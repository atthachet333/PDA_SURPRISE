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
            className="order-2 lg:order-1"
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
            className="ai-frame-cinematic ai-photo-spill relative order-1 mx-auto w-full max-w-md overflow-hidden shadow-glow-lg lg:order-2 lg:max-w-lg"
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
          className="mx-auto max-w-2xl text-center"
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
        </motion.div>
      </div>
    </SceneSection>
  );
}
