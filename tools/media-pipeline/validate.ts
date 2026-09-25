/**
 * Canonical media integrity — the "final validation" stage of every ingest and
 * the whole of `npm run media:check`.
 *
 * It runs against a FileResolver so the same checks verify the staged result
 * (staging first, then the live public folder) before anything is promoted,
 * and the live repository afterwards.
 */
import { existsSync, readFileSync } from 'node:fs';

import { relationshipYears } from '../../frontend/src/data/relationshipYears.ts';
import {
  GROUP_DATE_LABELS,
  PHOTO_ID,
  PHOTO_URL_DIR,
  POSTER_URL_DIR,
  THUMB_URL_DIR,
  VIDEO_ID,
  VIDEO_URL_DIR,
  urlToFile,
  type PipelineContext
} from './config.ts';
import type { CanonicalPhoto, CanonicalState, CanonicalVideo, CurationManifest } from './canonical.ts';
import { verifyDerivative } from './images.ts';
import type { IssueLog } from './issues.ts';
import { probeMp4 } from './mp4.ts';

export interface FileResolver {
  exists(url: string): boolean;
  read(url: string): Buffer;
}

export function publicResolver(ctx: PipelineContext): FileResolver {
  return {
    exists: (url) => existsSync(urlToFile(ctx.publicDir, url)),
    read: (url) => readFileSync(urlToFile(ctx.publicDir, url))
  };
}

/** Staged files shadow the live public folder. */
export function stagedResolver(stagingPublic: string, live: FileResolver): FileResolver {
  return {
    exists: (url) => existsSync(urlToFile(stagingPublic, url)) || live.exists(url),
    read: (url) => (existsSync(urlToFile(stagingPublic, url)) ? readFileSync(urlToFile(stagingPublic, url)) : live.read(url))
  };
}

const DECLARED_YEARS = new Set<string>(relationshipYears.map((year) => year.id));
const YEAR_SOURCES = new Set(['owner-override', 'capture-date', 'release-default']);

function unique(log: IssueLog, kind: string, values: Array<[string, string]>): void {
  const seen = new Map<string, string>();
  for (const [owner, value] of values) {
    if (seen.has(value)) log.error(owner, 'id-collision', `${kind} "${value}" is also used by ${seen.get(value)}`);
    else seen.set(value, owner);
  }
}

function checkYear(log: IssueLog, id: string, yearId: string | undefined, yearSource: string | undefined, required: boolean): void {
  if (yearId === undefined && !required) return;
  if (!yearId || (yearId !== 'unassigned' && !DECLARED_YEARS.has(yearId))) {
    log.error(id, 'year-undeclared', `yearId "${String(yearId)}" is not declared in relationshipYears.ts`);
  }
  if (required && (!yearSource || !YEAR_SOURCES.has(yearSource) || yearSource === 'release-default')) {
    log.error(id, 'year-source-invalid', `pipeline entries need an explicit yearSource (owner-override or capture-date), got "${String(yearSource)}"`);
  }
}

