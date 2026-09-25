/**
 * EP43 — the ingestion workflow.
 *
 *   source folder + media.json
 *     → validation          (request, filenames, types, decode, duplicates, ids)
 *     → year / group         (owner-supplied only; resolveMediaYear from the app)
 *     → privacy review       (explicit status; deterministic checks to confirm)
 *     → derivatives          (staged under .media-staging/, never in public/)
 *     → canonical update     (generated blocks + manifest provenance, staged)
 *     → final validation     (the staged result, exactly as it would ship)
 *     → promote              (journaled; any failure rolls everything back)
 *     → post-validation      (the live repository; rolled back if it fails)
 *
 * Nothing under frontend/ or tools/ changes until the staged result is valid,
 * and no existing file is ever overwritten except the three canonical data
 * files, which are replaced atomically with backups kept for rollback.
 */
import { createHash } from 'node:crypto';
import {
  closeSync,
  constants,
  copyFileSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  unlinkSync,
  writeFileSync,
  writeSync
} from 'node:fs';
import path from 'node:path';

import { resolveMediaYear } from '../../frontend/src/data/archiveYears.ts';
import { relationshipYearAt, relationshipYears, type RelationshipYearId } from '../../frontend/src/data/relationshipYears.ts';
import {
  DEFAULT_VIDEO_LABEL,
  GROUP_DATE_LABELS,
  NEAR_DUPLICATE_DISTANCE,
  PHOTO_ID,
  PHOTO_LOW_EDGE,
  PHOTO_MIN_EDGE,
  PHOTO_URL_DIR,
  PIPELINE_ID,
  POSTER_URL_DIR,
  THUMB_URL_DIR,
  VIDEO_ARCHIVE_SHORT_EDGE,
  VIDEO_ID,
  VIDEO_URL_DIR,
  urlToFile,
  type PipelineContext
} from './config.ts';
import {
  manifestRecords,
  parseCanonical,
  parseManifest,
  readCanonical,
  serializeManifest,
  writeGeneratedBlock,
  type CanonicalPhoto,
  type CanonicalState,
  type CanonicalVideo,
  type CurationManifest,
  type IngestStamp,
  type ManifestFileRecord,
  type ManifestVideoRecord,
  type PrivacyReviewRecord
} from './canonical.ts';
import {
  differenceHash,
  fullDerivative,
  hammingDistance,
  inspectImage,
  posterDerivative,
  thumbDerivative,
  type ImageInspection
} from './images.ts';
import { IssueLog, PipelineError } from './issues.ts';
import { probeMp4, type Mp4Probe } from './mp4.ts';
import { loadRequest, type IngestRequest, type RequestItem } from './request.ts';
import { publicResolver, stagedResolver, validateCanonical } from './validate.ts';
import { extractPosterFrame, planVideo, videoDerivative, type VideoPlan } from './videos.ts';

export type IngestStatus = 'published' | 'unchanged' | 'dry-run' | 'blocked' | 'awaiting-review' | 'failed';

export interface IngestResult {
  status: IngestStatus;
  exitCode: 0 | 1 | 2 | 3;
  batch: string | null;
  log: IssueLog;
  published: string[];
  rejected: string[];
  unchanged: string[];
  pending: string[];
  /** Repository-relative paths created or modified (or that would be, on a dry run). */
  changedFiles: string[];
}

export interface IngestOptions {
  dryRun?: boolean;
  /** Test hook: throw during promotion after N file operations, to exercise rollback. */
  failAfterPromoteSteps?: number;
}

const SENSITIVE_NAME = /(screen ?shot|screen[-_ ]?capture|scan|passport|id[-_ ]?card|licen[cs]e|certificate|document|receipt|slip|invoice|bank|statement|contract|medical|ultrasound|prescription|บัตร|สลิป|เอกสาร|ใบเสร็จ|ทะเบียน|พาสปอร์ต|ใบขับขี่)/i;

const DECLARED_YEARS = new Set<string>(relationshipYears.map((year) => year.id));

interface PlannedPhoto {
  item: RequestItem;
  kind: 'photo';
  source: string;
  bytes: Buffer;
  sha256: string;
  inspection: ImageInspection;
  hash: string;
  entry: CanonicalPhoto;
}

interface PlannedVideo {
  item: RequestItem;
  kind: 'video';
  source: string;
  bytes: Buffer;
  sha256: string;
  probe: Mp4Probe;
  plan: VideoPlan;
  entry: CanonicalVideo;
}

interface RejectedItem {
  item: RequestItem;
  source: string;
  bytes: Buffer;
  sha256: string;
  inspection?: ImageInspection;
  probe?: Mp4Probe;
}

const sha256Of = (buffer: Buffer) => createHash('sha256').update(buffer).digest('hex');
const relative = (ctx: PipelineContext, file: string) => path.relative(ctx.root, file).split(path.sep).join('/');

/* ─── Relationship year: explicit owner input only ───────────────────────── */

