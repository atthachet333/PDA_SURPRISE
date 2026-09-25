/**
 * Video derivatives.
 *
 * Two paths, both ending in the same verified H.264 MP4:
 *
 *   - An H.264 MP4 source ships as-is, with its udta/meta boxes blanked in
 *     place (creation time, device, location). No ffmpeg required.
 *   - Anything else (a MOV, HEVC, a non-faststart file) is transcoded with the
 *     established policy — H.264, +faststart, -map_metadata -1, 720 on the
 *     short edge — which needs ffmpeg (see findFfmpeg in config.ts).
 *
 * The poster is either a still the owner supplies or, with ffmpeg, a frame
 * taken from the clip itself. Nothing heavier than the ffmpeg binary.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { VIDEO_ARCHIVE_SHORT_EDGE } from './config.ts';
import { PipelineError } from './issues.ts';
import { isShippableMp4, probeMp4, stripMp4Metadata, type Mp4Probe } from './mp4.ts';

export interface VideoPlan {
  /** 'passthrough' keeps the encoded stream; 'transcode' needs ffmpeg. */
  mode: 'passthrough' | 'transcode';
  reasons: string[];
}

export function planVideo(probe: Mp4Probe, extension: string): VideoPlan {
  const reasons: string[] = [];
  if (extension === '.mov' || probe.brand === 'qt  ') reasons.push('QuickTime container');
  if (!isShippableMp4(probe)) {
    if (probe.videoCodec !== 'avc1' && probe.videoCodec !== 'avc3') reasons.push(`${probe.videoCodec} video (browsers need H.264)`);
    if (probe.hasAudio && probe.audioCodec !== 'mp4a') reasons.push(`${probe.audioCodec} audio (needs AAC)`);
  }
  if (!probe.faststart) reasons.push('moov after mdat (no faststart)');
  return { mode: reasons.length ? 'transcode' : 'passthrough', reasons };
}

function run(ffmpeg: string, args: string[], asset: string): void {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-nostdin', ...args], {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new PipelineError(`ffmpeg failed (${result.status ?? result.signal}): ${(result.stderr || '').trim().slice(-600)}`, asset);
  }
}

/** Shipped bytes plus the probe of what actually ships. */
export interface VideoDerivative {
  buffer: Buffer;
  probe: Mp4Probe;
  transcoded: boolean;
}

export function videoDerivative(source: string, plan: VideoPlan, ffmpeg: string | null, asset: string): VideoDerivative {
  if (plan.mode === 'passthrough') {
    const { buffer } = stripMp4Metadata(readFileSync(source));
    return { buffer, probe: probeMp4(buffer), transcoded: false };
  }
  if (!ffmpeg) {
    throw new PipelineError(`needs transcoding (${plan.reasons.join(', ')}) but no ffmpeg was found`, asset);
  }
  const work = mkdtempSync(path.join(tmpdir(), 'media-pipeline-'));
  try {
    const output = path.join(work, 'out.mp4');
    const edge = VIDEO_ARCHIVE_SHORT_EDGE;
    run(ffmpeg, [
      '-i', source,
      '-map', '0:v:0', '-map', '0:a:0?',
      '-vf', `scale='if(gt(iw,ih),-2,min(${edge},iw))':'if(gt(iw,ih),min(${edge},ih),-2)',setsar=1`,
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-threads', '1',
      '-c:a', 'aac', '-b:a', '128k',
      '-map_metadata', '-1', '-map_chapters', '-1',
      '-fflags', '+bitexact', '-flags:v', '+bitexact', '-flags:a', '+bitexact',
      '-movflags', '+faststart',
      '-y', output
    ], asset);
    // ffmpeg still writes an encoder tag in udta; blank it like any other metadata.
    const { buffer } = stripMp4Metadata(readFileSync(output));
    return { buffer, probe: probeMp4(buffer), transcoded: true };
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

/** A PNG frame from the clip, for the poster. Taken from the shipped derivative so it matches playback. */
export function extractPosterFrame(video: Buffer, duration: number, ffmpeg: string, asset: string): Buffer {
  const work = mkdtempSync(path.join(tmpdir(), 'media-pipeline-'));
  try {
    const input = path.join(work, 'clip.mp4');
    const output = path.join(work, 'poster.png');
    writeFileSync(input, video);
    const at = Math.min(1, duration / 2).toFixed(2);
    run(ffmpeg, ['-ss', at, '-i', input, '-frames:v', '1', '-y', output], asset);
    return readFileSync(output);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}
