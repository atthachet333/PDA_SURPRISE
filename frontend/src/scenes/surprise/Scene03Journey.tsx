import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { SceneSection } from '@/components/surprise/SceneSection';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePageVisible } from '@/hooks/usePageVisible';
import { PEAK_MEDIA, TURR_MEDIA } from '@/data/storyMedia';
import { pauseOtherVideos } from '@/lib/media';
import { cn } from '@/lib/cn';

const EASE = [0.16, 1, 0.3, 1] as const;

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

/* ---------------------------------------------------------------- PEAK --
 * Luxury editorial spread, and the most energetic of the three prototypes.
 * The photograph bleeds off the left edge at full scene height; the headline
 * is pulled back across the gutter onto it so the words belong to the image.
 * Idle motion: breathe + light sweep + pointer parallax + drifting rule.
 * ---------------------------------------------------------------------- */
function PeakScene({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const drift = useTransform(scrollYProgress, [0, 1], reduced ? ['0%', '0%'] : ['-3.5%', '3.5%']);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 40, damping: 18 });
  const sy = useSpring(py, { stiffness: 40, damping: 18 });
  const imageX = useTransform(sx, (v) => `${v * -10}px`);
  const imageY = useTransform(sy, (v) => `${v * -8}px`);
  const textX = useTransform(sx, (v) => `${v * 6}px`);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduced || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <article
      id="peak"
      ref={ref}
      onPointerMove={onPointerMove}
      className="ai-peak relative w-full overflow-hidden lg:grid lg:min-h-[100svh] lg:grid-cols-[52fr_48fr] lg:items-center"
    >
      <span aria-hidden="true" className="ai-peak-depth pointer-events-none absolute inset-0" />

      <motion.figure
        initial={reduced ? false : { clipPath: 'inset(0 18% 0 0)' }}
        whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 1.6, ease: EASE }}
        className="ai-peak-frame relative h-[74svh] min-h-[27rem] w-full overflow-hidden sm:h-[82svh] lg:h-[86svh] lg:min-h-0"
      >
        <motion.div style={{ y: drift }} className="absolute -inset-[4%]">
          <motion.div style={{ x: imageX, y: imageY }} className="h-full w-full">
            <MemoryImage
              photo={PEAK_MEDIA.hero}
              alt="ร้าน Peak — ร้านที่เราเจอกันครั้งแรก"
              tone="champagne"
              loading="eager"
              objectPosition="58% 46%"
              className="ai-peak-image"
            />
          </motion.div>
        </motion.div>
        <span aria-hidden="true" className="ai-peak-sweep absolute inset-0" />
        {/* Localized scrims only: the right edge for the headline on desktop,
            the foot of the frame for the headline on phones. */}
        <span aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[38%] bg-gradient-to-l from-[#0b1624]/80 via-[#0b1624]/25 to-transparent lg:block" />
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[#0b1624] via-[#0b1624]/55 to-transparent lg:hidden" />

        <span className="absolute left-5 top-6 font-mono text-[0.5rem] uppercase tracking-[0.3em] text-ivory/70 sm:left-8 sm:top-8 lg:left-12 lg:top-12">
          A&amp;I · THE FIRST PAGE
        </span>
        <span aria-hidden="true" className="ai-peak-index absolute bottom-8 left-5 hidden font-display text-[0.7rem] tracking-[0.34em] text-champagne/70 sm:left-8 lg:bottom-12 lg:left-12 lg:block">
          01 — PEAK
        </span>

        {/* Phone headline sits on the photograph so the hero keeps its weight. */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-7 sm:px-8 lg:hidden">
          <p className="font-mono text-[0.58rem] uppercase tracking-[0.32em] text-champagne/85">FIRST MEETING · จุดเริ่มต้น</p>
          <h2 className="thai-display ai-peak-title mt-3 font-thai text-[clamp(2.9rem,14vw,4.4rem)] font-light leading-[1.02] text-ivory">ร้าน Peak</h2>
        </div>
      </motion.figure>

      <motion.div
        style={{ x: textX }}
        className="relative z-10 flex flex-col justify-center px-5 pb-12 pt-7 sm:px-8 lg:-ml-[9vw] lg:py-24 lg:pl-0 lg:pr-12 xl:pr-20"
      >
        <motion.div
          initial={reduced ? false : { opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '0px 0px -12% 0px' }}
          transition={{ duration: 1.25, delay: 0.25, ease: EASE }}
        >
          <p className="hidden font-mono text-[0.72rem] uppercase tracking-[0.32em] text-champagne/90 lg:block">FIRST MEETING · จุดเริ่มต้น</p>
          <span aria-hidden="true" className="ai-peak-rule mt-6 hidden h-px w-[min(22rem,100%)] origin-left bg-gradient-to-r from-champagne via-champagne/40 to-transparent lg:block" />
          <h2 className="thai-display ai-peak-title mt-6 hidden font-thai text-[clamp(4rem,7.4vw,7.5rem)] font-light leading-[0.98] text-ivory lg:block">
            ร้าน Peak
          </h2>
          <p className="font-thai text-[clamp(1.1rem,1.5vw,1.35rem)] leading-8 text-champagne lg:mt-7 lg:pl-[9vw]">ร้านที่เราเจอกันครั้งแรก</p>
          <p className="mt-5 max-w-sm whitespace-pre-line font-thai text-[clamp(1rem,1.2vw,1.125rem)] leading-9 text-ivory/78 lg:mt-7 lg:pl-[9vw] lg:max-w-none">
            {'ตอนนั้นเรายังไม่รู้เลยว่า\nการเจอกันธรรมดาในวันนั้น\nจะพาเรามาไกลถึงขนาดนี้'}
          </p>
          <div aria-hidden="true" className="mt-8 flex items-center gap-3 lg:mt-10 lg:pl-[9vw]">
            <span className="ai-peak-dot h-1.5 w-1.5 rounded-full bg-champagne" />
            <span className="font-display text-sm italic tracking-[0.14em] text-ivory/50">where everything quietly started</span>
          </div>
        </motion.div>
      </motion.div>
    </article>
  );
}

/* ---------------------------------------------------------------- TURR --
 * The night it became "us". The real clip leads, framed large; the still is
 * its poster, so reduced motion, a slow network and a failed load all land on
 * the same confirmed photograph. Two thin paths meet at the frame's edge.
 * ---------------------------------------------------------------------- */
function TurrScene({ reduced }: { reduced: boolean }) {
  return (
    <article
      id="relationship-start"
      className="ai-turr relative w-full overflow-hidden px-5 pb-20 pt-4 sm:px-8 sm:pt-12 lg:flex lg:min-h-[100svh] lg:items-center lg:px-12 lg:py-[6svh]"
    >
      <span aria-hidden="true" className="ai-turr-atmosphere pointer-events-none absolute inset-0" />

      <div className="relative mx-auto grid w-full max-w-[80rem] items-center gap-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16 xl:gap-20">
        <div className="relative z-10 order-2 lg:order-1">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.32em] text-fuchsia-100/85 sm:text-[0.72rem]">OUR BEGINNING · 12 OCT 2025</p>
          <DateLockup reduced={reduced} />
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 1.3, delay: 0.55, ease: EASE }}
          >
            <span aria-hidden="true" className="mt-7 block h-px w-full max-w-md bg-gradient-to-r from-champagne/80 via-fuchsia-300/40 to-transparent" />
            <h2 className="thai-display mt-7 max-w-xl font-thai text-[clamp(2.3rem,4.6vw,4.4rem)] font-light leading-[1.12] text-ivory">วันที่เราเริ่มเป็น “เรา”</h2>
            <p className="mt-5 font-thai text-[clamp(1.02rem,1.35vw,1.2rem)] leading-8 text-champagne">ร้าน TURR เกษตร · คืนที่ขอเธอเป็นแฟน</p>
            <p className="mt-6 max-w-lg whitespace-pre-line font-thai text-[clamp(1rem,1.2vw,1.1rem)] leading-9 text-ivory/78">
              {'จากคนสองคนในคืนนั้น\nกลายเป็นคำว่า “เรา”\nตั้งแต่วันนั้นเป็นต้นมา'}
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 0.96, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 1.6, ease: EASE }}
          className="relative order-1 mx-auto w-full max-w-[26rem] lg:order-2 lg:w-auto lg:max-w-none"
        >
          <span aria-hidden="true" className="ai-turr-halo pointer-events-none absolute -inset-10 rounded-[50%]" />
          <ConvergingPaths reduced={reduced} />
          <TurrFilm reduced={reduced} />
          <span aria-hidden="true" className="ai-turr-pulse absolute -left-[5px] top-[58%] z-10 hidden h-2.5 w-2.5 rounded-full bg-champagne lg:block" />
        </motion.div>
      </div>
    </article>
  );
}

