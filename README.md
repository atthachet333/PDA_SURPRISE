# PDA BLISS — platform

A production-structured monorepo containing two separate experiences behind one
codebase:

1. **The public PDA BLISS site** — a corporate website for a custom software
   studio (green / white / black, bright and enterprise-modern).
2. **A private workspace experience ("A&I")** — a separate, self-contained
   cinematic experience with its own design system (sky blue / ivory / soft
   navy), reached through the client portal.

The two share only the build tooling. They have different palettes, typography
treatments, component trees and motion languages, and nothing from one leaks
into the other.

---

## Quick start

```bash
npm install
cp backend/.env.example backend/.env
npm run dev
```

| Service  | URL                     |
| -------- | ----------------------- |
| Frontend | http://localhost:1368   |
| Backend  | http://localhost:1369   |
| Health   | http://localhost:1369/api/health |

The Vite dev server proxies `/api/*` to the backend, so the browser only ever
talks to port 1368.

> Requires Node 20.11 or newer.

---

## Commands

Run from the repository root:

| Command             | What it does                                            |
| ------------------- | ------------------------------------------------------- |
| `npm run dev`       | Backend and frontend together, with reload              |
| `npm run dev:frontend` / `npm run dev:backend` | One side only         |
| `npm run build`     | Typecheck and build both workspaces                     |
| `npm run start`     | Serve the production build of both                      |
| `npm run typecheck` | `tsc --noEmit` across both workspaces                   |
| `npm run lint`      | ESLint over the frontend                                |
| `npm run clean`     | Remove both `dist` folders                              |
| `npm run media:init -- <folder>`   | Write a `media.json` skeleton for a batch of new A&I media (EP43) |
| `npm run media:ingest -- <folder>` | Validate, process and publish that batch (`--dry-run` to check only) |
| `npm run media:check` | Verify the canonical A&I media data and files          |

---

## Architecture

```
.
├── backend/                 Fastify + TypeScript API
│   └── src/
│       ├── config/env.ts    Zod-validated environment (fails fast on boot)
│       ├── routes/          health · config · contact · auth/client/admin stubs
│       ├── schemas/         Request validation schemas
│       ├── services/        Lead persistence behind a repository interface
│       ├── plugins/         Shared error handling
│       ├── app.ts           Plugin + route registration
│       └── server.ts        Listen and graceful shutdown
│
└── frontend/                React 18 + Vite + TypeScript
    └── src/
        ├── app/             Router shell, audio provider and context
        ├── components/
        │   ├── business/    PDA BLISS site components only
        │   ├── surprise/    A&I components only
        │   └── shared/      Layout primitives used by both
        ├── pages/
        │   ├── business/    Home · Services · Solutions · Work · About · Contact · Login
        │   └── surprise/    Workspace (gateway) · Experience (A&I)
        ├── scenes/surprise/ The twelve A&I scenes, one file each
        ├── hooks/           Motion, device, scroll and audio hooks
        ├── lib/             API client, audio manager, device profiling
        ├── data/            All content and configuration
        └── styles/          Tailwind layer with the design tokens
```

### Routes

| Path            | What it is                                              |
| --------------- | ------------------------------------------------------- |
| `/`             | Homepage                                                |
| `/services`     | Services                                                |
| `/solutions`    | Solutions, filterable by category                       |
| `/work`         | Case studies                                            |
| `/work/:slug`   | Case study detail                                       |
| `/about`        | About                                                   |
| `/contact`      | Contact form (posts to the API)                         |
| `/login`        | Client portal sign-in                                   |
| `/workspace`    | Private workspace gateway                               |
| `/us`           | The A&I experience                                      |
| `/dev/anniversary-preview` | Content console — **development only**, absent from production builds |

Everything except the homepage is lazily loaded, which keeps `three.js` out of
the initial bundle for ordinary visitors.

### API

| Method | Endpoint              | Notes                                             |
| ------ | --------------------- | ------------------------------------------------- |
| GET    | `/api/health`         | Liveness, uptime, environment                     |
| GET    | `/api/config/public`  | Non-secret runtime config and form option lists   |
| POST   | `/api/contact`        | Validated, rate limited, persisted                |
| any    | `/api/auth/*`         | Reserved — returns 501                            |
| any    | `/api/client/*`       | Reserved — returns 501                            |
| any    | `/api/admin/*`        | Reserved — returns 501                            |

All responses use one envelope:

```jsonc
{ "ok": true,  "data":  { /* ... */ } }
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "…", "fields": [] } }
```

Leads are written as newline-delimited JSON to `backend/data/leads.jsonl` in
development. `LeadRepository` in `backend/src/services/leadService.ts` is the
single seam to swap in PostgreSQL, a CRM, email or LINE notifications without
touching the route layer.

---

## Environment

Backend variables live in `backend/.env` (see `backend/.env.example`). The
process refuses to start if any value is invalid.

