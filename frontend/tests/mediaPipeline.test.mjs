import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import {
  parseCanonical,
  parseManifest,
  readCanonical,
  readGeneratedBlock,
  serializeManifest,
  writeGeneratedBlock
} from '../../tools/media-pipeline/canonical.ts';
import { createContext, findFfmpeg, REPO_ROOT } from '../../tools/media-pipeline/config.ts';
import { ingest, nextFreeNumbers, resolveItemYear } from '../../tools/media-pipeline/ingest.ts';
import { initRequest } from '../../tools/media-pipeline/init.ts';
import { IssueLog } from '../../tools/media-pipeline/issues.ts';
import { probeMp4, stripMp4Metadata } from '../../tools/media-pipeline/mp4.ts';
import { loadRequest } from '../../tools/media-pipeline/request.ts';
import { publicResolver, validateCanonical } from '../../tools/media-pipeline/validate.ts';
import { memoryArchive, memoryArchiveGroups } from '../src/data/memoryArchive.ts';
import { memoryVideos } from '../src/data/memoryVideos.ts';

/**
 * EP43 — the media pipeline.
 *
 * Every ingest here runs against a throwaway copy of the repository. Nothing is
 * shared with the real one — no hard links, no symlinks — so no test can ever
 * write into real media: the data files, the manifest, the archive thumbnails
 * and every pipeline-ingested file are copied; every other shipped file becomes
 * an empty placeholder with the same name (curated files are only checked for
 * existence). Expected ids are computed, never hard-coded, so the suite keeps
 * passing after real media are ingested. Fixtures are generated noise.
 */

const REAL = createContext(REPO_ROOT, { ffmpegPath: null });
const FFMPEG = findFfmpeg(REPO_ROOT);
const scratch = mkdtempSync(path.join(tmpdir(), 'ep43-media-'));
after(() => rmSync(scratch, { recursive: true, force: true }));

const REAL_STATE = readCanonical(REAL);
/** Files whose bytes a test needs; everything else is an empty placeholder. */
const REAL_BYTES = new Set([
  ...[...REAL_STATE.ingestedPhotos].flatMap((photo) => [photo.image, photo.thumb]),
  ...[...REAL_STATE.ingestedVideos].flatMap((clip) => [clip.video, clip.poster]),
  '/images/memories/archive/memory-001.webp'
]);

let repoCount = 0;
function mirrorTree(from, to, url) {
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    const source = path.join(from, name);
    const target = path.join(to, name);
    const childUrl = `${url}/${name}`;
    if (statSync(source).isDirectory()) mirrorTree(source, target, childUrl);
    else if (REAL_BYTES.has(childUrl) || url === '/images/memories/archive/thumbs') copyFileSync(source, target);
    else writeFileSync(target, '');
  }
}

function makeRepo({ ffmpeg = null } = {}) {
  const root = path.join(scratch, `repo-${++repoCount}`);
  mkdirSync(path.join(root, 'frontend', 'src', 'data'), { recursive: true });
  mkdirSync(path.join(root, 'tools'), { recursive: true });
  copyFileSync(REAL.archiveModule, path.join(root, 'frontend', 'src', 'data', 'memoryArchive.ts'));
  copyFileSync(REAL.videoModule, path.join(root, 'frontend', 'src', 'data', 'memoryVideos.ts'));
  copyFileSync(REAL.manifestPath, path.join(root, 'tools', 'anniversary-media-curation.json'));
  mirrorTree(path.join(REAL.publicDir, 'images', 'memories'), path.join(root, 'frontend', 'public', 'images', 'memories'), '/images/memories');
  mirrorTree(path.join(REAL.publicDir, 'videos'), path.join(root, 'frontend', 'public', 'videos'), '/videos');
  const ctx = createContext(root, { ffmpegPath: ffmpeg });
  const next = nextFreeNumbers(ctx, readCanonical(ctx), parseManifest(readFileSync(ctx.manifestPath, 'utf8'), 'manifest'));
  ctx.photoId = (offset = 0) => `memory-${String(next.photo + offset).padStart(3, '0')}`;
  ctx.clipId = (offset = 0) => `memory-clip-${String(next.video + offset).padStart(2, '0')}`;
  ctx.base = readCanonical(ctx);
  return ctx;
}

/** Entries this test added, excluding anything already ingested for real. */
function added(ctx) {
  const state = readCanonical(ctx);
  const photos = new Set(ctx.base.ingestedPhotos.map((photo) => photo.id));
  const clips = new Set(ctx.base.ingestedVideos.map((clip) => clip.id));
  return {
    photos: state.ingestedPhotos.filter((photo) => !photos.has(photo.id)),
    videos: state.ingestedVideos.filter((clip) => !clips.has(clip.id))
  };
}

const REAL_BEFORE = { ...snapshotOf(REAL), files: listFiles(REAL.publicDir).join('\n') };

function snapshotOf(ctx) {
  return {
    archive: readFileSync(ctx.archiveModule, 'utf8'),
    videos: readFileSync(ctx.videoModule, 'utf8'),
    manifest: readFileSync(ctx.manifestPath, 'utf8')
  };
}

function snapshot(ctx) {
  return {
    archive: readFileSync(ctx.archiveModule, 'utf8'),
    videos: readFileSync(ctx.videoModule, 'utf8'),
    manifest: readFileSync(ctx.manifestPath, 'utf8')
  };
}

function listFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { recursive: true }).map(String).sort();
}

/* ─── fixtures ──────────────────────────────────────────────────────────── */

