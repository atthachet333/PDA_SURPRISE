from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "review-local" / "pydeps"))

from PIL import Image, ImageFilter, ImageOps  # type: ignore  # noqa: E402
from pillow_heif import register_heif_opener  # type: ignore  # noqa: E402


register_heif_opener()

SOURCE_DIR = ROOT / "review-local" / "drive-2026-09-20"
AUDIT_PATH = ROOT / "review-local" / "fresh-media-audit.json"
OLD_MANIFEST_PATH = ROOT / "tools" / "anniversary-media-curation.json"
OUTPUT_DIR = ROOT / "frontend" / "public" / "images" / "memories" / "archive"
THUMB_DIR = OUTPUT_DIR / "thumbs"
MANIFEST_PATH = ROOT / "tools" / "anniversary-media-curation.json"


EXCLUSIONS: dict[str, tuple[str, str, str | None]] = {
    # 31-frame Cha-am burst: four distinct frames are retained, all others are
    # represented by the same-moment group rather than rendered as 27 clones.
    **{
        f"IMG_{number}.HEIC": ("F. DUPLICATE / NEAR-DUPLICATE", "burst duplicate", "burst-chaam-2025-10-16")
        for number in range(3525, 3557)
        if number not in {3525, 3545, 3550, 3555}
    },
    "IMG_4156.HEIC": ("F. DUPLICATE / NEAR-DUPLICATE", "near duplicate", "mirror-burst"),
    "IMG_4158.HEIC": ("F. DUPLICATE / NEAR-DUPLICATE", "near duplicate", "mirror-burst"),
    "IMG_4159.HEIC": ("F. DUPLICATE / NEAR-DUPLICATE", "near duplicate", "mirror-burst"),
    "IMG_3847.HEIC": ("E. PRIVATE / EXCLUDED", "private/sensitive content — child", None),
    "IMG_3856.HEIC": ("E. PRIVATE / EXCLUDED", "private/sensitive content — child", None),
    "IMG_5642.JPG": ("E. PRIVATE / EXCLUDED", "sensitive personal document and near duplicate", "registration-documents"),
    "IMG_5644.JPG": ("E. PRIVATE / EXCLUDED", "sensitive personal document and near duplicate", "registration-documents"),
    "5.jpg": ("F. DUPLICATE / NEAR-DUPLICATE", "near duplicate", "wedding-portrait-set"),
    "2.jpg": ("F. DUPLICATE / NEAR-DUPLICATE", "near duplicate", "wedding-portrait-set"),
    "49.jpg": ("F. DUPLICATE / NEAR-DUPLICATE", "near duplicate", "wedding-table-set"),
    "46.jpg": ("F. DUPLICATE / NEAR-DUPLICATE", "near duplicate", "wedding-table-set"),
    "F8BDF6F8-2C3B-40F7-868B-75CA9CE4714A.JPEG": ("F. DUPLICATE / NEAR-DUPLICATE", "near duplicate", "mural-set"),
    "AC263B5F-6C5C-4673-9C43-C33E169962E0.JPEG": ("F. DUPLICATE / NEAR-DUPLICATE", "near duplicate", "mural-set"),
    "BEBE1CF8-34C8-47A4-AC4A-090DDCF905D5.JPEG": ("F. DUPLICATE / NEAR-DUPLICATE", "near duplicate", "mural-set"),
    "AED9632F-4A81-458B-B4F1-0E390F30D81F.JPEG": ("F. DUPLICATE / NEAR-DUPLICATE", "near duplicate", "mural-set"),
    "814D0538-44BB-44C3-BC16-35F0B61522B3.JPG": ("E. PRIVATE / EXCLUDED", "accidental screenshot", None),
    "D248FE15-B6E2-4008-B391-A3D3353E4F63.JPG": ("E. PRIVATE / EXCLUDED", "accidental screenshot", None),
    "EA66B9C8-38E4-4AB1-912A-F50BE37F56DD.JPG": ("E. PRIVATE / EXCLUDED", "private/sensitive content", None),
    "E75F371F-9F1D-49B8-8E59-455B4152A929.jpeg": ("E. PRIVATE / EXCLUDED", "private/sensitive content", None),
    "IMG_5220.jpg": ("E. PRIVATE / EXCLUDED", "bystander-heavy frame", None),
    "3C6DFD27-505E-429B-BCBE-DE470A7F1C23.JPG": ("F. DUPLICATE / NEAR-DUPLICATE", "near duplicate", "night-picnic-set"),
    "5180ED73-66E8-439B-90A5-E982E59816E9.JPG": ("F. DUPLICATE / NEAR-DUPLICATE", "near duplicate", "night-picnic-set"),
    "10FD43E3-7851-4C37-8839-B5EAEE1E765C.JPG": ("F. DUPLICATE / NEAR-DUPLICATE", "near duplicate", "night-picnic-set"),
    "6B9AD382-7450-4F70-AAD6-DC6D8B86D7C2.JPG": ("F. DUPLICATE / NEAR-DUPLICATE", "near duplicate", "night-picnic-set"),
}


