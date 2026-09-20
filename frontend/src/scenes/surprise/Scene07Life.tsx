import { motion } from 'framer-motion';
import { SceneLabel, SceneSection } from '@/components/surprise/SceneSection';
import { MemoryFrame } from '@/components/surprise/MemoryFrame';
import { SecretCats } from '@/components/surprise/SecretCats';
import { anniversary } from '@/data/anniversary';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/cn';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * An editorial composition, not a tile grid.
 *
 * What was here was a four-column grid on fixed 10rem rows, which is a
 * LANDSCAPE cell — and every photograph in this group is portrait. The result
 * cropped the cats' faces and the top of the house. So the plates are laid out
 * by hand instead: one lead photograph, a column beside it, and a wide plate
 * that drops below the baseline so the block reads like a spread rather than a
 * contact sheet. Each plate keeps its own proportions.
 *
 * Captions are sentences about the photograph. The old ones were the slot's
 * internal `intent` string — "ภาพหนมถ้วย", "ภาพครอบครัว" — which describes the
 * slot to a developer, not the moment to the person reading it.
 */
interface Plate {
  id: string;
  photo?: string;
  /** What this is. Shown small, above the line. */
  eyebrow: string;
  /** The line itself. Written, not derived. */
  caption: string;
  tone: 'sky' | 'cream' | 'navy' | 'champagne';
  objectPosition?: string;
}

function plates(): Plate[] {
  const byId = (id: string) =>
    [...anniversary.familyMemories, ...anniversary.finalImages].find((slot) => slot.id === id);

  return [
    {
      id: 'together-now',
      photo: byId('family-01')?.image,
      eyebrow: 'วันนี้',
      caption: 'เรายังอยู่ด้วยกัน และยังเลือกกันอยู่ทุกวัน',
      tone: 'cream'
    },
    {
      id: 'kanomtuay',
      photo: byId('family-02')?.image,
      eyebrow: 'หนมถ้วย',
      caption: 'ตัวเล็กที่ชอบขึ้นที่สูง',
      tone: 'sky',
      // A kitten at the top of a cat tower: hold the frame high or lose its face.
      objectPosition: '50% 32%'
    },
    {
      id: 'tuayfu',
      photo: byId('family-03')?.image,
      eyebrow: 'ถ้วยฟู',
      caption: 'ตัวที่นอนเก่งที่สุดในบ้าน',
      tone: 'sky',
      objectPosition: '50% 45%'
    },
    {
      id: 'before',
      photo: byId('final-03')?.image,
      eyebrow: 'ก่อนถึงวันนั้น',
      caption: 'วันที่เราซ้อมเป็นวันของเรา',
      tone: 'champagne'
    }
  ];
}

export function Scene07Life() {
  const reduced = useReducedMotion();
  const [lead, ...rest] = plates();

  return (
    <SceneSection id="life" label="ชีวิตของเราด้วยกัน" fullHeight={false} className="overflow-hidden py-28 sm:py-36">
      <span aria-hidden="true" className="ai-warm-wash pointer-events-none absolute inset-0" />

      <div className="relative w-full max-w-6xl">
        <div className="max-w-3xl">
          <SceneLabel>07 · ชีวิตของเราด้วยกัน</SceneLabel>
          <h2 className="thai-display ai-legible mt-5 font-thai text-[clamp(2.15rem,4.4vw,3.75rem)] font-light leading-[1.18] text-ivory">
            จากเรื่องของคนสองคน
            <br />
            ค่อย ๆ กลายเป็นชีวิตที่เราสร้างด้วยกัน
          </h2>
          <p className="mt-6 max-w-xl font-thai text-base leading-8 text-ivory/65">
            บ้านที่กลับไป คนในครอบครัว เรื่องเล็ก ๆ ระหว่างวัน และแมวสองตัวที่ทำให้คำว่าเราใหญ่ขึ้นอีกหน่อย
          </p>
        </div>

        {/* The spread. One column on a phone — nothing is ever narrower than a
            readable photograph — and asymmetric from `lg` up. */}
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-12 lg:gap-7">
          {lead ? (
            <Plate plate={lead} index={0} reduced={reduced} className="sm:col-span-2 lg:col-span-7" />
          ) : null}

          <div className="grid gap-5 sm:col-span-2 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1 lg:gap-7">
            {rest.slice(0, 2).map((plate, index) => (
              <Plate key={plate.id} plate={plate} index={index + 1} reduced={reduced} />
            ))}
          </div>

          {/* Dropped below the baseline and inset, so the block has a rhythm
              instead of a grid line. */}
          {rest[2] ? (
            <Plate
              plate={rest[2]}
              index={3}
              reduced={reduced}
              className="sm:col-span-2 lg:col-span-6 lg:col-start-4 lg:mt-4"
            />
          ) : null}
        </div>

        {/*
          Two faint paw marks. They read as part of the sky until someone touches
          one. The cats are named on their own plates above, so this is only the
          joke that they come as a pair — the row of name pills that used to sit
          here said the same thing twice.
        */}
        <SecretCats className="mx-auto mt-16 h-16 w-full max-w-sm" />
      </div>
    </SceneSection>
  );
}

function Plate({
  plate,
  index,
  reduced,
  className
}: {
  plate: Plate;
  index: number;
  reduced: boolean;
  className?: string;
}) {
  return (
    <motion.figure
      initial={reduced ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1.1, delay: index * 0.08, ease: EASE }}
      className={cn('ai-frame-memory relative overflow-hidden', className)}
    >
      <MemoryFrame
        photo={plate.photo}
        alt={plate.caption}
        shape="editorial"
        tone={plate.tone}
        label={plate.eyebrow}
        index={index}
        objectPosition={plate.objectPosition}
      />
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/92 via-navy-900/35 to-transparent p-5 pt-14">
        <span className="block font-mono text-[0.5rem] uppercase tracking-[0.26em] text-sky-100/70">
          {plate.eyebrow}
        </span>
        <p className="mt-1.5 font-thai text-sm leading-6 text-ivory">{plate.caption}</p>
      </figcaption>
    </motion.figure>
  );
}
