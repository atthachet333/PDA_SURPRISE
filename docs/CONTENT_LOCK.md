# Content lock — what is true, what is gated, what is still missing

The record of the pre-redesign content lock. The redesign pass should treat
this as the boundary of what may be published.

---

## PDA BLISS

### Verified and published

| Field | Value | Where |
| --- | --- | --- |
| Legal name (TH) | บริษัท พีดีเอ บลิส จำกัด | `company.legalNameTh` |
| Legal name (EN) | PDA BLISS COMPANY LIMITED | `company.legalName` |
| Phone | 0638693614 | `company.phone` |
| Email | pdablissoffice@gmail.com | `company.email` |
| LINE OA | @593oiwec | `company.lineOA` |
| Address | 14/14 ซอยกรุงเทพ-นนท์ 21, ถนนกรุงเทพ-นนท์, แขวงบางซื่อ เขตบางซื่อ, กรุงเทพมหานคร 10800 | `company.address` |

These exist in exactly one place. No component may hold a literal copy.

### Verified numbers

Only two figures are substantiated:

- **6** ระบบซอฟต์แวร์
- **4** เว็บไซต์

Both live in `company.metrics`. `metricsVerified` is **false**, so they are not
rendered yet — two figures do not fill the current four-column strip, and the
redesign pass owns that layout. The homepage shows `capabilityMarkers` instead.

### Must not be invented

Listed in `company.unverifiedMetricKeys` so nobody regenerates them:

- Client counts
- Satisfaction percentages ("98% satisfaction" and similar)
- Years in business / years of experience
- Revenue impact for clients

The founding year is also unknown. `founded` is `null` and `foundedVerified` is
`false`; the hero badge falls back to `company.heroBadge`. The previous value of
`2020` was not supplied by the owner and has been removed.

### Services

Seven primary services, Thai-first, English as secondary `nameEn`:

1. ระบบ ERP / บริหารธุรกิจ — ERP
2. ระบบ Payroll / เงินเดือน — Payroll
3. เว็บไซต์องค์กรและธุรกิจ — Website
4. เว็บแอปพลิเคชัน — Web Application
5. แอปพลิเคชันมือถือ — Mobile Application
6. ระบบ HR ผ่าน LINE — HR LINE Bot
7. ระบบจัดเก็บเอกสารและไฟล์ — Document Management System

Nine supporting capabilities follow them. `primaryServices` selects the seven.

### Case studies vs portfolio

Two separate files, deliberately:

- `work.ts` — **illustrative** case studies with example figures.
  `caseStudiesVerified` is `false`, so no figure is ever rendered. Left untouched
  by this pass.
- `portfolio.ts` — **real systems**, with no outcome numbers at all. Gated on
  `verified` (owner has confirmed the description) and `publicSafe` (every
  screenshot reviewed). Not yet rendered anywhere.

### Blog

Placeholder-ready only. No CMS. Eight topics in `insights.ts`, all
`published: false`, none with an author or date. The cards show "เร็ว ๆ นี้".

---

## A&I

### Canonical

- `relationshipStartDate` = **2025-10-12** (12 October 2025)
- Every counter derives from it: `dayCounter.target`, `intro.subtitle`,
  `project.duration`, `convergence.glyph`, and the `days` statistic. Nothing
  hardcodes a day count, and `Scene02Days` paces itself in fractions of the
  target rather than assuming 365.

### Real data now in the config

- Names: Atthachet and Isariya
- Pets: ถ้วยฟู, หนมถ้วย
- 10 provinces travelled together
- 6 important places, 18 visited places
- The final message, split into `opening` / `gratitude[]` / `reflection[]` /
  `future[]` / `closing[]`, in the owner's own wording

### Statistics

Reduced to figures that are actually true: days (live), 10 provinces,
18 places, 2 cats, and ∞. The previous sample values — 1,842 photos, 12 trips,
47 inside jokes — were invented and have been removed rather than guessed at.

### Still missing

| Item | Status |
| --- | --- |
| Photographs | None. Every memory renders a generated placeholder. |
| Map coordinates | None supplied. All 24 real places carry `coordinatesPending: true`. |
| Map pins | `locations[]` still holds the ORIGINAL SAMPLE pins (Chiang Mai, Phuket, Tokyo) because the 3D globe cannot render a pin without coordinates. Flagged `── PLACEHOLDER ──` in the file. |
| Audio | `/public/audio/main-track.mp3` absent by design — "A Thousand Years" is copyrighted and the owner supplies a lawful private copy. Everything runs without it. |
| Timeline dates | Only the start date is known. Other moments are labelled by sequence, not by an invented date. |
| Memory captions | Neutral — they state the place and nothing more. Emotional captions are written when the owner sees the photos. |