/** Deterministic noise: dHash-distinct from every archive thumbnail. */
async function noiseImage(seed, width, height, format = 'jpeg', { exif, orientation } = {}) {
  const pixels = Buffer.alloc(width * height * 3);
  let state = seed * 2654435761 >>> 0;
  const cell = 40;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const cx = Math.floor(x / cell);
      const cy = Math.floor(y / cell);
      state = (Math.imul(cx * 73856093 ^ cy * 19349663 ^ seed * 83492791, 2654435761) >>> 0);
      const offset = (y * width + x) * 3;
      pixels[offset] = state & 255;
      pixels[offset + 1] = (state >> 8) & 255;
      pixels[offset + 2] = (state >> 16) & 255;
    }
  }
  let image = sharp(pixels, { raw: { width, height, channels: 3 } });
  if (orientation || exif) image = image.withMetadata({ ...(orientation ? { orientation } : {}), ...(exif ? { exif } : {}) });
  if (format === 'png') return image.png().toBuffer();
  if (format === 'webp') return image.webp({ quality: 80 }).toBuffer();
  return image.jpeg({ quality: 90 }).toBuffer();
}

function box(type, ...parts) {
  const payload = Buffer.concat(parts);
  const header = Buffer.alloc(8);
  header.writeUInt32BE(8 + payload.length);
  header.write(type, 4, 'latin1');
  return Buffer.concat([header, payload]);
}

const u32 = (...values) => {
  const out = Buffer.alloc(values.length * 4);
  values.forEach((value, index) => out.writeInt32BE(value, index * 4));
  return out;
};
const IDENTITY = u32(0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000);

function track(handler, codec, width, height, id) {
  const tkhd = box('tkhd', u32(0x7, 0, 0, id, 0, 0), Buffer.alloc(8), Buffer.alloc(8), IDENTITY, u32(width * 65536, height * 65536));
  const hdlr = box('hdlr', u32(0, 0), Buffer.from(handler, 'latin1'), Buffer.alloc(12), Buffer.from([0]));
  const stsd = box('stsd', u32(0, 1), box(codec, Buffer.alloc(78)));
  return box('trak', tkhd, box('mdia', box('mdhd', Buffer.alloc(24)), hdlr, box('minf', box('stbl', stsd))));
}

/**
 * A structurally valid MP4 (ftyp · moov · mdat) with iPhone-style location
 * metadata in moov/udta. Not playable — the pipeline never decodes it.
 */
function syntheticMp4({ width = 720, height = 1280, seconds = 3, audio = false, brand = 'isom', codec = 'avc1', seed = 1 } = {}) {
  const ftyp = box('ftyp', Buffer.from(brand, 'latin1'), u32(0x200), Buffer.from('isomiso2avc1mp41', 'latin1'));
  const mvhd = box('mvhd', u32(0, 0, 0, 1000, seconds * 1000, 0x10000), Buffer.from([1, 0]), Buffer.alloc(10), IDENTITY, Buffer.alloc(24), u32(3));
  const udta = box('udta', box('©xyz', Buffer.from('\u0000\u0012\u0000\u0000+13.7563+100.5018/', 'latin1')));
  const tracks = [track('vide', codec, width, height, 1), ...(audio ? [track('soun', 'mp4a', 0, 0, 2)] : [])];
  const moov = box('moov', mvhd, ...tracks, udta);
  return Buffer.concat([ftyp, moov, box('mdat', Buffer.alloc(64, seed))]);
}

let batchCount = 0;
function makeBatch(files, request) {
  const dir = path.join(scratch, `batch-${++batchCount}`);
  mkdirSync(dir, { recursive: true });
  for (const [name, bytes] of Object.entries(files)) writeFileSync(path.join(dir, name), bytes);
  if (request) writeFileSync(path.join(dir, 'media.json'), JSON.stringify(request, null, 2));
  return dir;
}

const approved = { status: 'approved', reviewedBy: 'owner' };
const codes = (result, severity = 'error') => result.log.issues.filter((issue) => issue.severity === severity).map((issue) => issue.code);

/* ─── backward compatibility ────────────────────────────────────────────── */

test('the pipeline reads the canonical model exactly as the application does', () => {
  const state = readCanonical(REAL);
  const photos = [...state.curatedPhotos, ...state.ingestedPhotos];
  assert.deepEqual(photos.map((photo) => photo.id), memoryArchive.map((photo) => photo.id));
  assert.deepEqual(photos.map((photo) => [photo.image, photo.thumb, photo.width, photo.height, photo.group]),
    memoryArchive.map((photo) => [photo.image, photo.thumb, photo.width, photo.height, photo.group]));
  const videos = [...state.curatedVideos, ...state.ingestedVideos];
  assert.deepEqual(videos.map((clip) => [clip.id, clip.video, clip.poster, clip.role]),
    memoryVideos.map((clip) => [clip.id, clip.video, clip.poster, clip.role]));
  assert.deepEqual(state.groups, memoryArchiveGroups);
});

test('the established archive is untouched: 122 photos and 19 clips, all curated, all Year 01', () => {
  const state = readCanonical(REAL);
  assert.equal(state.curatedPhotos.length, 122);
  assert.equal(state.curatedVideos.length, 19);
  const curated = new Set([...state.curatedPhotos, ...state.curatedVideos].map((entry) => entry.id));
  for (const entry of [...memoryArchive, ...memoryVideos].filter((item) => curated.has(item.id))) {
    assert.equal(entry.yearId, 'year-01', `${entry.id} changed year`);
    assert.equal(entry.yearSource, 'release-default', `${entry.id} changed year source`);
  }
});

