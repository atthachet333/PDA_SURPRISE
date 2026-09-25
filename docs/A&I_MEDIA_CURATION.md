# A&I — media curation

**Current runtime curation record.** Historical notes below preserve the evidence
available at each pass; the newest owner-confirmed amendment takes precedence.

Source: the owner's Google Drive folder *A&I Anniversary 2026*, treated as read-only.
Nothing in Drive was renamed, moved, deleted or modified.

Machine-readable manifest: [`tools/anniversary-media-curation.json`](../tools/anniversary-media-curation.json)
New media after the curation passes (EP43): [MEDIA_PIPELINE.md](MEDIA_PIPELINE.md). Its records in the
manifest carry an `ingest` stamp and a `privacyReview` object.
Review images: `review-local/` (gitignored — never commit)

## Owner truth lock — Peak vs TURR (2026-09-23, supersedes every table below)

| event | still | clip | recap |
|---|---|---|---|
| ร้าน Peak — first meeting | `IMG_3416.HEIC` → `peak-01.webp` | — | timeline uses `IMG_3417` (`archive/memory-060.webp`, same minute) |
| ร้าน TURR เกษตร — 12 OCT 2025 | `IMG_3479.PNG` → `turr-night-still.webp` (formerly `peak-02.webp`) | `6769b2a3….MOV` → `/videos/memories/turr-night.mp4` (silent, poster = the still) | frame of `40f120df….MOV` → `turr-night-recap.webp` |

`IMG_3479` is a frame of the `6769b2a3` story (same neon sign, same burned-in caption).
The owner confirmed both as the TURR night, overriding the earlier bystander exclusion.
Peak and TURR never share a source; `frontend/tests/storyMedia.test.mjs` enforces it.

## Current authoritative pass — full media rebuild (2026-09-20)

This section supersedes every historical count and chronology note below it.
The shared Drive folder was re-enumerated from scratch and every source file was
downloaded into a gitignored review workspace for pixel, metadata, duplicate,
privacy and production-status inspection.

- **132 sources:** 123 images and 9 videos, 346,181,482 source bytes.
- **72 safe photographs used** in the read-only Memory Archive.
- **72 full derivatives** (11,835,720 bytes) and **72 thumbnails**
  (1,316,262 bytes), all local WebP with EXIF removed.
- **42 duplicate/burst frames excluded:** 27 Cha-am burst frames and 15 other
  near-duplicates. Two additional registration frames are both sensitive and
  near-duplicates, so the manifest reports 44 duplicate-related exclusions.
- **9 private/excluded images:** two child frames, two accidental screenshots,
  two intimate frames, two raw duplicate certificate frames, and one
  bystander-heavy frame.
- The 9 source videos remain inventoried. The existing single optimized finale
  video remains the only runtime video; no source MOV/HEIC ships.

The 72-photo archive is progressively rendered in groups of 24. The field loads
480px thumbnails lazily; the 1600px derivative is requested only when a memory
is opened. There are zero Drive requests at runtime.

### Current story chronology

The current narrative is deliberately four separate milestones:

1. **PRE-WEDDING** — the staged portrait set.
2. **OUR WEDDING / วันแต่งงาน** — real ceremony and outdoor photographer
   images. The ceremony date is not asserted.
3. **วันที่เราตัดสินใจจดทะเบียนสมรสด้วยกัน** — the owner-confirmed decision
   photograph, kept as its own beat.
4. **MARRIAGE REGISTRATION / วันจดทะเบียนสมรส — 28 JUL 2026** — a quieter
   documentary beat using `IMG_5643.JPG` only through a pixel-redacted WebP.

The registration derivative blurs the name, registration-number, signature and
serial fields in the exported pixels. Raw certificate sources are absent from
public assets. The ceremony appears before registration throughout the story.

### Current photo language

- The rejected side-card carousel was removed. Its first visual is now the
  previously unused action photograph `SP121756_26-12-68 (03).jpeg`, exported
  as `special-roadtrip-wide.webp`.
- Early story media uses a wide hero, asymmetric duo and three-frame film strip.
- Peak remains the photographed first-meeting milestone.
- TURR remains media-honest and text-driven, but now carries a full-scale
  **12 OCT 2025** celestial date break equal in visual weight to Peak.
- The old rotating card universe is now a progressive celestial memory field
  with event filters, staggered scale and full-image focus on demand.
- Photo frame borders were removed globally; native aspect, editorial crop and
  layout composition replace blurred side filler.

