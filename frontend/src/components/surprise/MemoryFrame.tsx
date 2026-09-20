import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { MemoryImage } from '@/components/surprise/MemoryImage';
import { aspectOf, frameStyle, isPortrait, type FrameShape } from '@/lib/mediaAspect';
import type { Memory } from '@/data/anniversary';

interface MemoryFrameProps {
  photo?: string;
  alt: string;
  /** Which family of proportions this frame belongs to. See `mediaAspect`. */
  shape?: FrameShape;
  tone?: Memory['tone'];
  label?: string;
  index?: number;
  loading?: 'lazy' | 'eager';
  objectPosition?: string;
  className?: string;
  /** Overlaid inside the frame — a caption, a date, a corner mark. */
  children?: ReactNode;
}

/**
 * A photograph in a frame that fits it.
 *
 * The frame's aspect ratio is derived from the photograph itself (clamped into
 * the requested shape's range), so the crop is a few percent instead of the two
 * thirds a portrait photo lost inside a 21/9 band. Nothing here letterboxes:
 * the frame moves to the photo rather than the photo shrinking inside the frame.
 *
 * `objectPosition` still matters for the small residual crop, and is where a
 * per-photo bias belongs — a face high in the frame, a cat low in it.
 */
export function MemoryFrame({
  photo,
  alt,
  shape = 'editorial',
  tone,
  label,
  index,
  loading,
  objectPosition,
  className,
  children
}: MemoryFrameProps) {
  return (
    <div
      /* `ai-sweep` and `ai-lift` are pointer-only and no-ops under reduced
         motion; see the micro-interaction block in global.css. They are applied
         here rather than per scene so every photograph answers the pointer the
         same way. */
      className={cn('ai-sweep ai-lift relative overflow-hidden', className)}
      style={frameStyle(photo, shape)}
    >
      <MemoryImage
        photo={photo}
        alt={alt}
        tone={tone}
        label={label}
        index={index}
        loading={loading}
        objectPosition={objectPosition}
      />
      {children}
    </div>
  );
}

interface MemoryBleedProps extends Omit<MemoryFrameProps, 'shape'> {
  /** Cap on the frame's height, so a tall portrait never exceeds one screen. */
  maxHeight?: string;
}

/**
 * The full-bleed treatment, for portrait photographs.
 *
 * A wide cinematic band is the wrong container for a phone photo held upright,
 * and it is most of this pool. So the band stays full-width — the moment still
 * arrives as a whole screen — but the photograph inside it is shown WHOLE, at
 * its own proportions, with a scaled and blurred copy of itself filling the
 * space either side.
 *
 * That backdrop is the difference between "shown whole" and "letterboxed": the
 * width is filled by the photograph's own colour rather than by black bars, so
 * an uncropped portrait reads as a deliberate composition. It also costs
 * nothing extra to load — same `src`, already in the cache.
 *
 * A landscape photograph needs none of this and simply fills the band.
 */
export function MemoryBleed({
  photo,
  alt,
  tone,
  label,
  index,
  loading,
  objectPosition,
  className,
  maxHeight = 'min(90vh, 54rem)',
  children
}: MemoryBleedProps) {
  const portrait = isPortrait(photo);

  if (!portrait) {
    return (
      <div className={cn('relative w-full overflow-hidden', className)} style={frameStyle(photo, 'wide')}>
        <MemoryImage
          photo={photo}
          alt={alt}
          tone={tone}
          label={label}
          index={index}
          loading={loading}
          objectPosition={objectPosition}
        />
        {children}
      </div>
    );
  }

  /*
   * HOW WIDE THE BAND IS ALLOWED TO BE.
   *
   * Owner feedback on this treatment was, in effect, two halves of one problem:
   * "ขยายให้ใหญ่หน่อย" and "รูปภาพมีพื้นที่ว่าง". Measured at 1440, the three
   * fullbleed beats — the first meeting, the actual wedding, and
   * "เรายังอยู่ด้วยกัน" — were painting the photograph across 36–48% of the band.
   * The remaining half to two thirds was blurred filler. A photograph occupying
   * a third of an enormous card reads as both too small AND surrounded by empty
   * space, because it is both.
   *
   * So the band no longer takes its width from the page. It takes it from the
   * photograph: the height cap decides how tall the picture can be, the
   * photograph's own ratio decides how wide that makes it, and `BLEED` is how
   * much margin is allowed beyond that. At 1.28 the blurred edge is a deliberate
   * border — enough to keep the full-width, no-hard-edge feeling that made this
   * treatment worth having — rather than the majority of the frame.
   *
   * `min()` with 100% means a narrow screen still goes edge to edge, so nothing
   * changes on a phone, where the portrait already filled the width.
   */
  const BLEED = 1.28;
  const ratio = aspectOf(photo);

  /*
   * THE HEIGHT HAS TO KNOW ABOUT THE WIDTH.
   *
   * On a phone the band cannot be as wide as the photograph would like, so a
   * fixed tall band left the picture unable to fill it. Measured at 390: the
   * band was 360x805 while the picture's own box came out 604 wide, which
   * overflowed and was clipped by the band — the photograph was being cut on
   * BOTH SIDES on every phone, on the first-meeting beat, the wedding, and
   * "เรายังอยู่ด้วยกัน".
   *
   * So the band's height is capped by what the available width can actually
   * support at this photograph's ratio. On a wide screen the first term wins
   * and nothing changes; on a phone the second wins and the band shrinks to fit
   * the picture instead of cropping it. The gutter matches the scene padding.
   */
  const height = `min(${maxHeight}, calc((100vw - 3rem) / ${ratio.toFixed(3)}))`;

  return (
    <div
      className={cn('relative mx-auto overflow-hidden', className)}
      style={{
        height,
        width: `min(100%, calc(${height} * ${(ratio * BLEED).toFixed(3)}))`
      }}
    >
      {/* The bleed. Decorative twice over — it is the same photograph again —
          so it carries no alt text and no semantics. */}
      <div aria-hidden="true" className="absolute inset-0">
        <MemoryImage
          photo={photo}
          alt=""
          tone={tone}
          loading={loading}
          objectPosition={objectPosition}
          className="scale-110 blur-2xl brightness-[0.55] saturate-[0.85]"
        />
        <span className="absolute inset-0 bg-navy-900/45" />
      </div>

      {/* The photograph itself: whole, centred, height-bound. `contain` is safe
          here because the frame is already the photo's own shape. */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* `max-w-full` is the belt: whatever the height works out to, this box
            can never be wider than the band that contains it. */}
        <div className="relative h-full max-w-full" style={frameStyle(photo, 'natural')}>
          <MemoryImage
            photo={photo}
            alt={alt}
            tone={tone}
            label={label}
            index={index}
            loading={loading}
            cropMode="contain"
          />
        </div>
      </div>

      {children}
    </div>
  );
}
