/**
 * EP43 media pipeline — command line.
 *
 *   npm run media:init   -- <folder> [--batch <name>]   write a media.json skeleton
 *   npm run media:ingest -- <folder> [--dry-run]         validate, process, publish
 *   npm run media:check                                  verify canonical media data
 *
 * Exit codes: 0 ok · 1 validation errors · 2 awaiting privacy review · 3 failed and rolled back.
 * Full guide: docs/MEDIA_PIPELINE.md
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { createContext } from './config.ts';
import { parseManifest, readCanonical } from './canonical.ts';
import { ingest } from './ingest.ts';
import { initRequest } from './init.ts';
import { formatIssue, IssueLog, type Issue } from './issues.ts';
import { publicResolver, validateCanonical } from './validate.ts';

const USAGE = `Usage:
  npm run media:init   -- <folder> [--batch <name>]
  npm run media:ingest -- <folder> [--dry-run]
  npm run media:check
See docs/MEDIA_PIPELINE.md.`;

function printIssues(issues: Issue[]): void {
  const order = { error: 0, warning: 1, note: 2 } as const;
  for (const issue of [...issues].sort((a, b) => order[a.severity] - order[b.severity])) console.log(formatIssue(issue));
}

function list(title: string, values: string[]): void {
  if (!values.length) return;
  console.log(`\n${title}`);
  for (const value of values) console.log(`  ${value}`);
}

async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  const flags = new Set(rest.filter((arg) => arg.startsWith('--')));
  // npm runs scripts from the repo root; resolve folders against where the command was typed.
  const base = process.env.INIT_CWD ?? process.cwd();
  const positional = rest
    .filter((arg, index) => !arg.startsWith('--') && rest[index - 1] !== '--batch')
    .map((arg) => path.resolve(base, arg));

  if (command === 'init') {
    if (!positional[0]) {
      console.log(USAGE);
      return 1;
    }
    const batchIndex = rest.indexOf('--batch');
    const { log, written, count } = initRequest(positional[0], batchIndex >= 0 ? rest[batchIndex + 1] : undefined);
    printIssues(log.issues);
    if (!written) return 1;
    console.log(`\nWrote ${written} with ${count} item(s).`);
    console.log('Fill in yearId (or capturedOn), group for photos, and the privacy review for every item, then run:');
    console.log(`  npm run media:ingest -- "${positional[0]}" --dry-run`);
    return 0;
  }

  if (command === 'ingest') {
    if (!positional[0]) {
      console.log(USAGE);
      return 1;
    }
    const ctx = createContext();
    const dryRun = flags.has('--dry-run');
    console.log(`EP43 media ingest${dryRun ? ' (dry run)' : ''} — ${positional[0]}`);
    console.log(`ffmpeg: ${ctx.ffmpegPath ?? 'not found (H.264 MP4 with a poster still works)'}`);
    const result = await ingest(positional[0], ctx, { dryRun });
    printIssues(result.log.issues);
    list(dryRun ? 'Would publish:' : 'Published:', result.published);
    list('Recorded as rejected (not published):', result.rejected);
    list('Already ingested, unchanged:', result.unchanged);
    list('Awaiting privacy review:', result.pending);
    list(dryRun ? 'Would change:' : 'Changed:', result.changedFiles);
    const summary: Record<typeof result.status, string> = {
      published: 'Done. Review the diff, run npm run media:check and the test suite, then commit.',
      unchanged: 'Nothing to do: every item in this batch is already ingested.',
      'dry-run': 'Dry run passed. Nothing was written. Run again without --dry-run to publish.',
      blocked: 'Blocked: fix the errors above. Nothing was written.',
      'awaiting-review': 'Waiting on the privacy review. Nothing was written.',
      failed: 'Failed. Nothing was promoted, or it was rolled back. The run is safe to repeat.'
    };
    console.log(`\n${summary[result.status]}`);
    return result.exitCode;
  }

  if (command === 'check') {
    const ctx = createContext(undefined, { ffmpegPath: null });
    const log = new IssueLog();
    const state = readCanonical(ctx);
    const manifest = parseManifest(readFileSync(ctx.manifestPath, 'utf8'), ctx.manifestPath);
    await validateCanonical(state, manifest, publicResolver(ctx), log);
    printIssues(log.issues);
    console.log(
      `\nPhotos: ${state.curatedPhotos.length} curated + ${state.ingestedPhotos.length} ingested. ` +
      `Videos: ${state.curatedVideos.length} curated + ${state.ingestedVideos.length} ingested.`
    );
    console.log(log.hasErrors() ? `${log.errors.length} error(s).` : 'Canonical media data is consistent.');
    return log.hasErrors() ? 1 : 0;
  }

  console.log(USAGE);
  return command ? 1 : 0;
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(3);
  }
);
