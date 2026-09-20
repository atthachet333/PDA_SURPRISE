/**
 * The real intrinsic size of every shipped photograph.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * Nearly every photograph in this experience is PORTRAIT — they
 * were taken on a phone, held upright, the way people actually photograph each
 * other. `roadtrip-01` is the deliberate landscape exception.
 *
 * The layouts were written the other way round: 16/9 and 21/9 bands, squares,
 * 5/4 splits, all filled with `object-fit: cover`. A 3:4 photograph poured into
 * a 21:9 band loses roughly two thirds of its height, which is why faces and
 * cats were being cut off — the owner's report of "จัดรูปภาพใหม่ มันเห็นไม่ครบ".
 *
 * The fix is not a blanket `object-fit: contain` (that letterboxes everything
 * and looks like a broken slideshow). It is to let each frame take its aspect
 * FROM THE PHOTOGRAPH, so the crop is small or zero by construction.
 *
 * Dimensions are measured from the optimized `.webp` files that actually ship,
 * not from the Drive originals. Keep this table in step when assets change: an
 * entry that is missing simply falls back to a sensible portrait default, so a
 * stale table degrades rather than breaks.
 */

/** width / height for each shipped asset, keyed by its public path. */
const INTRINSIC: Record<string, number> = {
  '/images/memories/cat-01.webp': 787 / 1400,
  '/images/memories/cat-02.webp': 1050 / 1400,
  '/images/memories/chaam-01.webp': 1200 / 1600,
  '/images/memories/chaam-shadows.webp': 1200 / 1600,
  '/images/memories/pattaya-01.webp': 1200 / 1600,
  '/images/memories/marriage-decision-01.webp': 900 / 1600,
  '/images/memories/together-now-01.webp': 900 / 1600,
  '/images/memories/finale-shadow-heart-poster.webp': 900 / 1600,
  '/images/memories/graduation-01.webp': 1200 / 1600,
  '/images/memories/chaam-beach-02.webp': 1800 / 2400,
  '/images/memories/roadtrip-01.webp': 1600 / 1000,
  '/images/memories/sarika-01.webp': 1200 / 1600,
  '/images/memories/suanphueng-01.webp': 900 / 1600,
  '/images/memories/peak-01.webp': 1350 / 1800,
  '/images/memories/peak-02.webp': 788 / 1400,
  '/images/memories/wedding-01.webp': 1066 / 1600,
  '/images/memories/wedding-02.webp': 1066 / 1600,
  '/images/memories/wedding-03.webp': 1066 / 1600,
  '/images/memories/wedding-actual-01.webp': 1200 / 1800,
  '/images/memories/wedding-actual-02.webp': 1066 / 1600,
  '/images/memories/wedding-actual-03.webp': 1066 / 1600,
  '/images/memories/special-roadtrip-wide.webp': 2000 / 1250,
  '/images/memories/wedding-ceremony-01.webp': 1333 / 2000,
  '/images/memories/wedding-ceremony-02.webp': 1333 / 2000,
  '/images/memories/wedding-ceremony-03.webp': 1333 / 2000,
  '/images/memories/marriage-registration-safe.webp': 1108 / 1477
};

/** What an unmeasured or absent photo is assumed to be: a phone portrait. */
const DEFAULT_ASPECT = 3 / 4;

export type Orientation = 'portrait' | 'square' | 'landscape';

/**
 * Frame intents, in the vocabulary the scenes think in. Each one is a RANGE the
 * frame is allowed to move inside — never a fixed number — so the photograph
 * keeps the final say.
 *
 *   natural   no crop at all: the frame becomes the photograph's own shape.
 *   editorial a magazine plate. Portraits stay tall, landscapes stay wide.
 *   tall      a standing column, for stacks and side-by-side reading columns.
 *   wide      the widest any frame gets, and still never a letterbox.
 *   square    a contact print. Crops, but symmetrically and only a little.
 */
export type FrameShape = 'natural' | 'editorial' | 'tall' | 'wide' | 'square';

const BOUNDS: Record<FrameShape, [min: number, max: number]> = {
  // A touch of clamping even here: a 0.56 phone portrait at full height is a
  // ribbon on a wide screen, and 9/16 is as narrow as a frame should ever get.
  natural: [0.5625, 1.9],
  editorial: [0.66, 1.5],
  tall: [0.62, 0.9],
  wide: [0.8, 1.6],
  square: [0.85, 1.18]
};

export function aspectOf(photo?: string): number {
  if (!photo) return DEFAULT_ASPECT;
  return INTRINSIC[photo] ?? DEFAULT_ASPECT;
}

export function orientationOf(photo?: string): Orientation {
  const aspect = aspectOf(photo);
  if (aspect > 1.06) return 'landscape';
  if (aspect < 0.95) return 'portrait';
  return 'square';
}

export function isPortrait(photo?: string): boolean {
  return orientationOf(photo) === 'portrait';
}

/**
 * The aspect a frame should actually use for this photograph.
 *
 * Clamping to the shape's range is what keeps a layout coherent — a row of
 * photos does not become a row of unrelated rectangles — while still moving
 * toward each photograph rather than away from it. The residual crop is at most
 * the distance between the photo and the nearest edge of the range, which for
 * this asset pool is a few percent instead of two thirds.
 */
export function frameAspect(photo: string | undefined, shape: FrameShape = 'editorial'): number {
  const [min, max] = BOUNDS[shape];
  return Math.min(max, Math.max(min, aspectOf(photo)));
}

/** Ready for `style`: `aspectRatio` wants a unitless number, as a string. */
export function frameStyle(photo: string | undefined, shape: FrameShape = 'editorial') {
  return { aspectRatio: String(frameAspect(photo, shape)) };
}

/**
 * Intrinsic `width`/`height` for the `<img>` itself.
 *
 * These are never used for layout — CSS sizes the element — but the browser
 * uses the ratio to reserve space before the bytes land, which is what stops
 * the page from jumping as photographs decode.
 */
export function intrinsicAttrs(photo?: string): { width: number; height: number } {
  const aspect = aspectOf(photo);
  return aspect >= 1
    ? { width: 1600, height: Math.round(1600 / aspect) }
    : { width: Math.round(1600 * aspect), height: 1600 };
}