The authoritative per-source fields — source ID/name, MIME type, dimensions,
capture date, internal-only GPS, hash, event, A–G category, duplicate group,
privacy, owner-confirmation state, production asset, thumbnail, runtime status
and exclusion reason — are in `tools/anniversary-media-curation.json`.

## Current amendment — 132-file refresh (2026-09-20)

Drive was refreshed from 116 to **132 files**. The 16 additions include
`24.jpg` and the outdoor photographer set from the actual wedding. Privacy QA
excluded certificate/document frames and retained only photographs without
legible private documents or license plates.

Owner-confirmed mappings now used by the runtime:

| story fact | source / treatment | runtime asset |
|---|---|---|
| ร้าน Peak = จุดเริ่มต้น / ร้านที่เจอกันครั้งแรก | owner-confirmed reference image #1 | `peak-01.webp` *(#2 was TURR — see truth lock above)* |
| ร้าน TURR เกษตร = วันที่ขอคบ, 2025-10-12 | *superseded:* owner-confirmed still + clip | `turr-night-still.webp`, `turr-night.mp4` |
| สวนผึ้ง | Christmas-tree photograph | `suanphueng-01.webp` |
| หนมถ้วย | confirmed kitten image | `cat-01.webp` |
| ถ้วยฟู | confirmed sleeping-cat image | `cat-02.webp` |
| wedding ceremony, date unknown / owner decision | `24.jpg` plus safe outdoor wedding set | `wedding-actual-01.webp` through `-03.webp` |
| legal registration, 2026-07-28 | privacy-safe derivative of `IMG_5643.JPG` | `marriage-registration-safe.webp` |
| pre-wedding | confirmed studio / staged portraits | `wedding-01.webp`, `wedding-03.webp` |
| `IMG_5398` classification | owner decision; kept as a neutral memory | `wedding-02.webp` |
| พัทยา | owner-confirmed latest reference #3 (`IMG_7173.jpeg`) | `pattaya-01.webp` |
| ตัดสินใจจดทะเบียนสมรสด้วยกัน | owner-confirmed latest reference #4 (`142C7102…JPG`) | `marriage-decision-01.webp` |
| ชะอำ | owner-confirmed latest reference #5 (`IMG_3550.HEIC`) | `chaam-beach-02.webp` |
| เรายังอยู่ด้วยกัน | owner-confirmed latest reference #6 (`686D8E0B…JPG`) | `together-now-01.webp` |

The production runtime references only local optimized WebP assets. It makes no
Google Drive requests and ships no HEIC originals.

---

## 1. Drive access and inventory

Access worked. Every file was downloaded, opened, and read for EXIF, GPS and
content. Videos were decoded and sampled at three points each.

**This initial snapshot held 116 files, not 100.** It is superseded by the
132-file amendment above but remains here as the audit trail for the first pass.

| | stated | found |
|---|---|---|
| HEIC | 44 | 44 |
| PNG | 3 | 3 |
| MP4 | 1 | 1 |
| MOV | 7 | **8** |
| JPEG/JPG | 45 | **60** |
| **total** | **100** | **116** |

HEIC, PNG and MP4 match exactly, so the counts were taken from the same folder —
it simply has 16 more JPEG/JPG and one more MOV than the brief recorded. All 116
filenames are unique and none is a byte-identical copy of another. Nothing is
missing; there is more than expected.

- images **107**, videos **9**
- reliable capture date on **89**; **27** carry none
- GPS on **57**

Drive's own `created_time` was ignored throughout. Every date below is the
camera's own capture timestamp.

---

## 2. The two milestone questions

### ร้าน TURR เกษตร — **no confident candidate found**

> **OWNER CORRECTION 2026-09-20 — see §8b.** The owner confirmed both
> `IMG_3416.HEIC` and `IMG_3479.PNG` as ร้าน Peak, the place where the couple
> first met. Neither image belongs to TURR. The evidence analysis below remains
> useful, but the Peak mapping now follows owner truth.

There is **no file that places the couple at TURR Kaset**, and I am not going to
nominate one on atmosphere alone.

What actually exists around the canonical start date of **2025-10-12**:

