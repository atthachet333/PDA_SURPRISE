import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  memoryVideos,
  archiveVideos,
  compatibleArchiveGroup,
  featuredMemoryFilm,
  livingMemoryFor
} from '../src/data/memoryVideos.ts';

const ROLES = new Set(['featured', 'story', 'archive']);
const PLACEMENTS = new Set(['life', 'moments', 'journey']);
const manifest = JSON.parse(readFileSync(new URL('../../tools/anniversary-media-curation.json', import.meta.url), 'utf8'));

test('every clip has a unique id and a unique runtime source', () => {
  const ids = new Set();
  const sources = new Set();
  for (const clip of memoryVideos) {
    assert.ok(clip.id, 'a clip is missing an id');
    assert.ok(!ids.has(clip.id), `duplicate clip id: ${clip.id}`);
    ids.add(clip.id);
    assert.ok(!sources.has(clip.video), `two clips share one file: ${clip.video}`);
    sources.add(clip.video);
  }
  assert.equal(ids.size, memoryVideos.length);
});

test('every clip ships a local production file and a poster that exist', () => {
  for (const clip of memoryVideos) {
    assert.ok(clip.video.startsWith('/videos/'), `${clip.id} video is not a local runtime path`);
    assert.ok(clip.poster.startsWith('/images/'), `${clip.id} poster is not a local runtime path`);
    assert.ok(existsSync(new URL(`../public${clip.video}`, import.meta.url)), `${clip.id} video file missing on disk`);
    assert.ok(existsSync(new URL(`../public${clip.poster}`, import.meta.url)), `${clip.id} poster file missing on disk`);
  }
});

test('no clip serves a raw camera container or a remote url', () => {
  for (const clip of memoryVideos) {
    const paths = `${clip.video} ${clip.poster}`;
    assert.ok(clip.video.endsWith('.mp4'), `${clip.id} is not an mp4`);
    assert.doesNotMatch(paths, /\.(mov|MOV|heic|HEIC|m4v)\b/, `${clip.id} points at a raw container`);
    assert.doesNotMatch(paths, /drive\.google|googleusercontent|^https?:/, `${clip.id} points off-origin`);
  }
});

test('roles and placements stay inside their enums', () => {
  for (const clip of memoryVideos) {
    assert.ok(ROLES.has(clip.role), `${clip.id} has an unknown role: ${clip.role}`);
    if (clip.placement !== undefined) {
      assert.ok(PLACEMENTS.has(clip.placement), `${clip.id} has an unknown placement: ${clip.placement}`);
    }
    assert.equal(clip.role === 'story', clip.placement !== undefined,
      `${clip.id}: a story clip needs a placement and only a story clip may have one`);
  }
});

test('at most one featured film, and every clip is reachable', () => {
  const featured = memoryVideos.filter((clip) => clip.role === 'featured');
  assert.ok(featured.length <= 1, 'more than one featured memory film');
  if (featured.length) assert.equal(featuredMemoryFilm?.id, featured[0].id);

  /* A produced file nothing renders is dead weight in the repo. Story clips are
     reached through their placement, everything else through the archive. */
  for (const clip of memoryVideos) {
    const reachable = clip.role === 'story'
      ? livingMemoryFor(clip.placement)?.id === clip.id
      : archiveVideos.some((entry) => entry.id === clip.id);
    assert.ok(reachable, `${clip.id} is produced but nothing renders it`);
  }
});

test('each story placement resolves to at most one clip', () => {
  for (const placement of PLACEMENTS) {
    const matches = memoryVideos.filter((clip) => clip.role === 'story' && clip.placement === placement);
    assert.ok(matches.length <= 1, `placement ${placement} claimed by ${matches.length} clips`);
  }
});

test('dimensions and duration are real numbers', () => {
  for (const clip of memoryVideos) {
    for (const field of ['width', 'height', 'posterWidth', 'posterHeight', 'duration']) {
      assert.ok(Number.isFinite(clip[field]) && clip[field] > 0, `${clip.id}.${field} is not a positive number`);
    }
    const expected = clip.height > clip.width ? 'portrait' : 'landscape';
    assert.equal(clip.orientation, expected, `${clip.id} orientation disagrees with its dimensions`);
  }
});

test('the manifest accounts for all 22 source videos and every exclusion has a reason', () => {
  const videos = manifest.videoCuration;
  assert.ok(videos, 'manifest is missing videoCuration');
  assert.equal(videos.length, 22, 'the manifest should describe all 22 source videos');

  const ids = new Set();
  for (const entry of videos) {
    assert.ok(!ids.has(entry.sourceFilename), `duplicate manifest video: ${entry.sourceFilename}`);
    ids.add(entry.sourceFilename);
    assert.ok(ROLES.has(entry.role) || ['EXCLUDE', 'ALREADY_INTEGRATED'].includes(entry.role),
      `${entry.sourceFilename} has an unknown role: ${entry.role}`);
    assert.ok(['HIGH', 'MEDIUM', 'OWNER_DECISION'].includes(entry.confidence),
      `${entry.sourceFilename} has an unknown confidence: ${entry.confidence}`);
    if (entry.role === 'EXCLUDE') {
      assert.ok(entry.exclusionReason && entry.exclusionReason.length > 10,
        `${entry.sourceFilename} is excluded without a reason`);
      assert.equal(entry.runtimeVideo, null, `${entry.sourceFilename} is excluded but still has a runtime path`);
    }
  }
});

test('every runtime clip in the manifest matches a shipped clip', () => {
  const shipped = new Map(memoryVideos.map((clip) => [clip.video, clip]));
  for (const entry of manifest.videoCuration) {
    if (!entry.runtimeVideo || entry.role === 'ALREADY_INTEGRATED') continue;
    assert.ok(shipped.has(entry.runtimeVideo),
      `${entry.sourceFilename} claims ${entry.runtimeVideo}, which nothing ships`);
  }
});

test('video filtering cannot retain a stale photo-only group', () => {
  assert.equal(compatibleArchiveGroup('all', 'life'), 'life');
  assert.equal(compatibleArchiveGroup('photo', 'life'), 'life');
  assert.equal(compatibleArchiveGroup('video', 'all'), 'all');
  assert.equal(compatibleArchiveGroup('video', 'life'), 'all');
});
