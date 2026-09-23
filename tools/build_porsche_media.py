"""Build privacy-safe runtime derivatives for the Porsche (ปอร์เช่) Drive folder.

Source: owner Drive folder 11SQ0SmjA_OluxN-w6gjnopvCvT2Nfjwo, downloaded
read-only into review-local/drive-porsche/ (gitignored).

The folder holds four prenatal ultrasound scans. Every frame carries a header
band and side columns with medical and identifying text: clinic, the mother's
full name, patient number, due date, gestational age and scan timestamps. None
of that may ship. The derivative is a pixel crop of the scan fan only, so the
text is removed from the pixels themselves - never hidden by CSS - and the
WebP is written without EXIF, GPS, ICC or any other metadata.

Run from the repository root:  python tools/build_porsche_media.py
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "review-local" / "drive-porsche"
OUTPUT_DIR = ROOT / "frontend" / "public" / "images" / "memories" / "archive"
THUMB_DIR = OUTPUT_DIR / "thumbs"
MANIFEST = ROOT / "tools" / "anniversary-media-curation.json"

# Scan fan only. Header text ends at y≈62, the "S" marker sits at y≈108-128,
# the technical column is x<110 and the depth scale / icons are x>1110.
SAFE_CROP = (125, 132, 1110, 924)

# Chronological by the scan timestamp printed in each frame (the timestamps
# themselves are not exported anywhere at runtime).
SOURCES = [
    ("IMG_6370.JPG", 179),
    ("IMG_6369.JPG", 180),
    ("IMG_6368.JPG", 181),
    ("IMG_6371.JPG", 182),
]


def save_webp(image: Image.Image, path: Path, edge: int, quality: int) -> tuple[int, int, int]:
    clean = image.convert("RGB")
    if max(clean.size) > edge:
        scale = edge / max(clean.size)
        clean = clean.resize((round(clean.width * scale), round(clean.height * scale)), Image.Resampling.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    clean.save(path, "WEBP", quality=quality, method=6, exif=b"", icc_profile=None)
    return clean.width, clean.height, path.stat().st_size


def main() -> None:
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    known = {entry["sourceFilename"] for entry in manifest["files"]}
    hashes: set[str] = set()
    added = []
    for filename, number in SOURCES:
        source = SOURCE_DIR / filename
        raw = source.read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        if digest in hashes:
            raise SystemExit(f"duplicate source content: {filename}")
        hashes.add(digest)

        with Image.open(source) as image:
            width, height = image.size
            safe = image.crop(SAFE_CROP)
        name = f"memory-{number:03d}.webp"
        w, h, size = save_webp(safe, OUTPUT_DIR / name, 1600, 84)
        tw, th, tsize = save_webp(safe, THUMB_DIR / name, 480, 76)
        print(f"{filename} -> {name} {w}x{h} {size}b, thumb {tw}x{th} {tsize}b")

        if filename in known:
            continue
        added.append({
            "sourceFileId": None,
            "sourceFilename": filename,
            "sourceFolder": "Porsche (ปอร์เช่)",
            "mimeType": "image/jpeg",
            "mediaType": "image",
            "sourceBytes": len(raw),
            "dimensions": {"width": width, "height": height},
            "captureDate": None,
            "gpsInternal": None,
            "sha256": digest,
            "phash": None,
            "event": "porsche-family",
            "category": "B. STORY SUPPORT",
            "duplicateGroup": None,
            "privacy": "safe-after-crop",
            "privacyNote": "prenatal scan; header/side text (clinic, name, patient id, dates) removed by pixel crop before export",
            "ownerConfirmed": True,
            "productionAssets": [f"/images/memories/archive/{name}"],
            "thumb": f"/images/memories/archive/thumbs/{name}",
            "runtimeLocation": "local",
            "productionStatus": "used",
            "excludedReason": None,
        })

    if added:
        manifest["files"].extend(added)
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + "\n", encoding="utf-8", newline="\n")
    print(f"manifest entries added: {len(added)}")


if __name__ == "__main__":
    main()