| file | when | what it is | confidence |
|---|---|---|---|
| `EA66B9C8-…-F50BE37F56DD.JPG` | **2025-10-12 12:08** | the only file dated on the start date. An edited polaroid-in-polaroid selfie, indoors, domestic. **Not a bar.** | start date HIGH, TURR **NO** |
| `dbe81e98…MOV` | 2025-10-12 (≈12:07 local) | 18s indoor video, same day, same domestic setting | start date MEDIUM, TURR **NO** |
| `IMG_3416 / 3417 / 3423.HEIC` | **2025-10-10 21:32** | a real bar interior — neon, bottle shelves, mirror selfie. GPS 13.8852, 100.5518 | **Peak OWNER-CONFIRMED** for `IMG_3416`; same venue HIGH for adjacent frames; TURR **NO** |
| `IMG_3479.PNG` | 2025-10-13 | bar/club, overlay text reads *"ได้ของขวัญวันเกิดละน่ะ"* | **Peak OWNER-CONFIRMED**, TURR **NO** |
| `40f120df…MOV`, `6769b2a3…MOV` | undated | same venue and same overlay text as the PNG — one night, three files | — |

Why metadata alone did not identify the venue:

- Their GPS sits roughly 4–5 km north-west of the Kaset intersection area. That
  is not a rounding error.
- The one neon sign in frame is **blown out to solid white** — I magnified it 6×
  and it is genuinely illegible. It could say anything.
- The nearest bar night is **two days before** the start date, and the next is a
  **birthday**, which is a different occasion.

Those clues were correctly insufficient for a TURR assignment. The owner has
now resolved both references as **ร้าน Peak**, the place where the couple first
met. That owner truth overrides the inconclusive venue metadata; TURR remains
text-driven.

### The wedding — **found, with strong evidence**

> **⚠️ REFINED 2026-09-20 — see §8b.** Under the owner's outdoor-vs-studio rule,
> every frame listed here is **pre-wedding studio work**, not the wedding day.
> The actual wedding photograph is `24.jpg`, which is not in this folder.

Not by date — no file carries a 2026-07-28 timestamp, and the whole pool stops
at 2026-04-29 — but by unambiguous content. All are undated.

| file | evidence |
|---|---|
| `IMG_5393.JPG` | a sign reading **"WELCOME OUR WEDDING — so glad you're here"** |
| `IMG_5394.JPG`, `IMG_5396.JPG` | studio portraits: white bridal gown with bouquet, navy suit |
| `IMG_5395.JPG` | bridal flat-lay, couple lying among flowers in wedding dress and suit |
| `IMG_5397.JPG`, `IMG_5398.JPG` | **Thai traditional wedding attire**, white/silver, studio and a Thai room |
| `IMG_5642 / 5643 / 5644.JPG` | both holding **ใบสำคัญการสมรส** (marriage certificates) under the sign **"สำนักงานเขตบางซื่อ … ฝ่ายทะเบียน"** — Bang Sue District Office, Bangkok |

Event confidence **HIGH**. Date confidence **UNKNOWN**: I magnified the
certificate's date line and the handwritten date is covered by the official red
seal. The photographs prove a marriage was registered at Bang Sue District
Office; they do not independently prove the date. The runtime's 2026-07-28
registration date comes from owner-confirmed canonical truth, not image inference.

⚠️ The certificate photos show **names and a registration number at readable
size**. See §7.

---

## 3. Duplicates

**Exact (byte-identical): none.** All 116 md5s differ.

**Near-duplicates** (difference-hash distance ≤ 8):

| group | files | keep |
|---|---|---|
| G1 | `IMG_4155` / `IMG_4156.HEIC` | `IMG_4155` |
| G2 | `IMG_4158` / `IMG_4159.HEIC` | `IMG_4158` |
| G3 | `IMG_5642` / `IMG_5643` / `IMG_5644.JPG` | `IMG_5643` |

**The one that matters isn't a hash group.** `IMG_3525`–`IMG_3556` is a
**31-frame burst** — one afternoon at Cha-am, same two people, same clothes,
same stretch of sand, over about four minutes. The poses vary enough that
perceptual hashing does not flag them, but as memories they are *one* memory.
They are tagged `burst-chaam-2025-10-16` in the manifest and **at most 3–4
should ever be used.**

---

## 4. Where they were

Everything below is GPS-led. I did not send any coordinate to a geocoding
service — that would mean handing a private couple's movements to a third party —
so placenames are matched against the owner's own known-place list and marked
accordingly.

