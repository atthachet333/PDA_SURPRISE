/**
 * EP43 — media pipeline configuration.
 *
 * Every path the pipeline touches is resolved from one `PipelineContext`, so the
 * test suite can run the whole pipeline against a throwaway copy of the repo and
 * the CLI runs it against the real one. Nothing here is personal data: the
 * canonical records stay in frontend/src/data/, provenance stays in
 * tools/anniversary-media-curation.json.
 */
import { existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PIPELINE_ID = 'EP43';

/** The request file every source batch carries. */
export const REQUEST_FILENAME = 'media.json';

/** Source formats the repository has always accepted (see audit_anniversary_media.py). */
export const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif']);
export const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov']);

/** Operating-system litter: ignored with a warning, never ingested. */
export const OS_JUNK = new Set(['.ds_store', 'thumbs.db', 'desktop.ini']);

/** Sidecars that can carry edit history or location. Never silently ignored. */
export const SIDECAR_EXTENSIONS = new Set(['.aae', '.xmp', '.thm', '.json', '.xml', '.plist', '.txt']);

/**
 * Derivative sizes, identical to the established archive (build_anniversary_archive.py):
 * a 1600px long-edge WebP at q82, a 480px thumbnail at q72.
 */
export const PHOTO_FULL_EDGE = 1600;
export const PHOTO_FULL_QUALITY = 82;
export const PHOTO_THUMB_EDGE = 480;
export const PHOTO_THUMB_QUALITY = 72;
/** Below this long edge a photo cannot fill a thumbnail tile; the existing curation excluded such frames. */
export const PHOTO_MIN_EDGE = 480;
/** Below this long edge the full-screen viewer upscales; allowed only with an explicit confirmation. */
export const PHOTO_LOW_EDGE = 1200;

/** Video policy (videoPolicy in the curation manifest): archive clips at 720 on the short edge. */
export const VIDEO_ARCHIVE_SHORT_EDGE = 720;
export const POSTER_EDGE = 1600;
export const POSTER_QUALITY = 82;
/** The neutral label every established archive clip already uses. It is not a caption. */
export const DEFAULT_VIDEO_LABEL = 'ความทรงจำที่ยังเคลื่อนไหว';

/** Runtime URL conventions, unchanged from the established archive. */
export const PHOTO_URL_DIR = '/images/memories/archive';
export const THUMB_URL_DIR = '/images/memories/archive/thumbs';
export const VIDEO_URL_DIR = '/videos/memories';
export const POSTER_URL_DIR = '/images/memories/video';

export const PHOTO_ID = /^memory-(\d{3,})$/;
export const VIDEO_ID = /^memory-clip-(\d{2,})$/;

/**
 * The established date labels for each archive group. The Thai group label is
 * read from `memoryArchiveGroups` in memoryArchive.ts itself, so the pipeline
 * never keeps a second copy of it.
 */
export const GROUP_DATE_LABELS: Record<string, string> = {
  moments: 'LITTLE MOMENTS',
  journey: 'JOURNEY',
  milestones: 'MILESTONES',
  prewedding: 'PRE-WEDDING',
  wedding: 'WEDDING CEREMONY',
  registration: 'MARRIAGE REGISTRATION',
  life: 'LIFE'
};

/** Near-duplicate threshold on a 64-bit difference hash. */
export const NEAR_DUPLICATE_DISTANCE = 4;

export interface PipelineContext {
  root: string;
  publicDir: string;
  archiveModule: string;
  videoModule: string;
  manifestPath: string;
  stagingRoot: string;
  /** Resolved lazily; null when no ffmpeg is available. */
  ffmpegPath: string | null;
}

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function createContext(root: string = REPO_ROOT, options: { ffmpegPath?: string | null } = {}): PipelineContext {
  return {
    root,
    publicDir: path.join(root, 'frontend', 'public'),
    archiveModule: path.join(root, 'frontend', 'src', 'data', 'memoryArchive.ts'),
    videoModule: path.join(root, 'frontend', 'src', 'data', 'memoryVideos.ts'),
    manifestPath: path.join(root, 'tools', 'anniversary-media-curation.json'),
    stagingRoot: path.join(root, '.media-staging'),
    ffmpegPath: options.ffmpegPath === undefined ? findFfmpeg(root) : options.ffmpegPath
  };
}

/** A runtime URL such as /images/memories/archive/memory-183.webp → a file under `base`. */
export function urlToFile(base: string, url: string): string {
  return path.join(base, ...url.replace(/^\//, '').split('/'));
}

/**
 * ffmpeg is optional. In order: FFMPEG_PATH, `ffmpeg` on PATH, then the
 * imageio-ffmpeg binary the existing curation tools install into
 * review-local/pydeps. Without one, H.264 MP4 sources still ingest as-is.
 */
export function findFfmpeg(root: string): string | null {
  const candidates: string[] = [];
  if (process.env.FFMPEG_PATH) candidates.push(process.env.FFMPEG_PATH);
  candidates.push('ffmpeg');
  const bundled = path.join(root, 'review-local', 'pydeps', 'imageio_ffmpeg', 'binaries');
  if (existsSync(bundled)) {
    for (const name of readdirSync(bundled).sort()) {
      if (name.startsWith('ffmpeg')) candidates.push(path.join(bundled, name));
    }
  }
  for (const candidate of candidates) {
    const probe = spawnSync(candidate, ['-hide_banner', '-version'], { encoding: 'utf8' });
    if (probe.status === 0) return candidate;
  }
  return null;
}
