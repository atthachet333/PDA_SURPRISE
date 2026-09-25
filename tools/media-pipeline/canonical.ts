/**
 * The canonical media model, read and written in place.
 *
 * There is no pipeline-owned manifest. The application's own data files stay
 * the single source of truth:
 *
 *   frontend/src/data/memoryArchive.ts   photos   (MemoryArchiveItem)
 *   frontend/src/data/memoryVideos.ts    videos   (MemoryVideo)
 *   tools/anniversary-media-curation.json  provenance (hashes, privacy, batch)
 *
 * The pipeline writes only between `@media-pipeline:begin/end` markers inside
 * the two data files, and appends provenance records to the curation manifest
 * using that file's existing record shapes. The curated literals above the
 * markers are read (to avoid collisions) but never rewritten.
 */
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

import type { PipelineContext } from './config.ts';

export type MediaKind = 'photos' | 'videos';

/** Field order is fixed so a regenerated block is byte-identical. */
const PHOTO_KEYS = ['id', 'image', 'thumb', 'width', 'height', 'group', 'groupLabel', 'dateLabel', 'special', 'privacy', 'yearId', 'yearSource'] as const;
const VIDEO_KEYS = ['id', 'video', 'poster', 'width', 'height', 'posterWidth', 'posterHeight', 'duration', 'orientation', 'role', 'label', 'hasAudio', 'yearId', 'yearSource'] as const;

export interface CanonicalPhoto {
  id: string;
  image: string;
  thumb: string;
  width: number;
  height: number;
  group: string;
  groupLabel: string;
  dateLabel: string;
  special: boolean;
  privacy: string;
  yearId?: string;
  yearSource?: string;
}

export interface CanonicalVideo {
  id: string;
  video: string;
  poster: string;
  width: number;
  height: number;
  posterWidth: number;
  posterHeight: number;
  duration: number;
  orientation: 'portrait' | 'landscape';
  role: string;
  label: string;
  hasAudio: boolean;
  placement?: string;
  yearId?: string;
  yearSource?: string;
}

export interface CanonicalState {
  archiveText: string;
  videoText: string;
  curatedPhotos: CanonicalPhoto[];
  ingestedPhotos: CanonicalPhoto[];
  curatedVideos: CanonicalVideo[];
  ingestedVideos: CanonicalVideo[];
  groups: Array<{ id: string; label: string }>;
}

export class CanonicalFormatError extends Error {}

function markers(kind: MediaKind) {
  return { begin: `// @media-pipeline:begin ${kind}`, end: `// @media-pipeline:end ${kind}` };
}

/**
 * Evaluate one `const name: Type[] = [ ... ];` literal from a data module. The
 * curated literals are plain object literals (with comments), which is valid
 * JavaScript once the type annotation is left behind.
 */
export function readArrayLiteral<T>(text: string, name: string, file: string): T[] {
  const declaration = new RegExp(`(?:export )?const ${name}(?::[^=]+)? = \\[`);
  const match = declaration.exec(text);
  if (!match) throw new CanonicalFormatError(`${file}: cannot find the ${name} array`);
  const open = match.index + match[0].length - 1;
  const close = text.indexOf('\n];', open);
  if (close === -1) throw new CanonicalFormatError(`${file}: the ${name} array is not closed with "];" at column 0`);
  const literal = text.slice(open, close + 2);
  try {
    const value = vm.runInNewContext(`(${literal})`, Object.create(null), { timeout: 1000 }) as unknown;
    // Plain data only, and in this realm (objects built inside the vm carry its prototypes).
    return JSON.parse(JSON.stringify(value)) as T[];
  } catch (error) {
    throw new CanonicalFormatError(`${file}: the ${name} array is not a plain literal (${(error as Error).message})`);
  }
}

function blockBounds(text: string, kind: MediaKind, file: string) {
  const { begin, end } = markers(kind);
  const beginAt = text.indexOf(begin);
  const endAt = text.indexOf(end);
  if (beginAt === -1 || endAt === -1 || endAt < beginAt || text.indexOf(begin, beginAt + 1) !== -1) {
    throw new CanonicalFormatError(`${file}: expected exactly one "${begin}" … "${end}" block`);
  }
  const innerStart = text.indexOf('\n', beginAt) + 1;
  const lineStart = text.lastIndexOf('\n', endAt) + 1;
  return { innerStart, innerEnd: lineStart, indent: text.slice(lineStart, endAt) };
}

export function readGeneratedBlock<T>(text: string, kind: MediaKind, file: string): T[] {
  const { innerStart, innerEnd } = blockBounds(text, kind, file);
  const inner = text.slice(innerStart, innerEnd).trim().replace(/,\s*$/, '');
  if (!inner) return [];
  try {
    const parsed = JSON.parse(`[${inner}]`) as unknown;
    if (!Array.isArray(parsed) || parsed.some((entry) => typeof entry !== 'object' || entry === null)) throw new Error('not an array of objects');
    return parsed as T[];
  } catch (error) {
    throw new CanonicalFormatError(
      `${file}: the generated ${kind} block is not plain JSON (${(error as Error).message}). ` +
      'Restore it from git, or fix the hand edit so every entry is a JSON object.'
    );
  }
}

