# A&I media pipeline (EP43)

> **EP43 — Automated Media Pipeline.** This document is the canonical record of
> EP43. It describes how new A&I photos and videos enter the repository. Code:
> `tools/media-pipeline/`. Tests: `frontend/tests/mediaPipeline.test.mjs`.

New media go through one repository command. You don't hand-edit IDs, thumbnails,
posters, manifests or year assignments. The pipeline writes into the **existing**
canonical media model. It adds no manifest of its own.

---

## Quick start

```bash
# 1. Put the new files in a batch folder (gitignored)
mkdir -p media-inbox/year-02-first-batch
cp ~/Pictures/new/*.jpg media-inbox/year-02-first-batch/

# 2. Write the request skeleton (every decision starts blank)
npm run media:init -- media-inbox/year-02-first-batch

# 3. Fill in media.json: yearId (or capturedOn), group for photos, privacy review

# 4. Check it: validates, processes and stages everything, writes nothing
npm run media:ingest -- media-inbox/year-02-first-batch --dry-run

# 5. Publish it
npm run media:ingest -- media-inbox/year-02-first-batch

# 6. Verify, review the diff, commit
npm run media:check
npm test
git status
```

Run all commands from the repository root. Folder arguments resolve against the
directory you typed the command in.

---

## Architecture

```
media-inbox/<batch>/            source files + media.json          (gitignored)
        │
        ▼
 1  validation         request schema, filenames, types, decode, duplicates, IDs
 2  year / group       owner-supplied only → resolveMediaYear() from the app
 3  privacy review     explicit status + deterministic checks to confirm
 4  derivatives        sharp (images), MP4 reader / optional ffmpeg (video)
 5  staging            .media-staging/<batch>/public/…         (gitignored)
 6  canonical update   generated blocks + manifest provenance, in memory
 7  final validation   the staged result, exactly as it would ship
 8  promote            journaled copy; any failure rolls everything back
 9  post-validation    the live repository; rolled back if it fails
        │
        ▼
frontend/public/images/memories/archive/<id>.webp           full photo
frontend/public/images/memories/archive/thumbs/<id>.webp    thumbnail
frontend/public/videos/memories/<id>.mp4                    clip
frontend/public/images/memories/video/<id>.jpg              clip poster
frontend/src/data/memoryArchive.ts   (generated block)      canonical photo entries
frontend/src/data/memoryVideos.ts    (generated block)      canonical clip entries
tools/anniversary-media-curation.json (appended records)    provenance
```

| Module (`tools/media-pipeline/`) | Role |
| --- | --- |
| `cli.ts` | `init` / `ingest` / `check` commands |
| `init.ts` | Writes the `media.json` skeleton (never overwrites one) |
| `config.ts` | Paths, sizes, URL and ID conventions, ffmpeg discovery |
| `request.ts` | `media.json` schema and source-folder checks |
| `ingest.ts` | The workflow: plan → stage → validate → promote → verify |
| `images.ts` | Decode check, derivatives, difference hash (sharp) |
| `mp4.ts` | MP4/QuickTime reader, metadata blanking — no decoder needed |
| `videos.ts` | Passthrough or ffmpeg transcode, poster frame |
| `canonical.ts` | Reads/writes the canonical data files and the manifest |
| `validate.ts` | Canonical integrity — used by every ingest and `media:check` |

### Canonical model integration — no second source of truth

The application reads media from the same two files it always has:

- `memoryArchive.ts` → `memoryArchive: MemoryArchiveItem[]`
- `memoryVideos.ts` → `memoryVideos: MemoryVideo[]`

EP43 added one array to each file, `ingestedMemoryArchive` and
`ingestedMemoryVideos`. Each is merged into the exported list after the curated
entries, and the pipeline writes only between these markers:

```ts
// @media-pipeline:begin photos
{ "id": "memory-183", "image": "/images/memories/archive/memory-183.webp", … }
// @media-pipeline:end photos
```

Entries inside the markers are plain JSON objects, sorted by ID, with a fixed
field order, so a regenerated block is byte-identical. The pipeline reads the
curated arrays above the markers to avoid collisions but never rewrites them.
No scene, filter or component changed: an ingested photo shows up in the
Memory Archive through the same `memoryArchive` export.