| cluster | GPS | n | reading | confidence |
|---|---|---|---|---|
| 2025-10-16 | 12.7986, 99.9856 | 31 | **ชะอำ, เพชรบุรี** — beach, matches the known place | **HIGH** |
| 2026-04-11 | 12.7954, 99.9851 | 2 | **ชะอำ** again, ~6 months later | **HIGH** |
| 2025-12-10 | 14.3086, 101.2566 | 4 | **น้ำตกสาริกา, นครนายก** — waterfall rock visibly behind them | **HIGH** |
| undated | — | 3 | **สำนักงานเขตบางซื่อ, กรุงเทพฯ** — office name legible on the sign | **HIGH** |
| 2026-01-11 | 13.3120, 100.9028 | 4 | Chonburi coast, between **บางแสน** and **อ่างศิลา** | **MEDIUM** (which one: Q7) |
| 2025-12-25 | 13.7096, 100.0590 | 6 | **นครปฐม** — a temple/park with white naga sculpture | **MEDIUM** (which temple: Q6) |
| 2025-10-10 | 13.8852, 100.5518 | 3 | Bangkok, a bar | province MEDIUM, venue **LOW** |
| 2026-02-06 | 13.8686, 100.5792 | 1 | Bangkok, a donation/charity event | **MEDIUM** |
| 2026-04-29 | 13.9609, 100.5775 | 5 | Pak Kret area → likely **นนทบุรี** | **LOW** |
| 2026-04-12 | 12.7211, 99.9642 | 2 | ~8 km south of Cha-am. Could be southern เพชรบุรี **or หัวหิน (ประจวบฯ)** | **LOW** (Q8) |
| 2025-11-16 | 13.6147, 100.7581 | 2 | graduation — coordinates fall in **สมุทรปราการ** | **LOW** (Q9) |

**Two coordinates fall outside the ten known provinces** — 12.7211 (possibly
Prachuap Khiri Khan) and 13.6147 (Samut Prakan). Neither is proposed as a new
truth. Both are questions for the owner; a campus or a beach can sit just over a
provincial line without the day "belonging" to that province.

Four known provinces have **no photographic evidence at all**: ราชบุรี,
นครสวรรค์, อุตรดิตถ์, สุโขทัย.

---

## 5. Place coverage — all 19

| # | place | status | evidence |
|---|---|---|---|
| 1 | บ้านวิน | **TEXT-DRIVEN** | none |
| 2 | งานกาชาด | **PHOTO POSSIBLE** | `IMG_2448` is a charity donation event — banner reads *การแบ่งปันของคุณ เปลี่ยนแปลงสังคมได้*, not กาชาด (Q5) |
| 3 | ร้านเหล้า | **PHOTO VERIFIED** | `IMG_3416/3417/3423`, `IMG_3479` + 2 clips — owner-confirmed as **ร้าน Peak**, the first-meeting venue (§8b) |
| 4 | คอนโดพี่โด | **TEXT-DRIVEN** | none |
| 5 | เขื่อน | **TEXT-DRIVEN** | none |
| 6 | วันแคมป์ | **TEXT-DRIVEN** | none |
| 7 | น้ำตกสาริกา | **PHOTO VERIFIED** | `IMG_5882/5883`, GPS + waterfall rock |
| 8 | อุทยานพระพิฆเนศ | **PHOTO POSSIBLE** | `IMG_5768` is 700 m away the same morning; no Ganesha visible |
| 9 | ชะอำ | **PHOTO VERIFIED** | 33 files across two visits |
| 10 | พัทยา | **PHOTO VERIFIED** | owner-confirmed latest reference #3, `IMG_7173.jpeg` (§8c) |
| 11 | บางแสน | **PHOTO POSSIBLE** | 2026-01-11 cluster (Q7) |
| 12 | อ่างศิลา | **PHOTO POSSIBLE** | same cluster (Q7) |
| 13 | บ้านกงเปรี้ยว | **TEXT-DRIVEN** | none |
| 14 | วัดดอนขนาท | **TEXT-DRIVEN** | none |
| 15 | บ้านเปรี้ยว | **TEXT-DRIVEN** | none |
| 16 | วัดไร่แตงทอง | **TEXT-DRIVEN** | the Nakhon Pathom temple photo is ~35 km from วัดไร่แตงทอง, so it is probably a different temple (Q6) |
| 17 | วัดหุบกระทิง | **TEXT-DRIVEN** | no Ratchaburi GPS at all |
| 18 | ทางรถไฟ | **TEXT-DRIVEN** | no railway image |
| 19 | **ร้าน TURR เกษตร** | **TEXT-DRIVEN** | no confirmed photograph; the two formerly assigned images are Peak (§8b) |

**Photo verified 4 · possible 4 · text-driven 11 · node only 0.** TURR remains text-driven and does not reuse the Peak photograph.

