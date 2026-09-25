/**
 * A small ISO-BMFF / QuickTime reader — enough to validate a clip, read what
 * the canonical model needs (display size, duration, audio presence, codec),
 * find location metadata, and blank metadata boxes in place.
 *
 * No decoding happens here. It exists so an H.264 MP4 can be ingested without
 * ffmpeg, and so every clip — transcoded or not — is verified the same way.
 */

export interface Mp4Box {
  type: string;
  /** Offset of the box header in the file. */
  start: number;
  /** Offset of the payload (after the header, and after version/flags for full boxes we descend into). */
  payload: number;
  end: number;
  children: Mp4Box[];
}

export interface Mp4Probe {
  brand: string;
  /** Seconds, rounded to 2 decimals as the canonical model stores it. */
  duration: number;
  /** Display size, after any rotation in the track matrix. */
  width: number;
  height: number;
  rotation: 0 | 90 | 180 | 270;
  videoCodec: string;
  audioCodec: string | null;
  hasAudio: boolean;
  /** moov precedes mdat, so playback can start before the whole file arrives. */
  faststart: boolean;
  /** udta / meta boxes that can carry creation time, device, or location. */
  metadataBoxes: string[];
  hasLocation: boolean;
}

const CONTAINERS = new Set(['moov', 'trak', 'mdia', 'minf', 'stbl', 'edts', 'dinf', 'udta', 'meta', 'ilst', 'mvex']);
const METADATA_BOXES = new Set(['udta', 'meta']);
const LOCATION_TYPES = new Set(['©xyz', 'loci']);
const LOCATION_KEY = Buffer.from('com.apple.quicktime.location', 'latin1');

export class Mp4Error extends Error {}

function boxType(buffer: Buffer, offset: number): string {
  return buffer.toString('latin1', offset, offset + 4);
}

/**
 * QuickTime `meta` has no version/flags word; ISO `meta` does. The first child
 * of a QuickTime meta is `hdlr`, so look for it at both offsets.
 */
function metaPayloadOffset(buffer: Buffer, payload: number, end: number): number {
  if (payload + 8 <= end && boxType(buffer, payload + 4) === 'hdlr') return payload;
  return payload + 4;
}

export function parseBoxes(buffer: Buffer, start = 0, end = buffer.length, depth = 0): Mp4Box[] {
  if (depth > 12) throw new Mp4Error('box nesting is implausibly deep');
  const boxes: Mp4Box[] = [];
  let offset = start;
  while (offset + 8 <= end) {
    let size = buffer.readUInt32BE(offset);
    const type = boxType(buffer, offset + 4);
    let header = 8;
    if (size === 1) {
      if (offset + 16 > end) throw new Mp4Error(`truncated 64-bit ${type} box`);
      const large = buffer.readBigUInt64BE(offset + 8);
      if (large > BigInt(Number.MAX_SAFE_INTEGER)) throw new Mp4Error(`${type} box is too large`);
      size = Number(large);
      header = 16;
    } else if (size === 0) {
      size = end - offset;
    }
    if (size < header || offset + size > end) {
      throw new Mp4Error(`corrupt ${JSON.stringify(type)} box at byte ${offset} (size ${size}, container ends at ${end})`);
    }
    const box: Mp4Box = { type, start: offset, payload: offset + header, end: offset + size, children: [] };
    if (CONTAINERS.has(type)) {
      const childStart = type === 'meta' ? metaPayloadOffset(buffer, box.payload, box.end) : box.payload;
      box.payload = childStart;
      // udta may end with a 32-bit zero terminator; tolerate trailing bytes < 8.
      box.children = parseBoxes(buffer, childStart, box.end, depth + 1);
    }
    boxes.push(box);
    offset += size;
  }
  return boxes;
}

function find(boxes: Mp4Box[], type: string): Mp4Box | undefined {
  return boxes.find((box) => box.type === type);
}

function walk(boxes: Mp4Box[], visit: (box: Mp4Box) => void): void {
  for (const box of boxes) {
    visit(box);
    walk(box.children, visit);
  }
}

function fixed16(buffer: Buffer, offset: number): number {
  return buffer.readInt32BE(offset) / 65536;
}

interface TrackInfo {
  handler: string;
  codec: string | null;
  width: number;
  height: number;
  rotation: 0 | 90 | 180 | 270;
}

