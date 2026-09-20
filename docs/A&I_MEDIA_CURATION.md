# A&I — media curation

**Curation only. Nothing is wired into the runtime yet.**

Source: the owner's Google Drive folder *A&I Anniversary 2026*, treated as read-only.
Nothing in Drive was renamed, moved, deleted or modified.

Machine-readable manifest: [`tools/anniversary-media-curation.json`](../tools/anniversary-media-curation.json)
Review images: `review-local/` (gitignored — never commit)

---

## 1. Drive access and inventory

Access worked. Every file was downloaded, opened, and read for EXIF, GPS and
content. Videos were decoded and sampled at three points each.

**The folder holds 116 files, not 100.**

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

> **⚠️ SUPERSEDED 2026-09-20 — see §8b.** The owner has since confirmed
> `IMG_3479.PNG` as ร้าน TURR เกษตร and `IMG_3416.HEIC` as จุดเริ่มต้น. The
> analysis below remains accurate about the *evidence* — the sign really is
> illegible and the GPS really is 4–5 km off — it was simply never going to be
> resolvable from metadata. Owner confirmation outranks it.

There is **no file that places the couple at TURR Kaset**, and I am not going to
nominate one on atmosphere alone.

What actually exists around the canonical start date of **2025-10-12**:

| file | when | what it is | confidence |
|---|---|---|---|
| `EA66B9C8-…-F50BE37F56DD.JPG` | **2025-10-12 12:08** | the only file dated on the start date. An edited polaroid-in-polaroid selfie, indoors, domestic. **Not a bar.** | start date HIGH, TURR **NO** |
| `dbe81e98…MOV` | 2025-10-12 (≈12:07 local) | 18s indoor video, same day, same domestic setting | start date MEDIUM, TURR **NO** |
| `IMG_3416 / 3417 / 3423.HEIC` | **2025-10-10 21:32** | a real bar interior — neon, bottle shelves, mirror selfie. GPS 13.8852, 100.5518 | venue-is-a-bar HIGH, **TURR LOW** |
| `IMG_3479.PNG` | 2025-10-13 | bar/club, overlay text reads *"ได้ของขวัญวันเกิดละน่ะ"* — a **birthday**, not a proposal | bar HIGH, **TURR LOW** |
| `40f120df…MOV`, `6769b2a3…MOV` | undated | same venue and same overlay text as the PNG — one night, three files | — |

Why the bar photos are only LOW:

- Their GPS sits roughly 4–5 km north-west of the Kaset intersection area. That
  is not a rounding error.
- The one neon sign in frame is **blown out to solid white** — I magnified it 6×
  and it is genuinely illegible. It could say anything.
- The nearest bar night is **two days before** the start date, and the next is a
  **birthday**, which is a different occasion.

So: the day the relationship began is represented in this pool by a quiet photo
at home, not by a bar. **Beginning should stay text-driven** until the owner
says otherwise. Questions Q1–Q4 on the review sheet settle it in seconds.

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
Office; they do not prove the date, so nothing here is asserted as 2026-07-28.

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
| 3 | ร้านเหล้า | **PHOTO VERIFIED** | `IMG_3416/3417/3423`, `IMG_3479` + 2 clips — now **owner-confirmed as ร้าน TURR เกษตร** (§8b) |
| 4 | คอนโดพี่โด | **TEXT-DRIVEN** | none |
| 5 | เขื่อน | **TEXT-DRIVEN** | none |
| 6 | วันแคมป์ | **TEXT-DRIVEN** | none |
| 7 | น้ำตกสาริกา | **PHOTO VERIFIED** | `IMG_5882/5883`, GPS + waterfall rock |
| 8 | อุทยานพระพิฆเนศ | **PHOTO POSSIBLE** | `IMG_5768` is 700 m away the same morning; no Ganesha visible |
| 9 | ชะอำ | **PHOTO VERIFIED** | 33 files across two visits |
| 10 | พัทยา | **NODE ONLY** | no GPS anywhere near Pattaya |
| 11 | บางแสน | **PHOTO POSSIBLE** | 2026-01-11 cluster (Q7) |
| 12 | อ่างศิลา | **PHOTO POSSIBLE** | same cluster (Q7) |
| 13 | บ้านกงเปรี้ยว | **TEXT-DRIVEN** | none |
| 14 | วัดดอนขนาท | **TEXT-DRIVEN** | none |
| 15 | บ้านเปรี้ยว | **TEXT-DRIVEN** | none |
| 16 | วัดไร่แตงทอง | **TEXT-DRIVEN** | the Nakhon Pathom temple photo is ~35 km from วัดไร่แตงทอง, so it is probably a different temple (Q6) |
| 17 | วัดหุบกระทิง | **TEXT-DRIVEN** | no Ratchaburi GPS at all |
| 18 | ทางรถไฟ | **TEXT-DRIVEN** | no railway image |
| 19 | **ร้าน TURR เกษตร** | **PHOTO VERIFIED** | **owner-confirmed** (§8b): `IMG_3479.PNG`, integrated as `turr-01.webp` |