Which is a good result, not a poor one: **11 of 19 places becoming text is the
story, not a gap.** "บางที่มีรูป บางที่เหลือแค่ความทรงจำ" only works if it's true.

---

## 6. What to use

19 selects, 11 backups, 4 owner decisions, 82 skips.

**Cha-am** — selected `IMG_3550.HEIC` (both faces clear, 4284×5712, wide crop
headroom). Runtime role: the owner-confirmed latest reference #5 beach memory.

**Beginning** — *none proposed.* Text-driven until Q1–Q4 are answered.

**Travel** — `IMG_3555`, `IMG_3545` (ชะอำ) · `IMG_5882` (สาริกา) ·
`IMG_7173` (ชลบุรี) · `IMG_3867` (seafront). Backups `IMG_6235`, `SP132301…(04)`.

**Daily** — `142C7102…JPG` (kiss, indoors) · `IMG_1752` (Christmas tree).
Backups `IMG_4678`, `IMG_4538`.

**Family** — `IMG_3847`, `IMG_3856` (beach with a small child, sunset).

**Pets** — `IMG_2536` (clean cat portrait) · `IMG_6158` (cat asleep).
Backup `686D8E0B…JPG`. **Which cat is which is unknown — Q10–Q12.** The pool
shows a silver tabby that may be one cat at different ages or two similar cats;
I am not guessing ถ้วยฟู vs หนมถ้วย from fur.

**Timeline** — `IMG_5224` (graduation) · `IMG_5394`, `IMG_5398` (wedding) ·
`IMG_5643` (registration, **pending Q13**).

**Finale** — `IMG_3525.HEIC` (two shadows on wet sand; symbolic, quiet, and the
cleanest thing in the pool to put text over) · `IMG_7084.mov` · `IMG_5395` as backup.

**Letter** — `A0CF4295…MOV`.

---

## 7. Privacy

Ten files flagged. Nothing here is auto-recommended.

| severity | files | issue |
|---|---|---|
| **high** | `IMG_5642/5643/5644.JPG` | **Marriage certificates at readable size** — names and registration number. A legal document. If used, crop to the couple and the office sign, or skip (Q13) |
| medium | `EA66B9C8…JPG`, `E75F371F…jpeg` | intimate; bare shoulders (Q18) |
| medium | `IMG_3847`, `IMG_3856` | a **small child** is clearly visible. Not the couple's to publish without asking (Q17) |
| low | `IMG_6984.png`, `D248FE15…JPG` | an identifiable third person |
| low | `IMG_5220`, `IMG_5235` | graduation crowds, many bystanders |

No documents, addresses, financial data, login screens, messages or ID cards
were found beyond the marriage certificates.

---

## 8. Videos

| # | file | dur | size | quality | verdict |
|---|---|---|---|---|---|
| v06 | **`IMG_7084.mov`** | 20.4s | 3840×2160 landscape | excellent | **USE — finale.** The couple's shadows on a wall forming a heart. The single strongest clip, and it rhymes with the `IMG_3525` shadow stills |
| v05 | **`A0CF4295…MOV`** | 12.9s | 1080×1920 | good | **USE — letter.** Head resting on a shoulder. Quiet and genuinely tender |
| v03 | `4f00a344…MOV` | 6.9s | 1080×1920 | good | **optional 3rd** — warm outdoor selfie |
| v01 | `2b7e45d6…MOV` | 14.0s | 1080×1920 | fair | skip — dim |
| v09 | `dbe81e98…MOV` | 18.8s | 1080×1920 | fair | hold — on the start date, but intimate |
| v08 | `cbb08f91…MOV` | 4.3s | 1080×1920 | fair | skip |
| v02 | `40f120df…MOV` | 5.6s | **360×640** | poor | skip — unusable resolution |
| v04 | `6769b2a3…MOV` | 5.4s | **540×960** | poor | skip |
| v07 | `Qk9cnmGS…MP4` | 9.6s | **540×960** | poor | skip |

Recommendation: **two clips, three at most.**

---

## 8b. Owner confirmations received (2026-09-20)

Five reference images were confirmed by the owner. A later owner correction
locks references 1 and 2 to **ร้าน Peak**, the place where the couple first met.
This table reflects that corrected mapping.

