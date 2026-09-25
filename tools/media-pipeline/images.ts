/**
 * Image validation and derivatives, on sharp (libvips).
 *
 * Output matches the established archive exactly: a WebP full image at 1600px
 * on the long edge (q82) and a 480px WebP thumbnail (q72), orientation baked
 * into the pixels, and no EXIF, GPS, XMP or ICC metadata written.
 */
import sharp from 'sharp';

import {
  PHOTO_FULL_EDGE,
  PHOTO_FULL_QUALITY,
  PHOTO_THUMB_EDGE,
  PHOTO_THUMB_QUALITY,
  POSTER_EDGE,
  POSTER_QUALITY
} from './config.ts';

// Deterministic output: libvips' operation cache and threading never change
// pixels, but keep the encoder single-threaded anyway so reruns are byte-stable.
sharp.concurrency(1);

export interface ImageInspection {
  format: string;
  /** Display size after EXIF orientation. */
  width: number;
  height: number;
  orientation: number;
  hasExif: boolean;
  hasGps: boolean;
  hasXmp: boolean;
  hasIptc: boolean;
  hasIcc: boolean;
  /** Owner-irrelevant hint only: never used to assign a relationship year. */
  exifDate: string | null;
}

export interface Derivative {
  buffer: Buffer;
  width: number;
  height: number;
  /** True when the source bytes were kept as-is (already an appropriate WebP). */
  passthrough: boolean;
}

const EXIF_DATE = /(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/;

function exifDateOf(exif: Buffer | undefined): string | null {
  if (!exif) return null;
  // DateTimeOriginal and friends are ASCII "YYYY:MM:DD HH:MM:SS" inside the IFD.
  const match = EXIF_DATE.exec(exif.toString('latin1'));
  return match ? `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}` : null;
}

function exifHasGps(exif: Buffer | undefined): boolean {
  if (!exif) return false;
  // The GPS IFD pointer is tag 0x8825, in either byte order.
  return exif.includes(Buffer.from([0x88, 0x25])) || exif.includes(Buffer.from([0x25, 0x88]));
}

/** Decode the whole image, not just the header: catches truncated and corrupt files. */
export async function inspectImage(input: Buffer): Promise<ImageInspection> {
  const meta = await sharp(input, { failOn: 'error' }).metadata();
  if (!meta.width || !meta.height || !meta.format) throw new Error('no readable image dimensions');
  await sharp(input, { failOn: 'error' }).rotate().resize(64, 64, { fit: 'inside' }).raw().toBuffer();
  const orientation = meta.orientation ?? 1;
  const swap = orientation >= 5 && orientation <= 8;
  return {
    format: meta.format,
    width: swap ? meta.height : meta.width,
    height: swap ? meta.width : meta.height,
    orientation,
    hasExif: Boolean(meta.exif),
    hasGps: exifHasGps(meta.exif),
    hasXmp: Boolean(meta.xmp),
    hasIptc: Boolean(meta.iptc),
    hasIcc: Boolean(meta.icc),
    exifDate: exifDateOf(meta.exif)
  };
}

async function encodeWebp(input: Buffer, edge: number, quality: number): Promise<Derivative> {
  const { data, info } = await sharp(input, { failOn: 'error' })
    .rotate()
    .resize(edge, edge, { fit: 'inside', withoutEnlargement: true, kernel: 'lanczos3' })
    .toColourspace('srgb')
    .webp({ quality, effort: 6 })
    .toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height, passthrough: false };
}

/**
 * The full-size archive image. A source that is already a metadata-free WebP
 * within the size limit is kept byte-for-byte: re-encoding it would only lose
 * quality.
 */
export async function fullDerivative(input: Buffer, inspection: ImageInspection): Promise<Derivative> {
  const clean = !inspection.hasExif && !inspection.hasXmp && !inspection.hasIptc && !inspection.hasIcc;
  if (inspection.format === 'webp' && clean && inspection.orientation === 1
    && Math.max(inspection.width, inspection.height) <= PHOTO_FULL_EDGE) {
    return { buffer: Buffer.from(input), width: inspection.width, height: inspection.height, passthrough: true };
  }
  return encodeWebp(input, PHOTO_FULL_EDGE, PHOTO_FULL_QUALITY);
}

export function thumbDerivative(input: Buffer): Promise<Derivative> {
  return encodeWebp(input, PHOTO_THUMB_EDGE, PHOTO_THUMB_QUALITY);
}

/** Video posters are JPEG, as every established poster in /images/memories/video is. */
export async function posterDerivative(input: Buffer): Promise<Derivative> {
  const { data, info } = await sharp(input, { failOn: 'error' })
    .rotate()
    .resize(POSTER_EDGE, POSTER_EDGE, { fit: 'inside', withoutEnlargement: true, kernel: 'lanczos3' })
    .toColourspace('srgb')
    .jpeg({ quality: POSTER_QUALITY, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height, passthrough: false };
}

/** 64-bit difference hash, as 16 hex chars. Orientation-aware. */
export async function differenceHash(input: Buffer): Promise<string> {
  const pixels = await sharp(input).rotate().grayscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer();
  let bits = 0n;
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const left = pixels[row * 9 + col]!;
      const right = pixels[row * 9 + col + 1]!;
      bits = (bits << 1n) | (left > right ? 1n : 0n);
    }
  }
  return bits.toString(16).padStart(16, '0');
}

export function hammingDistance(a: string, b: string): number {
  let value = BigInt(`0x${a}`) ^ BigInt(`0x${b}`);
  let count = 0;
  while (value) {
    count += Number(value & 1n);
    value >>= 1n;
  }
  return count;
}

/** Verify an output file: readable, the expected size, and carrying no metadata. */
export async function verifyDerivative(buffer: Buffer): Promise<{ width: number; height: number; format: string; hasMetadata: boolean }> {
  const meta = await sharp(buffer, { failOn: 'error' }).metadata();
  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    format: meta.format ?? 'unknown',
    hasMetadata: Boolean(meta.exif || meta.xmp || meta.iptc)
  };
}
