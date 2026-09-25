/**
 * The ingestion request: a source folder plus its media.json.
 *
 * media.json is the only place an owner decision enters the pipeline — the
 * relationship year, the archive group, the privacy review. Nothing in it is
 * ever guessed or filled from file metadata. Unknown keys are errors, so a typo
 * such as "yearID" cannot silently fall back to anything.
 */
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import {
  IMAGE_EXTENSIONS,
  OS_JUNK,
  PHOTO_ID,
  REQUEST_FILENAME,
  SIDECAR_EXTENSIONS,
  VIDEO_EXTENSIONS,
  VIDEO_ID
} from './config.ts';
import { CONFIRMABLE, type IssueLog } from './issues.ts';

export type PrivacyStatus = 'approved' | 'pending' | 'rejected';

export interface RequestItem {
  file: string;
  kind: 'photo' | 'video';
  id?: string;
  yearId?: string;
  capturedOn?: string;
  group?: string;
  groupLabel?: string;
  dateLabel?: string;
  special: boolean;
  label?: string;
  poster?: string;
  confirm: string[];
  privacy: { status: PrivacyStatus; reviewedBy?: string; note?: string };
}

export interface IngestRequest {
  sourceDir: string;
  batch: string;
  items: RequestItem[];
  /** Files present in the folder that the request uses as posters. */
  posterFiles: Set<string>;
}

const BATCH = /^[a-z0-9][a-z0-9-]{1,62}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const ITEM_KEYS = new Set(['file', 'type', 'id', 'yearId', 'capturedOn', 'group', 'groupLabel', 'dateLabel', 'special', 'label', 'poster', 'confirm', 'privacy']);
const PRIVACY_KEYS = new Set(['status', 'reviewedBy', 'note']);
const TOP_KEYS = new Set(['$schema', 'batch', 'items', 'ignore']);

/** Filenames that are safe to read on every OS the owner uses (Windows included). */
export function unsafeFilenameReason(name: string): string | null {
  if (name !== path.basename(name) || name.includes('/') || name.includes('\\')) return 'contains a path separator';
  if (name === '.' || name === '..' || name.includes('..')) return 'contains ".."';
  if (name.startsWith('.')) return 'is a hidden file';
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f<>:"|?*]/.test(name)) return 'contains a control or reserved character';
  if (name.length > 120) return 'is longer than 120 characters';
  if (/[. ]$/.test(name)) return 'ends with a dot or space';
  return null;
}

export function kindOf(name: string): 'photo' | 'video' | null {
  const ext = path.extname(name).toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) return 'photo';
  if (VIDEO_EXTENSIONS.has(ext)) return 'video';
  return null;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const optionalString = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);

