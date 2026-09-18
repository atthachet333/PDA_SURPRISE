import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { SceneLabel, SceneSection, SceneTitle } from '@/components/surprise/SceneSection';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { anniversary, type TimelineMoment } from '@/data/anniversary';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { useAudio } from '@/app/audioContext';
import { preloadImages } from '@/lib/preload';
import { cn } from '@/lib/cn';

/**
 * Scene 08 — the story.
 *
 * Emotional job: NARRATIVE. Deliberately not a vertical timeline with dots.
 *
 * Every moment gets a different composition, chosen per entry in the config, so
 * the rhythm of the year is felt rather than listed. A moment that mattered
 * takes the full frame; a difficult week is text alone on an empty screen.
 */

const ENTER = { duration: 1.35, ease: [0.16, 1, 0.3, 1] as const };

export function Scene08Timeline() {
  const container = useRef<HTMLDivElement>(null);
  const [ref, inView] = useInViewOnce<HTMLDivElement>({ threshold: 0.05 });
  const { triggerCue } = useAudio();

  const { scrollYProgress } = useScroll({ target: container, offset: ['start end', 'end start'] });
  const threadScale = useTransform(scrollYProgress, [0.06, 0.9], [0, 1]);

  useEffect(() => {
    if (!inView) return;
    triggerCue('timeline');
    void preloadImages(
      anniversary.timeline.flatMap((moment) => [moment.image, ...(moment.images ?? [])])
    );
  }, [inView, triggerCue]);

  return (
    <SceneSection id="timeline" label="The story" fullHeight={false} className="py-28 sm:py-36">
      <div ref={container} className="relative w-full max-w-6xl">
        <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40" />

        <div className="text-center">
          <SceneLabel>The story</SceneLabel>
          <SceneTitle className="mt-5">How the year actually went.</SceneTitle>
        </div>

        {/* A single thread of light running the length of the story */}
        <motion.span
          aria-hidden="true"
          style={{ scaleY: threadScale }}
          className="absolute left-1/2 top-52 hidden h-[calc(100%-14rem)] w-px origin-top bg-gradient-to-b from-sky-300/45 via-sky-200/20 to-transparent lg:block"
        />

        <div className="mt-24 space-y-32 lg:space-y-44">
          {anniversary.timeline.map((moment, index) => (
            <Moment key={moment.id} moment={moment} index={index} />
          ))}
        </div>
      </div>
    </SceneSection>
  );
}

function Moment({ moment, index }: { moment: TimelineMoment; index: number }) {
  switch (moment.treatment) {
    case 'fullbleed':
      return <FullBleed moment={moment} index={index} />;
    case 'split':
      return <Split moment={moment} index={index} />;
    case 'polaroid':
      return <Polaroid moment={moment} index={index} />;
    case 'date':
      return <DateType moment={moment} index={index} />;
    case 'stack':
      return <Stack moment={moment} index={index} />;
    case 'textOnly':
      return <TextOnly moment={moment} />;
    case 'blurFocus':
      return <BlurFocus moment={moment} index={index} />;
    default:
      return <Split moment={moment} index={index} />;
  }
}

function Label({ moment, className }: { moment: TimelineMoment; className?: string }) {
  return (
    <span className={cn('font-mono text-[0.5625rem] uppercase tracking-[0.3em] text-sky-100/65', className)}>
      {moment.label}
      {moment.location ? ` · ${moment.location}` : ''}
    </span>
  );
}

/** 1. Full-bleed reveal — the frame opens to the whole width. */
function FullBleed({ moment, index }: { moment: TimelineMoment; index: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, scale: 1.08, filter: 'blur(14px)' }}
      whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -15% 0px' }}
      transition={{ ...ENTER, duration: 1.6 }}
      className="relative"
    >
      <figure className="ai-surface relative overflow-hidden rounded-panel shadow-glow">
        <span className="block aspect-[16/9] sm:aspect-[21/9]">
          <MemoryImage
            photo={moment.image}
            alt={moment.title}
            tone="champagne"
            label={moment.label}
            index={index}
          />
        </span>
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/25 to-transparent"
        />
        <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <Label moment={moment} />
          <h3 className="ai-legible mt-3 font-display text-[clamp(1.85rem,4.4vw,3.25rem)] font-light leading-tight text-ivory">
            {moment.title}
          </h3>
          <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-ivory/75">{moment.body}</p>
        </figcaption>
      </figure>
    </motion.article>
  );
}

