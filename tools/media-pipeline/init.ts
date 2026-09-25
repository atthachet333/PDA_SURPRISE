/**
 * `npm run media:init -- <folder>` — writes a media.json skeleton listing every
 * supported file in the folder. Every decision is left blank on purpose: the
 * year, the group and the privacy review are the owner's to fill in, and an
 * unfilled skeleton fails ingestion with a message naming each gap.
 */
import { existsSync, lstatSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { REQUEST_FILENAME } from './config.ts';
import { IssueLog } from './issues.ts';
import { kindOf, unsafeFilenameReason } from './request.ts';

export function initRequest(sourceDir: string, batchName?: string): { log: IssueLog; written: string | null; count: number } {
  const log = new IssueLog();
  const dir = path.resolve(sourceDir);
  if (!existsSync(dir) || !lstatSync(dir).isDirectory()) {
    log.error('batch', 'source-missing', `${dir} is not a directory`, 'Create it and copy the new media into it first.');
    return { log, written: null, count: 0 };
  }
  const target = path.join(dir, REQUEST_FILENAME);
  if (existsSync(target)) {
    log.error('batch', 'request-exists', `${target} already exists and is never overwritten`, 'Edit it, or delete it first to start over.');
    return { log, written: null, count: 0 };
  }
  const batch = batchName ?? path.basename(dir).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 63);
  const items: object[] = [];
  for (const name of readdirSync(dir).sort()) {
    if (!lstatSync(path.join(dir, name)).isFile()) continue;
    const kind = kindOf(name);
    const unsafe = unsafeFilenameReason(name);
    if (!kind || unsafe) {
      if (!name.startsWith('.')) log.warn(name, 'not-listed', unsafe ? `filename ${unsafe}` : 'not a supported media type');
      continue;
    }
    items.push(kind === 'photo'
      ? { file: name, type: 'photo', yearId: '', group: '', privacy: { status: 'pending', reviewedBy: '', note: '' } }
      : { file: name, type: 'video', yearId: '', privacy: { status: 'pending', reviewedBy: '', note: '' } });
  }
  if (!items.length) {
    log.error('batch', 'items-missing', 'no supported photos or videos in the folder');
    return { log, written: null, count: 0 };
  }
  writeFileSync(target, `${JSON.stringify({ batch, items }, null, 2)}\n`, { flag: 'wx' });
  return { log, written: target, count: items.length };
}