| ref | meaning | source file | status |
|---|---|---|---|
| 1 | **ร้าน Peak — จุดเริ่มต้น** | `IMG_3416.HEIC` | owner-confirmed; integrated as `peak-01.webp` |
| 2 | **ร้าน Peak — จุดเริ่มต้น** | `IMG_3479.PNG` | *superseded:* TURR, integrated as `turr-night-still.webp` |
| 3 | **หนมถ้วย** | `IMG_2536.JPG` | integrated as `cat-01.webp` |
| 4 | งานแต่งจริง | `24.jpg` | arrived in the 132-file refresh; integrated as `wedding-actual-01.webp` |
| 5 | **ถ้วยฟู** | `IMG_6158.JPG` | integrated as `cat-02.webp` |

### Peak is resolved; TURR has no confirmed photograph

The owner corrected the earlier mapping: reference images #1 and #2 are both
ร้าน Peak, where the couple first met. Confidence for those two Peak mappings is
recorded as `OWNER_CONFIRMED`. TURR must not use either image and remains a
text-only relationship milestone until a separate photograph is confirmed.

## 8c. Latest owner reference order

The latest owner reference sequence is semantic, not the numeric filenames in
Drive. A fresh 132-file listing confirmed that Drive's `3.jpg`–`6.jpg` are
wedding photographs, so they were not substituted for these owner-confirmed
story meanings.

| ref | meaning | source file | local production asset |
|---|---|---|---|
| 3 | พัทยา | `IMG_7173.jpeg` | `pattaya-01.webp` |
| 4 | วันที่ตัดสินใจจดทะเบียนสมรสด้วยกัน | `142C7102-D966-415C-9299-0742C5C486DC.JPG` | `marriage-decision-01.webp` |
| 5 | ชะอำ | `IMG_3550.HEIC` | `chaam-beach-02.webp` |
| 6 | ปัจจุบัน — เรายังอยู่ด้วยกัน | `686D8E0B-7CE2-48C0-97E3-AFD57D3DC4D0.JPG` | `together-now-01.webp` |

The marriage-decision memory is a separate beat from both the pre-wedding shoot
and the actual wedding. All four assets are optimized local WebP files; runtime
code makes no Drive request.

### Wedding vs pre-wedding

Owner's rule: **outdoor / real-location = the actual wedding; studio or staged
set = pre-wedding.** Applied to the six wedding frames:

| file | verdict | why |
|---|---|---|
| `IMG_5393` | PRE-WEDDING | grey seamless studio; the WELCOME sign is a prop on the set |
| `IMG_5394` | PRE-WEDDING | grey seamless studio portrait |
| `IMG_5395` | PRE-WEDDING | staged overhead flat-lay with props |
| `IMG_5396` | PRE-WEDDING | grey seamless studio portrait |
| `IMG_5397` | PRE-WEDDING | grey seamless studio, Thai dress, prop pedestal |
| `IMG_5398` | **OWNER DECISION — neutral runtime memory** | Thai dress in a *real* room — carved doors, brass vessels — not a studio sweep. The one frame the rule does not settle. **Q19.** |

**Historical 116-file conclusion:** every wedding image in that original pool
was pre-wedding. The 132-file refresh supersedes the missing-media conclusion:
`24.jpg` and the safe outdoor set now carry the actual wedding, while the studio
set remains explicitly pre-wedding.

---

## 9. Owner review

**Resolved 2026-09-20:** Q1/Q2 (Peak), Q7 (the latest owner reference assigns
the selected coast image to Pattaya), Q10/Q11/Q12 (cat identities), the latest
reference order #3–#6, and the general wedding/pre-wedding split. The old
worksheet questions below are retained only as historical curation evidence;
they are not active canonical runtime decisions.

The only current owner decisions are the exact wedding-ceremony date and Q19:
whether `IMG_5398` (Thai dress, real room) is the actual ceremony or a
pre-wedding shoot.

`review-local/OWNER_REVIEW.jpg` — one sheet, **18 questions**, each with a
thumbnail. Answer in shorthand:

```
Q1 = Peak               Q7 = บางแสน        Q13 = crop
Q2 = Peak               Q10 = ถ้วยฟู       Q17 = ไม่ใช้
```

Also in `review-local/`: `sheet01`–`sheet06.jpg` (all 107 images, numbered
`#1`–`#107`), `videos.jpg`, `focus.jpg`. **This folder is gitignored and must
never be committed.**

---

## 10. Optimization and local serving

Drive stays the source; production never touches it.

```
Drive (untouched) → local original → convert → frontend/public/images/memories/ → anniversary.ts
```

| use | long edge | format |
|---|---|---|
| hero | 2400 px | WebP q82 + JPEG fallback |
| memory | 1600 px | WebP q80 |
| orbit / thumb | 800 px | WebP q75 |
| video | keep 1080p; 4K clip down-scaled to 1080p | MP4 H.264 |