| Variable                | Default                    | Purpose                              |
| ----------------------- | -------------------------- | ------------------------------------ |
| `PORT`                  | `1369`                     | API port                             |
| `CORS_ORIGIN`           | `http://localhost:1368`    | Comma-separated allowed origins      |
| `LEAD_STORE`            | `file`                     | `file` or `memory`                   |
| `LEAD_STORE_PATH`       | `./data/leads.jsonl`       | Where file storage writes            |
| `CONTACT_RATE_MAX`      | `5`                        | Submissions per window per IP        |
| `CONTACT_RATE_WINDOW`   | `10 minutes`               | Rate limit window                    |
| `COMPANY_EMAIL/PHONE/LOCATION` | —                   | Served via `/api/config/public`      |

Frontend variables (`frontend/.env`, optional) only control the dev proxy
target and an optional API base URL. No secret ever belongs in the frontend.

---

## Editing content

All copy and configuration is data, not markup.

| File                           | Contains                                        |
| ------------------------------ | ----------------------------------------------- |
| `frontend/src/data/company.ts` | Company details, metrics, navigation, process    |
| `frontend/src/data/services.ts`| The ten services                                 |
| `frontend/src/data/solutions.ts`| Solution modules and categories                 |
| `frontend/src/data/work.ts`    | Case studies                                     |
| `frontend/src/data/about.ts`   | Mission, values, philosophy                      |
| `frontend/src/data/anniversary.ts` | **Everything in the A&I experience**         |

### Adding new A&I photos and videos — the media pipeline (EP43)

New memories go through `npm run media:ingest`. It generates the IDs, the WebP
derivatives and thumbnails, the video posters, the relationship-year assignment
(from owner input only), the privacy-review record and the canonical entries in
`memoryArchive.ts` / `memoryVideos.ts`. Nothing is edited by hand. See
**[docs/MEDIA_PIPELINE.md](docs/MEDIA_PIPELINE.md)**.

### Replacing the A&I photos and content

**Everything personal lives in `frontend/src/data/anniversary.ts`.** No scene
component contains personal data, so this is the only file you need to edit.

Run the dev server and open **http://localhost:1368/dev/anniversary-preview**
while you work. It lists every memory, every referenced image path with a live
ok / missing check, the timeline order, the locations with their coordinates,
and a validation report. It is development-only and is not present in a
production build.

1. **Start date — do this first.** Set `relationshipStartDate` (`YYYY-MM-DD`).
   Every live counter derives from it, and the validator warns if it disagrees
   with your `days` statistic.

2. **Names** — `couple.initials` (the mark shown everywhere), `nameA`, `nameB`.

3. **Photos** — drop files into `frontend/public/images/memories/`, then set
   each memory's `image`:

   ```ts
   {
     id: 'm03',
     title: 'The first trip',
     date: 'Day 048',
     caption: 'Somewhere new, and somehow it felt familiar.',
     image: '/images/memories/first-trip.jpg',
     location: 'Chiang Mai',
     featured: true
   }
   ```

   Any entry without an image — or whose file fails to load — renders a
   generated A&I placeholder (sky gradient, star field, the mark, the memory
   number) instead of a broken image, so the experience is presentable before a
   single photo is added.

   *Format:* portrait crops around 3:4 or 4:5 look best. 1200–1600px on the long
   edge is plenty. `featured: true` favours a memory in the carousel and
   convergence, and puts it in the small set preloaded up front.

   *Scoping:* add `scene: ['universe', 'gallery']` to restrict a memory to
   particular scenes. Omit it to use the memory everywhere.

4. **Locations** — real `lat` / `lng` position the pins on the globe and the
   glowing arcs between them. `status: 'future'` renders an unfilled pin at the
   end of the route.

5. **Timeline** — each moment picks one of seven compositions via `treatment`:

   | treatment | what it looks like |
   | --- | --- |
   | `fullbleed` | full-width image, copy over a gradient |
   | `split` | image and text side by side, alternating |
   | `polaroid` | small tilted print with a caption |
   | `date` | oversized date type with the photo beneath |
   | `stack` | a fanned pile (supply 2–3 paths in `images`) |
   | `textOnly` | no image at all, on purpose |
   | `blurFocus` | blurred backdrop, sharp foreground plate |

   `type` (`photo` / `text` / `location` / `highlight` / `video`) is metadata.
   `video` is accepted and reserved — no player is implemented yet, and the
   validator will tell you it renders as a photo moment.

6. **Statistics** — `days`, `photos`, `trips`, `specialPlaces`, `insideJokes`
   and a free `custom` slot. Numeric values animate; strings (like `∞`) render
   as-is.

7. **Words** — `intro`, `dayCounter`, `quietLines`, `convergence.caption` and
   `finalMessages`.

No photos are committed to this repository; `public/images/memories/` is
gitignored.

---

## Audio

No audio files ship with this repository, and none are required.

- **Music:** place a licensed track at `frontend/public/audio/main-track.mp3`.
  Nothing else needs changing.