export function resolveItemYear(
  item: Pick<RequestItem, 'file' | 'yearId' | 'capturedOn'>,
  log: IssueLog
): { yearId: RelationshipYearId; yearSource: 'owner-override' | 'capture-date' } | null {
  const asset = item.file;
  if (!item.yearId && !item.capturedOn) {
    log.error(asset, 'year-missing', 'no relationship year',
      `Add "yearId" (${[...DECLARED_YEARS].join(' | ')}) or an owner-confirmed "capturedOn" date. File dates are never used.`);
    return null;
  }
  if (item.yearId && !DECLARED_YEARS.has(item.yearId)) {
    log.error(asset, 'year-undeclared', `yearId "${item.yearId}" is not declared in frontend/src/data/relationshipYears.ts`,
      'Declare the year there first (deliberately), or use a declared one.');
    return null;
  }
  if (item.capturedOn) {
    const derived = resolveMediaYear({ captureDate: item.capturedOn });
    if (derived.yearId === 'unassigned') {
      log.error(asset, 'year-before-start', `capturedOn ${item.capturedOn} is before the relationship start`,
        'Check the date. The archive only holds media from the relationship years.');
      return null;
    }
    if (!DECLARED_YEARS.has(derived.yearId)) {
      log.error(asset, 'year-undeclared', `capturedOn ${item.capturedOn} falls in ${derived.yearId}, which relationshipYears.ts does not declare yet`);
      return null;
    }
    if (item.yearId && item.yearId !== derived.yearId) {
      log.error(asset, 'year-conflict', `yearId "${item.yearId}" disagrees with capturedOn ${item.capturedOn} (${derived.yearId})`,
        'Keep only the one that is true.');
      return null;
    }
    if (!item.yearId) return { yearId: derived.yearId, yearSource: 'capture-date' };
  }
  return { yearId: item.yearId as RelationshipYearId, yearSource: 'owner-override' };
}

/* ─── Existing state: ids, hashes, files ─────────────────────────────────── */

interface Existing {
  state: CanonicalState;
  manifest: CurationManifest;
  archiveText: string;
  videoText: string;
  manifestText: string;
  photoIds: Set<string>;
  videoIds: Set<string>;
  urls: Set<string>;
  bySha: Map<string, ManifestFileRecord | ManifestVideoRecord>;
  nextPhoto: number;
  nextVideo: number;
  thumbHashes: Array<{ id: string; hash: string }>;
}