STORY_ASSETS = {
    "IMG_3416.HEIC": ["/images/memories/peak-01.webp"],
    "IMG_3479.PNG": ["/images/memories/turr-night-still.webp"],
    "IMG_3555.HEIC": ["/images/memories/chaam-01.webp"],
    "IMG_3550.HEIC": ["/images/memories/chaam-beach-02.webp"],
    "IMG_3525.HEIC": ["/images/memories/chaam-shadows.webp"],
    "IMG_5224.JPG": ["/images/memories/graduation-01.webp"],
    "142C7102-D966-415C-9299-0742C5C486DC.JPG": ["/images/memories/marriage-decision-01.webp"],
    "IMG_7173.jpeg": ["/images/memories/pattaya-01.webp"],
    "SP132301_25-12-68 (04).jpeg": ["/images/memories/roadtrip-01.webp"],
    "IMG_5882.JPG": ["/images/memories/sarika-01.webp"],
    "IMG_1752.JPG": ["/images/memories/suanphueng-01.webp"],
    "686D8E0B-7CE2-48C0-97E3-AFD57D3DC4D0.JPG": ["/images/memories/together-now-01.webp"],
    "IMG_2536.JPG": ["/images/memories/cat-01.webp"],
    "IMG_6158.JPG": ["/images/memories/cat-02.webp"],
    "IMG_5394.JPG": ["/images/memories/wedding-01.webp"],
    "IMG_5398.JPG": ["/images/memories/wedding-02.webp"],
    "IMG_5393.JPG": ["/images/memories/wedding-03.webp"],
    "24.jpg": ["/images/memories/wedding-actual-01.webp"],
    "3.jpg": ["/images/memories/wedding-actual-02.webp"],
    "15.jpg": ["/images/memories/wedding-actual-03.webp"],
}


SPECIAL_ASSETS = {
    "SP121756_26-12-68 (03).jpeg": "/images/memories/special-roadtrip-wide.webp",
    "726_Original.JPG": "/images/memories/wedding-ceremony-01.webp",
    # 720_Original.JPG ships only as archive memory-015 (EP46.5): its standalone
    # wedding-ceremony-02 copy was unused after the 2026-09-23 milestone redesign.
    "736_Original.JPG": "/images/memories/wedding-ceremony-03.webp",
    "IMG_5643.JPG": "/images/memories/marriage-registration-safe.webp",
}


SPECIAL_ANCHORS = {
    "SP121756_26-12-68 (03).jpeg",
    "IMG_3416.HEIC",
    "IMG_7173.jpeg",
    "IMG_5882.JPG",
    "726_Original.JPG",
    "IMG_5395.JPG",
    "686D8E0B-7CE2-48C0-97E3-AFD57D3DC4D0.JPG",
    "IMG_2536.JPG",
}


def resize_long_edge(image: Image.Image, edge: int) -> Image.Image:
    if max(image.size) <= edge:
        return image.copy()
    scale = edge / max(image.size)
    return image.resize((round(image.width * scale), round(image.height * scale)), Image.Resampling.LANCZOS)


def save_webp(image: Image.Image, path: Path, edge: int, quality: int) -> tuple[int, int, int]:
    clean = resize_long_edge(image.convert("RGB"), edge)
    path.parent.mkdir(parents=True, exist_ok=True)
    clean.save(path, "WEBP", quality=quality, method=6, exif=b"", icc_profile=None)
    return clean.width, clean.height, path.stat().st_size