/** "12 OCT" assembles, then "2025" resolves beneath it. Static when reduced. */
function DateLockup({ reduced }: { reduced: boolean }) {
  const glyphs = ['1', '2', ' ', 'O', 'C', 'T'];
  return (
    <div className="mt-5 font-display font-light leading-[0.8] text-ivory" aria-label="12 October 2025">
      <span aria-hidden="true" className="block whitespace-nowrap text-[clamp(4.6rem,13vw,10.5rem)] tracking-[-0.045em]">
        {glyphs.map((glyph, index) => (
          <motion.span
            key={index}
            className="inline-block"
            initial={reduced ? false : { opacity: 0, y: '0.3em', filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.1 + index * 0.08, ease: EASE }}
          >
            {glyph}
          </motion.span>
        ))}
      </span>
      <motion.span
        aria-hidden="true"
        className="ai-turr-year ml-1 mt-3 block text-[clamp(2.4rem,5.6vw,5rem)] tracking-[0.12em] text-champagne"
        initial={reduced ? false : { opacity: 0, letterSpacing: '0.5em' }}
        whileInView={{ opacity: 1, letterSpacing: '0.12em' }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, delay: 0.55, ease: EASE }}
      >
        2025
      </motion.span>
    </div>
  );
}

/**
 * The confirmed clip. Nothing is fetched until the frame is near the viewport;
 * it then plays muted and looped while visible (the source has no audio track,
 * so there is nothing to negotiate with the song). Reduced motion never starts
 * it on its own, but the control still plays it.
 */