function maxNumber(values: Iterable<string>, pattern: RegExp): number {
  let max = 0;
  for (const value of values) {
    const match = pattern.exec(value);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return max;
}

function listDir(dir: string): string[] {
  return existsSync(dir) ? readdirSync(dir) : [];
}

function manifestUrlsOf(records: Array<ManifestFileRecord | ManifestVideoRecord>): string[] {
  return records.flatMap((record) => [
    ...((record as ManifestFileRecord).productionAssets ?? []),
    String((record as ManifestFileRecord).thumb ?? ''),
    String((record as ManifestVideoRecord).runtimeVideo ?? ''),
    String((record as ManifestVideoRecord).poster ?? '')
  ]).filter(Boolean);
}

/**
 * The next free photo and clip numbers: one past everything that exists or ever
 * existed — canonical entries, manifest records and files on disk — so a number
 * that once belonged to an excluded or deleted source is never reused.
 */
export function nextFreeNumbers(ctx: PipelineContext, state: CanonicalState, manifest: CurationManifest): { photo: number; video: number } {
  const records = manifestRecords(manifest);
  const urls = manifestUrlsOf(records).map((url) => path.posix.basename(url, path.posix.extname(url)));
  const recordIds = records.map((record) => String(record.ingest?.id ?? (record as ManifestVideoRecord).id ?? ''));
  const fileIds = (url: string) => listDir(urlToFile(ctx.publicDir, url)).map((name) => path.basename(name, path.extname(name)));
  const photoCandidates = [...state.curatedPhotos, ...state.ingestedPhotos].map((photo) => photo.id);
  const videoCandidates = [...state.curatedVideos, ...state.ingestedVideos].map((clip) => clip.id);
  return {
    photo: 1 + maxNumber([...photoCandidates, ...recordIds, ...urls, ...fileIds(PHOTO_URL_DIR), ...fileIds(THUMB_URL_DIR)], PHOTO_ID),
    video: 1 + maxNumber([...videoCandidates, ...recordIds, ...urls, ...fileIds(VIDEO_URL_DIR), ...fileIds(POSTER_URL_DIR)], VIDEO_ID)
  };
}

async function loadExisting(ctx: PipelineContext): Promise<Existing> {
  const archiveText = readFileSync(ctx.archiveModule, 'utf8');
  const videoText = readFileSync(ctx.videoModule, 'utf8');
  const manifestText = readFileSync(ctx.manifestPath, 'utf8');
  const state = parseCanonical(archiveText, videoText, ctx);
  const manifest = parseManifest(manifestText, ctx.manifestPath);

  const photos = [...state.curatedPhotos, ...state.ingestedPhotos];
  const videos = [...state.curatedVideos, ...state.ingestedVideos];
  const records = manifestRecords(manifest);
  const bySha = new Map<string, ManifestFileRecord | ManifestVideoRecord>();
  for (const record of records) if (record.sha256) bySha.set(record.sha256, record);

  const urls = new Set<string>([
    ...photos.flatMap((photo) => [photo.image, photo.thumb]),
    ...videos.flatMap((clip) => [clip.video, clip.poster])
  ]);
  const manifestUrls = manifestUrlsOf(records);
  const photoIds = new Set(photos.map((photo) => photo.id));
  const videoIds = new Set(videos.map((clip) => clip.id));
  const { photo: nextPhoto, video: nextVideo } = nextFreeNumbers(ctx, state, manifest);

  const thumbHashes: Array<{ id: string; hash: string }> = [];
  const thumbDir = urlToFile(ctx.publicDir, THUMB_URL_DIR);
  for (const name of listDir(thumbDir).sort()) {
    if (!name.endsWith('.webp')) continue;
    try {
      thumbHashes.push({ id: path.basename(name, '.webp'), hash: await differenceHash(readFileSync(path.join(thumbDir, name))) });
    } catch {
      // An unreadable existing thumb is media:check's business, not a reason to block an ingest.
    }
  }

  return {
    state, manifest, archiveText, videoText, manifestText, photoIds, videoIds,
    urls: new Set([...urls, ...manifestUrls]),
    bySha, nextPhoto, nextVideo, thumbHashes
  };
}

/* ─── Privacy and confirmation checks ────────────────────────────────────── */

function requireConfirmations(item: RequestItem, raised: Map<string, string>, log: IssueLog): void {
  for (const [code, reason] of raised) {
    if (!item.confirm.includes(code)) {
      log.error(item.file, 'confirmation-required', `${reason}`,
        `Look at the file. If it is fine to publish, add "${code}" to this item's "confirm" array.`);
    }
  }
  for (const code of item.confirm) {
    if (!raised.has(code)) log.warn(item.file, 'confirmation-unused', `"${code}" is confirmed but that check did not trigger`);
  }
}

function sourceMetadataSummary(inspection?: ImageInspection, probe?: Mp4Probe): string[] {
  const found: string[] = [];
  if (inspection?.hasExif) found.push('exif');
  if (inspection?.hasGps) found.push('gps');
  if (inspection?.hasXmp) found.push('xmp');
  if (inspection?.hasIptc) found.push('iptc');
  if (probe?.metadataBoxes.length) found.push(...new Set(probe.metadataBoxes));
  if (probe?.hasLocation) found.push('location');
  return found;
}

/* ─── Planning (read-only) ───────────────────────────────────────────────── */

function checkGroup(item: RequestItem, groups: Map<string, string>, log: IssueLog): void {
  const choices = [...groups.keys()].join(', ');
  if (!item.group) log.error(item.file, 'group-missing', 'no archive group', `Add "group": one of ${choices}.`);
  else if (!groups.has(item.group)) log.error(item.file, 'group-invalid', `group "${item.group}" is not in memoryArchiveGroups`, `Use one of ${choices}.`);
}

interface Plan {
  request: IngestRequest;
  photos: PlannedPhoto[];
  videos: PlannedVideo[];
  rejected: RejectedItem[];
  unchanged: string[];
  pending: string[];
}

async function planBatch(ctx: PipelineContext, existing: Existing, request: IngestRequest, log: IssueLog): Promise<Plan> {
  const plan: Plan = { request, photos: [], videos: [], rejected: [], unchanged: [], pending: [] };
  const batchSha = new Map<string, string>();
  const batchIds = new Set<string>();
  const batchHashes: Array<{ id: string; hash: string }> = [];
  const groups = new Map(existing.state.groups.map((group) => [group.id, group.label]));
  const ingestedById = new Map<string, CanonicalPhoto | CanonicalVideo>(
    [...existing.state.ingestedPhotos, ...existing.state.ingestedVideos].map((entry) => [entry.id, entry])
  );
  let nextPhoto = existing.nextPhoto;
  let nextVideo = existing.nextVideo;

  for (const item of request.items) {
    const asset = item.file;
    const source = path.join(request.sourceDir, item.file);
    if (!existsSync(source)) continue; // reported by loadRequest
    const bytes = readFileSync(source);
    const sha256 = sha256Of(bytes);

    const twin = batchSha.get(sha256);
    if (twin) {
      log.error(asset, 'duplicate-content', `identical bytes to "${twin}" in this batch`, 'Keep one copy.');
      continue;
    }
    batchSha.set(sha256, asset);

    // Already known content: a rerun of this batch, or a duplicate of something established.
    const known = existing.bySha.get(sha256);
    if (known) {
      const stamp = known.ingest;
      if (!stamp || stamp.batch !== request.batch) {
        const where = stamp ? `batch "${stamp.batch}" as ${stamp.id ?? 'a rejected item'}` : `the established archive as "${known.sourceFilename}"`;
        log.error(asset, 'duplicate-content', `already in ${where}`, 'Remove it from this batch; the archive already has it.');
        continue;
      }
      const wasRejected = stamp.id === null;
      if (wasRejected !== (item.privacy.status === 'rejected')) {
        log.error(asset, 'review-changed', `recorded as ${wasRejected ? 'rejected' : `published (${stamp.id})`} in this batch; the request now says "${item.privacy.status}"`,
          'A rerun never reverses a publish decision. Change the canonical entry and its manifest record deliberately.');
        continue;
      }
      if (!wasRejected) {
        const entry = ingestedById.get(stamp.id!);
        if (!entry) {
          log.error(asset, 'canonical-missing', `the manifest records it as ${stamp.id}, but the canonical entry is gone`,
            'Restore the entry from git, or remove its manifest record deliberately.');
          continue;
        }
        const year = resolveItemYear(item, new IssueLog());
        const changed: string[] = [];
        if (year && (entry.yearId !== year.yearId || entry.yearSource !== year.yearSource)) changed.push('year');
        if (item.kind === 'photo') {
          const photo = entry as CanonicalPhoto;
          if (item.group !== photo.group) changed.push('group');
          if (item.groupLabel && item.groupLabel !== photo.groupLabel) changed.push('groupLabel');
          if (item.dateLabel && item.dateLabel !== photo.dateLabel) changed.push('dateLabel');
          if (item.special !== photo.special) changed.push('special');
        } else if ((item.label ?? DEFAULT_VIDEO_LABEL) !== (entry as CanonicalVideo).label) {
          changed.push('label');
        }
        if (item.id && item.id !== stamp.id) changed.push('id');
        if (changed.length) {
          log.error(asset, 'already-ingested-changed', `already published as ${stamp.id}; the request now changes ${changed.join(', ')}`,
            'Ingestion never rewrites a published entry. Edit it in the data file deliberately, or restore media.json.');
          continue;
        }
      }
      plan.unchanged.push(asset);
      continue;
    }

    // Decode before anything else: an unreadable file is an error regardless of review state.
    let inspection: ImageInspection | undefined;
    let probe: Mp4Probe | undefined;
    try {
      if (item.kind === 'photo') inspection = await inspectImage(bytes);
      else probe = probeMp4(bytes);
    } catch (error) {
      const hint = /heif|heic/i.test(path.extname(item.file))
        ? 'This build of libvips cannot decode HEIC. Export it as JPEG (full quality) and ingest that.'
        : 'Re-export the file from its source; it is truncated, corrupt, or not what its extension says.';
      log.error(asset, 'unreadable', `cannot be decoded: ${(error as Error).message}`, hint);
      continue;
    }

    if (item.privacy.status === 'pending') {
      // Report the other gaps now too, so the owner fills media.json in one pass.
      resolveItemYear(item, log);
      if (item.kind === 'photo') checkGroup(item, groups, log);
      plan.pending.push(asset);
      continue;
    }
    if (item.privacy.status === 'rejected') {
      plan.rejected.push({ item, source, bytes, sha256, inspection, probe });
      continue;
    }

    const year = resolveItemYear(item, log);
    const raised = new Map<string, string>();
    if (SENSITIVE_NAME.test(item.file) || (item.poster && SENSITIVE_NAME.test(item.poster))) {
      raised.set('filename-sensitive', 'the filename suggests a document, screenshot or scan');
    }
    const metadata = sourceMetadataSummary(inspection, probe);
    if (metadata.length) log.note(asset, 'metadata-removed', `source carries ${metadata.join(', ')}; derivatives are written without it and verified`);

    // Stable id: explicit, or the next free number after everything that exists or ever existed.
    let id = item.id;
    if (id) {
      const taken = item.kind === 'photo' ? existing.photoIds : existing.videoIds;
      if (taken.has(id) || batchIds.has(id)) {
        log.error(asset, 'id-collision', `id "${id}" is already used`, 'Omit "id" to take the next free one.');
        continue;
      }
      const number = Number(/(\d+)$/.exec(id)![1]);
      if (number < (item.kind === 'photo' ? existing.nextPhoto : existing.nextVideo)) {
        log.error(asset, 'id-collision', `id "${id}" is below the next free number; old numbers may belong to excluded sources`,
          'Omit "id" to take the next free one.');
        continue;
      }
    } else if (item.kind === 'photo') {
      do id = `memory-${String(nextPhoto++).padStart(3, '0')}`; while (batchIds.has(id));
    } else {
      do id = `memory-clip-${String(nextVideo++).padStart(2, '0')}`; while (batchIds.has(id));
    }
    batchIds.add(id);

    if (item.kind === 'photo' && inspection) {
      const longEdge = Math.max(inspection.width, inspection.height);
      if (longEdge < PHOTO_MIN_EDGE) {
        log.error(asset, 'too-small', `${inspection.width}×${inspection.height} is below the ${PHOTO_MIN_EDGE}px minimum`, 'Find the original, larger file.');
      } else if (longEdge < PHOTO_LOW_EDGE) {
        raised.set('low-resolution', `${inspection.width}×${inspection.height} will look soft in the full-screen viewer`);
      }
      if (inspection.format === 'png') raised.set('source-png', 'PNG sources are usually screenshots or exports');

      const hash = await differenceHash(bytes);
      const near = [...existing.thumbHashes, ...batchHashes]
        .map((other) => ({ ...other, distance: hammingDistance(hash, other.hash) }))
        .filter((other) => other.distance <= NEAR_DUPLICATE_DISTANCE)
        .sort((a, b) => a.distance - b.distance)[0];
      if (near) raised.set('near-duplicate', `looks almost identical to ${near.id} (distance ${near.distance})`);
      batchHashes.push({ id: `${id} (${asset})`, hash });

      checkGroup(item, groups, log);
      if (inspection.exifDate && year) {
        const exifYear = relationshipYearAt(inspection.exifDate.slice(0, 10)).id;
        if (exifYear && exifYear !== year.yearId) {
          log.warn(asset, 'exif-year-differs', `file metadata suggests ${exifYear} (${inspection.exifDate}); using the owner-supplied ${year.yearId}`);
        }
      }
      requireConfirmations(item, raised, log);
      if (!year || !item.group || !groups.has(item.group)) continue;

      const image = `${PHOTO_URL_DIR}/${id}.webp`;
      const thumb = `${THUMB_URL_DIR}/${id}.webp`;
      plan.photos.push({
        item, kind: 'photo', source, bytes, sha256, inspection, hash,
        entry: {
          id, image, thumb, width: 0, height: 0,
          group: item.group,
          groupLabel: item.groupLabel ?? groups.get(item.group)!,
          dateLabel: item.dateLabel ?? GROUP_DATE_LABELS[item.group] ?? item.group.toUpperCase(),
          special: item.special,
          privacy: 'safe',
          yearId: year.yearId,
          yearSource: year.yearSource
        }
      });
    } else if (item.kind === 'video' && probe) {
      const videoPlan = planVideo(probe, path.extname(item.file).toLowerCase());
      if (videoPlan.mode === 'transcode' && !ctx.ffmpegPath) {
        log.error(asset, 'ffmpeg-required', `needs transcoding (${videoPlan.reasons.join(', ')}) and no ffmpeg was found`,
          'Install ffmpeg (or set FFMPEG_PATH), or export the clip as an H.264/AAC MP4 and ingest that.');
      }
      if (!item.poster && !ctx.ffmpegPath) {
        log.error(asset, 'poster-required', 'no "poster" image and no ffmpeg to take a frame',
          'Add a still of the clip to the folder and name it in "poster", or install ffmpeg.');
      }
      if (Math.min(probe.width, probe.height) < 480) {
        raised.set('low-resolution', `${probe.width}×${probe.height} is below shippable quality for the archive`);
      } else if (videoPlan.mode === 'passthrough' && Math.min(probe.width, probe.height) > VIDEO_ARCHIVE_SHORT_EDGE) {
        log.warn(asset, 'oversized-video', `${probe.width}×${probe.height} ships as-is; archive clips are ${VIDEO_ARCHIVE_SHORT_EDGE}px on the short edge`,
          'Fine for playback. To match the policy, export at 720p before ingesting.');
      }
      if (probe.hasAudio) raised.set('audio-track', 'the clip has an audio track; speech can reveal names, places or other people');
      requireConfirmations(item, raised, log);
      if (!year) continue;

      plan.videos.push({
        item, kind: 'video', source, bytes, sha256, probe, plan: videoPlan,
        entry: {
          id,
          video: `${VIDEO_URL_DIR}/${id}.mp4`,
          poster: `${POSTER_URL_DIR}/${id}.jpg`,
          width: 0, height: 0, posterWidth: 0, posterHeight: 0, duration: 0,
          orientation: 'portrait',
          role: 'archive',
          label: item.label ?? DEFAULT_VIDEO_LABEL,
          hasAudio: false,
          yearId: year.yearId,
          yearSource: year.yearSource
        }
      });
    }
  }

  // No silent overwrite: every target must be new, in canonical data, in the manifest and on disk.
  for (const planned of [...plan.photos, ...plan.videos]) {
    const targets = planned.kind === 'photo'
      ? [planned.entry.image, planned.entry.thumb]
      : [planned.entry.video, planned.entry.poster];
    for (const url of targets) {
      if (existing.urls.has(url) || existsSync(urlToFile(ctx.publicDir, url))) {
        log.error(planned.item.file, 'would-overwrite', `${url} already exists`, 'Omit "id" so a free one is chosen, or remove the stray file deliberately.');
      }
    }
  }
  return plan;
}

/* ─── Staging ────────────────────────────────────────────────────────────── */

interface StagedFile {
  url: string;
  staged: string;
}

function stage(stagingPublic: string, url: string, buffer: Buffer, files: StagedFile[]): void {
  const staged = urlToFile(stagingPublic, url);
  mkdirSync(path.dirname(staged), { recursive: true });
  writeFileSync(staged, buffer);
  files.push({ url, staged });
}

const CODEC_NAMES: Record<string, string> = { avc1: 'h264', avc3: 'h264', hvc1: 'hevc', hev1: 'hevc' };

function privacyRecord(item: RequestItem, metadata: string[]): PrivacyReviewRecord {
  return {
    status: item.privacy.status === 'rejected' ? 'rejected' : 'approved',
    reviewedBy: item.privacy.reviewedBy ?? '',
    note: item.privacy.note ?? null,
    confirmed: [...item.confirm].sort(),
    sourceMetadata: metadata
  };
}

function stampOf(batch: string, id: string | null, entry?: { yearId?: string; yearSource?: string }): IngestStamp {
  return { pipeline: PIPELINE_ID, batch, id, yearId: entry?.yearId ?? null, yearSource: entry?.yearSource ?? null };
}

async function buildStaged(ctx: PipelineContext, plan: Plan, stagingPublic: string, log: IssueLog) {
  const staged: StagedFile[] = [];
  const photoRecords: ManifestFileRecord[] = [];
  const videoRecords: ManifestVideoRecord[] = [];
  const batch = plan.request.batch;

  for (const photo of plan.photos) {
    const full = await fullDerivative(photo.bytes, photo.inspection);
    const thumb = await thumbDerivative(photo.bytes);
    if (full.passthrough) log.note(photo.item.file, 'passthrough', 'already a clean WebP within 1600px; kept byte-for-byte');
    photo.entry.width = full.width;
    photo.entry.height = full.height;
    stage(stagingPublic, photo.entry.image, full.buffer, staged);
    stage(stagingPublic, photo.entry.thumb, thumb.buffer, staged);
    photoRecords.push({
      sourceFileId: null,
      sourceFilename: photo.item.file,
      sourceFolder: `ingest:${batch}`,
      mimeType: `image/${photo.inspection.format === 'jpeg' ? 'jpeg' : photo.inspection.format}`,
      mediaType: 'image',
      sourceBytes: photo.bytes.length,
      dimensions: { width: photo.inspection.width, height: photo.inspection.height },
      captureDate: null,
      gpsInternal: null,
      sha256: photo.sha256,
      phash: photo.hash,
      event: null,
      category: 'C. MEMORY GALLERY',
      duplicateGroup: null,
      privacy: 'safe',
      ownerConfirmed: false,
      productionAssets: [photo.entry.image],
      thumb: photo.entry.thumb,
      runtimeLocation: 'local',
      productionStatus: 'used',
      excludedReason: null,
      privacyReview: privacyRecord(photo.item, sourceMetadataSummary(photo.inspection)),
      ingest: stampOf(batch, photo.entry.id, photo.entry)
    });
  }

  for (const clip of plan.videos) {
    const derivative = videoDerivative(clip.source, clip.plan, ctx.ffmpegPath, clip.item.file);
    const probe = derivative.probe;
    const stillSource = clip.item.poster
      ? readFileSync(path.join(plan.request.sourceDir, clip.item.poster))
      : extractPosterFrame(derivative.buffer, probe.duration, ctx.ffmpegPath!, clip.item.file);
    const poster = await posterDerivative(stillSource);
    if (Math.sign(poster.width - poster.height) !== Math.sign(probe.width - probe.height)) {
      log.warn(clip.item.file, 'poster-orientation', `poster ${poster.width}×${poster.height} and clip ${probe.width}×${probe.height} differ in orientation`);
    }
    Object.assign(clip.entry, {
      width: probe.width,
      height: probe.height,
      posterWidth: poster.width,
      posterHeight: poster.height,
      duration: probe.duration,
      orientation: probe.height > probe.width ? 'portrait' : 'landscape',
      hasAudio: probe.hasAudio
    });
    stage(stagingPublic, clip.entry.video, derivative.buffer, staged);
    stage(stagingPublic, clip.entry.poster, poster.buffer, staged);
    videoRecords.push({
      id: clip.entry.id,
      sourceFolder: `ingest:${batch}`,
      sourceFilename: clip.item.file,
      sourceFileId: null,
      sourceBytes: clip.bytes.length,
      productionBytes: derivative.buffer.length,
      duration: clip.probe.duration,
      orientation: clip.probe.height > clip.probe.width ? 'portrait' : 'landscape',
      dimensions: { width: clip.probe.width, height: clip.probe.height },
      runtimeDimensions: { width: probe.width, height: probe.height },
      codec: CODEC_NAMES[clip.probe.videoCodec] ?? clip.probe.videoCodec,
      sha256: clip.sha256,
      privacyStatus: 'safe',
      role: 'archive',
      confidence: 'HIGH',
      poster: clip.entry.poster,
      preview: null,
      runtimeVideo: clip.entry.video,
      sourceHasAudioTrack: clip.probe.hasAudio,
      runtimeHasAudioTrack: probe.hasAudio,
      audioMeanDb: null,
      hasMeaningfulAudio: probe.hasAudio ? 'OWNER_DECISION' : false,
      storyPlacement: null,
      exclusionReason: null,
      note: derivative.transcoded ? `transcoded: ${clip.plan.reasons.join(', ')}` : 'H.264 source kept; metadata boxes blanked',
      privacyReview: privacyRecord(clip.item, sourceMetadataSummary(undefined, clip.probe)),
      ingest: stampOf(batch, clip.entry.id, clip.entry)
    });
  }

  for (const rejected of plan.rejected) {
    const reason = `privacy review: rejected by ${rejected.item.privacy.reviewedBy}${rejected.item.privacy.note ? ` — ${rejected.item.privacy.note}` : ''}`;
    const review = privacyRecord(rejected.item, sourceMetadataSummary(rejected.inspection, rejected.probe));
    if (rejected.item.kind === 'photo') {
      photoRecords.push({
        sourceFileId: null,
        sourceFilename: rejected.item.file,
        sourceFolder: `ingest:${batch}`,
        mimeType: `image/${rejected.inspection?.format ?? 'unknown'}`,
        mediaType: 'image',
        sourceBytes: rejected.bytes.length,
        dimensions: rejected.inspection ? { width: rejected.inspection.width, height: rejected.inspection.height } : null,
        captureDate: null,
        gpsInternal: null,
        sha256: rejected.sha256,
        phash: null,
        event: null,
        category: 'E. PRIVATE / EXCLUDED',
        duplicateGroup: null,
        privacy: 'private',
        ownerConfirmed: false,
        productionAssets: [],
        thumb: null,
        runtimeLocation: null,
        productionStatus: 'excluded',
        excludedReason: reason,
        privacyReview: review,
        ingest: stampOf(batch, null)
      });
    } else {
      videoRecords.push({
        id: null,
        sourceFolder: `ingest:${batch}`,
        sourceFilename: rejected.item.file,
        sourceFileId: null,
        sourceBytes: rejected.bytes.length,
        productionBytes: null,
        duration: rejected.probe?.duration ?? null,
        orientation: rejected.probe && rejected.probe.height > rejected.probe.width ? 'portrait' : 'landscape',
        dimensions: rejected.probe ? { width: rejected.probe.width, height: rejected.probe.height } : null,
        runtimeDimensions: null,
        codec: rejected.probe ? (CODEC_NAMES[rejected.probe.videoCodec] ?? rejected.probe.videoCodec) : null,
        sha256: rejected.sha256,
        privacyStatus: 'excluded',
        role: 'EXCLUDE',
        confidence: 'HIGH',
        poster: null,
        preview: null,
        runtimeVideo: null,
        sourceHasAudioTrack: rejected.probe?.hasAudio ?? null,
        runtimeHasAudioTrack: false,
        audioMeanDb: null,
        hasMeaningfulAudio: 'OWNER_DECISION',
        storyPlacement: null,
        exclusionReason: reason,
        note: null,
        privacyReview: review,
        ingest: stampOf(batch, null)
      });
    }
  }
  return { staged, photoRecords, videoRecords };
}

/* ─── Promotion journal and rollback ─────────────────────────────────────── */

interface Journal {
  batch: string;
  state: 'promoting' | 'committed';
  created: string[];
  replaced: Array<{ target: string; backup: string }>;
}

const journalPath = (ctx: PipelineContext) => path.join(ctx.stagingRoot, 'journal.json');
const lockPath = (ctx: PipelineContext) => path.join(ctx.stagingRoot, '.lock');

function saveJournal(ctx: PipelineContext, journal: Journal): void {
  const file = journalPath(ctx);
  writeFileSync(`${file}.tmp`, JSON.stringify(journal, null, 2));
  renameSync(`${file}.tmp`, file);
}

function rollback(ctx: PipelineContext, journal: Journal): void {
  for (const file of [...journal.created].reverse()) {
    const absolute = path.join(ctx.root, file);
    if (existsSync(absolute)) unlinkSync(absolute);
  }
  for (const { target, backup } of [...journal.replaced].reverse()) {
    const absoluteBackup = path.join(ctx.root, backup);
    if (existsSync(absoluteBackup)) copyFileSync(absoluteBackup, path.join(ctx.root, target));
  }
}

/** A run that died mid-promotion is undone before anything else happens. */
export function recoverInterrupted(ctx: PipelineContext, log: IssueLog): void {
  const file = journalPath(ctx);
  if (!existsSync(file)) return;
  const journal = JSON.parse(readFileSync(file, 'utf8')) as Journal;
  if (journal.state !== 'committed') {
    rollback(ctx, journal);
    log.warn('batch', 'recovered', `an interrupted ingest of "${journal.batch}" was rolled back (${journal.created.length} created files removed, ${journal.replaced.length} data files restored)`);
  }
  rmSync(file, { force: true });
  rmSync(path.join(ctx.stagingRoot, journal.batch), { recursive: true, force: true });
}

function acquireLock(ctx: PipelineContext): void {
  mkdirSync(ctx.stagingRoot, { recursive: true });
  try {
    const fd = openSync(lockPath(ctx), 'wx');
    writeSync(fd, String(process.pid));
    closeSync(fd);
  } catch {
    throw new PipelineError(`another ingest holds ${relative(ctx, lockPath(ctx))}. If none is running, delete that file and rerun (the next run rolls back any half-finished promotion).`);
  }
}

function releaseLock(ctx: PipelineContext): void {
  rmSync(lockPath(ctx), { force: true });
}

function promote(
  ctx: PipelineContext,
  batch: string,
  stagingDir: string,
  staged: StagedFile[],
  texts: Array<{ target: string; next: string; expected: string }>,
  options: IngestOptions
): void {
  const journal: Journal = { batch, state: 'promoting', created: [], replaced: [] };
  saveJournal(ctx, journal);
  let steps = 0;
  const step = () => {
    steps += 1;
    if (options.failAfterPromoteSteps !== undefined && steps > options.failAfterPromoteSteps) {
      throw new PipelineError(`simulated failure after ${options.failAfterPromoteSteps} promotion steps`);
    }
  };
  try {
    // Guard against edits made while this run was working.
    for (const text of texts) {
      if (readFileSync(text.target, 'utf8') !== text.expected) {
        throw new PipelineError(`${relative(ctx, text.target)} changed during the run; nothing was promoted. Rerun.`);
      }
    }
    for (const file of staged) {
      step();
      const target = urlToFile(ctx.publicDir, file.url);
      mkdirSync(path.dirname(target), { recursive: true });
      journal.created.push(relative(ctx, target));
      saveJournal(ctx, journal);
      copyFileSync(file.staged, target, constants.COPYFILE_EXCL); // never overwrites
    }
    const backups = path.join(stagingDir, 'backup');
    mkdirSync(backups, { recursive: true });
    for (const text of texts) {
      step();
      const backup = path.join(backups, path.basename(text.target));
      copyFileSync(text.target, backup);
      journal.replaced.push({ target: relative(ctx, text.target), backup: relative(ctx, backup) });
      saveJournal(ctx, journal);
      const temporary = `${text.target}.media-pipeline.tmp`;
      writeFileSync(temporary, text.next);
      renameSync(temporary, text.target);
    }
    journal.state = 'committed';
    saveJournal(ctx, journal);
  } catch (error) {
    rollback(ctx, journal);
    rmSync(journalPath(ctx), { force: true });
    throw error;
  }
}

/* ─── Entry point ────────────────────────────────────────────────────────── */

export async function ingest(sourceDir: string, ctx: PipelineContext, options: IngestOptions = {}): Promise<IngestResult> {
  const log = new IssueLog();
  const result: IngestResult = {
    status: 'blocked', exitCode: 1, batch: null, log,
    published: [], rejected: [], unchanged: [], pending: [], changedFiles: []
  };

  try {
    acquireLock(ctx);
  } catch (error) {
    log.error('batch', 'locked', (error as Error).message);
    return result;
  }

  try {
    recoverInterrupted(ctx, log);
    const request = loadRequest(sourceDir, log);
    if (!request) return result;
    result.batch = request.batch;

    const existing = await loadExisting(ctx);
    const plan = await planBatch(ctx, existing, request, log);
    result.unchanged = plan.unchanged;
    result.pending = plan.pending;

    if (log.hasErrors()) return result;
    if (plan.pending.length) {
      for (const file of plan.pending) {
        log.error(file, 'privacy-review-pending', 'privacy review is still "pending"; nothing in this batch is published until every item is decided',
          'Look at the file, then set privacy.status to "approved" or "rejected" and privacy.reviewedBy.');
      }
      result.status = 'awaiting-review';
      result.exitCode = 2;
      return result;
    }
    if (!plan.photos.length && !plan.videos.length && !plan.rejected.length) {
      result.status = 'unchanged';
      result.exitCode = 0;
      return result;
    }

    const stagingDir = path.join(ctx.stagingRoot, request.batch);
    rmSync(stagingDir, { recursive: true, force: true });
    const stagingPublic = path.join(stagingDir, 'public');
    mkdirSync(stagingPublic, { recursive: true });

    try {
      const { staged, photoRecords, videoRecords } = await buildStaged(ctx, plan, stagingPublic, log);

      const nextArchive = plan.photos.length
        ? writeGeneratedBlock(existing.archiveText, 'photos', [...existing.state.ingestedPhotos, ...plan.photos.map((photo) => photo.entry)], ctx.archiveModule)
        : existing.archiveText;
      const nextVideos = plan.videos.length
        ? writeGeneratedBlock(existing.videoText, 'videos', [...existing.state.ingestedVideos, ...plan.videos.map((clip) => clip.entry)], ctx.videoModule)
        : existing.videoText;
      const nextManifest = parseManifest(existing.manifestText, ctx.manifestPath);
      nextManifest.files.push(...photoRecords);
      nextManifest.videoCuration.push(...videoRecords);
      const nextManifestText = serializeManifest(nextManifest);

      // Final validation of the staged result, exactly as it would ship.
      const stagedLog = new IssueLog();
      const stagedState = parseCanonical(nextArchive, nextVideos, ctx);
      await validateCanonical(stagedState, parseManifest(nextManifestText, ctx.manifestPath), stagedResolver(stagingPublic, publicResolver(ctx)), stagedLog);
      for (const issue of stagedLog.issues) log.add({ ...issue, message: `staged result: ${issue.message}` });
      if (stagedLog.hasErrors()) {
        result.status = 'failed';
        result.exitCode = 3;
        return result;
      }

      const texts = [
        { target: ctx.archiveModule, next: nextArchive, expected: existing.archiveText },
        { target: ctx.videoModule, next: nextVideos, expected: existing.videoText },
        { target: ctx.manifestPath, next: nextManifestText, expected: existing.manifestText }
      ].filter((text) => text.next !== text.expected);
      result.changedFiles = [
        ...staged.map((file) => relative(ctx, urlToFile(ctx.publicDir, file.url))),
        ...texts.map((text) => relative(ctx, text.target))
      ];
      result.published = [...plan.photos, ...plan.videos].map((entry) => `${entry.entry.id} ← ${entry.item.file}`);
      result.rejected = plan.rejected.map((entry) => entry.item.file);

      if (options.dryRun) {
        result.status = 'dry-run';
        result.exitCode = 0;
        return result;
      }

      promote(ctx, request.batch, stagingDir, staged, texts, options);

      // Post-promotion validation of the live repository.
      const liveLog = new IssueLog();
      const manifestNow = parseManifest(readFileSync(ctx.manifestPath, 'utf8'), ctx.manifestPath);
      await validateCanonical(readCanonical(ctx), manifestNow, publicResolver(ctx), liveLog);
      if (liveLog.hasErrors()) {
        const journal = JSON.parse(readFileSync(journalPath(ctx), 'utf8')) as Journal;
        rollback(ctx, journal);
        for (const issue of liveLog.issues) log.add({ ...issue, message: `after promotion: ${issue.message}` });
        log.error('batch', 'rolled-back', 'the promoted result failed validation and was rolled back');
        result.status = 'failed';
        result.exitCode = 3;
        result.changedFiles = [];
        result.published = [];
        return result;
      }
      result.status = 'published';
      result.exitCode = 0;
      return result;
    } finally {
      rmSync(journalPath(ctx), { force: true });
      rmSync(stagingDir, { recursive: true, force: true });
    }
  } catch (error) {
    const asset = error instanceof PipelineError ? error.asset : 'batch';
    log.error(asset, 'failed', (error as Error).message, 'Nothing was promoted. Fix the cause and rerun; the run is safe to repeat.');
    result.status = 'failed';
    result.exitCode = 3;
    result.changedFiles = [];
    result.published = [];
    return result;
  } finally {
    releaseLock(ctx);
  }
}
