# Brand sources (EP46.6 — PDA BLISS SOLUTION)

`source/pda-bliss-solution-source.webp` is the owner-approved PDA BLISS SOLUTION
lockup (1254×1254 raster on white). It is the only master: there is no vector
file, so nothing is traced or upscaled.

Every public brand file is generated from it by
`tools/brand/build_solution_brand.py` (dev machine, Pillow + numpy):

```
python tools/brand/build_solution_brand.py
```

| Output | Use |
| --- | --- |
| `public/brand/solution/pda-bliss-solution-{logo,mark,mark-sm,wordmark}[-dark].webp` | site logo variants; `-dark` = ivory letterforms + lifted green for dark grounds |
| `public/favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png` | browser tab (monogram on a light rounded tile, readable on dark tabs) |
| `public/apple-touch-icon.png` | iOS home screen, 180×180, opaque |
| `public/android-chrome-192x192.png`, `android-chrome-512x512.png` | manifest `any` |
| `public/maskable-512x512.png` | manifest `maskable`, mark inside the 60% safe circle |
| `public/brand/og-default.png` | 1200×630 share card |

The share card uses Latin text only so one image serves the Thai, English and
Chinese pages. No screenshot, client data or private imagery belongs in it.
All outputs are written without EXIF/XMP/ICC metadata. The source stays out of
`public/`, so it is never served.