function TurrFilm({ reduced }: { reduced: boolean }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pageVisible = usePageVisible();
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [userChoice, setUserChoice] = useState<'play' | 'pause' | null>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = frameRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const nearObserver = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) setNear(true);
    }, { rootMargin: '400px 0px' });
    const viewObserver = new IntersectionObserver(([entry]) => setInView(Boolean(entry?.isIntersecting)), { threshold: 0.35 });
    nearObserver.observe(node);
    viewObserver.observe(node);
    return () => {
      nearObserver.disconnect();
      viewObserver.disconnect();
    };
  }, []);

  const wantsPlay = !failed && pageVisible && inView && (userChoice === 'play' || (userChoice === null && !reduced));
  const mounted = !failed && (near || userChoice === 'play');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (wantsPlay) void video.play().catch(() => setPlaying(false));
    else video.pause();
  }, [wantsPlay, mounted]);

  const toggle = () => setUserChoice(playing ? 'pause' : 'play');

  return (
    <div
      ref={frameRef}
      className="ai-turr-film relative mx-auto aspect-[9/16] w-full overflow-hidden lg:h-[min(86svh,56rem)] lg:w-auto"
    >
      <img
        src={TURR_MEDIA.still}
        alt="คืนที่ขอเธอเป็นแฟนที่ร้าน TURR เกษตร 12 ตุลาคม 2025"
        width={788}
        height={1400}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {mounted ? (
        <video
          ref={videoRef}
          src={TURR_MEDIA.video}
          poster={TURR_MEDIA.still}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-1000', playing ? 'opacity-100' : 'opacity-0')}
          onPlay={(event) => {
            pauseOtherVideos(event.currentTarget);
            setPlaying(true);
          }}
          onPause={() => setPlaying(false)}
          onError={() => {
            setFailed(true);
            setPlaying(false);
          }}
        />
      ) : null}
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#140b24]/80 via-transparent to-[#1d0f33]/20" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
        <div>
          <p className="font-mono text-[0.5rem] uppercase tracking-[0.3em] text-ivory/75">TURR · KASET</p>
          <p className="mt-1 font-display text-base italic text-champagne/85">the night we became us</p>
        </div>
        {failed ? null : (
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'หยุดวิดีโอคืนที่ร้าน TURR' : 'เล่นวิดีโอคืนที่ร้าน TURR'}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-ivory/25 bg-[#140b24]/55 px-3.5 py-2 backdrop-blur-sm transition-colors hover:border-champagne/60 focus-visible:outline-offset-4"
            data-cursor="open"
          >
            <span aria-hidden="true" className="relative flex h-2.5 w-2.5 items-center justify-center">
              {playing ? (
                <span className="flex gap-[2px]"><span className="h-2.5 w-[2px] bg-champagne" /><span className="h-2.5 w-[2px] bg-champagne" /></span>
              ) : (
                <span className="h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-champagne" />
              )}
            </span>
            <span className="font-mono text-[0.5rem] uppercase tracking-[0.22em] text-ivory/85">{playing ? 'MOVING' : 'PLAY'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Two thin luminous paths that meet at the film's left edge and pulse there.
 * The SVG is anchored to the film itself, so the meeting point stays on the
 * frame at every desktop width; strokes do not scale with the stretch.
 */
function ConvergingPaths({ reduced }: { reduced: boolean }) {
  const a = 'M 0 40 C 300 60, 520 360, 1000 522';
  const b = 'M 0 880 C 320 840, 560 660, 1000 522';
  return (
    <svg aria-hidden="true" viewBox="0 0 1000 900" preserveAspectRatio="none" className="pointer-events-none absolute right-full top-0 hidden h-full w-[min(52vw,46rem)] overflow-visible lg:block">
      <defs>
        <linearGradient id="turr-path-a" x1="0" x2="1"><stop offset="0" stopColor="#7ec8ff" stopOpacity="0" /><stop offset="0.6" stopColor="#7ec8ff" stopOpacity="0.4" /><stop offset="1" stopColor="#ebd9bc" stopOpacity="0.85" /></linearGradient>
        <linearGradient id="turr-path-b" x1="0" x2="1"><stop offset="0" stopColor="#e3a0f0" stopOpacity="0" /><stop offset="0.6" stopColor="#e3a0f0" stopOpacity="0.4" /><stop offset="1" stopColor="#ebd9bc" stopOpacity="0.85" /></linearGradient>
      </defs>
      <path d={a} fill="none" stroke="url(#turr-path-a)" strokeOpacity="0.45" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <path d={b} fill="none" stroke="url(#turr-path-b)" strokeOpacity="0.45" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <path className="ai-turr-path" d={a} fill="none" stroke="url(#turr-path-a)" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
      <path className="ai-turr-path ai-turr-path-b" d={b} fill="none" stroke="url(#turr-path-b)" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
      {reduced ? null : (
        <>
          <circle r="2" fill="#bfe3ff">
            <animateMotion dur="9s" repeatCount="indefinite" path={a} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.2 1" />
            <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.2;0.85;1" dur="9s" repeatCount="indefinite" />
          </circle>
          <circle r="2" fill="#f1c7fa">
            <animateMotion dur="9s" begin="1.2s" repeatCount="indefinite" path={b} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.2 1" />
            <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.2;0.85;1" dur="9s" begin="1.2s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );
}
