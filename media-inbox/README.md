# media-inbox

Drop new A&I photos and videos here, one folder per batch:

```
media-inbox/
  year-02-first-batch/
    IMG_1234.jpg
    clip.mp4
    clip-poster.jpg      (optional, a still for a clip)
    media.json           (npm run media:init writes the skeleton)
```

Everything in this folder except this README is gitignored. Source files never
enter the repository; only the pipeline's verified derivatives do.

```bash
npm run media:init   -- media-inbox/year-02-first-batch
# fill in media.json: yearId (or capturedOn), group, privacy review
npm run media:ingest -- media-inbox/year-02-first-batch --dry-run
npm run media:ingest -- media-inbox/year-02-first-batch
npm run media:check
```

Full guide: [docs/MEDIA_PIPELINE.md](../docs/MEDIA_PIPELINE.md) (EP43).
