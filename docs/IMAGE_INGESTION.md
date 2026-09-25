# A&I image ingestion workflow

> **Superseded for new media by EP43.** New photos and videos are ingested with
> `npm run media:ingest`. See [MEDIA_PIPELINE.md](MEDIA_PIPELINE.md). This
> document records the original one-off Drive curation pass and its rules, which
> the pipeline enforces.

The owner will supply a large Google Drive photo library. This document is the
workflow for turning that library into committed, optimised assets.

**The production runtime must never depend on Google Drive.** Drive is a source
pool for a one-off human-reviewed pass. The running site only ever reads files
from `frontend/public/images/memories/`.

---

## Pipeline

```
Google Drive source pool
   ↓  export a working copy locally (never linked at runtime)
image review
   ↓  discard blurred, duplicated, unusable, or private-to-others frames
duplicate filtering
   ↓  near-duplicate detection; keep the best frame of each burst
scene scoring
   ↓  score each candidate against the slot categories below
selected asset manifest
   ↓  a flat list of chosen files with the slot each one fills
local optimised images
   ↓  resize, strip EXIF (including GPS), convert, compress
anniversary.ts mapping
       set `image` on the matching memory / slot
```

## Slot categories

| Category | What belongs in it |
| --- | --- |
| `hero` | The opening image. The strongest photo of the two of them. |
| `timeline` | One image per timeline moment, in story order. |
| `travel` | Trips — beaches, waterfalls, provinces, road trips. |
| `funny` | The photos that are funny rather than flattering. |
| `daily` | Ordinary days. These carry more weight than they look like they do. |
| `family` | Family, homes, temples, the wedding. |
| `pets` | ถ้วยฟู and หนมถ้วย. |
| `finale` | The closing images. The most recent, and the family ones. |

Declared in `AssetCategory` in `frontend/src/data/anniversary.ts`.

## Rules

1. **Strip EXIF on every file**, GPS data especially. These are private photos.
2. **Do not write a caption for a photo you have not seen.** Slots carry an
   `intent` describing what the slot is for. The caption is written when the
   image is chosen, by the owner, in their own words.
3. **Do not infer a date from a filename.** If the date is not known, leave
   `date` as the sequence label.
4. **Do not derive coordinates from photo metadata** and place them on the map
   without the owner approving each one. The canonical roster intentionally
   keeps `coordinatesPending: true`; story highlights are not coordinate data.
5. Optimise before committing: long edge ≤ 2000px, WebP or optimised JPEG,
   target under ~300KB per file.
6. `frontend/public/images/memories/*` is gitignored apart from `.gitkeep`.
   Confirm the intended storage approach with the owner before committing any
   private photograph to the repository.

## Applying the manifest

For each chosen file:

- A real place already in `memories[]` → set that entry's `image`.
- An opening or closing image → set `image` on the matching slot in
  `heroImages[]` / `finalImages[]`.
- A pet photo → `petImages[]`.
- A timeline moment → set `image` on the matching entry in `timeline[]`.

Then check the report at `/dev/anniversary-preview`, which lists every entry
still missing an image.