def privacy_safe_registration(image: Image.Image) -> Image.Image:
    # The two certificates occupy these rectangles in IMG_5643.JPG. Blur is
    # baked into pixels before resize/export; CSS never carries privacy.
    safe = image.copy()
    for box in (
        (278, 900, 448, 1138),
        (248, 1135, 330, 1175),
        (682, 775, 852, 1012),
        (654, 1007, 735, 1045),
    ):
        region = safe.crop(box).filter(ImageFilter.GaussianBlur(radius=28))
        safe.paste(region, box)
    return safe


def archive_group(name: str, old: dict[str, Any]) -> tuple[str, str, str]:
    if name == "IMG_5398.JPG":
        return "moments", "ความทรงจำของเรา", "MEMORY"
    if name in {"1.jpg", "3.jpg", "4.jpg", "6.jpg", "15.jpg", "17.jpg", "24.jpg", "44.jpg", "718_Original.JPG", "720_Original.JPG", "726_Original.JPG", "736_Original.JPG"}:
        return "wedding", "พิธีของเรา", "WEDDING CEREMONY"
    if name.startswith("IMG_539"):
        return "prewedding", "ก่อนวันงาน", "PRE-WEDDING"
    if name.startswith("IMG_564"):
        return "registration", "วันจดทะเบียนสมรส", "MARRIAGE REGISTRATION"
    if name in {"IMG_2536.JPG", "IMG_6158.JPG", "686D8E0B-7CE2-48C0-97E3-AFD57D3DC4D0.JPG"}:
        return "life", "ชีวิตของเรา", "LIFE"
    category = str(old.get("candidateCategory") or "UNKNOWN").upper()
    event = str(old.get("candidateEvent") or "ความทรงจำของเรา")
    if category in {"TRAVEL", "HERO", "FINALE"} or any(token in event.lower() for token in ("beach", "waterfall", "seaside", "trip", "road")):
        return "journey", "ระหว่างทาง", "JOURNEY"
    if category in {"TIMELINE", "FAMILY"} or any(token in event.lower() for token in ("graduation", "wedding", "family")):
        return "milestones", "วันสำคัญ", "MILESTONES"
    return "moments", "วันธรรมดาที่พิเศษ", "LITTLE MOMENTS"