test('npm run media:check logic passes on the repository as committed', async () => {
  const log = new IssueLog();
  const manifest = parseManifest(readFileSync(REAL.manifestPath, 'utf8'), REAL.manifestPath);
  await validateCanonical(readCanonical(REAL), manifest, publicResolver(REAL), log);
  assert.deepEqual(log.errors, []);
});

test('the curation manifest round-trips byte-for-byte, so appends never reformat history', () => {
  const text = readFileSync(REAL.manifestPath, 'utf8');
  assert.equal(serializeManifest(parseManifest(text, 'manifest')), text);
});

test('the MP4 reader agrees with every shipped archive clip', () => {
  for (const clip of memoryVideos.filter((entry) => entry.role === 'archive')) {
    const probe = probeMp4(readFileSync(path.join(REAL.publicDir, clip.video)));
    assert.equal(probe.width, clip.width, clip.id);
    assert.ok(Math.abs(probe.height - clip.height) <= 1, clip.id);
    assert.ok(Math.abs(probe.duration - clip.duration) < 0.05, clip.id);
    assert.equal(probe.hasAudio, clip.hasAudio, clip.id);
    assert.equal(probe.videoCodec, 'avc1');
    assert.equal(probe.faststart, true);
  }
});

/* ─── generated blocks ──────────────────────────────────────────────────── */

test('generated blocks are deterministic, sorted, and refuse hand edits that are not JSON', () => {
  const text = writeGeneratedBlock(readFileSync(REAL.archiveModule, 'utf8'), 'photos', [], 'memoryArchive.ts');
  const entry = (id) => ({ id, image: `/images/memories/archive/${id}.webp`, thumb: `/images/memories/archive/thumbs/${id}.webp`, width: 1, height: 2, group: 'life', groupLabel: 'x', dateLabel: 'LIFE', special: false, privacy: 'safe', yearId: 'year-02', yearSource: 'owner-override' });
  const once = writeGeneratedBlock(text, 'photos', [entry('memory-1190'), entry('memory-1184')], 'memoryArchive.ts');
  const again = writeGeneratedBlock(once, 'photos', readGeneratedBlock(once, 'photos', 'memoryArchive.ts'), 'memoryArchive.ts');
  assert.equal(again, once);
  assert.deepEqual(readGeneratedBlock(once, 'photos', 'x').map((item) => item.id), ['memory-1184', 'memory-1190']);
  // Everything outside the markers is untouched.
  assert.equal(writeGeneratedBlock(once, 'photos', [], 'x'), text);
  assert.throws(() => readGeneratedBlock(once.replace('"id": "memory-1184"', "id: 'memory-1184'"), 'photos', 'x'), /not plain JSON/);
  assert.throws(() => writeGeneratedBlock(text, 'photos', [{ ...entry('memory-200'), caption: 'x' }], 'x'), /unknown fields: caption/);
});

/* ─── relationship year ─────────────────────────────────────────────────── */

test('the year comes only from explicit owner input, through the app resolver', () => {
  const log = new IssueLog();
  assert.deepEqual(resolveItemYear({ file: 'a', yearId: 'year-02' }, log), { yearId: 'year-02', yearSource: 'owner-override' });
  assert.deepEqual(resolveItemYear({ file: 'b', capturedOn: '2026-11-02' }, log), { yearId: 'year-02', yearSource: 'capture-date' });
  assert.deepEqual(resolveItemYear({ file: 'c', capturedOn: '2026-10-11' }, log), { yearId: 'year-01', yearSource: 'capture-date' });
  assert.deepEqual(resolveItemYear({ file: 'd', yearId: 'year-01', capturedOn: '2026-01-05' }, log), { yearId: 'year-01', yearSource: 'owner-override' });
  assert.deepEqual(log.issues, []);

  const failures = [
    [{ file: 'e' }, 'year-missing'],
    [{ file: 'f', yearId: 'year-03' }, 'year-undeclared'],
    [{ file: 'g', capturedOn: '2025-10-11' }, 'year-before-start'],
    [{ file: 'h', capturedOn: '2027-10-12' }, 'year-undeclared'],
    [{ file: 'i', yearId: 'year-02', capturedOn: '2026-01-05' }, 'year-conflict']
  ];
  for (const [item, code] of failures) {
    const failLog = new IssueLog();
    assert.equal(resolveItemYear(item, failLog), null, item.file);
    assert.deepEqual(failLog.errors.map((issue) => issue.code), [code], item.file);
  }
});

/* ─── request validation ────────────────────────────────────────────────── */

test('the request rejects unsafe names, unknown fields, unlisted files and sidecars', async () => {
  const jpg = await noiseImage(11, 800, 600);
  const dir = makeBatch({ 'a.jpg': jpg, 'A.JPG': jpg, 'a.aae': Buffer.from('<plist/>'), 'stray.jpg': jpg, 'notes.gif': Buffer.from('GIF89a') }, {
    batch: 'request-checks',
    items: [
      { file: 'a.jpg', yearId: 'year-02', group: 'life', privacy: approved, yearID: 'x' },
      { file: '../escape.jpg', yearId: 'year-02', privacy: approved },
      { file: 'notes.gif', privacy: approved },
      { file: 'A.JPG', yearId: 'year-02', group: 'life', privacy: approved },
      { file: 'missing.mp4', yearId: 'year-02', privacy: { status: 'approved' } }
    ]
  });
  const log = new IssueLog();
  loadRequest(dir, log);
  const found = log.errors.map((issue) => `${issue.asset}:${issue.code}`);
  for (const expected of [
    'a.jpg:item-unknown-field',
    '../escape.jpg:unsafe-filename',
    'notes.gif:unsupported-type',
    'A.JPG:duplicate-filename',
    'a.aae:sidecar-file',
    'stray.jpg:unexpected-file',
    'missing.mp4:privacy-reviewer-missing',
    'missing.mp4:source-missing'
  ]) {
    assert.ok(found.includes(expected), `expected ${expected} in ${found.join(', ')}`);
  }
});