All 44 HEIC files decode correctly and convert cleanly. Nothing is upscaled —
`IMG_5642/5643/5644` are only 1108×1477 and `IMG_3479` is a screenshot, so those
cap at their native size.

Confirmed semantic targets include `pattaya-01.webp`,
`marriage-decision-01.webp`, `chaam-beach-02.webp`, and
`together-now-01.webp`. Other runtime names remain purpose-specific, including
`travel-chaam-01.webp`, `travel-sarika-01.webp`, `cat-01.webp`, `cat-02.webp`,
and the separate pre-wedding and actual-wedding series.

---

## 11. Typography refinement (implemented 2026-09-20)

The private A&I flow now uses **Anuphan** for warm, readable Thai body copy and
**Noto Serif Thai** for emotional display lines, with Cormorant Garamond retained
for Latin editorial accents. The font rules are scoped beneath `.ai-private`, so
corporate routes keep their existing typography. Important desktop lines use a
deliberate single-line treatment where space allows, including
`ร้าน Peak — ร้านที่เราเจอกันครั้งแรก`.

---

## 12. Reconciliation status

- `visitedPlaces` is the canonical visible roster. Its derived count is **19**:
  Status is absent and TURR is the current nineteenth entry. Story highlights
  are deliberately separate and do not contribute to this statistic.
- Two GPS clusters fall outside the ten known provinces (§4). Neither has been
  added.
- Runtime data now carries the latest owner-confirmed Pattaya, marriage-decision,
  Cha-am, and present-day mappings.

---

## 13. Remaining owner decisions

Only two owner decisions remain: the exact wedding-ceremony date, which is not
displayed, and Q19 for `IMG_5398`. Until its classification is confirmed,
`IMG_5398` remains a neutral memory and is not treated as evidence of either
pre-wedding or the actual ceremony.

---

## 14. Photo-correction continuation (2026-09-20)

**Drive re-listed before relying on anything here: 129 files enumerated** from
the shared folder, against 132 at the previous refresh. The difference is the
enumeration method (a signed-out shared view, read by scrolling a virtualised
list), not a change to the archive: every file the runtime depends on was
present. **No new owner reference images have been added to Drive since the
previous pass**, so no mapping was re-derived from source in this pass.

### Mappings: verified, not re-litigated

The owner-confirmed mappings recorded in §8b and §8c were already implemented in
runtime data before this pass. They were checked rather than changed:

| Beat | Asset | Status |
| --- | --- | --- |
| ร้าน Peak — ร้านที่เราเจอกันครั้งแรก | `peak-01` | OWNER_CONFIRMED |
| ร้าน TURR เกษตร — 12 OCT 2025 | `turr-night-still`, `turr-night.mp4` | OWNER_CONFIRMED (2026-09-23) |
| พัทยา | `pattaya-01` | OWNER_CONFIRMED |
| ชะอำ (beach beat) | `chaam-beach-02` | OWNER_CONFIRMED |
| สวนผึ้ง | `suanphueng-01` | OWNER_CONFIRMED |
| วันที่ตัดสินใจจดทะเบียนสมรสด้วยกัน | `marriage-decision-01` | OWNER_CONFIRMED |
| เรายังอยู่ด้วยกัน | `together-now-01` | OWNER_CONFIRMED |
| PRE-WEDDING | `wedding-01/03` | OWNER_CONFIRMED |
| Unclassified Thai-attire memory | `wedding-02` (`IMG_5398`) | OWNER_DECISION |
| ACTUAL WEDDING | `wedding-actual-01/02/03` | OWNER_CONFIRMED |
| หนมถ้วย / ถ้วยฟู | `cat-01` / `cat-02` | OWNER_CONFIRMED |

Cross-checked against disk: **21 assets, 21 referenced, 0 broken references, 0
orphans.** บ้านโป่ง remains a separate story highlight rather than an entry in
the canonical 19-place roster; only its photo beat was replaced.

### What this pass actually changed — presentation, not mapping

1. **The fullbleed band was starving its photographs.** Measured at 1440, the
   first-meeting, actual-wedding and present-day beats painted the picture
   across **36–48%** of the band; the rest was blurred filler. That is one
   defect reported as two ("ขยายให้ใหญ่หน่อย" and "รูปภาพมีพื้นที่ว่าง"). The band
   now takes its width from the photograph rather than the page: **78%** at
   1440 and 1920.