async function checkIngestedPhoto(log: IssueLog, photo: CanonicalPhoto, groups: Set<string>, files: FileResolver): Promise<void> {
  const id = photo.id;
  if (!PHOTO_ID.test(id)) log.error(id, 'id-invalid', 'does not follow memory-NNN');
  if (photo.image !== `${PHOTO_URL_DIR}/${id}.webp` || photo.thumb !== `${THUMB_URL_DIR}/${id}.webp`) {
    log.error(id, 'url-convention', `image/thumb must be ${PHOTO_URL_DIR}/${id}.webp and ${THUMB_URL_DIR}/${id}.webp`);
  }
  if (!groups.has(photo.group)) log.error(id, 'group-invalid', `group "${photo.group}" is not in memoryArchiveGroups`);
  if (!photo.groupLabel || !photo.dateLabel) log.error(id, 'label-missing', 'groupLabel and dateLabel must be non-empty');
  if (typeof photo.special !== 'boolean') log.error(id, 'field-invalid', 'special must be a boolean');
  if (photo.privacy !== 'safe') log.error(id, 'privacy-invalid', `pipeline entries publish only privacy "safe", got "${photo.privacy}"`);
  checkYear(log, id, photo.yearId, photo.yearSource, true);
  for (const [url, expectWidth, expectHeight] of [[photo.image, photo.width, photo.height], [photo.thumb, null, null]] as const) {
    if (!files.exists(url)) continue; // reported by the shared existence check
    try {
      const real = await verifyDerivative(files.read(url));
      if (real.format !== 'webp') log.error(id, 'format-invalid', `${url} is ${real.format}, expected webp`);
      if (real.hasMetadata) log.error(id, 'metadata-present', `${url} still carries EXIF/XMP/IPTC metadata`);
      if (expectWidth !== null && (real.width !== expectWidth || real.height !== expectHeight)) {
        log.error(id, 'dimensions-mismatch', `${url} is ${real.width}×${real.height}, the entry says ${expectWidth}×${expectHeight}`);
      }
      if (expectWidth === null && Math.sign(real.width - real.height) !== Math.sign(photo.width - photo.height)) {
        log.error(id, 'dimensions-mismatch', `${url} orientation differs from the full image`);
      }
    } catch (error) {
      log.error(id, 'unreadable', `${url} cannot be decoded: ${(error as Error).message}`);
    }
  }
}

async function checkIngestedVideo(log: IssueLog, clip: CanonicalVideo, files: FileResolver): Promise<void> {
  const id = clip.id;
  if (!VIDEO_ID.test(id)) log.error(id, 'id-invalid', 'does not follow memory-clip-NN');
  if (clip.video !== `${VIDEO_URL_DIR}/${id}.mp4` || clip.poster !== `${POSTER_URL_DIR}/${id}.jpg`) {
    log.error(id, 'url-convention', `video/poster must be ${VIDEO_URL_DIR}/${id}.mp4 and ${POSTER_URL_DIR}/${id}.jpg`);
  }
  if (clip.role !== 'archive' || clip.placement !== undefined) {
    log.error(id, 'role-invalid', 'pipeline clips are archive clips without a story placement');
  }
  if (!clip.label) log.error(id, 'label-missing', 'label must be non-empty');
  checkYear(log, id, clip.yearId, clip.yearSource, true);
  if (files.exists(clip.video)) {
    try {
      const probe = probeMp4(files.read(clip.video));
      if (probe.width !== clip.width || probe.height !== clip.height) {
        log.error(id, 'dimensions-mismatch', `${clip.video} is ${probe.width}×${probe.height}, the entry says ${clip.width}×${clip.height}`);
      }
      if (Math.abs(probe.duration - clip.duration) > 0.05) log.error(id, 'duration-mismatch', `${clip.video} runs ${probe.duration}s, the entry says ${clip.duration}s`);
      if (probe.hasAudio !== clip.hasAudio) log.error(id, 'audio-mismatch', `hasAudio is ${clip.hasAudio} but the file ${probe.hasAudio ? 'has' : 'has no'} audio track`);
      const orientation = clip.height > clip.width ? 'portrait' : 'landscape';
      if (clip.orientation !== orientation) log.error(id, 'orientation-mismatch', `orientation should be ${orientation}`);
      if (probe.hasLocation || probe.metadataBoxes.length) log.error(id, 'metadata-present', `${clip.video} still carries ${probe.metadataBoxes.join('/') || 'location'} metadata`);
    } catch (error) {
      log.error(id, 'unreadable', `${clip.video} cannot be parsed: ${(error as Error).message}`);
    }
  }
  if (files.exists(clip.poster)) {
    try {
      const real = await verifyDerivative(files.read(clip.poster));
      if (real.format !== 'jpeg') log.error(id, 'format-invalid', `${clip.poster} is ${real.format}, expected jpeg`);
      if (real.hasMetadata) log.error(id, 'metadata-present', `${clip.poster} still carries metadata`);
      if (real.width !== clip.posterWidth || real.height !== clip.posterHeight) {
        log.error(id, 'dimensions-mismatch', `${clip.poster} is ${real.width}×${real.height}, the entry says ${clip.posterWidth}×${clip.posterHeight}`);
      }
    } catch (error) {
      log.error(id, 'unreadable', `${clip.poster} cannot be decoded: ${(error as Error).message}`);
    }
  }
}

