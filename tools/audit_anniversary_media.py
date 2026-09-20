from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
PYDEPS = ROOT / "review-local" / "pydeps"
sys.path.insert(0, str(PYDEPS))

from PIL import ExifTags, Image, ImageDraw, ImageFont, ImageOps  # type: ignore  # noqa: E402
from pillow_heif import register_heif_opener  # type: ignore  # noqa: E402
import imagehash  # type: ignore  # noqa: E402
import imageio_ffmpeg  # type: ignore  # noqa: E402


register_heif_opener()

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".heic", ".heif"}
VIDEO_EXTENSIONS = {".mov", ".mp4"}
DATE_KEYS = (36867, 36868, 306)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def rational(value: Any) -> float:
    try:
        return float(value)
    except (TypeError, ValueError, ZeroDivisionError):
        return 0.0


def gps_decimal(gps: dict[Any, Any]) -> dict[str, float] | None:
    try:
        lat_values = gps.get(2)
        lon_values = gps.get(4)
        if not lat_values or not lon_values:
            return None
        lat = rational(lat_values[0]) + rational(lat_values[1]) / 60 + rational(lat_values[2]) / 3600
        lon = rational(lon_values[0]) + rational(lon_values[1]) / 60 + rational(lon_values[2]) / 3600
        if gps.get(1) == "S":
            lat = -lat
        if gps.get(3) == "W":
            lon = -lon
        return {"latitude": round(lat, 6), "longitude": round(lon, 6)}
    except (KeyError, TypeError, IndexError):
        return None