Provenance (source filename, SHA-256, difference hash, privacy review, batch) is
appended to `tools/anniversary-media-curation.json` using that file's existing
record shapes: photos go to `files[]`, clips to `videoCuration[]`. Each pipeline
record carries an extra `ingest` stamp and a `privacyReview` object. The file is
written in its existing format (indent 1, trailing newline), so an append never
reformats history.

---

## Supported media

| Kind | Source formats | Output |
| --- | --- | --- |
| Photo | `.jpg` `.jpeg` `.png` `.webp` `.heic` `.heif` | WebP 1600px long edge (q82) + WebP 480px thumbnail (q72) |
| Video | `.mp4` `.mov` | H.264 MP4 + JPEG poster (1600px long edge, q82) |

These are the formats the repository already accepted
(`tools/audit_anniversary_media.py`). No new formats were added.

- **HEIC:** the prebuilt sharp/libvips can't decode HEVC-compressed HEIC.
  The pipeline reports `unreadable` for these, with the fix: export the photo as
  a full-quality JPEG and ingest that.
- **Orientation** is applied from EXIF into the pixels before any metadata is
  dropped, so a phone portrait stays portrait. `width`/`height` in the entry
  are the real display size, which is what the archive uses for its aspect-ratio
  layout.
- **No unnecessary recompression:** a source that is already a metadata-free
  WebP within 1600px is kept byte-for-byte as the full image.

### Video paths

| Source | Needs ffmpeg? | What happens |
| --- | --- | --- |
| H.264/AAC MP4 with faststart | no | Stream kept as-is. `udta`/`meta` boxes (creation time, device, location) are blanked in place. Box sizes don't change, so every chunk offset stays valid. |
| MOV, HEVC, non-AAC audio, no faststart | yes | Transcoded with the established policy: H.264 CRF 22, AAC 128k, `+faststart`, `-map_metadata -1`, 720 on the short edge. |

Posters come from a still the owner supplies (`"poster"` in media.json), or,
with ffmpeg, from a frame of the shipped clip at 1s. Without either, the item
fails with `poster-required`.

ffmpeg is optional and found in this order: `FFMPEG_PATH`, `ffmpeg` on `PATH`,
then the imageio-ffmpeg binary the existing curation tools install under
`review-local/pydeps/`. No transcoding service or other infrastructure is
involved.

---

## media.json

```jsonc
{
  "batch": "year-02-first-batch",          // required: a-z 0-9 -, names the batch in provenance
  "ignore": ["notes-for-me.txt"],          // optional: files in the folder to leave alone
  "items": [
    {
      "file": "IMG_1234.jpg",              // required: a file in this folder
      "type": "photo",                     // optional: checked against the extension
      "yearId": "year-02",                 // yearId and/or capturedOn — see below
      "group": "journey",                  // photos: one of memoryArchiveGroups
      "special": false,                    // photos, optional: archive ANCHOR tile
      "groupLabel": "…", "dateLabel": "…", // photos, optional: overrides of the group defaults
      "id": "memory-190",                  // optional: otherwise the next free ID
      "confirm": ["low-resolution"],       // optional: checks the owner has looked at
      "privacy": { "status": "approved", "reviewedBy": "Atthachet", "note": "…" }
    },
    {
      "file": "clip.mp4",
      "capturedOn": "2026-11-02",          // owner-confirmed date → year via resolveMediaYear
      "poster": "clip-still.jpg",          // videos, optional with ffmpeg
      "label": "…",                        // videos, optional: defaults to ความทรงจำที่ยังเคลื่อนไหว
      "confirm": ["audio-track"],
      "privacy": { "status": "approved", "reviewedBy": "Atthachet" }
    }
  ]
}
```

Unknown fields are errors, so a typo like `yearID` can't silently fall back to
a default. There are no caption, place or event fields. The pipeline has
nowhere to put invented content.

**Generated metadata.**

