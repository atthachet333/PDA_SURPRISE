# Brand sources (EP44)

Editable sources for the generated public brand files. The PNGs in
`public/brand/` are committed; regenerate them only when these change, with any
SVG renderer, e.g. `npx sharp-cli`:

| Source | Output | Size |
| --- | --- | --- |
| `og-default.svg` | `public/brand/og-default.png` | 1200×630 (social share card) |
| `icon.svg` | `public/brand/apple-touch-icon.png` | 180×180 |
| `icon.svg` | `public/brand/icon-192.png` | 192×192 |
| `icon.svg` | `public/brand/icon-512.png` | 512×512 (maskable) |

The share card uses Latin text only so one image serves the Thai, English and
Chinese pages. No screenshot, client data or private imagery belongs in it.
