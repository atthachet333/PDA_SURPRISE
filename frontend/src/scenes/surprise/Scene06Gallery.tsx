import { motion } from 'framer-motion';
import { SceneLabel, SceneSection, SceneTitle } from '@/components/surprise/SceneSection';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { frameStyle } from '@/lib/mediaAspect';
import { LITTLE_MOMENTS_MEDIA } from '@/data/storyMedia';

const EASE = [0.16, 1, 0.3, 1] as const;
const STRIP_ALTS = ['วันธรรมดาที่พิเศษ', 'เราในอีกวันหนึ่ง', 'ทะเลและแสงแดด'];

/**
 * An editorial opening spread for the real photo story.
 *
 * The former implementation was a rotating card carousel with faded neighbours
 * and a framed centre card. The owner explicitly rejected that language. This
 * spread replaces it with one new, visually distinct Drive photograph, then an
 * asymmetric pair and a film strip: photographs lead, interface chrome recedes.
 */
export function Scene06Gallery() {
  const reduced = useReducedMotion();

  return (
    <SceneSection id="little-moments" label="โมเมนต์เล็ก ๆ" className="overflow-hidden" fullHeight={false}>
      <div className="w-full max-w-[90rem] py-12 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <SceneLabel>03 · โมเมนต์เล็ก ๆ ของเรา</SceneLabel>
          <SceneTitle className="thai-display mt-5 font-thai">เรื่องจริงของเรา<br />อยู่ในภาพพวกนี้</SceneTitle>
          <p className="mx-auto mt-6 max-w-xl font-thai text-base leading-8 text-ivory/65">
            ไม่ได้มีแค่วันสำคัญ บางครั้งความทรงจำที่ชัดที่สุดก็คือถนนหนึ่งเส้น ทะเลหนึ่งวัน และคนเดิมที่อยู่ข้างกัน
          </p>
        </div>

        <motion.figure
          initial={reduced ? false : { y: 32 }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: '0px 0px -12% 0px' }}
          transition={{ duration: 1.25, ease: EASE }}
          className="relative mt-14 overflow-hidden sm:mt-20"
        >
          <div className="aspect-[5/4] sm:aspect-[16/8] lg:aspect-[21/9]">
            <MemoryImage
              photo={LITTLE_MOMENTS_MEDIA.wide}
              alt="การเดินทางด้วยกันบนถนนสายหนึ่ง"
              tone="navy"
              loading="eager"
              cropMode="cover"
              objectPosition="50% 52%"
            />
          </div>
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/85 via-navy-900/15 to-transparent px-6 pb-6 pt-24 sm:px-10 sm:pb-9">
            <p className="font-thai text-lg text-ivory sm:text-xl">ถนนยาว ๆ กับคนข้างหลัง</p>
            <p className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.26em] text-sky-100/65">ONE ROAD · TWO OF US</p>
          </figcaption>
        </motion.figure>

        <div className="mt-5 grid gap-5 sm:grid-cols-12 sm:items-end lg:mt-8 lg:gap-8">
          <EditorialPhoto
            photo={LITTLE_MOMENTS_MEDIA.sarika}
            alt="ทริปน้ำตกสาริกา"
            caption="น้ำตกสาริกา"
            className="sm:col-span-7"
            index={1}
          />
          <EditorialPhoto
            photo={LITTLE_MOMENTS_MEDIA.suanphueng}
            alt="ความทรงจำที่สวนผึ้ง"
            caption="ปลายปีที่สวนผึ้ง"
            className="sm:col-span-5 sm:mb-10"
            index={2}
          />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-5">
          {LITTLE_MOMENTS_MEDIA.strip.map((photo, index) => (
            <motion.figure
              key={photo}
              initial={reduced ? false : { y: 18 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: index * 0.08, ease: EASE }}
              className="aspect-[3/4] overflow-hidden even:translate-y-4 sm:even:translate-y-8"
            >
              <MemoryImage photo={photo} alt={STRIP_ALTS[index] ?? ''} tone="sky" loading="lazy" cropMode="cover" />
            </motion.figure>
          ))}
        </div>
      </div>
    </SceneSection>
  );
}
/**
 * An editorial plate that takes its proportions from the photograph.
 *
 * It used to take a hand-written aspect, and the pair here were set to
 * `aspect-[4/5] sm:aspect-[4/3]` and `aspect-[4/5]`. Both photographs are
 * portrait, so the 4/3 box was showing 56% of น้ำตกสาริกา — a landscape frame
 * imposed on an upright picture, which is the exact problem `mediaAspect`
 * exists to prevent and which the rest of the experience already routes
 * through. The asymmetry of the pair still comes from the column spans and the
 * bottom offset, not from cropping one of them in half.
 */
function EditorialPhoto({
  photo,
  alt,
  caption,
  className,
  index
}: {
  photo: string;
  alt: string;
  caption: string;
  className: string;
  index: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.figure
      initial={reduced ? false : { y: 24 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1.05, delay: index * 0.08, ease: EASE }}
      className={className}
    >
      <div className="overflow-hidden" style={frameStyle(photo, 'editorial')}>
        <MemoryImage photo={photo} alt={alt} tone="cream" loading="lazy" cropMode="cover" />
      </div>
      <figcaption className="mt-3 font-thai text-sm text-ivory/65">{caption}</figcaption>
    </motion.figure>
  );
}