**Photo verified 5 · possible 4 · text-driven 9 · node only 1.** (TURR moved to verified on owner confirmation, 2026-09-20.)

Which is a good result, not a poor one: **9 of 19 places becoming text is the
story, not a gap.** "บางที่มีรูป บางที่เหลือแค่ความทรงจำ" only works if it's true.

---

## 6. What to use

18 selects, 11 backups, 5 owner decisions, 82 skips.

**Hero** — primary `IMG_3550.HEIC` (Cha-am, both faces clear, 4284×5712, wide
crop headroom). Backups `IMG_3551.HEIC`, `IMG_7193.jpeg`.

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

Five reference images were confirmed by the owner. **The screenshots themselves
did not arrive with the message**; the mapping below was read from the filename
list in the brief, whose order matched reference order — independently verified
at position 2, which the brief states outright.

| ref | meaning | source file | status |
|---|---|---|---|
| 1 | จุดเริ่มต้น | `IMG_3416.HEIC` | integrated as `beginning-01.webp` (hero) |
| 2 | **ร้าน TURR เกษตร** | `IMG_3479.PNG` | integrated as `turr-01.webp` — stated explicitly in the brief |
| 3 | **หนมถ้วย** | `IMG_2536.JPG` | integrated as `cat-01.webp` |
| 4 | งานแต่งจริง | `24.jpg` | **not in the 116-file folder — cannot be integrated** |
| 5 | **ถ้วยฟู** | `IMG_6158.JPG` | integrated as `cat-02.webp` |

### TURR is resolved

§2 of the curation said *no confident TURR candidate*. That stands as a
statement about the **evidence** — the venue's neon sign is blown out in every
frame and the GPS sits 4–5 km from Kaset. It is now resolved by something
stronger than evidence: the owner said so. Confidence is recorded as
`OWNER_CONFIRMED`, which outranks any metadata inference.

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
| `IMG_5398` | **UNCERTAIN → labelled pre-wedding** | Thai dress in a *real* room — carved doors, brass vessels — not a studio sweep. The one frame the rule does not settle. **Q19.** |

**Consequence: every wedding image in the pool is pre-wedding.** The canonical
date 2026-07-28 has therefore been *removed* from all of them. The wedding
milestone stays a date beat with no photograph, and a separate pre-wedding beat
carries the studio work. Dating a studio shoot as the wedding is precisely what
the owner's rule exists to prevent.

The actual wedding photograph (`24.jpg`) is not in the Drive folder — it needs
to be added there, or supplied directly, before it can be used.

---

## 9. Owner review

**Resolved 2026-09-20:** Q2/Q3/Q4 (TURR), Q10/Q11/Q12 (cat identities), and the
wedding/pre-wedding split. **Q19 is new:** is `IMG_5398` (Thai dress, real room)
the actual ceremony or a pre-wedding shoot?

Still open: Q1, Q5, Q6, Q7, Q8, Q9, Q13, Q14, Q15, Q16, Q17, Q18, Q19.

`review-local/OWNER_REVIEW.jpg` — one sheet, **18 questions**, each with a
thumbnail. Answer in shorthand:

```
Q1 = ไม่ใช่ TURR        Q7 = บางแสน        Q13 = crop
Q2 = TURR               Q10 = ถ้วยฟู       Q17 = ไม่ใช้
```

Also in `review-local/`: `sheet01`–`sheet06.jpg` (all 107 images, numbered
`#1`–`#107`), `videos.jpg`, `focus.jpg`. **This folder is gitignored and must
never be committed.**

---

## 10. Optimization plan (next pass, after answers)

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

Target names (only after confirmation): `hero-01.webp`, `travel-chaam-01.webp`,
`travel-sarika-01.webp`, `daily-01.webp`, `family-01.webp`, `pet-01.webp`,
`finale-01.webp`, `timeline-wedding-01.webp`.

---

## 11. Typography note (observation only — no change made)

The places that become text-driven are exactly the ones where the current
display face will feel hardest: nine place names with no photograph behind them,
carried entirely by type, plus the numeric beats (10 จังหวัด / 19 สถานที่). Those
scenes — Places, Journey, Letter — are where a softer editorial Thai face would
earn its keep. Flagged for the separate typography pass; nothing changed here.

---

## 12. Reconciliation needed before integration

- **19 places** is the current truth; runtime data still reflects **18**. Not
  changed in this pass — the brief says reconcile after review.
- Two GPS clusters fall outside the ten known provinces (§4). Neither has been
  added.
- Nothing in `data/anniversary.ts` was touched.

---

## 13. Next pass

1. Owner answers the 18 questions.
2. Reconcile 18 → 19 places; decide the two out-of-province clusters.
3. Convert only the confirmed selects; write them to `public/images/memories/`.
4. Fill the slots — hero 1/3, featured, daily, travel, family, pets, finale —
   **leaving unfilled anything with no worthy photo.**
5. Build the text-driven treatment for the nine text places.
6. Then, separately, the typography pass.