def normalize_date(value: Any) -> str | None:
    if not value:
        return None
    if isinstance(value, bytes):
        value = value.decode("utf-8", "ignore")
    text = str(value).strip().replace("\x00", "")
    for fmt in ("%Y:%m:%d %H:%M:%S", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(text[:19], fmt).isoformat(timespec="seconds")
        except ValueError:
            pass
    return text or None


def inspect_image(path: Path) -> tuple[dict[str, Any], Image.Image]:
    with Image.open(path) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")
        exif = opened.getexif()
        capture_date = next((normalize_date(exif.get(key)) for key in DATE_KEYS if exif.get(key)), None)
        gps = None
        try:
            raw_gps = exif.get_ifd(34853)
            if raw_gps:
                gps = gps_decimal(raw_gps)
        except (AttributeError, KeyError, TypeError):
            gps = None
        width, height = image.size
        metadata = {
            "mediaType": "image",
            "width": width,
            "height": height,
            "aspectRatio": round(width / height, 6),
            "captureDate": capture_date,
            "hasGps": gps is not None,
            "gpsInternal": gps,
            "phash": str(imagehash.phash(image)),
        }
        return metadata, image.copy()


def ffprobe_json(path: Path) -> dict[str, Any]:
    ffmpeg = Path(imageio_ffmpeg.get_ffmpeg_exe())
    ffprobe = ffmpeg.with_name("ffprobe.exe")
    if not ffprobe.exists():
        return {}
    command = [
        str(ffprobe), "-v", "error", "-print_format", "json", "-show_streams", "-show_format", str(path)
    ]
    result = subprocess.run(command, capture_output=True, text=True, check=True)
    return json.loads(result.stdout)


def inspect_video(path: Path, still_dir: Path) -> tuple[dict[str, Any], Image.Image | None]:
    info = ffprobe_json(path)
    video_stream = next((stream for stream in info.get("streams", []) if stream.get("codec_type") == "video"), {})
    duration = rational(video_stream.get("duration") or info.get("format", {}).get("duration"))
    width = int(video_stream.get("width") or 0)
    height = int(video_stream.get("height") or 0)
    tags = {**info.get("format", {}).get("tags", {}), **video_stream.get("tags", {})}
    capture_date = tags.get("creation_time")
    metadata = {
        "mediaType": "video",
        "width": width or None,
        "height": height or None,
        "aspectRatio": round(width / height, 6) if width and height else None,
        "captureDate": capture_date,
        "durationSec": round(duration, 3) if duration else None,
        "hasGps": False,
        "gpsInternal": None,
        "phash": None,
    }
    still_dir.mkdir(parents=True, exist_ok=True)
    still_path = still_dir / f"{path.stem}.jpg"
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    midpoint = max(0.1, duration / 2 if duration else 0.1)
    subprocess.run(
        [ffmpeg, "-y", "-ss", str(midpoint), "-i", str(path), "-frames:v", "1", "-vf", "scale='min(720,iw)':-2", str(still_path)],
        capture_output=True,
        check=False,
    )
    if still_path.exists():
        with Image.open(still_path) as still:
            return metadata, ImageOps.exif_transpose(still).convert("RGB")
    return metadata, None


def fit_thumb(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    background = Image.new("RGB", size, "#0a1220")
    fitted = ImageOps.contain(image, (size[0] - 16, size[1] - 48), Image.Resampling.LANCZOS)
    x = (size[0] - fitted.width) // 2
    y = 8 + (size[1] - 48 - fitted.height) // 2
    background.paste(fitted, (x, y))
    return background


def contact_sheets(items: list[tuple[dict[str, Any], Image.Image | None]], output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    columns, rows = 4, 4
    cell = (360, 300)
    per_sheet = columns * rows
    font = ImageFont.load_default(size=17)
    for sheet_index in range(math.ceil(len(items) / per_sheet)):
        sheet_items = items[sheet_index * per_sheet:(sheet_index + 1) * per_sheet]
        canvas = Image.new("RGB", (columns * cell[0], rows * cell[1]), "#07101c")
        draw = ImageDraw.Draw(canvas)
        for slot, (record, image) in enumerate(sheet_items):
            x = (slot % columns) * cell[0]
            y = (slot // columns) * cell[1]
            if image is not None:
                thumb = fit_thumb(image, cell)
                canvas.paste(thumb, (x, y))
            label = f"#{record['inventoryNo']:03d} {record['sourceFilename']}"
            draw.rectangle((x, y + cell[1] - 39, x + cell[0], y + cell[1]), fill="#07101c")
            draw.text((x + 8, y + cell[1] - 31), label[:42], fill="#f8f0df", font=font)
        canvas.save(output_dir / f"fresh-sheet-{sheet_index + 1:02d}.jpg", quality=88, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", default="review-local/drive-2026-09-20")
    parser.add_argument("--inventory", default="review-local/drive-inventory-source.json")
    parser.add_argument("--output", default="review-local/fresh-media-audit.json")
    parser.add_argument("--sheets", default="review-local/fresh-sheets")
    args = parser.parse_args()

    source_dir = ROOT / args.source
    source_inventory = json.loads((ROOT / args.inventory).read_text(encoding="utf-8"))
    still_dir = ROOT / "review-local" / "video-stills"
    records: list[dict[str, Any]] = []
    previews: list[tuple[dict[str, Any], Image.Image | None]] = []

    for number, drive_record in enumerate(source_inventory["files"], start=1):
        path = source_dir / drive_record["sourceFilename"]
        suffix = path.suffix.lower()
        if suffix in IMAGE_EXTENSIONS:
            details, preview = inspect_image(path)
        elif suffix in VIDEO_EXTENSIONS:
            details, preview = inspect_video(path, still_dir)
        else:
            details, preview = {"mediaType": "unknown"}, None
        record = {
            "inventoryNo": number,
            **drive_record,
            "sha256": sha256(path),
            **details,
        }
        records.append(record)
        previews.append((record, preview))
        print(f"{number:03d}/{len(source_inventory['files'])} {path.name}", flush=True)

    hashes: dict[str, list[str]] = {}
    for record in records:
        hashes.setdefault(record["sha256"], []).append(record["sourceFilename"])
    exact_duplicates = [names for names in hashes.values() if len(names) > 1]
    payload = {
        "auditedAt": "2026-09-20",
        "sourceCount": len(records),
        "imageCount": sum(record["mediaType"] == "image" for record in records),
        "videoCount": sum(record["mediaType"] == "video" for record in records),
        "withCaptureDate": sum(bool(record.get("captureDate")) for record in records),
        "withGpsInternal": sum(bool(record.get("hasGps")) for record in records),
        "exactDuplicateGroups": exact_duplicates,
        "files": records,
    }
    (ROOT / args.output).write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    contact_sheets(previews, ROOT / args.sheets)
    print(json.dumps({key: payload[key] for key in ("sourceCount", "imageCount", "videoCount", "withCaptureDate", "withGpsInternal", "exactDuplicateGroups")}, ensure_ascii=False))


if __name__ == "__main__":
    main()