function ordered(entry: object, keys: readonly string[]): Record<string, unknown> {
  const source = entry as Record<string, unknown>;
  const extra = Object.keys(source).filter((key) => !keys.includes(key));
  if (extra.length) throw new CanonicalFormatError(`generated entry ${String(source.id)} has unknown fields: ${extra.join(', ')}`);
  const out: Record<string, unknown> = {};
  for (const key of keys) if (source[key] !== undefined) out[key] = source[key];
  return out;
}

const numericId = (id: string) => Number(/(\d+)$/.exec(id)?.[1] ?? Number.MAX_SAFE_INTEGER);

export function writeGeneratedBlock(text: string, kind: MediaKind, entries: object[], file: string): string {
  const { innerStart, innerEnd, indent } = blockBounds(text, kind, file);
  const keys = kind === 'photos' ? PHOTO_KEYS : VIDEO_KEYS;
  const sorted = [...entries].sort((a, b) => {
    const left = String((a as { id: string }).id);
    const right = String((b as { id: string }).id);
    return numericId(left) - numericId(right) || left.localeCompare(right);
  });
  const body = sorted
    .map((entry) => JSON.stringify(ordered(entry, keys), null, 2).split('\n').map((line) => indent + line).join('\n'))
    .join(',\n');
  return text.slice(0, innerStart) + (body ? `${body}\n` : '') + text.slice(innerEnd);
}

export function parseCanonical(archiveText: string, videoText: string, ctx: PipelineContext): CanonicalState {
  return {
    archiveText,
    videoText,
    curatedPhotos: readArrayLiteral<CanonicalPhoto>(archiveText, 'curatedMemoryArchive', ctx.archiveModule),
    ingestedPhotos: readGeneratedBlock<CanonicalPhoto>(archiveText, 'photos', ctx.archiveModule),
    curatedVideos: readArrayLiteral<CanonicalVideo>(videoText, 'curatedMemoryVideos', ctx.videoModule),
    ingestedVideos: readGeneratedBlock<CanonicalVideo>(videoText, 'videos', ctx.videoModule),
    groups: readArrayLiteral<{ id: string; label: string }>(archiveText, 'memoryArchiveGroups', ctx.archiveModule)
  };
}

export function readCanonical(ctx: PipelineContext): CanonicalState {
  return parseCanonical(readFileSync(ctx.archiveModule, 'utf8'), readFileSync(ctx.videoModule, 'utf8'), ctx);
}

/* ─── The curation manifest ──────────────────────────────────────────────── */

export interface IngestStamp {
  pipeline: 'EP43';
  batch: string;
  /** null for a source the privacy review rejected: it has no canonical entry. */
  id: string | null;
  yearId: string | null;
  yearSource: string | null;
}

export interface PrivacyReviewRecord {
  status: 'approved' | 'rejected';
  reviewedBy: string;
  note: string | null;
  confirmed: string[];
  sourceMetadata: string[];
}

export interface ManifestFileRecord {
  sourceFileId: string | null;
  sourceFilename: string;
  sourceFolder?: string;
  mimeType: string;
  mediaType: string;
  sha256: string;
  productionAssets: string[];
  thumb: string | null;
  productionStatus: string;
  ingest?: IngestStamp;
  [key: string]: unknown;
}

export interface ManifestVideoRecord {
  id: string | null;
  sourceFilename: string;
  sha256: string;
  runtimeVideo: string | null;
  poster: string | null;
  role: string;
  ingest?: IngestStamp;
  [key: string]: unknown;
}

export interface CurationManifest {
  files: ManifestFileRecord[];
  part2?: { files: ManifestFileRecord[] };
  videoCuration: ManifestVideoRecord[];
  [key: string]: unknown;
}

export function parseManifest(text: string, file: string): CurationManifest {
  let parsed: CurationManifest;
  try {
    parsed = JSON.parse(text) as CurationManifest;
  } catch (error) {
    throw new CanonicalFormatError(`${file}: not valid JSON (${(error as Error).message})`);
  }
  if (!Array.isArray(parsed.files) || !Array.isArray(parsed.videoCuration)) {
    throw new CanonicalFormatError(`${file}: expected "files" and "videoCuration" arrays`);
  }
  return parsed;
}

/** Same formatting the Python curation tools write (indent 1, trailing newline), so diffs stay minimal. */
export function serializeManifest(manifest: CurationManifest): string {
  return `${JSON.stringify(manifest, null, 1)}\n`;
}

/** Every provenance record with a content hash, across all historical passes. */
export function manifestRecords(manifest: CurationManifest): Array<ManifestFileRecord | ManifestVideoRecord> {
  return [...manifest.files, ...(manifest.part2?.files ?? []), ...manifest.videoCuration];
}