/** 2. Split screen — image and text hold equal weight, alternating side. */
function Split({ moment, index }: { moment: TimelineMoment; index: number }) {
  const reduced = useReducedMotion();
  const flipped = index % 2 === 1;

  return (
    <article className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
      <motion.figure
        initial={reduced ? false : { opacity: 0, x: flipped ? 60 : -60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        transition={ENTER}
        className={cn('ai-surface overflow-hidden rounded-panel', flipped && 'lg:order-2')}
      >
        <span className="block aspect-[5/4]">
          <MemoryImage
            photo={moment.image}
            alt={moment.title}
            tone="sky"
            label={moment.label}
            index={index}
          />
        </span>
      </motion.figure>

      <motion.div
        initial={reduced ? false : { opacity: 0, x: flipped ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        transition={{ ...ENTER, delay: 0.12 }}
      >
        <Label moment={moment} />
        <h3 className="ai-legible mt-4 font-display text-[clamp(1.75rem,3.4vw,2.75rem)] font-light leading-tight text-ivory">
          {moment.title}
        </h3>
        <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ivory/70">{moment.body}</p>
      </motion.div>
    </article>
  );
}

/** 3. Floating polaroid — small, tilted, personal. */
function Polaroid({ moment, index }: { moment: TimelineMoment; index: number }) {
  const reduced = useReducedMotion();
  return (
    <article className="flex flex-col items-center gap-10 lg:flex-row lg:justify-center lg:gap-16">
      <motion.figure
        initial={reduced ? false : { opacity: 0, y: 60, rotate: -8 }}
        whileInView={{ opacity: 1, y: 0, rotate: -4 }}
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        transition={ENTER}
        className={cn(
          'w-[15rem] shrink-0 rounded-[4px] bg-cream p-3 pb-12 shadow-[0_30px_60px_-30px_rgba(12,27,41,0.95)] sm:w-[17rem]',
          !reduced && 'animate-drift'
        )}
        style={{ animationDuration: '11s' }}
      >
        <span className="block aspect-square overflow-hidden">
          <MemoryImage
            photo={moment.image}
            alt={moment.title}
            tone="cream"
            label={moment.label}
            index={index}
          />
        </span>
        <figcaption className="mt-4 text-center font-display text-sm italic text-navy-700">
          {moment.label}
        </figcaption>
      </motion.figure>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ ...ENTER, delay: 0.15 }}
        className="max-w-sm text-center lg:text-left"
      >
        <h3 className="ai-legible font-display text-[clamp(1.6rem,3vw,2.4rem)] font-light leading-tight text-ivory">
          {moment.title}
        </h3>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-ivory/70">{moment.body}</p>
      </motion.div>
    </article>
  );
}

/** 4. Oversized date typography — the date is the image. */
function DateType({ moment, index }: { moment: TimelineMoment; index: number }) {
  const reduced = useReducedMotion();
  return (
    <article className="relative text-center">
      <motion.p
        initial={reduced ? false : { opacity: 0, scale: 0.92, letterSpacing: '0.4em' }}
        whileInView={{ opacity: 1, scale: 1, letterSpacing: '0.04em' }}
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        transition={{ ...ENTER, duration: 1.8 }}
        className="font-display text-[clamp(3.5rem,13vw,9rem)] font-light leading-none text-ivory/12"
      >
        {moment.label}
      </motion.p>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ ...ENTER, delay: 0.2 }}
        className="relative -mt-[6vw] flex flex-col items-center"
      >
        <figure className="ai-surface w-[13rem] overflow-hidden rounded-panel shadow-glow sm:w-[16rem]">
          <span className="block aspect-[4/5]">
            <MemoryImage
              photo={moment.image}
              alt={moment.title}
              tone="champagne"
              label={moment.label}
              index={index}
            />
          </span>
        </figure>
        <h3 className="ai-legible mt-8 max-w-md font-display text-[clamp(1.6rem,3.2vw,2.5rem)] font-light leading-tight text-ivory">
          {moment.title}
        </h3>
        <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-ivory/70">{moment.body}</p>
      </motion.div>
    </article>
  );
}