test('media:init writes a skeleton with every decision left blank, and never overwrites', async () => {
  const dir = makeBatch({ 'b.jpg': await noiseImage(12, 700, 500), 'c.mp4': syntheticMp4(), 'readme.txt': Buffer.from('x') });
  const first = initRequest(dir);
  assert.equal(first.count, 2);
  const request = JSON.parse(readFileSync(path.join(dir, 'media.json'), 'utf8'));
  assert.deepEqual(request.items.map((item) => [item.file, item.type, item.yearId, item.privacy.status]),
    [['b.jpg', 'photo', '', 'pending'], ['c.mp4', 'video', '', 'pending']]);
  assert.equal(initRequest(dir).written, null);
});

/* ─── ingestion ─────────────────────────────────────────────────────────── */

test('a valid photo is ingested into the canonical model with verified derivatives', async () => {
  const ctx = makeRepo();
  const before = snapshot(ctx);
  // Landscape pixels with EXIF orientation 6: the photo is portrait once shown.
  const photo = await noiseImage(21, 2400, 1800, 'jpeg', {
    orientation: 6,
    exif: { IFD0: { Make: 'Test' }, IFD3: { GPSLatitudeRef: 'N', GPSLatitude: '13/1 45/1 0/1' } }
  });
  const dir = makeBatch({ 'IMG_0001.jpg': photo }, {
    batch: 'photo-batch',
    items: [{ file: 'IMG_0001.jpg', yearId: 'year-02', group: 'journey', privacy: { ...approved, note: 'checked' } }]
  });
  const result = await ingest(dir, ctx);
  assert.equal(result.status, 'published', JSON.stringify(result.log.issues));
  assert.equal(result.exitCode, 0);

  const id = ctx.photoId();
  const state = readCanonical(ctx);
  assert.equal(state.curatedPhotos.length, 122, 'curated entries are untouched');
  assert.deepEqual(state.ingestedPhotos.slice(0, -1), ctx.base.ingestedPhotos, 'earlier pipeline entries are untouched');
  assert.deepEqual(added(ctx).photos, [{
    id,
    image: `/images/memories/archive/${id}.webp`,
    thumb: `/images/memories/archive/thumbs/${id}.webp`,
    width: 1200,
    height: 1600,
    group: 'journey',
    groupLabel: 'ระหว่างทาง',
    dateLabel: 'JOURNEY',
    special: false,
    privacy: 'safe',
    yearId: 'year-02',
    yearSource: 'owner-override'
  }]);

  const full = await sharp(path.join(ctx.publicDir, `images/memories/archive/${id}.webp`)).metadata();
  assert.deepEqual([full.format, full.width, full.height, full.exif, full.orientation], ['webp', 1200, 1600, undefined, undefined]);
  const thumb = await sharp(path.join(ctx.publicDir, `images/memories/archive/thumbs/${id}.webp`)).metadata();
  assert.deepEqual([thumb.width, thumb.height], [360, 480]);

  const record = parseManifest(readFileSync(ctx.manifestPath, 'utf8'), 'm').files.at(-1);
  assert.equal(record.sourceFilename, 'IMG_0001.jpg');
  assert.equal(record.gpsInternal, null, 'GPS is never copied into the repository');
  assert.deepEqual(record.ingest, { pipeline: 'EP43', batch: 'photo-batch', id, yearId: 'year-02', yearSource: 'owner-override' });
  assert.deepEqual(record.privacyReview, { status: 'approved', reviewedBy: 'owner', note: 'checked', confirmed: [], sourceMetadata: ['exif', 'gps'] });
  assert.deepEqual(record.productionAssets, [`/images/memories/archive/${id}.webp`]);

  // Only the photos block and the manifest changed; memoryVideos.ts is byte-identical.
  const afterState = snapshot(ctx);
  assert.equal(afterState.videos, before.videos);
  assert.equal(afterState.archive.split('// @media-pipeline:begin photos')[0], before.archive.split('// @media-pipeline:begin photos')[0]);
  assert.ok(!existsSync(ctx.stagingRoot) || listFiles(ctx.stagingRoot).length === 0, 'staging is cleaned up');

  // The written data module still loads as the application loads it.
  const mod = await import(`${path.join(ctx.root, 'frontend/src/data/memoryArchive.ts')}?${Date.now()}`);
  const loaded = mod.memoryArchive.find((item) => item.id === id);
  assert.equal(loaded.yearId, 'year-02');
  assert.equal(mod.memoryArchive.length, 122 + ctx.base.ingestedPhotos.length + 1);
});