function readTrack(buffer: Buffer, trak: Mp4Box): TrackInfo {
  const tkhd = find(trak.children, 'tkhd');
  const mdia = find(trak.children, 'mdia');
  const hdlr = mdia ? find(mdia.children, 'hdlr') : undefined;
  if (!tkhd || !mdia || !hdlr) throw new Mp4Error('a track is missing tkhd/mdia/hdlr');
  const handler = boxType(buffer, hdlr.payload + 8);

  const version = buffer.readUInt8(tkhd.payload);
  // Offsets inside tkhd after version/flags: v0 uses 32-bit times, v1 64-bit.
  const matrixOffset = tkhd.payload + (version === 1 ? 52 : 40);
  const a = fixed16(buffer, matrixOffset);
  const b = fixed16(buffer, matrixOffset + 4);
  const width = Math.round(buffer.readUInt32BE(matrixOffset + 36) / 65536);
  const height = Math.round(buffer.readUInt32BE(matrixOffset + 40) / 65536);
  let rotation: TrackInfo['rotation'] = 0;
  if (a === 0 && b === 1) rotation = 90;
  else if (a === -1 && b === 0) rotation = 180;
  else if (a === 0 && b === -1) rotation = 270;

  const minf = find(mdia.children, 'minf');
  const stbl = minf ? find(minf.children, 'stbl') : undefined;
  const stsd = stbl ? find(stbl.children, 'stsd') : undefined;
  let codec: string | null = null;
  if (stsd && stsd.payload + 16 <= stsd.end && buffer.readUInt32BE(stsd.payload + 4) > 0) {
    codec = boxType(buffer, stsd.payload + 12);
  }
  return { handler, codec, width, height, rotation };
}

export function probeMp4(buffer: Buffer): Mp4Probe {
  if (buffer.length < 16) throw new Mp4Error('file is too small to be a video');
  const top = parseBoxes(buffer);
  const ftyp = find(top, 'ftyp');
  if (!ftyp) throw new Mp4Error('no ftyp box — not an MP4/QuickTime file');
  const moov = find(top, 'moov');
  if (!moov) throw new Mp4Error('no moov box — the file is truncated or not finalised');
  const mdatIndex = top.findIndex((box) => box.type === 'mdat');
  if (mdatIndex === -1) throw new Mp4Error('no mdat box — the file carries no media data');

  const mvhd = find(moov.children, 'mvhd');
  if (!mvhd) throw new Mp4Error('no mvhd box');
  const mvVersion = buffer.readUInt8(mvhd.payload);
  const timescale = buffer.readUInt32BE(mvhd.payload + (mvVersion === 1 ? 20 : 12));
  const rawDuration = mvVersion === 1
    ? Number(buffer.readBigUInt64BE(mvhd.payload + 24))
    : buffer.readUInt32BE(mvhd.payload + 16);
  if (!timescale || !rawDuration) throw new Mp4Error('the movie header declares no duration');

  const tracks = moov.children.filter((box) => box.type === 'trak').map((trak) => readTrack(buffer, trak));
  const video = tracks.find((track) => track.handler === 'vide');
  if (!video) throw new Mp4Error('no video track');
  if (!video.width || !video.height) throw new Mp4Error('the video track declares no size');
  const audio = tracks.find((track) => track.handler === 'soun');
  const swap = video.rotation === 90 || video.rotation === 270;

  const metadataBoxes: string[] = [];
  let hasLocation = false;
  walk([moov, ...top.filter((box) => box.type === 'meta')], (box) => {
    if (METADATA_BOXES.has(box.type)) metadataBoxes.push(box.type);
    if (LOCATION_TYPES.has(box.type)) hasLocation = true;
  });
  if (!hasLocation) hasLocation = buffer.subarray(moov.start, moov.end).includes(LOCATION_KEY);

  return {
    brand: boxType(buffer, ftyp.payload),
    duration: Math.round((rawDuration / timescale) * 100) / 100,
    width: swap ? video.height : video.width,
    height: swap ? video.width : video.height,
    rotation: video.rotation,
    videoCodec: video.codec ?? 'unknown',
    audioCodec: audio?.codec ?? null,
    hasAudio: Boolean(audio),
    faststart: top.findIndex((box) => box === moov) < mdatIndex,
    metadataBoxes,
    hasLocation
  };
}

/**
 * Blank every udta / meta box (moov-level, track-level and top-level) in place:
 * the type becomes `free` and the payload is zeroed. Sizes never change, so
 * every chunk offset in the file stays valid and no remux is needed.
 * Returns a new buffer; the input is not modified.
 */
export function stripMp4Metadata(input: Buffer): { buffer: Buffer; blanked: number } {
  const buffer = Buffer.from(input);
  const top = parseBoxes(buffer);
  const targets: Mp4Box[] = [];
  const collect = (boxes: Mp4Box[]) => {
    for (const box of boxes) {
      if (METADATA_BOXES.has(box.type)) {
        targets.push(box);
        continue; // the whole subtree goes with it
      }
      collect(box.children);
    }
  };
  collect(top.filter((box) => box.type === 'moov' || box.type === 'meta'));
  for (const box of targets) {
    const headerSize = buffer.readUInt32BE(box.start) === 1 ? 16 : 8;
    buffer.write('free', box.start + 4, 'latin1');
    buffer.fill(0, box.start + headerSize, box.end);
  }
  return { buffer, blanked: targets.length };
}

/** H.264 in an MP4 brand is what every shipped clip is and what every browser plays. */
export function isShippableMp4(probe: Mp4Probe): boolean {
  const qt = probe.brand === 'qt  ';
  const h264 = probe.videoCodec === 'avc1' || probe.videoCodec === 'avc3';
  const audioOk = !probe.hasAudio || probe.audioCodec === 'mp4a';
  return !qt && h264 && audioOk;
}
