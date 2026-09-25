"""Build the PDA BLISS SOLUTION brand assets (EP46.6).

Source: frontend/scripts/brand/source/pda-bliss-solution-source.webp — the
owner-approved lockup, a 1254x1254 raster on a flat #FEFEFE ground. There is
no vector master, so nothing here is upscaled or traced: every output is the
source's own pixels, cropped, un-matted and downsampled.

UN-MATTING. The ground is removed exactly rather than keyed: for a pixel c
over ground B, alpha = max over channels of (B - c) / B and the foreground is
(c - (1 - alpha) * B) / alpha. Black and green ink come back as opaque ink;
anti-aliased edges keep their true partial alpha.

SHADOW. The source's soft drop shadow is neutral grey at low alpha. At header
sizes it reads as dirt, so neutral pixels have their alpha pushed through a
smoothstep (faint shadow -> 0, letterforms unchanged). Green ink is untouched.

DARK VARIANT. Black letterforms become ivory; the green is lifted so it keeps
its contrast on the dark corporate ground. No white box behind anything.

Outputs (committed):
  frontend/public/brand/solution/   logo, mark and wordmark, light + dark (WebP)
  frontend/public/                  favicon.ico, favicon-16x16.png,
                                    favicon-32x32.png, apple-touch-icon.png,
                                    android-chrome-192x192.png,
                                    android-chrome-512x512.png,
                                    maskable-512x512.png
  frontend/public/brand/og-default.png   1200x630 share card

Every file is written without EXIF, XMP, ICC or any other metadata.

Run from the repository root (dev machine only, needs Pillow + numpy):
    python tools/brand/build_solution_brand.py
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent.parent
SOURCE = ROOT / "frontend" / "scripts" / "brand" / "source" / "pda-bliss-solution-source.webp"
PUBLIC = ROOT / "frontend" / "public"
BRAND = PUBLIC / "brand" / "solution"

GROUND = 254.0
# Regions of the source lockup (rows / columns, inclusive), measured once.
MARK_BOX = (285, 149, 953, 853)        # left, top, right, bottom
WORDMARK_BOX = (116, 860, 1136, 1095)
FULL_BOX = (110, 140, 1142, 1100)

IVORY = np.array([245, 243, 238], dtype=float)
PAPER = (250, 251, 249)                # icon ground: the corporate light surface
FONT_MONO = "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf"
FONT_SANS = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"


def smoothstep(edge0: float, edge1: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def unmatte(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Foreground colour, alpha and a 'greenness' mask from a ground-composited image."""
    alpha = np.clip((GROUND - rgb).max(axis=2) / GROUND, 0.0, 1.0)
    alpha[alpha < 0.02] = 0.0
    safe = np.where(alpha > 0, alpha, 1.0)[..., None]
    fg = np.clip((rgb - (1 - alpha[..., None]) * GROUND) / safe, 0, 255)
    # Any clear green bias is green ink: the shaded parts of the metallic P and
    # D are nearly black but still lean green, and must not turn ivory.
    green = np.clip((fg[..., 1] - np.maximum(fg[..., 0], fg[..., 2]) - 4) / 14.0, 0.0, 1.0)
    # The darkest core of those letters has almost no hue left. A pixel whose
    # neighbourhood is green ink is green ink too (a few px of the source).
    near = np.asarray(
        Image.fromarray((green * alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(5)), dtype=float
    ) / 255.0
    green = np.maximum(green, smoothstep(0.35, 0.65, near))
    return fg, alpha, green


def variant(rgb: np.ndarray, dark: bool) -> Image.Image:
    fg, alpha, green = unmatte(rgb)
    neutral = 1.0 - green
    # Drop the soft grey shadow, keep letterforms and their edges.
    lo, hi = (0.42, 0.78) if dark else (0.18, 0.55)
    alpha = alpha * (green + neutral * smoothstep(lo, hi, alpha))
    if dark:
        # Same hue, linearly brighter, so the metallic gradient survives.
        lifted = np.clip(fg * 2.3 + np.array([6, 22, 10]), 0, 255)
        fg = green[..., None] * lifted + neutral[..., None] * IVORY
    out = np.dstack([fg, alpha * 255]).round().astype(np.uint8)
    return Image.fromarray(out, "RGBA")


def crop(image: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    region = image.crop((box[0], box[1], box[2] + 1, box[3] + 1))
    bbox = region.getchannel("A").point(lambda a: 255 if a > 6 else 0).getbbox()
    return region.crop(bbox) if bbox else region


def save(image: Image.Image, path: Path, **options) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    clean = Image.new(image.mode, image.size)
    clean.frombytes(image.tobytes())  # a fresh image: no info/EXIF/XMP/ICC block
    clean.save(path, **options)
    print(f"  {path.relative_to(ROOT)}  {image.size[0]}x{image.size[1]}  {path.stat().st_size // 1024} KB")


def fit(image: Image.Image, box: int) -> Image.Image:
    scale = box / max(image.size)
    return image.resize((max(1, round(image.width * scale)), max(1, round(image.height * scale))), Image.LANCZOS)


def icon(mark: Image.Image, size: int, safe: float, ground=PAPER) -> Image.Image:
    """Opaque square icon, the mark centred inside `safe` of the edge."""
    canvas = Image.new("RGBA", (size, size), ground + (255,))
    glyph = fit(mark, round(size * safe))
    canvas.alpha_composite(glyph, ((size - glyph.width) // 2, (size - glyph.height) // 2))
    return canvas.convert("RGB")


def small_icon(mark: Image.Image, size: int) -> Image.Image:
    """16/32/48px favicons: the complete mark on a light rounded tile, so the
    black A survives a dark browser tab. The mark is never cut or retouched."""
    scale = 8
    big = size * scale
    tile = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    ImageDraw.Draw(tile).rounded_rectangle([0, 0, big - 1, big - 1], radius=round(big * 0.22), fill=PAPER + (255,))
    glyph = fit(mark, round(big * 0.9))
    tile.alpha_composite(glyph, ((big - glyph.width) // 2, (big - glyph.height) // 2))
    return tile.resize((size, size), Image.LANCZOS)


def share_card(logo: Image.Image) -> Image.Image:
    width, height = 1200, 630
    card = Image.new("RGBA", (width, height), (246, 248, 245, 255))
    # Translucent strokes go on their own layer: ImageDraw replaces RGBA
    # pixels instead of blending them.
    grid = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    lines = ImageDraw.Draw(grid)
    for x in range(0, width, 40):  # the corporate dev grid, very faint
        lines.line([(x, 0), (x, height)], fill=(6, 59, 42, 14))
    for y in range(0, height, 40):
        lines.line([(0, y), (width, y)], fill=(6, 59, 42, 14))
    lines.line([(640, 190), (640, 440)], fill=(6, 59, 42, 70), width=2)
    card.alpha_composite(grid)
    draw = ImageDraw.Draw(card)
    draw.rectangle([0, height - 10, width, height], fill=(6, 94, 52, 255))

    lockup = fit(logo, 470)
    card.alpha_composite(lockup, (80, (height - 10 - lockup.height) // 2))

    mono = ImageFont.truetype(FONT_MONO, 22)
    sans = ImageFont.truetype(FONT_SANS, 40)
    x = 684
    lines = ["Business systems", "Web applications", "Websites"]
    for index, line in enumerate(lines):
        draw.text((x, 205 + index * 62), line, font=sans, fill=(18, 24, 22, 255))
    draw.text((x, 408), "BY PDA BLISS COMPANY LIMITED", font=mono, fill=(6, 94, 52, 255))
    return card.convert("RGB")


def main() -> None:
    rgb = np.asarray(Image.open(SOURCE).convert("RGB")).astype(float)
    light, dark = variant(rgb, dark=False), variant(rgb, dark=True)

    print("brand/solution")
    # (name, region, longest edge in px). Each is ~4x its largest display size;
    # the source is never enlarged (`fit` only ever shrinks these crops).
    outputs = (
        ("logo", FULL_BOX, 600),        # stacked lockup
        ("mark", MARK_BOX, 560),        # large monogram (hero watermark)
        ("mark-sm", MARK_BOX, 176),     # header, footer, contact dock (40-44px)
        ("wordmark", WORDMARK_BOX, 560),  # PDA BLISS / SOLUTION line (~30px tall)
    )
    for name, box, edge in outputs:
        for suffix, image in (("", light), ("-dark", dark)):
            region = crop(image, box)
            assert max(region.size) >= edge, f"{name} would be upscaled"
            save(fit(region, edge), BRAND / f"pda-bliss-solution-{name}{suffix}.webp", quality=90, method=6)

    mark = crop(light, MARK_BOX)
    print("icons")
    small = {size: small_icon(mark, size) for size in (16, 32, 48)}
    save(small[16], PUBLIC / "favicon-16x16.png", optimize=True)
    save(small[32], PUBLIC / "favicon-32x32.png", optimize=True)
    small[48].save(PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"  frontend/public/favicon.ico  16/32/48  {(PUBLIC / 'favicon.ico').stat().st_size // 1024} KB")
    save(icon(mark, 180, 0.78), PUBLIC / "apple-touch-icon.png", optimize=True)
    save(icon(mark, 192, 0.74), PUBLIC / "android-chrome-192x192.png", optimize=True)
    save(icon(mark, 512, 0.74), PUBLIC / "android-chrome-512x512.png", optimize=True)
    # Maskable: the whole mark inside the central 60% circle-safe zone.
    save(icon(mark, 512, 0.56), PUBLIC / "maskable-512x512.png", optimize=True)

    print("share card")
    save(share_card(crop(light, FULL_BOX)), PUBLIC / "brand" / "og-default.png", optimize=True)


if __name__ == "__main__":
    main()