2. **The same band clipped every phone.** At 390 the inner box resolved to
   604px inside a 360px band, so all three photographs were cut on both sides.
   The band's height is now capped by what the available width can support at
   the picture's own ratio: **100% of width, zero clipping**, band height within
   3px of the picture.
3. **Text over a bright photograph.** The Pattaya beat's body line had neither
   scrim nor shadow over sea and sky. It gained a radial scrim behind the
   reading column and the standard legibility shadow — local, with the corners
   of the image untouched.
4. **Every photograph in the story was invisible at rest.** 19 containers and 27
   `<img>` elements measured at computed `opacity: 0`, because entrances and a
   fade-in transition owned visibility. Photo entrances now animate movement
   only, and `MemoryImage` no longer fades. Re-measured: **0 hidden.**

### Copy

`finalMessages.segments.closing` now reads **"รักเปรี้ยวมาก ๆ เลย" / "และรักปอร์เช่"**,
replacing the formal name with the nickname per owner instruction. The Pattaya
beat's body names พัทยา rather than the province.

### Still requiring owner confirmation

The exact wedding-ceremony date remains unknown, and `IMG_5398` (Q19) remains
a neutral memory until the owner classifies it.

---

## Pass 2 — "A&I Part 2" folder (2026-09-21)

A second Drive folder (`1aqQRiPd7oWSHDiSrgsl2LoL3YerMEjm1`, "A&I Part 2") was
supplied as additional source media. The original folder
(`1xXDeJGp2OxDknOnsKZMHUmi5NqbTlada`, "A&I Anniversary 2026") was re-enumerated
and is **unchanged** — 132 rows in Drive, 132 records in the manifest — so all
new work in this pass comes from Part 2.

### Inventory

| | Part 2 |
| --- | --- |
| Files | 81 |
| Images | 68 |
| Videos | 13 |
| Exact duplicates of folder 1 (sha256) | 7 |
| New images | 61 |
| Accepted into production | 46 |

Deduplication is by sha256 for exact matches and perceptual hash for near
matches, against the 132 records already in the manifest — filenames alone are
never trusted. Only two new images were near-duplicates of already-integrated
media; three internal burst clusters were reduced to their best frame each.

### Exclusions

Six images were excluded for privacy: four frames containing a child, one
intimate/private moment, and one frame with identifiable third parties who have
not consented. Nine were excluded as burst or near duplicates. Every exclusion
carries a reason in `tools/anniversary-media-curation.json`.

`IMG_7585.jpeg` carried a fully legible vehicle plate. It ships only as a
pixel-redacted derivative — the plate region is downsampled and blurred so the
characters are unrecoverable — following the same practice already used for the
registration certificate. The raw frame never enters public assets.

41 of the 68 source images carried GPS. **No production derivative carries any
EXIF or GPS**: every output is repainted onto a fresh canvas before encoding,
and this was verified across all 58 new files.

### What the new media resolved

`pendingImageSlots()` reported **7 empty slots** before this pass and reports
**0** after: `hero-03`, `featured-01` through `featured-04`, `daily-03` and
`travel-03`. Each was filled against the slot's own `intent` field rather than
by convenience. `m02` (งานกาชาด) gained a content-grounded fairground image.

The memory archive grew from **72 to 118** items.

### Videos

All 13 new videos are casual couple clips between 4 and 40 seconds. None is a
produced film, and none contains documents, children or bystander-heavy framing.
They are inventoried with a `futureRole` in the manifest and are **not wired
into the runtime** — the shipping runtime video remains the existing curated
finale clip. The 40-second `IMG_7588.mov` is the only plausible
`FEATURED_MEMORY_FILM` candidate for the later dedicated video pass.

### Still requiring owner confirmation

**12 OCT 2025 / ร้าน TURR เกษตร has no photograph in either folder.** `m19` and
timeline entry `t2` — the relationship-start beat the owner asked to weigh as
heavily as the first meeting — remain imageless, while the Peak (first-meeting)
beat carries imagery in both places. No image in either folder has a capture
date of 2025-10-12, and assigning an unrelated photograph to a named, dated
milestone would be inventing owner truth. This needs either a TURR photograph
or a decision to carry the beat without one.

Fifteen other memories (`m01`, `m03`–`m06`, `m08`, `m11`–`m18`) name specific
places — บ้านวิน, ร้านเหล้า, เขื่อน, บางแสน, อ่างศิลา, วัดต่าง ๆ, ทางรถไฟ. The new media
cannot be matched to those names from content or EXIF without guessing, so they
were left imageless rather than mismapped.