/** Loads and validates media.json and the folder it describes. Returns null when the request itself is unusable. */
export function loadRequest(sourceDir: string, log: IssueLog): IngestRequest | null {
  const dir = path.resolve(sourceDir);
  if (!existsSync(dir) || !lstatSync(dir).isDirectory()) {
    log.error('batch', 'source-missing', `${dir} is not a directory`, 'Pass the folder that holds the media and its media.json.');
    return null;
  }
  const requestPath = path.join(dir, REQUEST_FILENAME);
  if (!existsSync(requestPath)) {
    log.error('batch', 'request-missing', `no ${REQUEST_FILENAME} in ${dir}`, `Run: npm run media:init -- "${sourceDir}" and fill it in.`);
    return null;
  }
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(requestPath, 'utf8'));
  } catch (error) {
    log.error('batch', 'request-invalid', `${REQUEST_FILENAME} is not valid JSON: ${(error as Error).message}`);
    return null;
  }
  if (!isObject(raw)) {
    log.error('batch', 'request-invalid', `${REQUEST_FILENAME} must be a JSON object`);
    return null;
  }
  for (const key of Object.keys(raw)) {
    if (!TOP_KEYS.has(key)) log.error('batch', 'request-unknown-field', `unknown top-level field "${key}"`, `Allowed: ${[...TOP_KEYS].join(', ')}`);
  }
  const batch = typeof raw.batch === 'string' ? raw.batch : '';
  if (!BATCH.test(batch)) {
    log.error('batch', 'batch-invalid', `batch "${batch}" must be 2–63 chars of a-z, 0-9 and "-"`, 'Name the batch after what it is, e.g. "year-02-first-batch".');
  }
  if (!Array.isArray(raw.items) || raw.items.length === 0) {
    log.error('batch', 'items-missing', `${REQUEST_FILENAME} lists no items`);
    return null;
  }
  const ignore = new Set(Array.isArray(raw.ignore) ? raw.ignore.filter((entry): entry is string => typeof entry === 'string') : []);

  const items: RequestItem[] = [];
  const seen = new Map<string, string>();
  const posterFiles = new Set<string>();

  raw.items.forEach((value, index) => {
    const where = `items[${index}]`;
    if (!isObject(value)) {
      log.error(where, 'item-invalid', 'each item must be an object');
      return;
    }
    const file = typeof value.file === 'string' ? value.file : '';
    const asset = file || where;
    for (const key of Object.keys(value)) {
      if (!ITEM_KEYS.has(key)) log.error(asset, 'item-unknown-field', `unknown field "${key}"`, `Allowed: ${[...ITEM_KEYS].join(', ')}`);
    }
    const unsafe = file ? unsafeFilenameReason(file) : 'is empty';
    if (unsafe) {
      log.error(asset, 'unsafe-filename', `"file" ${unsafe}`, 'Rename the source to a plain filename inside the batch folder.');
      return;
    }
    const folded = file.normalize('NFC').toLowerCase();
    if (seen.has(folded)) {
      log.error(asset, 'duplicate-filename', `listed twice (also as "${seen.get(folded)}"); names that differ only by case collide on Windows and macOS`);
      return;
    }
    seen.set(folded, file);

    const kind = kindOf(file);
    if (!kind) {
      log.error(asset, 'unsupported-type', `"${path.extname(file) || '(no extension)'}" is not a supported media type`,
        `Photos: ${[...IMAGE_EXTENSIONS].join(' ')}. Videos: ${[...VIDEO_EXTENSIONS].join(' ')}.`);
      return;
    }
    if (value.type !== undefined && value.type !== kind) {
      log.error(asset, 'type-mismatch', `"type" is "${String(value.type)}" but the extension is a ${kind}`);
    }

    const privacyRaw = value.privacy;
    let privacy: RequestItem['privacy'] = { status: 'pending' };
    if (!isObject(privacyRaw) || typeof privacyRaw.status !== 'string') {
      log.error(asset, 'privacy-review-missing', 'no privacy review state',
        'Add "privacy": { "status": "pending" | "approved" | "rejected", "reviewedBy": "…" } after looking at the file.');
    } else {
      for (const key of Object.keys(privacyRaw)) {
        if (!PRIVACY_KEYS.has(key)) log.error(asset, 'item-unknown-field', `unknown privacy field "${key}"`);
      }
      const status = privacyRaw.status;
      if (status !== 'approved' && status !== 'pending' && status !== 'rejected') {
        log.error(asset, 'privacy-review-invalid', `privacy.status "${status}" must be approved, pending or rejected`);
      } else {
        privacy = { status, reviewedBy: optionalString(privacyRaw.reviewedBy), note: optionalString(privacyRaw.note) };
        if (status !== 'pending' && !privacy.reviewedBy) {
          log.error(asset, 'privacy-reviewer-missing', `privacy.status is "${status}" but privacy.reviewedBy is empty`,
            'Record who made the decision; a publish decision is never anonymous.');
        }
      }
    }

    const confirm = Array.isArray(value.confirm) ? value.confirm.filter((code): code is string => typeof code === 'string') : [];
    if (value.confirm !== undefined && (!Array.isArray(value.confirm) || confirm.length !== value.confirm.length)) {
      log.error(asset, 'confirm-invalid', '"confirm" must be an array of check codes');
    }
    for (const code of confirm) {
      if (!CONFIRMABLE.has(code)) log.error(asset, 'confirm-invalid', `"${code}" is not a confirmable check`, `Confirmable: ${[...CONFIRMABLE].join(', ')}`);
    }

    const item: RequestItem = {
      file,
      kind,
      id: optionalString(value.id),
      yearId: optionalString(value.yearId),
      capturedOn: optionalString(value.capturedOn),
      group: optionalString(value.group),
      groupLabel: optionalString(value.groupLabel),
      dateLabel: optionalString(value.dateLabel),
      special: value.special === true,
      label: optionalString(value.label),
      poster: optionalString(value.poster),
      confirm,
      privacy
    };
    if (value.special !== undefined && typeof value.special !== 'boolean') log.error(asset, 'item-invalid', '"special" must be true or false');
    if (item.capturedOn && !DATE.test(item.capturedOn)) {
      log.error(asset, 'date-invalid', `capturedOn "${item.capturedOn}" must be YYYY-MM-DD`);
    }
    if (item.id && !(kind === 'photo' ? PHOTO_ID : VIDEO_ID).test(item.id)) {
      log.error(asset, 'id-invalid', `id "${item.id}" does not follow the ${kind} convention`,
        kind === 'photo' ? 'Photos use memory-NNN; omit "id" to take the next free one.' : 'Videos use memory-clip-NN; omit "id" to take the next free one.');
    }
    if (kind === 'photo') {
      for (const key of ['label', 'poster'] as const) {
        if (value[key] !== undefined) log.error(asset, 'item-invalid', `"${key}" only applies to videos`);
      }
    } else {
      for (const key of ['group', 'groupLabel', 'dateLabel', 'special'] as const) {
        if (value[key] !== undefined) log.error(asset, 'item-invalid', `"${key}" only applies to photos; clips have no archive group`);
      }
      if (item.poster) {
        const posterUnsafe = unsafeFilenameReason(item.poster);
        if (posterUnsafe) log.error(asset, 'unsafe-filename', `"poster" ${posterUnsafe}`);
        else if (kindOf(item.poster) !== 'photo') log.error(asset, 'unsupported-type', `poster "${item.poster}" is not a supported image`);
        else posterFiles.add(item.poster);
      }
    }
    items.push(item);
  });

  // Every file in the folder must be accounted for: listed, a poster, the request, or explicitly ignored.
  const listed = new Set(items.map((item) => item.file));
  const onDisk = readdirSync(dir);
  const onDiskFolded = new Map<string, string>();
  for (const name of onDisk) {
    const full = path.join(dir, name);
    const stat = lstatSync(full);
    const folded = name.normalize('NFC').toLowerCase();
    if (onDiskFolded.has(folded)) {
      log.error(name, 'duplicate-filename', `collides with "${onDiskFolded.get(folded)}" on case-insensitive file systems`);
    }
    onDiskFolded.set(folded, name);
    if (name === REQUEST_FILENAME || listed.has(name) || posterFiles.has(name) || ignore.has(name)) {
      if (stat.isSymbolicLink()) log.error(name, 'unsafe-path', 'is a symbolic link', 'Copy the real file into the batch folder.');
      else if ((listed.has(name) || posterFiles.has(name)) && !stat.isFile()) log.error(name, 'unsafe-path', 'is not a regular file');
      continue;
    }
    const lower = name.toLowerCase();
    if (OS_JUNK.has(lower)) {
      log.warn(name, 'os-junk', 'operating-system file ignored');
    } else if (stat.isDirectory()) {
      log.error(name, 'unexpected-file', 'sub-folders are not ingested', 'Keep each batch flat, or list the folder under "ignore".');
    } else if (SIDECAR_EXTENSIONS.has(path.extname(lower))) {
      log.error(name, 'sidecar-file', 'sidecar files can carry edit history, captions or location and are never published',
        'Delete it from the batch folder, or list it under "ignore" after checking it.');
    } else {
      log.error(name, 'unexpected-file', 'present in the folder but not listed in media.json',
        'Add it to "items", or list it under "ignore".');
    }
  }
  for (const item of items) {
    if (!onDisk.includes(item.file)) log.error(item.file, 'source-missing', 'listed in media.json but not in the folder');
    if (item.poster && !onDisk.includes(item.poster)) log.error(item.file, 'source-missing', `poster "${item.poster}" is not in the folder`);
    if (item.poster && listed.has(item.poster)) log.error(item.file, 'item-invalid', `poster "${item.poster}" is also listed as an item`);
  }

  return { sourceDir: dir, batch, items, posterFiles };
}