test('rerunning a published batch is a no-op, and output is deterministic across repos', async () => {
  const photo = await noiseImage(31, 1600, 1200);
  const request = { batch: 'rerun', items: [{ file: 'p.jpg', capturedOn: '2026-11-02', group: 'moments', privacy: approved }] };
  const ctxA = makeRepo();
  const ctxB = makeRepo();
  const dir = makeBatch({ 'p.jpg': photo }, request);
  assert.equal((await ingest(dir, ctxA)).status, 'published');
  assert.equal((await ingest(dir, ctxB)).status, 'published');
  const first = snapshot(ctxA);
  const filesBefore = listFiles(ctxA.publicDir);

  const again = await ingest(dir, ctxA);
  assert.equal(again.status, 'unchanged');
  assert.equal(again.exitCode, 0);
  assert.deepEqual(again.unchanged, ['p.jpg']);
  assert.deepEqual(snapshot(ctxA), first, 'no duplicate entries, no rewritten data');
  assert.deepEqual(listFiles(ctxA.publicDir), filesBefore, 'no new files');

  assert.deepEqual(snapshot(ctxB), first, 'the same input yields the same data');
  for (const url of [`images/memories/archive/${ctxA.photoId()}.webp`, `images/memories/archive/thumbs/${ctxA.photoId()}.webp`]) {
    assert.ok(readFileSync(path.join(ctxA.publicDir, url)).equals(readFileSync(path.join(ctxB.publicDir, url))), `${url} differs`);
  }
  assert.equal(added(ctxA).photos[0].yearSource, 'capture-date');

  // Changing a published decision is refused rather than silently applied.
  writeFileSync(path.join(dir, 'media.json'), JSON.stringify({ ...request, items: [{ ...request.items[0], group: 'life' }] }));
  const changed = await ingest(dir, ctxA);
  assert.equal(changed.status, 'blocked');
  assert.deepEqual(codes(changed), ['already-ingested-changed']);
  assert.deepEqual(snapshot(ctxA), first);
});

test('duplicates are caught: within a batch, across batches, and by near-identical pixels', async () => {
  const ctx = makeRepo();
  const photo = await noiseImage(41, 1600, 1200);
  const dirA = makeBatch({ 'x.jpg': photo, 'x-copy.jpg': photo }, {
    batch: 'dupes-a',
    items: [
      { file: 'x.jpg', yearId: 'year-02', group: 'life', privacy: approved },
      { file: 'x-copy.jpg', yearId: 'year-02', group: 'life', privacy: approved }
    ]
  });
  const inBatch = await ingest(dirA, ctx);
  assert.equal(inBatch.status, 'blocked');
  assert.deepEqual(codes(inBatch), ['duplicate-content']);

  const dirB = makeBatch({ 'x.jpg': photo }, { batch: 'dupes-b', items: [{ file: 'x.jpg', yearId: 'year-02', group: 'life', privacy: approved }] });
  assert.equal((await ingest(dirB, ctx)).status, 'published');
  const dirC = makeBatch({ 'again.jpg': photo }, { batch: 'dupes-c', items: [{ file: 'again.jpg', yearId: 'year-02', group: 'life', privacy: approved }] });
  const across = await ingest(dirC, ctx);
  assert.deepEqual(codes(across), ['duplicate-content']);
  assert.match(across.log.errors[0].message, new RegExp(`batch "dupes-b" as ${ctx.photoId()}`));

  // A re-export of an established archive photo: different bytes, same picture.
  const reexport = await sharp(path.join(ctx.publicDir, 'images/memories/archive/memory-001.webp')).jpeg({ quality: 70 }).toBuffer();
  const request = { batch: 'dupes-d', items: [{ file: 'old.jpg', yearId: 'year-02', group: 'wedding', privacy: approved }] };
  const dirD = makeBatch({ 'old.jpg': reexport }, request);
  const near = await ingest(dirD, ctx);
  assert.equal(near.status, 'blocked');
  assert.ok(codes(near).includes('confirmation-required'));
  assert.match(near.log.errors.find((issue) => issue.code === 'confirmation-required').message, /memory-001/);
});

test('id collisions and would-be overwrites are refused', async () => {
  const ctx = makeRepo();
  const photo = await noiseImage(51, 1600, 1200);
  const dir = makeBatch({ 'a.jpg': photo }, { batch: 'ids', items: [{ file: 'a.jpg', id: 'memory-001', yearId: 'year-02', group: 'life', privacy: approved }] });
  assert.deepEqual(codes(await ingest(dir, ctx)), ['id-collision']);

  const low = makeBatch({ 'a.jpg': photo }, { batch: 'ids-low', items: [{ file: 'a.jpg', id: 'memory-002', yearId: 'year-02', group: 'life', privacy: approved }] });
  assert.deepEqual(codes(await ingest(low, ctx)), ['id-collision'], 'numbers of excluded sources are never reused');

  // A stray poster already sits where the next clip's poster would go: that
  // number is skipped, and the stray file is left exactly as it was.
  const stray = path.join(ctx.publicDir, `images/memories/video/${ctx.clipId()}.jpg`);
  writeFileSync(stray, 'not mine');
  const video = makeBatch({ 'v.mp4': syntheticMp4(), 'v.jpg': await noiseImage(52, 900, 1600) }, {
    batch: 'overwrite', items: [{ file: 'v.mp4', yearId: 'year-02', poster: 'v.jpg', privacy: approved }]
  });
  const result = await ingest(video, ctx);
  assert.equal(result.status, 'published', JSON.stringify(result.log.issues));
  assert.deepEqual(added(ctx).videos.map((clip) => clip.id), [ctx.clipId(1)]);
  assert.equal(readFileSync(stray, 'utf8'), 'not mine');

  // An explicit id whose files already exist is refused, never overwritten.
  const taken = makeBatch({ 'w.mp4': syntheticMp4({ seed: 9 }), 'w.jpg': await noiseImage(53, 900, 1600) }, {
    batch: 'overwrite-explicit', items: [{ file: 'w.mp4', id: ctx.clipId(1), yearId: 'year-02', poster: 'w.jpg', privacy: approved }]
  });
  assert.deepEqual(codes(await ingest(taken, ctx)), ['id-collision']);
});

