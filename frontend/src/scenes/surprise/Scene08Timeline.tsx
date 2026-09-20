import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { SceneLabel, SceneSection, SceneTitle } from '@/components/surprise/SceneSection';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { MemoryBleed, MemoryFrame } from '@/components/surprise/MemoryFrame';
import { frameStyle } from '@/lib/mediaAspect';
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
    <SceneSection id="journey" label="เส้นทางของเรา" fullHeight={false} className="py-28 sm:py-36">
      <div ref={container} className="relative w-full max-w-6xl">
        <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40" />

        <div className="text-center">
          <SceneLabel>04 · เส้นทางของเรา</SceneLabel>
          <SceneTitle className="thai-display mt-5 font-thai">จากวันแรก มาถึงวันนี้</SceneTitle>
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

/**
 * 1. Full-bleed reveal — the frame opens to the whole width.
 *
 * It used to open to a 21/9 band, which removed about two thirds of a portrait
 * photograph. `MemoryBleed` keeps the full-width moment but shows the
 * photograph whole; see `components/surprise/MemoryFrame`.
 */
function FullBleed({ moment, index }: { moment: TimelineMoment; index: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.article
      /* The entrance moves the frame; it does NOT reveal it. Opacity is
         deliberately absent: with `opacity: 0` here, every photograph in the
         story was measured sitting invisible whenever the entrance did not
         resolve. A photo that slides is a nice touch; a photo that is missing
         is a broken page. */
      initial={reduced ? false : { scale: 1.06 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -15% 0px' }}
      transition={{ ...ENTER, duration: 1.6 }}
      className="relative"
    >
      <figure className="ai-frame-cinematic ai-photo-spill relative overflow-hidden shadow-glow">
        <MemoryBleed
          photo={moment.image}
          alt={moment.title}
          tone="champagne"
          label={moment.label}
          index={index}
          objectPosition={moment.objectPosition}
        />
        {/* The caption sits over the lower third, so the gradient only needs to
            reach that far — it must not wash out the photograph above it. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-navy-900/95 via-navy-900/45 to-transparent"
        />
        <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <Label moment={moment} />
          <h3 className="ai-legible mt-3 font-display text-[clamp(1.85rem,4.4vw,3.25rem)] font-light leading-tight text-ivory">
            {moment.title}
          </h3>
          <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-ivory/75">{moment.body}</p>
        </figcaption>
      </figure>
      {moment.images?.length ? (
        <div className="mx-auto mt-6 grid max-w-4xl gap-5 sm:grid-cols-2 sm:gap-7">
          {moment.images.map((image, supportIndex) => (
            <motion.figure
              key={image}
              /* Supporting photographs, same rule as the plate above: the
                 entrance moves them, it does not decide whether they exist. */
              initial={reduced ? false : { y: 26 }}
              whileInView={{ y: 0 }}
              viewport={{ once: true, margin: '0px 0px -12% 0px' }}
              transition={{ ...ENTER, delay: 0.12 + supportIndex * 0.1 }}
              className={cn('ai-frame-memory overflow-hidden', supportIndex === 1 && 'sm:mt-12')}
            >
              <MemoryFrame
                photo={image}
                alt={`${moment.title} ${supportIndex + 2}`}
                shape="editorial"
                tone="cream"
                index={index + supportIndex + 1}
                loading="lazy"
              />
            </motion.figure>
          ))}
        </div>
      ) : null}
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
      /* The entrance moves the frame; it does NOT reveal it. Opacity is
         deliberately absent: with `opacity: 0` here, every photograph in the
         story was measured sitting invisible whenever the entrance did not
         resolve. A photo that slides is a nice touch; a photo that is missing
         is a broken page. */
        initial={reduced ? false : { x: flipped ? 48 : -48 }}
        whileInView={{ x: 0 }}
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        transition={ENTER}
        className={cn('ai-frame-cinematic overflow-hidden', flipped && 'lg:order-2')}
      >
        {/* Aspect from the photograph, not from the grid. */}
        <span className="block" style={frameStyle(moment.image, 'editorial')}>
          <MemoryImage
            photo={moment.image}
            alt={moment.title}
            tone="sky"
            label={moment.label}
            index={index}
            objectPosition={moment.objectPosition}
            cropMode={moment.cropMode}
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
      /* The entrance moves the frame; it does NOT reveal it. Opacity is
         deliberately absent: with `opacity: 0` here, every photograph in the
         story was measured sitting invisible whenever the entrance did not
         resolve. A photo that slides is a nice touch; a photo that is missing
         is a broken page. */
        initial={reduced ? false : { y: 48, rotate: -8 }}
        whileInView={{ y: 0, rotate: -4 }}
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        transition={ENTER}
        className={cn(
          'ai-frame-polaroid w-[15rem] shrink-0 bg-cream p-3 pb-12 shadow-[0_30px_60px_-30px_rgba(12,27,41,0.95)] sm:w-[17rem]',
          !reduced && 'animate-drift'
        )}
        style={{ animationDuration: '11s' }}
      >
        {/* A print is nearly square by nature, so this shape crops a little —
            but symmetrically, and only by a few percent. */}
        <span className="block overflow-hidden" style={frameStyle(moment.image, 'square')}>
          <MemoryImage
            photo={moment.image}
            alt={moment.title}
            tone="cream"
            label={moment.label}
            index={index}
            objectPosition={moment.objectPosition}
            cropMode={moment.cropMode}
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
        className={cn('relative flex flex-col items-center', moment.image ? '-mt-[6vw]' : 'mt-8')}
      >
        {moment.image ? (
          <figure className="ai-frame-memory w-[13rem] overflow-hidden shadow-glow sm:w-[16rem]">
            <span className="block" style={frameStyle(moment.image, 'tall')}>
              <MemoryImage
                photo={moment.image}
                alt={moment.title}
                tone="champagne"
                label={moment.label}
                index={index}
                objectPosition={moment.objectPosition}
                cropMode={moment.cropMode}
              />
            </span>
          </figure>
        ) : null}
        <h3 className="ai-legible mt-8 max-w-md font-display text-[clamp(1.6rem,3.2vw,2.5rem)] font-light leading-tight text-ivory">
          {moment.title}
        </h3>
        <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-ivory/70">{moment.body}</p>
      </motion.div>
    </article>
  );
}