/** 5. Photo stack — a small pile, fanned. */
function Stack({ moment, index }: { moment: TimelineMoment; index: number }) {
  const reduced = useReducedMotion();
  const images = moment.images?.length ? moment.images : [moment.image, undefined, undefined];
  const rotations = [-7, 3, 9];

  return (
    <article className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
      <div className="relative mx-auto h-[17rem] w-[13rem] sm:h-[21rem] sm:w-[16rem]">
        {images.slice(0, 3).map((image, stackIndex) => (
          <motion.figure
            key={stackIndex}
            initial={reduced ? false : { opacity: 0, y: 40, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: rotations[stackIndex] ?? 0 }}
            viewport={{ once: true, margin: '0px 0px -15% 0px' }}
            transition={{ ...ENTER, delay: stackIndex * 0.14 }}
            className="ai-surface absolute inset-0 overflow-hidden rounded-panel shadow-glow"
            style={{ zIndex: 3 - stackIndex }}
          >
            <span className="block h-full">
              <MemoryImage
                photo={image}
                alt={stackIndex === 0 ? moment.title : ''}
                tone={stackIndex === 0 ? 'sky' : 'navy'}
                label={stackIndex === 0 ? moment.label : undefined}
                index={index + stackIndex}
              />
            </span>
          </motion.figure>
        ))}
      </div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ ...ENTER, delay: 0.2 }}
      >
        <Label moment={moment} />
        <h3 className="ai-legible mt-4 font-display text-[clamp(1.6rem,3.2vw,2.5rem)] font-light leading-tight text-ivory">
          {moment.title}
        </h3>
        <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ivory/70">{moment.body}</p>
      </motion.div>
    </article>
  );
}

/** 6. Text only — an empty frame, on purpose. */
function TextOnly({ moment }: { moment: TimelineMoment }) {
  const reduced = useReducedMotion();
  return (
    <motion.article
      initial={reduced ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '0px 0px -20% 0px' }}
      transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
      className="mx-auto max-w-lg py-10 text-center"
    >
      <Label moment={moment} />
      <h3 className="ai-legible mt-6 font-display text-[clamp(1.75rem,3.8vw,2.75rem)] font-light italic leading-snug text-ivory/90">
        {moment.title}
      </h3>
      <p className="mt-5 text-[0.95rem] leading-relaxed text-ivory/60">{moment.body}</p>
      <span aria-hidden="true" className="mx-auto mt-10 block h-px w-16 bg-sky-200/25" />
    </motion.article>
  );
}

/** 7. Blurred backdrop with a sharp foreground plate. */
function BlurFocus({ moment, index }: { moment: TimelineMoment; index: number }) {
  const reduced = useReducedMotion();
  return (
    <article className="relative flex min-h-[26rem] items-center justify-center overflow-hidden rounded-panel">
      <motion.span
        aria-hidden="true"
        initial={reduced ? false : { opacity: 0, scale: 1.2 }}
        whileInView={{ opacity: 0.55, scale: 1.1 }}
        viewport={{ once: true }}
        transition={{ ...ENTER, duration: 2 }}
        className="absolute inset-0 blur-xl"
      >
        <MemoryImage photo={moment.image} alt="" tone="sky" index={index} />
      </motion.span>
      <span aria-hidden="true" className="absolute inset-0 bg-navy-900/45" />

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 36, scale: 0.94 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        transition={{ ...ENTER, delay: 0.18 }}
        className="relative z-10 flex flex-col items-center gap-7 px-6 py-14 text-center sm:flex-row sm:gap-9 sm:text-left"
      >
        <figure className="ai-glass w-[11rem] shrink-0 overflow-hidden rounded-panel shadow-glow-lg sm:w-[13rem]">
          <span className="block aspect-[4/5]">
            <MemoryImage
              photo={moment.image}
              alt={moment.title}
              tone="sky"
              label={moment.label}
              index={index}
            />
          </span>
        </figure>
        <div className="max-w-sm">
          <Label moment={moment} />
          <h3 className="ai-legible mt-3 font-display text-[clamp(1.6rem,3.2vw,2.4rem)] font-light leading-tight text-ivory">
            {moment.title}
          </h3>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ivory/75">{moment.body}</p>
        </div>
      </motion.div>
    </article>
  );
}