test('unsupported, corrupt and undersized inputs fail with the asset named, and nothing is written', async () => {
  const ctx = makeRepo();
  const before = snapshot(ctx);
  const good = await noiseImage(61, 1600, 1200);
  const dir = makeBatch({
    'ok.jpg': good,
    'broken.jpg': good.subarray(0, Math.floor(good.length / 3)),
    'tiny.jpg': await noiseImage(62, 300, 200),
    'movie.avi': Buffer.from('RIFF'),
    'clip.mp4': Buffer.from('not a video at all')
  }, {
    batch: 'bad-inputs',
    items: [
      { file: 'ok.jpg', yearId: 'year-02', group: 'life', privacy: approved },
      { file: 'broken.jpg', yearId: 'year-02', group: 'life', privacy: approved },
      { file: 'tiny.jpg', yearId: 'year-02', group: 'life', privacy: approved },
      { file: 'movie.avi', yearId: 'year-02', privacy: approved },
      { file: 'clip.mp4', yearId: 'year-02', privacy: approved }
    ]
  });
  const result = await ingest(dir, ctx);
  assert.equal(result.status, 'blocked');
  assert.equal(result.exitCode, 1);
  const found = result.log.errors.map((issue) => `${issue.asset}:${issue.code}`);
  for (const expected of ['broken.jpg:unreadable', 'tiny.jpg:too-small', 'movie.avi:unsupported-type', 'clip.mp4:unreadable']) {
    assert.ok(found.includes(expected), `expected ${expected} in ${found.join(', ')}`);
  }
  assert.deepEqual(snapshot(ctx), before, 'a batch with any error publishes nothing, not even the valid item');
  assert.ok(!existsSync(path.join(ctx.publicDir, `images/memories/archive/${ctx.photoId()}.webp`)));
});

test('privacy review: pending blocks the batch, rejected is recorded but never published', async () => {
  const ctx = makeRepo();
  const before = snapshot(ctx);
  const a = await noiseImage(71, 1600, 1200);
  const b = await noiseImage(72, 1600, 1200);
  const request = {
    batch: 'privacy',
    items: [
      { file: 'a.jpg', yearId: 'year-02', group: 'life', privacy: approved },
      { file: 'b.jpg', yearId: 'year-02', group: 'life', privacy: { status: 'pending' } }
    ]
  };
  const dir = makeBatch({ 'a.jpg': a, 'b.jpg': b }, request);
  const pending = await ingest(dir, ctx);
  assert.equal(pending.status, 'awaiting-review');
  assert.equal(pending.exitCode, 2);
  assert.deepEqual(pending.pending, ['b.jpg']);
  assert.deepEqual(snapshot(ctx), before);

  request.items[1].privacy = { status: 'rejected', reviewedBy: 'owner', note: 'someone else is in frame' };
  writeFileSync(path.join(dir, 'media.json'), JSON.stringify(request));
  const decided = await ingest(dir, ctx);
  assert.equal(decided.status, 'published', JSON.stringify(decided.log.issues));
  assert.deepEqual(decided.rejected, ['b.jpg']);
  assert.deepEqual(added(ctx).photos.map((photo) => photo.id), [ctx.photoId()]);
  const rejected = parseManifest(readFileSync(ctx.manifestPath, 'utf8'), 'm').files.find((record) => record.sourceFilename === 'b.jpg');
  assert.equal(rejected.productionStatus, 'excluded');
  assert.deepEqual(rejected.productionAssets, []);
  assert.equal(rejected.ingest.id, null);
  assert.match(rejected.excludedReason, /rejected by owner — someone else is in frame/);

  // A rerun cannot flip a rejection into a publish.
  request.items[1].privacy = approved;
  writeFileSync(path.join(dir, 'media.json'), JSON.stringify(request));
  assert.deepEqual(codes(await ingest(dir, ctx)), ['review-changed']);
});

test('deterministic privacy checks need an explicit confirmation to publish', async () => {
  const ctx = makeRepo();
  const png = await noiseImage(81, 1600, 1200, 'png');
  const small = await noiseImage(82, 1000, 750);
  const request = {
    batch: 'confirmations',
    items: [
      { file: 'Screenshot 2026-11-02.png', yearId: 'year-02', group: 'life', privacy: approved },
      { file: 'small.jpg', yearId: 'year-02', group: 'life', privacy: approved, confirm: ['audio-track'] },
      { file: 'unreviewed.jpg', yearId: 'year-02', group: 'life' }
    ]
  };
  const dir = makeBatch({ 'Screenshot 2026-11-02.png': png, 'small.jpg': small, 'unreviewed.jpg': await noiseImage(83, 1600, 1200) }, request);
  const blocked = await ingest(dir, ctx);
  const messages = blocked.log.issues.map((issue) => `${issue.asset}:${issue.code}`);
  assert.ok(messages.includes('unreviewed.jpg:privacy-review-missing'));
  assert.equal(blocked.log.errors.filter((issue) => issue.asset === 'Screenshot 2026-11-02.png' && issue.code === 'confirmation-required').length, 2);
  assert.ok(messages.includes('small.jpg:confirmation-required'));
  assert.ok(messages.includes('small.jpg:confirmation-unused'));

  request.items[0].confirm = ['filename-sensitive', 'source-png'];
  request.items[1].confirm = ['low-resolution'];
  request.items[2].privacy = approved;
  writeFileSync(path.join(dir, 'media.json'), JSON.stringify(request));
  const confirmed = await ingest(dir, ctx);
  assert.equal(confirmed.status, 'published', JSON.stringify(confirmed.log.errors));
  const record = parseManifest(readFileSync(ctx.manifestPath, 'utf8'), 'm').files.find((entry) => entry.sourceFilename === 'Screenshot 2026-11-02.png');
  assert.deepEqual(record.privacyReview.confirmed, ['filename-sensitive', 'source-png']);
});