- **Effects:** optionally drop `hover/click/whoosh/impact/sparkle/transition.mp3`
  into `frontend/public/audio/sfx/`. Each file is independent, and **any effect
  without a file falls back to a tone synthesised with the Web Audio API** — so
  the interface has sound even with the folder empty.
- **No autoplay.** Audio unlocks on the visitor's own gesture: the BEGIN /
  OPEN PROJECT click, or the first-visit *Sound on* choice.
- **Fades only.** Music never starts or stops abruptly. The quiet scene ducks it
  to ~32%; the finale opens it back to full over four seconds.
- **Preferences persist** in `localStorage` (`ai:audio`), so the choice is
  remembered and the prompt is shown once.
- Music, effects and fullscreen controls live in the A&I navigation — top right
  on desktop, a bottom bar at thumb height on touch.

**Music sync is optional by design.** `anniversary.audio.cues` maps cue ids to
seconds in the track, and scenes subscribe with `onCue(id, handler)`. Every
scene *also* triggers its own beat from scroll position, so the experience is
identical with music off, with no track present, or with a track of any length.
Navigation never depends on song timing.

See `frontend/public/audio/README.md` for the full reference. Do not commit
copyrighted music.

---

## Performance and accessibility

- **Quality tiers** (`lib/device.ts`) — HIGH / MEDIUM / LOW, auto-selected from
  cores, device memory, pointer type and viewport. The tier sets the DPR cap,
  particle and star counts, cloud shader octaves, and whether the photo tunnel,
  depth fog and custom cursor run at all. Override it from
  `/dev/anniversary-preview`, or with
  `localStorage.setItem('ai:quality', 'low')`.
- **Mobile fallbacks** — the photo tunnel becomes a drifting contact sheet,
  particle counts drop, orbit radii shrink, and the nav controls move to a
  bottom bar.
- **Preloading is scoped** — only featured photos are warmed up front (on idle);
  each scene preloads its own set as it comes into view, with a concurrency cap
  so a large memory set never starves the current scene.
- **`prefers-reduced-motion`** is honoured everywhere: counters jump to their
  final value, the portal transition shortens, scenes present statically.
- **Tab visibility** pauses every WebGL render loop, the carousel and music.
- **Cleanup** — geometries are disposed and every rAF loop, timer, observer and
  listener is torn down on unmount.
- **Accessibility** — skip link, semantic landmarks, keyboard-operable carousel
  and scene navigation, visible focus rings, `aria-label`s on decorative
  controls, and alt text (or `role="img"` labels) on every memory.

---

## The client portal flow

`/login` is a normal client portal. Alongside the sign-in form it offers
**Continue with this device**, which opens `/workspace` — a locally cached
private workspace. That runs an access-check sequence, surfaces one private
project (`PROJECT_365`), and **OPEN PROJECT** plays a full-screen WebGL
transition that dissolves the corporate theme and hands off to `/us`.

Sign-in itself is not implemented: `/api/auth/*` returns 501 and the form says
accounts are provisioned by a project lead, rather than faking a session.

---

## Deployment

**Build**

```bash
npm run build
```

Outputs `frontend/dist` (static) and `backend/dist` (Node).

**Topology** — one process. With `SERVE_FRONTEND=true` the backend serves both
`frontend/dist` and `/api` on a single port, so the site and its API share an
origin: no CORS in production, no second public port, and one target for
Cloudflare Tunnel. Port 1368 is development only.

```powershell
pm2 start ecosystem.config.cjs
pm2 save
```

**The private music file is gitignored and will NOT arrive via `git pull`.** It
has to be copied onto the server by hand before the build. If it is missing the
experience still runs, silently.

> **Full runbook: [DEPLOYMENT.md](DEPLOYMENT.md)** — prerequisites, environment,
> private audio placement, PM2, Cloudflare origin, health checks, the smoke-test
> checklist, caching and rollback.

**Before going live — owner input required**

These are flagged with `OWNER INPUT REQUIRED` in the source:

- **Headline metrics** — `data/company.ts`. Real figures are **not published**
  while `metricsVerified` is `false`; the homepage shows a qualitative
  capability strip instead, so the site never presents invented numbers as
  audited fact. Fill in `metrics[]` with figures you can substantiate, then set
  the flag to `true`.
- **Case studies** — `data/work.ts`. The six engagements are illustrative
  placeholders. While `caseStudiesVerified` is `false`, the Work and Home pages
  describe them as *representative examples* rather than claiming measured
  results. Replace them with real anonymised work, then set the flag.
- **Contact details** — `data/company.ts` and `backend/.env` (email, phone,
  address) are placeholders.
- **A&I content** — `data/anniversary.ts`; see
  [Replacing the A&I photos and content](#replacing-the-ai-photos-and-content).
- Move lead storage off the local file (see `LeadRepository`).
- Confirm you hold a licence for any audio you add.