| Kind | Fields |
| --- | --- |
| Photo | `id`, `image`, `thumb`, `width`, `height`, `group`, `groupLabel` (from `memoryArchiveGroups`), `dateLabel` (the group's established label, e.g. `JOURNEY`), `special`, `privacy: "safe"`, `yearId`, `yearSource` |
| Clip | `id`, `video`, `poster`, `width`, `height`, `posterWidth`, `posterHeight`, `duration`, `orientation`, `role: "archive"`, `label`, `hasAudio`, `yearId`, `yearSource` |

Story and featured placements are never generated. They stay deliberate
curation edits.

**IDs** follow the established convention: `memory-NNN` for photos and
`memory-clip-NN` for clips. A new ID is the next number after everything that
exists or ever existed: canonical entries, manifest records, and files on disk.
Numbers that belonged to excluded sources are never reused. Existing IDs and URLs
never change.

---

## Relationship year

Year assignment goes through the app's own `resolveMediaYear()`
(`frontend/src/data/archiveYears.ts`) and `relationshipYears.ts`, and only from
explicit owner input.

| media.json | Result |
| --- | --- |
| `"yearId": "year-02"` | `year-02`, `yearSource: "owner-override"` |
| `"capturedOn": "2026-11-02"` | derived through the Bangkok-time boundary → `year-02`, `yearSource: "capture-date"` |
| both | must agree, or `year-conflict` |
| neither | `year-missing` — **never guessed** |
| a year not declared in `relationshipYears.ts` | `year-undeclared` — declare it there first, deliberately |
| a date before 2025-10-12 | `year-before-start` |

EXIF dates are **never** used to assign a year. If a file's EXIF date points to
a different year than the owner chose, the run prints an `exif-year-differs`
warning and uses the owner's value.

Established media keep `yearSource: "release-default"` and Year 01. Pipeline
entries never use `release-default`. Year 02 is still `preview`, so the archive
shows its "บทต่อไป" state for Year 02 however much media it holds. Changing
`releaseState` to `released` remains a separate, deliberate step
(`docs/A_AND_I_YEAR_ARCHIVE.md`).

---

## Privacy review

The publish decision is always explicit and always recorded.

| `privacy.status` | Effect |
| --- | --- |
| `pending` | the whole batch waits (exit code 2); nothing is written |
| `approved` | published, once every raised check is confirmed; `reviewedBy` required |
| `rejected` | recorded in the manifest as excluded, with the reason; never published and no derivatives; `reviewedBy` required |
| missing | `privacy-review-missing` error |

Deterministic checks. The pipeline does no face or identity detection.

| Check | Code | Blocking? |
| --- | --- | --- |
| Filename suggests a document, screenshot, scan, slip or ID (EN + TH words) | `filename-sensitive` | until confirmed |
| PNG source (usually a screenshot or export) | `source-png` | until confirmed |
| Clip has an audio track (speech can reveal names, places) | `audio-track` | until confirmed |
| Near-identical to an archive thumbnail or another item (dHash ≤ 4) | `near-duplicate` | until confirmed |
| Photo long edge < 1200px, or clip short edge < 480px | `low-resolution` | until confirmed |
| Photo long edge < 480px | `too-small` | always |
| EXIF / GPS / XMP / IPTC / QuickTime `udta`/`meta` / location atoms | `metadata-removed` | no — removed, then verified absent |
| Sidecars in the folder (`.aae`, `.xmp`, `.json`, …) | `sidecar-file` | until deleted or listed in `ignore` |
| Any other unlisted file or sub-folder | `unexpected-file` | until listed or ignored |

To confirm a check, add its code to the item's `"confirm"` array **after
looking at the file**. Confirming a check that didn't trigger produces a
`confirmation-unused` warning. GPS coordinates are never copied into the
repository: provenance records `gpsInternal: null` and lists only which kinds of
metadata the source had (`privacyReview.sourceMetadata`).

---

## Duplicates and collisions

| Situation | Code |
| --- | --- |
| The same bytes twice in one batch | `duplicate-content` |
| Bytes already in the archive (any historical pass, any batch) | `duplicate-content`, naming where |
| Near-identical picture (re-export, resize) | `near-duplicate` (confirmable) |
| Two names differing only by case / Unicode form | `duplicate-filename` |
| Explicit `id` already used, or below the next free number | `id-collision` |
| A target file already exists on disk or in the manifest | `would-overwrite` |

Nothing is ever overwritten. Derivatives are copied with an exclusive-create
flag. The only files replaced are the three canonical data files, and each is
checked against the content read at the start of the run.

---

## Idempotency and failure safety

- **Reruns.** A source whose SHA-256 is already recorded for this batch is
  `unchanged`. Rerunning a published batch is a no-op (exit 0), with no duplicate
  entries and no rewritten files. Adding items to a batch folder and rerunning
  publishes only the new ones.
- **Published decisions are never rewritten.** If media.json now asks for a
  different year, group, label or ID for a published item, the run fails with
  `already-ingested-changed`. A previously rejected item that is now approved
  fails with `review-changed`. Change the data file deliberately instead.
- **All or nothing per batch.** Any error or pending review means nothing is
  written, not even the valid items.
- **Staging.** Derivatives are built under `.media-staging/<batch>/`, and the
  complete result is validated before anything under `frontend/` or `tools/`
  changes.
- **Journaled promotion.** `.media-staging/journal.json` records every created
  file and every replaced data file, with its backup. A failure during
  promotion rolls back immediately. If the process is killed, the next
  `media:ingest` rolls the half-finished run back before doing anything else.
- **Post-promotion validation.** The live repository is validated once more. On
  failure everything is rolled back (exit 3).
- **One run at a time.** `.media-staging/.lock` prevents two concurrent runs.
- **Deterministic output.** The same input produces the same IDs, the same
  bytes and the same data text. The tests check this across two independent
  repository copies.

### Recovering from errors

| Exit | Meaning | What to do |
| --- | --- | --- |
| 0 | published / unchanged / dry run passed | review `git diff`, run `npm run media:check` and `npm test` |
| 1 | validation errors | read each `ERROR [code] asset:` line and its `→` fix; nothing was written |
| 2 | privacy review pending | review the listed files, set `approved` or `rejected` |
| 3 | failed (encoder, I/O, validation after staging) | nothing was promoted, or it was rolled back; fix the cause and rerun |

- A stale lock: if no ingest is running, delete `.media-staging/.lock`.
- The cleanest undo of a published batch before commit is
  `git checkout -- frontend/src/data tools/anniversary-media-curation.json`, then
  delete the new files listed under `Changed:`.
- A hand edit that breaks a generated block stops every ingest with a message
  naming the file. Restore it from git.

---

## `npm run media:check`

Validates the canonical media data as committed:

- IDs and file paths are unique; every referenced photo, thumbnail, clip and
  poster exists.
- Every year is declared, and pipeline entries have an explicit year source.
- Pipeline entries follow the URL and ID conventions, and their dimensions,
  duration and audio match the real files.
- Derivatives carry no EXIF/XMP/IPTC or video location metadata.
- Every pipeline entry has a provenance record and the reverse; no content hash
  is recorded twice.

Run it after every ingest and before committing. The test suite runs the same
check.

---

## Adding future media safely

1. Copy sources into `media-inbox/<batch>/`. Nothing there is ever committed.
2. `npm run media:init -- media-inbox/<batch>`, then fill in every item.
   Years and groups come from the owner, never from file dates.
3. Look at every file before setting `privacy.status`, and confirm checks only
   after looking.
4. `--dry-run` first, then the real run.
5. `npm run media:check`, `npm test`, `npm run build`. Open `/us` → Memory
   Archive and check the new items (for Year 02, while it is a preview, the
   archive deliberately shows the "บทต่อไป" state).
6. Commit the derivatives, the data files and the manifest together.
7. Story placements, featured clips and `releaseState` changes stay manual,
   deliberate edits.

Quality gates cover the pipeline itself: `npm run lint` (includes `lint:tools`),
`npm run typecheck` (includes `typecheck:tools`) and `npm test`
(`frontend/tests/mediaPipeline.test.mjs`, which runs every ingest against a
throwaway repository copy that shares no files with the real one).

Requirements: Node 20.11+ and `npm install` (sharp ships prebuilt binaries for
Windows, macOS and Linux). ffmpeg is optional.