test('an H.264 MP4 is ingested without ffmpeg: metadata blanked, poster supplied', async () => {
  const ctx = makeRepo({ ffmpeg: null });
  const source = syntheticMp4({ width: 720, height: 1280, seconds: 4 });
  assert.equal(probeMp4(source).hasLocation, true);
  const dir = makeBatch({ 'clip.mp4': source, 'clip-still.jpg': await noiseImage(91, 900, 1600) }, {
    batch: 'video-batch',
    items: [{ file: 'clip.mp4', type: 'video', capturedOn: '2026-12-24', poster: 'clip-still.jpg', privacy: approved }]
  });
  const result = await ingest(dir, ctx);
  assert.equal(result.status, 'published', JSON.stringify(result.log.issues));
  const id = ctx.clipId();
  assert.equal(readCanonical(ctx).curatedVideos.length, 19);
  assert.deepEqual(added(ctx).videos, [{
    id,
    video: `/videos/memories/${id}.mp4`,
    poster: `/images/memories/video/${id}.jpg`,
    width: 720,
    height: 1280,
    posterWidth: 900,
    posterHeight: 1600,
    duration: 4,
    orientation: 'portrait',
    role: 'archive',
    label: 'ความทรงจำที่ยังเคลื่อนไหว',
    hasAudio: false,
    yearId: 'year-02',
    yearSource: 'capture-date'
  }]);
  const shipped = readFileSync(path.join(ctx.publicDir, `videos/memories/${id}.mp4`));
  const probe = probeMp4(shipped);
  assert.equal(probe.hasLocation, false);
  assert.deepEqual(probe.metadataBoxes, []);
  assert.equal(shipped.length, source.length, 'blanking keeps every box size, so chunk offsets stay valid');
  const record = parseManifest(readFileSync(ctx.manifestPath, 'utf8'), 'm').videoCuration.at(-1);
  assert.equal(record.role, 'archive');
  assert.equal(record.runtimeVideo, `/videos/memories/${id}.mp4`);
  assert.deepEqual(record.privacyReview.sourceMetadata, ['udta', 'location']);
});

test('clips that need ffmpeg say so, and an audio track needs a confirmation', async () => {
  const ctx = makeRepo({ ffmpeg: null });
  const dir = makeBatch({
    'hevc.mp4': syntheticMp4({ codec: 'hvc1', seed: 2 }),
    'phone.mov': syntheticMp4({ brand: 'qt  ', seed: 3 }),
    'talk.mp4': syntheticMp4({ audio: true, seed: 4 })
  }, {
    batch: 'needs-ffmpeg',
    items: [
      { file: 'hevc.mp4', yearId: 'year-02', privacy: approved },
      { file: 'phone.mov', yearId: 'year-02', privacy: approved },
      { file: 'talk.mp4', yearId: 'year-02', privacy: approved }
    ]
  });
  const result = await ingest(dir, ctx);
  const found = result.log.errors.map((issue) => `${issue.asset}:${issue.code}`);
  for (const expected of ['hevc.mp4:ffmpeg-required', 'phone.mov:ffmpeg-required', 'talk.mp4:poster-required', 'talk.mp4:confirmation-required']) {
    assert.ok(found.includes(expected), `expected ${expected} in ${found.join(', ')}`);
  }
});

test('with ffmpeg, a MOV is transcoded to the archive policy and gets a poster from its own frames', { skip: FFMPEG ? false : 'no ffmpeg available' }, async () => {
  const ctx = makeRepo({ ffmpeg: FFMPEG });
  const work = path.join(scratch, 'ffmpeg-src');
  mkdirSync(work, { recursive: true });
  const mov = path.join(work, 'phone.mov');
  const made = spawnSync(FFMPEG, [
    '-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'lavfi', '-i', 'testsrc2=size=1080x1920:rate=30:duration=2',
    '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest',
    '-metadata', 'location=+13.7563+100.5018/', mov
  ]);
  assert.equal(made.status, 0, String(made.stderr));
  const dir = makeBatch({ 'phone.mov': readFileSync(mov) }, {
    batch: 'transcode',
    items: [{ file: 'phone.mov', yearId: 'year-02', confirm: ['audio-track'], privacy: approved }]
  });
  const result = await ingest(dir, ctx);
  assert.equal(result.status, 'published', JSON.stringify(result.log.issues));
  const [clip] = added(ctx).videos;
  assert.deepEqual([clip.width, clip.height, clip.hasAudio, clip.orientation], [720, 1280, true, 'portrait']);
  assert.ok(Math.abs(clip.duration - 2) < 0.1);
  const probe = probeMp4(readFileSync(path.join(ctx.publicDir, clip.video)));
  assert.deepEqual([probe.videoCodec, probe.audioCodec, probe.faststart, probe.hasLocation, probe.metadataBoxes.length], ['avc1', 'mp4a', true, false, 0]);
  const poster = await sharp(path.join(ctx.publicDir, clip.poster)).metadata();
  assert.deepEqual([poster.format, poster.width, poster.height], ['jpeg', 720, 1280]);
});

/* ─── failure safety ────────────────────────────────────────────────────── */