/** 5. Editorial sequence — one generous frame plus a supporting filmstrip. */
function Stack({ moment, index }: { moment: TimelineMoment; index: number }) {
  const reduced = useReducedMotion();
  const images = [moment.image, ...(moment.images ?? [])].filter(
    (image): image is string => Boolean(image)
  );
  const [active, setActive] = useState(0);
  const activeImage = images[active] ?? images[0];

  return (
    <article
      className="grid items-center gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16"
      data-editorial-sequence="true"
    >
      {/* No `key` here on purpose. Keying by the active photograph remounted
          the plate on every thumbnail press, which replayed the whole entrance
          for what is meant to be an instant preview — and re-entered the
          hidden state each time. The image element cross-fades on its own. */}
      <motion.figure
        /* The entrance moves the frame; it does NOT reveal it. Opacity is
             deliberately absent: with `opacity: 0` here, every photograph in the
             story was measured sitting invisible whenever the entrance did not
             resolve. A photo that slides is a nice touch; a photo that is missing
             is a broken page. */
        initial={reduced ? false : { y: 24, rotate: -1.5 }}
        whileInView={{ y: 0, rotate: 0 }}
        viewport={{ once: true, margin: '0px 0px -12% 0px' }}
        transition={ENTER}
        className="ai-frame-cinematic ai-photo-spill relative mx-auto w-full max-w-xl overflow-hidden shadow-glow-lg"
      >
        <MemoryFrame
          photo={activeImage}
          alt={`${moment.title} · ภาพที่ ${active + 1}`}
          shape="editorial"
          tone="champagne"
          label={`${active + 1} / ${images.length}`}
          index={index + active}
          objectPosition={moment.objectPosition}
        />
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/90 via-navy-900/20 to-transparent px-5 pb-5 pt-14 font-thai text-sm text-ivory/80">
          {moment.label} · {moment.title}
        </figcaption>
      </motion.figure>

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

        <div className="mt-8">
          <p className="font-thai text-xs text-sky-100/55">ภาพในช่วงเดียวกัน</p>
          <div
            className="mt-3 grid grid-cols-3 gap-3"
            role="group"
            aria-label={`ภาพจาก ${moment.title}`}
          >
            {images.map((image, imageIndex) => (
              <button
                key={image}
                type="button"
                aria-pressed={active === imageIndex}
                aria-label={`ดูภาพจาก ${moment.title} ภาพที่ ${imageIndex + 1}`}
                onClick={() => setActive(imageIndex)}
                className={cn(
                  'ai-pressable overflow-hidden bg-navy-800/20 transition-opacity',
                  active === imageIndex
                    ? 'opacity-100 shadow-glow'
                    : 'opacity-50 hover:opacity-90'
                )}
              >
                <span className="block overflow-hidden" style={frameStyle(image, 'tall')}>
                  <MemoryImage
                    photo={image}
                    alt=""
                    tone="champagne"
                    index={index + imageIndex}
                    loading="lazy"
                  />
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 font-mono text-[0.5rem] uppercase tracking-[0.22em] text-sky-100/40">
            {String(active + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
          </p>
        </div>
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
        <MemoryImage photo={moment.image} alt="" tone="sky" index={index} objectPosition={moment.objectPosition} cropMode={moment.cropMode} />
      </motion.span>
      {/*
        TWO scrims, not one.
        The flat wash below lifts the whole backdrop away from the copy. The
        radial one above concentrates behind the reading column, because the
        flat wash alone is not enough over a BRIGHT photograph — the Pattaya
        beat is sea and sky, and the owner's report of "ตัวอักษรมองไม่เห็น"
        lands exactly there. This darkens the area behind the words and leaves
        the corners of the image as they were, rather than dimming the picture.
      */}
      <span aria-hidden="true" className="absolute inset-0 bg-navy-900/45" />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(70%_80%_at_50%_50%,rgba(12,27,41,0.72),rgba(12,27,41,0.28)_60%,transparent_85%)]"
      />

      <motion.div
      /* The entrance moves the frame; it does NOT reveal it. Opacity is
         deliberately absent: with `opacity: 0` here, every photograph in the
         story was measured sitting invisible whenever the entrance did not
         resolve. A photo that slides is a nice touch; a photo that is missing
         is a broken page. */
        initial={reduced ? false : { y: 30, scale: 0.96 }}
        whileInView={{ y: 0, scale: 1 }}
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        transition={{ ...ENTER, delay: 0.18 }}
        className="relative z-10 flex flex-col items-center gap-7 px-6 py-14 text-center sm:flex-row sm:gap-9 sm:text-left"
      >
        <figure className="ai-frame-memory ai-photo-spill relative w-[11rem] shrink-0 overflow-hidden shadow-glow-lg sm:w-[13rem]">
          <span className="block" style={frameStyle(moment.image, 'tall')}>
            <MemoryImage
              photo={moment.image}
              alt={moment.title}
              tone="sky"
              label={moment.label}
              index={index}
              objectPosition={moment.objectPosition}
              cropMode={moment.cropMode}
            />
          </span>
        </figure>
        <div className="max-w-sm">
          <Label moment={moment} />
          <h3 className="ai-legible mt-3 font-display text-[clamp(1.6rem,3.2vw,2.4rem)] font-light leading-tight text-ivory">
            {moment.title}
          </h3>
          {/* `ai-legible` on the body too. The heading already carried it; the
              line underneath did not, and it is the smaller of the two. */}
          <p className="ai-legible mt-3 text-[0.95rem] leading-relaxed text-ivory/85">{moment.body}</p>
        </div>
      </motion.div>
    </article>
  );
}