def main() -> None:
    audit = json.loads(AUDIT_PATH.read_text(encoding="utf-8"))
    old_manifest = json.loads(OLD_MANIFEST_PATH.read_text(encoding="utf-8"))
    old_by_name = {item["sourceFilename"]: item for item in old_manifest.get("media", [])}

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    THUMB_DIR.mkdir(parents=True, exist_ok=True)
    manifest_files: list[dict[str, Any]] = []
    archive_items: list[dict[str, Any]] = []

    for record in audit["files"]:
        name = record["sourceFilename"]
        old = old_by_name.get(name, {})
        is_image = record["mediaType"] == "image"
        exclusion = EXCLUSIONS.get(name)
        production: list[str] = list(STORY_ASSETS.get(name, []))
        thumb: str | None = None
        classification = "G. UNKNOWN"
        privacy = "safe"
        excluded_reason = None
        duplicate_group = old.get("duplicateGroup")
        event = old.get("candidateEvent") or ("wedding ceremony" if name in {"1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "15.jpg", "17.jpg", "24.jpg", "44.jpg", "46.jpg", "49.jpg", "718_Original.JPG", "720_Original.JPG", "726_Original.JPG", "736_Original.JPG"} else "unknown")
        group_key, group_label, date_label = archive_group(name, old)

        if not is_image:
            classification = "D. ARCHIVE / EXTRA MEMORY"
            excluded_reason = "video retained as source; only the existing curated finale video ships"
        elif exclusion:
            classification, excluded_reason, configured_group = exclusion
            duplicate_group = configured_group or duplicate_group
            privacy = "private" if classification.startswith("E.") else "safe"
        else:
            if name == "IMG_5398.JPG":
                classification = "B. STORY SUPPORT"
            else:
                classification = "A. STORY HERO" if name in STORY_ASSETS or name in SPECIAL_ASSETS else ("C. MEMORY GALLERY" if record.get("captureDate") else "D. ARCHIVE / EXTRA MEMORY")
            source_path = SOURCE_DIR / name
            with Image.open(source_path) as opened:
                image = ImageOps.exif_transpose(opened).convert("RGB")
            if name == "IMG_5643.JPG":
                image = privacy_safe_registration(image)
                privacy = "pixel-redacted derivative; raw certificate excluded from public assets"
            full_name = f"memory-{record['inventoryNo']:03d}.webp"
            thumb_name = f"memory-{record['inventoryNo']:03d}.webp"
            full_path = OUTPUT_DIR / full_name
            thumb_path = THUMB_DIR / thumb_name
            fw, fh, full_bytes = save_webp(image, full_path, 1600, 82)
            tw, th, thumb_bytes = save_webp(image, thumb_path, 480, 72)
            archive_runtime = f"/images/memories/archive/{full_name}"
            thumb = f"/images/memories/archive/thumbs/{thumb_name}"
            production.append(archive_runtime)
            if name in SPECIAL_ASSETS:
                special_runtime = SPECIAL_ASSETS[name]
                special_path = ROOT / "frontend" / "public" / special_runtime.lstrip("/").replace("/", str(Path("/")).lstrip("/"))
                # Build the path explicitly for Windows rather than relying on
                # URL separators.
                special_path = ROOT / "frontend" / "public" / Path(*special_runtime.lstrip("/").split("/"))
                save_webp(image, special_path, 2000, 86)
                production.append(special_runtime)
            archive_items.append({
                "id": f"memory-{record['inventoryNo']:03d}",
                "source": name,
                "image": archive_runtime,
                "thumb": thumb,
                "width": fw,
                "height": fh,
                "thumbWidth": tw,
                "thumbHeight": th,
                "group": group_key,
                "groupLabel": group_label,
                "dateLabel": date_label,
                "captureDate": record.get("captureDate"),
                "special": name in SPECIAL_ANCHORS,
                "privacy": privacy,
                "bytes": full_bytes,
                "thumbBytes": thumb_bytes,
            })

        manifest_files.append({
            "sourceFileId": record["id"],
            "sourceFilename": name,
            "mimeType": record["mimeType"],
            "mediaType": record["mediaType"],
            "sourceBytes": record["bytes"],
            "dimensions": {"width": record.get("width"), "height": record.get("height")},
            "captureDate": record.get("captureDate"),
            "gpsInternal": record.get("gpsInternal"),
            "sha256": record["sha256"],
            "phash": record.get("phash"),
            "event": event,
            "category": classification,
            "duplicateGroup": duplicate_group,
            "privacy": privacy,
            "ownerConfirmed": (name in STORY_ASSETS and name != "IMG_5398.JPG") or name == "IMG_5643.JPG",
            **({"ownerDecision": "classification pending: pre-wedding or wedding ceremony"} if name == "IMG_5398.JPG" else {}),
            "productionAssets": production,
            "thumb": thumb,
            "runtimeLocation": "local" if production else None,
            "productionStatus": "used" if production else "excluded",
            "excludedReason": excluded_reason,
        })

    manifest = {
        "source": {
            "folder": "A&I Anniversary 2026",
            "folderId": "1xXDeJGp2OxDknOnsKZMHUmi5NqbTlada",
            "enumeratedAt": "2026-09-20",
            "sourceOnly": True,
        },
        "counts": {
            "total": len(manifest_files),
            "images": sum(item["mediaType"] == "image" for item in manifest_files),
            "videos": sum(item["mediaType"] == "video" for item in manifest_files),
            "safeImagesUsed": len(archive_items),
            "thumbnails": len(archive_items),
            "duplicateOrBurstExcluded": sum((item.get("excludedReason") or "").endswith("duplicate") or "duplicate" in (item.get("excludedReason") or "") for item in manifest_files),
            "privacyExcluded": sum(item["category"].startswith("E.") for item in manifest_files),
        },
        "specialAnchors": sorted(SPECIAL_ANCHORS),
        "files": manifest_files,
        "archive": archive_items,
        "privacy": {
            "gpsPolicy": "Internal curation only. Production derivatives contain no EXIF metadata.",
            "registration": "IMG_5643.JPG is represented only by a pixel-blurred derivative; raw certificate frames never enter public assets.",
        },
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    (ROOT / "review-local" / "memory-archive-runtime.json").write_text(json.dumps(archive_items, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(manifest["counts"], ensure_ascii=False))


if __name__ == "__main__":
    main()