test('a failure during promotion rolls every file back', async () => {
  const ctx = makeRepo();
  const before = snapshot(ctx);
  const filesBefore = listFiles(ctx.publicDir);
  const dir = makeBatch({ 'a.jpg': await noiseImage(101, 1600, 1200) }, {
    batch: 'rollback', items: [{ file: 'a.jpg', yearId: 'year-02', group: 'life', privacy: approved }]
  });
  for (const steps of [0, 1, 3]) {
    const result = await ingest(dir, ctx, { failAfterPromoteSteps: steps });
    assert.equal(result.status, 'failed', `after ${steps} steps`);
    assert.equal(result.exitCode, 3);
    assert.deepEqual(snapshot(ctx), before, `data restored after ${steps} steps`);
    assert.deepEqual(listFiles(ctx.publicDir), filesBefore, `files removed after ${steps} steps`);
    assert.ok(!existsSync(path.join(ctx.stagingRoot, 'journal.json')));
    assert.ok(!existsSync(path.join(ctx.stagingRoot, '.lock')));
  }
  assert.equal((await ingest(dir, ctx)).status, 'published', 'the same batch then succeeds');
});

test('an interrupted run is rolled back before the next one starts', async () => {
  const ctx = makeRepo();
  const before = snapshot(ctx);
  // Simulate a crash mid-promotion: one derivative copied, one data file replaced.
  const orphan = path.join(ctx.publicDir, `images/memories/archive/${ctx.photoId()}.webp`);
  writeFileSync(orphan, 'half-written');
  mkdirSync(path.join(ctx.stagingRoot, 'crashed', 'backup'), { recursive: true });
  copyFileSync(ctx.archiveModule, path.join(ctx.stagingRoot, 'crashed', 'backup', 'memoryArchive.ts'));
  writeFileSync(ctx.archiveModule, 'garbage');
  writeFileSync(path.join(ctx.stagingRoot, 'journal.json'), JSON.stringify({
    batch: 'crashed',
    state: 'promoting',
    created: [`frontend/public/images/memories/archive/${ctx.photoId()}.webp`],
    replaced: [{ target: 'frontend/src/data/memoryArchive.ts', backup: '.media-staging/crashed/backup/memoryArchive.ts' }]
  }));
  const dir = makeBatch({ 'a.jpg': await noiseImage(111, 1600, 1200) }, {
    batch: 'after-crash', items: [{ file: 'a.jpg', yearId: 'year-02', group: 'life', privacy: approved }]
  });
  const result = await ingest(dir, ctx, { dryRun: true });
  assert.ok(result.log.issues.some((issue) => issue.code === 'recovered'));
  assert.equal(result.status, 'dry-run');
  assert.deepEqual(snapshot(ctx), before);
  assert.ok(!existsSync(orphan));
});

test('a dry run validates and stages everything but writes nothing', async () => {
  const ctx = makeRepo();
  const before = snapshot(ctx);
  const filesBefore = listFiles(ctx.publicDir);
  const dir = makeBatch({ 'a.jpg': await noiseImage(121, 1600, 1200) }, {
    batch: 'dry', items: [{ file: 'a.jpg', yearId: 'year-01', group: 'moments', special: true, privacy: approved }]
  });
  const result = await ingest(dir, ctx, { dryRun: true });
  assert.equal(result.status, 'dry-run');
  assert.deepEqual(result.published, [`${ctx.photoId()} ← a.jpg`]);
  assert.deepEqual(result.changedFiles, [
    `frontend/public/images/memories/archive/${ctx.photoId()}.webp`,
    `frontend/public/images/memories/archive/thumbs/${ctx.photoId()}.webp`,
    'frontend/src/data/memoryArchive.ts',
    'tools/anniversary-media-curation.json'
  ]);
  assert.deepEqual(snapshot(ctx), before);
  assert.deepEqual(listFiles(ctx.publicDir), filesBefore);
});

test('a hand-broken generated block stops ingestion before anything is touched', async () => {
  const ctx = makeRepo();
  const text = readFileSync(ctx.archiveModule, 'utf8').replace('  // @media-pipeline:end photos', "  { id: 'memory-999' }\n  // @media-pipeline:end photos");
  writeFileSync(ctx.archiveModule, text);
  const dir = makeBatch({ 'a.jpg': await noiseImage(131, 1600, 1200) }, {
    batch: 'broken-block', items: [{ file: 'a.jpg', yearId: 'year-02', group: 'life', privacy: approved }]
  });
  const result = await ingest(dir, ctx);
  assert.equal(result.status, 'failed');
  assert.match(result.log.errors[0].message, /not plain JSON/);
  assert.equal(readFileSync(ctx.archiveModule, 'utf8'), text);
});

test('stripMp4Metadata never changes the size of a real shipped clip', () => {
  const clip = readFileSync(path.join(REAL.publicDir, 'videos/memories/memory-clip-04.mp4'));
  const { buffer, blanked } = stripMp4Metadata(clip);
  assert.equal(buffer.length, clip.length);
  assert.ok(blanked >= 1);
  const probe = probeMp4(buffer);
  assert.deepEqual([probe.width, probe.height, probe.hasAudio, probe.metadataBoxes.length], [720, 1280, true, 0]);
  assert.notEqual(buffer, clip, 'the input buffer is not mutated');
  assert.ok(clip.includes(Buffer.from('udta')));
});

test('scratch copies stay isolated from the real repository', async () => {
  // Byte-level: every real data file and every real media file is unchanged.
  assert.deepEqual({ ...snapshotOf(REAL), files: listFiles(REAL.publicDir).join('\n') }, REAL_BEFORE);
  for (const url of REAL_BYTES) {
    if (url.endsWith('.webp') || url.endsWith('.jpg')) await sharp(path.join(REAL.publicDir, url)).metadata();
    else probeMp4(readFileSync(path.join(REAL.publicDir, url)));
  }
  const log = new IssueLog();
  await validateCanonical(readCanonical(REAL), parseManifest(readFileSync(REAL.manifestPath, 'utf8'), 'm'), publicResolver(REAL), log);
  assert.deepEqual(log.errors, []);
});