export async function validateCanonical(
  state: CanonicalState,
  manifest: CurationManifest,
  files: FileResolver,
  log: IssueLog
): Promise<void> {
  const photos = [...state.curatedPhotos, ...state.ingestedPhotos];
  const videos = [...state.curatedVideos, ...state.ingestedVideos];
  const groups = new Set(state.groups.map((group) => group.id));

  unique(log, 'photo id', photos.map((photo) => [photo.id, photo.id]));
  unique(log, 'photo image', photos.map((photo) => [photo.id, photo.image]));
  unique(log, 'video id', videos.map((clip) => [clip.id, clip.id]));
  unique(log, 'video file', videos.map((clip) => [clip.id, clip.video]));

  for (const photo of photos) {
    for (const url of [photo.image, photo.thumb]) {
      if (!files.exists(url)) log.error(photo.id, 'file-missing', `${url} does not exist`);
    }
  }
  for (const clip of videos) {
    for (const url of [clip.video, clip.poster]) {
      if (!files.exists(url)) log.error(clip.id, 'file-missing', `${url} does not exist`);
    }
  }
  for (const photo of state.curatedPhotos) checkYear(log, photo.id, photo.yearId, photo.yearSource, false);
  for (const clip of state.curatedVideos) checkYear(log, clip.id, clip.yearId, clip.yearSource, false);

  for (const photo of state.ingestedPhotos) await checkIngestedPhoto(log, photo, groups, files);
  for (const clip of state.ingestedVideos) await checkIngestedVideo(log, clip, files);
  for (const group of groups) {
    if (!GROUP_DATE_LABELS[group]) log.error(group, 'group-unmapped', 'archive group has no default date label in tools/media-pipeline/config.ts');
  }

  // Provenance and canonical data must agree both ways for pipeline records.
  const ingestedPhotoIds = new Set(state.ingestedPhotos.map((photo) => photo.id));
  const ingestedVideoIds = new Set(state.ingestedVideos.map((clip) => clip.id));
  const provenance = new Map<string, string>();
  for (const record of manifest.files) {
    if (!record.ingest || record.productionStatus !== 'used') continue;
    const id = record.ingest.id ?? '';
    provenance.set(id, record.sourceFilename);
    if (!ingestedPhotoIds.has(id)) log.error(id || record.sourceFilename, 'provenance-orphan', `manifest records ${record.sourceFilename} as ${id}, but memoryArchive.ts has no such pipeline entry`);
  }
  for (const record of manifest.videoCuration) {
    if (!record.ingest || record.role !== 'archive') continue;
    const id = record.ingest.id ?? '';
    provenance.set(id, record.sourceFilename);
    if (!ingestedVideoIds.has(id)) log.error(id || record.sourceFilename, 'provenance-orphan', `manifest records ${record.sourceFilename} as ${id}, but memoryVideos.ts has no such pipeline entry`);
  }
  for (const id of [...ingestedPhotoIds, ...ingestedVideoIds]) {
    if (!provenance.has(id)) log.error(id, 'provenance-missing', 'pipeline entry has no provenance record in tools/anniversary-media-curation.json');
  }
  const hashes = new Map<string, string>();
  for (const record of [...manifest.files, ...manifest.videoCuration]) {
    if (!record.ingest) continue;
    const other = hashes.get(record.sha256);
    if (other) log.error(record.sourceFilename, 'duplicate-content', `same sha256 as ${other} in the manifest`);
    hashes.set(record.sha256, record.sourceFilename);
  }
}
