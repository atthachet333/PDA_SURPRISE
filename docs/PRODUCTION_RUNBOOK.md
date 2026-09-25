# PDA_SURPRISE — Production Runbook

> **The one deploy procedure (EP46).** This file replaces the procedure that
> used to live in `DEPLOYMENT.md`. If another document disagrees with this one,
> this one wins. EP47 executes it top to bottom. Nothing here has been run
> against the live server yet.
>
> **Production hostname (owner-confirmed in EP46.6): `solution.pdabliss.com`**
> — the PDA BLISS SOLUTION site of PDA BLISS COMPANY LIMITED. Public origin:
> `https://solution.pdabliss.com`. DNS and the tunnel route are wired in EP47,
> not before.

- [1. Architecture](#1-architecture)
- [2. Requirements](#2-requirements)
- [3. Environment](#3-environment)
- [4. Server layout and release model](#4-server-layout-and-release-model)
- [5. Build and release artifact](#5-build-and-release-artifact)
- [6. Runtime assets (A&I)](#6-runtime-assets-ai)
- [7. PM2](#7-pm2)
- [8. Cloudflare Tunnel](#8-cloudflare-tunnel)
- [9. Deploy (EP47 phases A–J)](#9-deploy-ep47-phases-aj)
- [10. Smoke checklist](#10-smoke-checklist)
- [11. Rollback](#11-rollback)
- [12. Logs](#12-logs)
- [13. Behaviour reference](#13-behaviour-reference)
- [14. Common failures](#14-common-failures)
- [15. Launch blockers and owner decisions](#15-launch-blockers-and-owner-decisions)

---

## 1. Architecture

```
Browser ──HTTPS──▶ Cloudflare edge ──▶ cloudflared (on the server)
                                            │  http://127.0.0.1:1369
                                            ▼
                          ONE Node process under PM2: "pda-surprise"
                          Fastify (backend/dist/server.js)
                            ├── /api/*   JSON API (health, config, contact)
                            └── /*       frontend/dist — SPA + static media
```

- **One production process.** `SERVE_FRONTEND=true` makes Fastify serve the
  built SPA and the API from one port and one origin: no CORS, no second
  port, no nginx, no `vite preview`. Port **1368 is development only**.
- **No database.** No production DB is required for v1. Contact enquiries are
  appended to one JSON-lines file (§13.4).
- **No SSR, no service worker.** Crawlers see `index.html` plus the static
  share tags; everything else renders client-side (docs/SEO.md).
- **No Docker, no Kubernetes.** Git, Node, npm, PM2 and cloudflared only.

## 2. Requirements

| | Requirement | Why |
|---|---|---|
| OS | Windows Server (existing host) | commands below are PowerShell |
| Node.js | **22.x LTS or newer** (`node -v`) | `@fastify/static` → `content-disposition@3` requires Node ≥ 22; Node 20 reached end of life in April 2026. `package.json` `engines` says `>=22.0.0` |
| npm | the one bundled with Node 22 (10.x) | the lockfile is `package-lock.json`: **npm only**, no pnpm/yarn/bun |
| git | any recent | clones the release |
| PM2 | already installed globally | `pm2 -v` |
| cloudflared | already installed and running | the tunnel is the only way in |
| Disk | ~450 MB per release (incl. `node_modules`) | keep the last 3 releases |

**Node is global on this server and shared with other projects.** If
`node -v` reports < 22, stop: upgrading it affects every other PM2 app. That
is an owner decision (§15), not a deploy step.

## 3. Environment

Two files, both **gitignored** and both living in `<root>\shared\` on the
server (§4). Each release gets a copy at deploy time, so a release folder
always carries the exact configuration it was started with.

### 3.1 Backend — `<root>\shared\backend.env` → `backend\.env`

Loaded by dotenv from the backend working directory at startup. Validated at
boot: the process **refuses to start** in production on an unsafe value.

| Variable | Req. | Secret | Production value / shape | Purpose | If missing / wrong |
|---|---|---|---|---|---|
| `NODE_ENV` | **required** | no | `production` (PM2 also sets it) | production safety checks, terse 5xx | development behaviour: verbose errors |
| `PORT` | required | no | `1369` | loopback port cloudflared targets | default 1369 |
| `HOST` | required | no | `127.0.0.1` | bind loopback only | default `0.0.0.0` — reachable from the LAN around the tunnel; `release:check` warns |
| `SERVE_FRONTEND` | **required** | no | `true` | serve `frontend/dist` from this process | default false → API only, the site 404s |
| `FRONTEND_DIST` | optional | no | `../frontend/dist` (default) | built SPA location | boot error if the folder does not exist |
| `PUBLIC_ORIGIN` | **required** | no | `https://solution.pdabliss.com` | added to the CORS allowlist; must equal `VITE_PUBLIC_ORIGIN` | empty = allowed at boot but `release:check` fails; non-https/private/with path = **refuses to start** |
| `TRUST_PROXY_HOPS` | required | no | `1` | trust exactly the local cloudflared hop for the client IP (rate limit) | default 1 |
| `LEAD_STORE` | required | no | `file` | persist enquiries | `memory` = lost on restart; `release:check` fails |
| `LEAD_STORE_PATH` | **required** | no (file holds personal data) | `<root>\shared\data\leads.jsonl` (**absolute**) | enquiry file outside the release | relative = inside one release, next deploy starts empty; `release:check` fails |
| `CORS_ORIGIN` | optional | no | leave default | only used cross-origin (not in this topology) | `*` refuses to start |
| `LOG_LEVEL` | optional | no | `info` | log verbosity | default info |
| `BODY_LIMIT_BYTES` | optional | no | default `65536` | request size cap | default |
| `CONTACT_RATE_MAX` | optional | no | default `5` | enquiries per IP per window | default |
| `CONTACT_RATE_WINDOW` | optional | no | default `10 minutes` | rate-limit window | default |
| `COMPANY_EMAIL` / `COMPANY_PHONE` / `COMPANY_LOCATION` | optional | no (published) | defaults mirror `frontend/src/data/company.ts` | `/api/config/public` | defaults |

Reserved in `.env.example` but **unused by v1**: `DATABASE_URL`, `JWT_SECRET`,
`SMTP_URL`. Do not set them.

### 3.2 Frontend build — `<root>\shared\frontend.env.production` → `frontend\.env.production`

Read by Vite **at build time only** and by the sitemap step (same loader).
`VITE_*` values are embedded in the public bundle: **never a secret**.

| Variable | Req. | Value / shape | Purpose | If missing / wrong |
|---|---|---|---|---|---|
| `VITE_PUBLIC_ORIGIN` | **required** | `https://solution.pdabliss.com` — https, public hostname, no path/query/credentials, not localhost/LAN/private IP | canonical, hreflang, `og:url`/`og:image`, JSON-LD, `sitemap.xml`, robots `Sitemap:` line | empty: build succeeds with relative URLs and **no sitemap**; `release:check` fails. Unsafe value: **the build fails** (sitemap step exits 1) |
| `VITE_API_BASE_URL` | optional | leave unset (`/api`) | API base | anything else needs CORS; `release:check` warns |
| `VITE_API_PROXY_TARGET` | dev only | — | Vite dev/preview proxy | ignored in production |

### 3.3 Secret inventory

**v1 has no secrets.** No API keys, tokens, passwords or database credentials
exist or are needed. The files that still must stay off Git and be handled
with care on the server:

| Item | Where | Sensitivity |
|---|---|---|
| `backend.env` | `<root>\shared\` | configuration, no secrets today; treat as private |
| `leads.jsonl` | `<root>\shared\data\` | **personal data** (names, emails, phones, project notes) |
| `main-track.mp3` | `<root>\shared\audio\` | copyrighted, owner-licensed |
| PM2 dump copies | `<root>\backups\…\dump.pm2` | contains every PM2 app's environment, **including other projects'** |

## 4. Server layout and release model

> **Root path — confirm in EP47.** The existing server convention is
> `D:\S2A_PROJECT\<project>`. Every command sets `$Root` once; change it there
> if the server uses a different drive or folder. Nothing existing is moved.

```
D:\S2A_PROJECT\PDA_SURPRISE\
  releases\
    20261001-1030\          one full git checkout per deploy: node_modules,
    20261003-0915\          backend\dist, frontend\dist, its own .env copies,
    …                       RELEASE.txt. Never edited after it goes live.
  shared\
    backend.env             the real backend configuration
    frontend.env.production VITE_PUBLIC_ORIGIN
    audio\main-track.mp3    owner-supplied track
    data\leads.jsonl        contact enquiries (LEAD_STORE_PATH points here)
  logs\                     PM2 stdout/stderr (PDA_LOG_DIR)
  backups\<stamp>\          pre-deploy snapshot: PM2 dump, env copies, leads copy
  CURRENT_RELEASE.txt       path of the live release
  deploys.log               one line per deploy / rollback
```

**Why versioned releases, not `git pull` in place:** the new release is
cloned, installed, built and checked **while the old one keeps serving**. The
switch is `pm2 delete` + `pm2 start` of this project's one process (a few
seconds). Rollback starts the previous folder again: **no rebuild, no GitHub,
no reinstall**. No symlinks or junctions are used.

## 5. Build and release artifact

**One canonical build, from a release folder:**

```powershell
npm ci
npm run build
npm run release:check
```

`npm run build` = backend `tsc` → `backend\dist`, frontend typecheck →
`vite build` → `frontend\dist`, then `robots.txt` / `sitemap.xml` from the route
inventory. It depends on nothing outside the checkout plus the two copied env
files and the copied track — no local absolute paths, no OneDrive, no
`review-local`.

What production actually runs:

| Path | Produced by | Needed at runtime |
|---|---|---|
| `backend\dist\` | `tsc` | yes — the server (its `.map` files are never served) |
| `frontend\dist\` | Vite + sitemap step | yes — every public file, **publicly downloadable** |
| `node_modules\` | `npm ci` | yes — backend dependencies |
| `backend\.env`, `frontend\.env.production` | copied from `shared\` | yes / build only |
| `ecosystem.config.cjs` | Git | PM2 start |

`tools\*.py`, `review-local\`, `media-inbox\` and all sources are not used at
runtime. Vite emits **no source maps** (`sourcemap: false`).

**`npm run release:check`** (`tools/release/release-check.mjs`) reads and
reports; it never builds, pushes, deploys or touches PM2/Cloudflare. It fails
(exit 1) on: Node < 22; a dirty checkout; missing/unsafe backend env;
missing/unsafe/mismatched `VITE_PUBLIC_ORIGIN`; a tracked copy of the track;
missing build output; source maps, raw media (HEIC/MOV/DNG…), archives, env
files or `review-local`/`media-inbox`/`drive-*` content in `dist`; **any dist
file that is neither tracked under `frontend/public` nor generated by the
build** (a stray screenshot or copied source); robots without the sitemap line
or private disallows; a sitemap that is missing, off-origin or lists a private
route; an index.html without the absolute share image. A missing track is
reported as **PROVISION** (copy it, then rebuild), not a Git error.
Flags: `--backend-env <file>`, `--skip-build-output`, `--allow-missing-audio`,
`--allow-dirty` (local only).

## 6. Runtime assets (A&I)

| Asset | In Git? | Provisioning |
|---|---|---|
| `frontend/public/audio/main-track.mp3` | **no** — copyrighted, gitignored | owner copies it once to `<root>\shared\audio\main-track.mp3`; each deploy copies it into the release **before** `npm run build` |
| `frontend/public/audio/sfx/*.mp3` | no (optional) | none — missing effects are synthesised |
| `frontend/public/images/memories/**/*.webp`, video posters `*.jpg` | yes | arrive with the clone |
| `frontend/public/videos/memories/*.mp4` | yes | arrive with the clone |
| PDA BLISS SOLUTION logo variants (`brand/solution/`), favicons and home-screen icons (`public/` root), `og-default.png`, manifest | yes | arrive with the clone |
| `/brand/pda-bliss-logo.svg`, `pda-bliss-mark.svg` | no | only the private `/login` page's older `Logo` component looks for them; it uses its inline mark. The corporate site uses PDA BLISS SOLUTION (EP46.6) |

Every other runtime path referenced by the source is tracked (audited in EP46).
**EP46.5 media** must be committed like the existing media; `release:check`
rejects any file in `dist` that is not tracked, so untracked media cannot ship
by accident.

**Privacy of what ships.** Only optimized derivatives are in Git: WebP images
and posters carry no EXIF/XMP/GPS; the MP4s carry no location/device tags
(both checked in EP46). The Porsche ultrasound images are pixel-crops of the
scan fan produced by `tools/build_porsche_media.py`; no raw scan, clinic
header or patient text is in the repository or the build. Raw Drive copies
live only in the gitignored `review-local\` on the curation machine and never
on the server.

**"Private" means unlisted, not access-controlled.** `/login`, `/memory-gate`,
`/workspace`, `/us` are noindex, disallowed in robots.txt, absent from the
sitemap, structured data and navigation, and gated client-side. Their media
files are still static files: anyone with an exact URL can fetch them. This is
the existing design; real access control is post-v1.

## 7. PM2

| | |
|---|---|
| Config | `ecosystem.config.cjs` (committed, no secrets) |
| Process name | **`pda-surprise`** — one process, fork mode, 1 instance |
| Paths | absolute, from the config file's own folder: `cwd = <release>\backend`, `script = <release>\backend\dist\server.js` |
| Env | `NODE_ENV=production` from the config; the rest from `backend\.env` |
| Restart | autorestart, `max_restarts 10`, `min_uptime 20s`, `restart_delay 2s`, `max_memory_restart 512M`, `kill_timeout 12s` (server force-exits after 10s) |
| Logs | `$env:PDA_LOG_DIR\pda-surprise-out.log` / `-error.log`, timestamped; fallback `<release>\backend\logs\` |

**Name collision check (EP47, read-only first):** the server already runs
`pda-bliss-web`, `pdabliss-backend`, `pdabliss-frontend`. `pda-surprise` does
not collide with those **names**, but one of them may already listen on 1369
or already serve the PDA BLISS hostname. Their relationship to this release
(replace, keep, retire) is an **owner decision** (§15). EP47 never stops,
deletes or restarts them.

**Never run:** `pm2 kill`, `pm2 delete all`, `pm2 restart all`,
`pm2 stop all`, `pm2 flush` (without a name), `pm2 startup`/`unstartup`,
`taskkill /IM node.exe`. Every command below names `pda-surprise`.

**Reboot survival** uses the server's existing PM2 resurrect setup. EP47 only
runs `pm2 save` after the start, then checks the dump lists `pda-surprise`
(§9 H). Scheduled Tasks are not touched.

**Log rotation:** EP47 checks `pm2 ls` for the `pm2-logrotate` module. If it is
not installed, logs grow unbounded — acceptable for v1 at this traffic;
installing it is a post-v1 ops task (it is global to the server).

## 8. Cloudflare Tunnel

| | |
|---|---|
| Public hostname | `solution.pdabliss.com` (owner-confirmed, EP46.6) — a subdomain of `pdabliss.com` |
| Service | `http://127.0.0.1:1369` (plain HTTP over loopback; TLS ends at Cloudflare) |
| Path rules | none — `/api` is on the same origin |
| WebSockets | not used in production |
| DNS | the proxied (orange-cloud) CNAME Cloudflare creates for the tunnel |

EP47 pre-checks (read-only first):

1. Which tunnel the server runs (`cloudflared tunnel list`) and whether its
   routes are dashboard-managed (Zero Trust → Networks → Tunnels → Public
   Hostnames) or a local `config.yml` ingress list.
2. Whether `solution.pdabliss.com` already routes somewhere (e.g. an existing
   `pdabliss-*` process). Add or change **only** this hostname's route; the
   apex `pdabliss.com` and every other subdomain are left exactly as they are.
3. HTTPS: SSL/TLS "Always Use HTTPS" on. The app never redirects by itself,
   so no redirect loop is possible from the origin side.
4. No origin exposure: port 1369 is not in the Windows firewall allow list or
   router forwards; `HOST=127.0.0.1` enforces it anyway.
5. **Client IP / rate limit (must verify):** after the first public request,
   `pm2 logs pda-surprise --lines 20` must show `remoteAddress` = the visitor's
   public IP, **not** `127.0.0.1`. With `TRUST_PROXY_HOPS=1` Fastify takes the
   last `X-Forwarded-For` entry, which Cloudflare sets. If it shows
   `127.0.0.1`, every visitor shares one bucket (5 enquiries per 10 minutes for
   the whole internet): stop and fix before announcing the site.
6. HSTS: the app sends `Strict-Transport-Security: max-age=31536000;
   includeSubDomains`. Sent from `solution.pdabliss.com` it covers that host
   and names under it only — never the apex `pdabliss.com` or its sibling
   subdomains — so it cannot affect the server's other sites.

## 9. Deploy (EP47 phases A–J)

Open **PowerShell** on the server. Run each block, read its output, then
continue. Stop on any unexpected result (→ §11 or §14).

```powershell
# Session variables — set once per session
$Root     = 'D:\S2A_PROJECT\PDA_SURPRISE'                 # confirm in EP47
$Repo     = 'https://github.com/atthachet333/PDA_SURPRISE.git'
$Expected = '<approved commit sha from EP47>'
$Stamp    = Get-Date -Format 'yyyyMMdd-HHmm'
$Rel      = "$Root\releases\$Stamp"
$Pm2Home  = if ($env:PM2_HOME) { $env:PM2_HOME } else { "$env:USERPROFILE\.pm2" }
$env:PDA_LOG_DIR = "$Root\logs"
```

### Pre-flight (read-only)

```powershell
node -v; npm -v; git --version; pm2 -v
pm2 ls
pm2 describe pda-surprise                                  # "doesn't exist" on the first deploy
Get-NetTCPConnection -LocalPort 1369 -State Listen -ErrorAction SilentlyContinue |
  ForEach-Object { Get-Process -Id $_.OwningProcess }       # who holds 1369?
cloudflared tunnel list
Get-PSDrive ($Root.Substring(0,1))                          # free space
```

First deploy only — create the layout (creates folders, touches nothing else):

```powershell
'releases','shared','shared\audio','shared\data','logs','backups' |
  ForEach-Object { New-Item -ItemType Directory -Force -Path "$Root\$_" | Out-Null }
Set-Content "$Root\shared\frontend.env.production" 'VITE_PUBLIC_ORIGIN=https://solution.pdabliss.com'
# owner copies the track (RDP / file share) to: $Root\shared\audio\main-track.mp3
```

`shared\backend.env` is created once, right after phase B, from the template
in the fresh clone:

```powershell
if (-not (Test-Path "$Root\shared\backend.env")) {
  Copy-Item "$Rel\backend\.env.example" "$Root\shared\backend.env"
  notepad "$Root\shared\backend.env"      # set the §3.1 production values
}
```

### A. Backup

```powershell
$Bk = "$Root\backups\$Stamp"; New-Item -ItemType Directory -Force $Bk | Out-Null
if (Test-Path "$Pm2Home\dump.pm2") { Copy-Item "$Pm2Home\dump.pm2" "$Bk\dump.pm2" }   # the saved list as it was
pm2 ls | Out-File "$Bk\pm2-ls.txt"
Copy-Item "$Root\shared\backend.env", "$Root\shared\frontend.env.production" $Bk -ErrorAction SilentlyContinue
Copy-Item "$Root\shared\data\leads.jsonl" $Bk -ErrorAction SilentlyContinue
if (Test-Path "$Root\CURRENT_RELEASE.txt") { Copy-Item "$Root\CURRENT_RELEASE.txt" $Bk }
```

The previous release folder itself is the code backup — it is never modified.
On the **first** deploy, any older deployment of the site (e.g. the
`pdabliss-*` processes or `C:\apps\PDA_SURPRISE`) is left exactly as it is and
is the rollback target.

### B. Fetch the release

```powershell
git clone --branch main --single-branch $Repo $Rel
Set-Location $Rel
$Sha = git rev-parse HEAD
if ($Sha -ne $Expected) { throw "HEAD $Sha is not the approved commit $Expected" }
```

If the server cannot reach GitHub: on a machine with the repo run
`git bundle create pda.bundle main`, copy it over, then
`git clone --branch main pda.bundle $Rel`.

### C. Install

```powershell
npm ci
```

### D. Environment

```powershell
Copy-Item "$Root\shared\backend.env" "$Rel\backend\.env"
Copy-Item "$Root\shared\frontend.env.production" "$Rel\frontend\.env.production"
```

### E. Runtime assets

```powershell
Copy-Item "$Root\shared\audio\main-track.mp3" "$Rel\frontend\public\audio\main-track.mp3"
```

### F. Build and check

```powershell
npm run build
npm run release:check          # must end with RELEASE CHECK PASSED
Set-Content "$Rel\RELEASE.txt" "commit=$Sha`nbuilt=$(Get-Date -Format o)`nby=$env:USERNAME"
```

`RELEASE.txt` sits in the release root, outside `frontend\dist`, so it is never
served.

### G. Local smoke on a spare port (old release still live)

```powershell
$env:PORT = '1399'
$Probe = Start-Process node -ArgumentList 'dist\server.js' -WorkingDirectory "$Rel\backend" -PassThru -WindowStyle Hidden
Remove-Item Env:PORT
Start-Sleep 3
curl.exe -s http://127.0.0.1:1399/api/health
'/', '/services', '/en/services', '/work', '/contact', '/login', '/memory-gate', '/robots.txt', '/sitemap.xml', '/audio/main-track.mp3' |
  ForEach-Object { "{0}  {1}" -f (curl.exe -s -o NUL -w '%{http_code}' "http://127.0.0.1:1399$_"), $_ }
curl.exe -s -o NUL -w '%{http_code}  missing asset (expect 404)`n' http://127.0.0.1:1399/assets/missing-00000000.js
Stop-Process -Id $Probe.Id                                   # this one PID only
```

Expect `200` for every page, robots, sitemap and the track; `404` for the
missing asset. Do not submit the contact form here — it would write a real
line into `leads.jsonl`.

### H. Switch

```powershell
pm2 delete pda-surprise                                      # skip on the first deploy
pm2 start "$Rel\ecosystem.config.cjs"
pm2 save
Set-Content "$Root\CURRENT_RELEASE.txt" $Rel
Add-Content "$Root\deploys.log" "$(Get-Date -Format o)  DEPLOY  $Sha  $Rel"
Start-Sleep 3
pm2 describe pda-surprise                                    # status online, cwd = $Rel\backend
curl.exe -s http://127.0.0.1:1369/api/health
Select-String -Path "$Pm2Home\dump.pm2" -Pattern 'pda-surprise' -Quiet   # True = survives reboot
```

### I. Cloudflare / public smoke

Only now create or repoint the tunnel route for the hostname (§8), then run
§10 against `https://solution.pdabliss.com`.

### J. Decision

All of §10 green → done; keep this release. Any P0 failure (site down, blank
page, 5xx, A&I gate broken, wrong hostname in canonicals) → §11 immediately,
then investigate on the stopped release, not on the live one.

## 10. Smoke checklist

Run against `https://solution.pdabliss.com` (and `127.0.0.1:1369` for the API).

**Transport and health**
- [ ] `curl.exe -s https://solution.pdabliss.com/api/health` → `200` `{"status":"ok","service":"pdabliss-api","environment":"production",…}`
- [ ] `curl.exe -sI http://solution.pdabliss.com/` → redirects to https (Cloudflare), no loop
- [ ] Response headers include CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, HSTS (§13.2)

**Routes — load AND refresh each (direct hit must not 404)**
- [ ] `/`, `/services`, `/en/services`, `/zh/work`, `/work/erp-inventory-costing`, `/about`, `/contact`, `/insights`, `/privacy`, `/cookie-policy`, `/terms`
- [ ] nonsense URL → styled 404 page, title "ไม่พบหน้านี้"
- [ ] `/dev/anniversary-preview` → styled 404 (absent from production)
- [ ] `/assets/missing-00000000.js` → `404` JSON, not HTML

**SEO**
- [ ] `/robots.txt` → text, `Sitemap: https://solution.pdabliss.com/sitemap.xml`, disallows `/login` `/memory-gate` `/workspace` `/us` `/dev/`
- [ ] `/sitemap.xml` → XML, 51 URLs, all on `https://solution.pdabliss.com`, none private
- [ ] view-source `/`: `og:image` = `https://solution.pdabliss.com/brand/og-default.png`
- [ ] DevTools on `/en/services`: canonical `https://solution.pdabliss.com/en/services`, hreflang th/en/zh-Hans/x-default
- [ ] `/favicon.ico`, `/favicon-32x32.png`, `/apple-touch-icon.png`, `/android-chrome-512x512.png`, `/maskable-512x512.png`, `/site.webmanifest` → 200; the tab shows the PDA BLISS SOLUTION monogram (hard-refresh: browsers cache favicons)
- [ ] a share preview of `https://solution.pdabliss.com/` (e.g. a LINE/Slack paste) shows the PDA BLISS SOLUTION card

**Contact**
- [ ] `POST /api/contact` with `{}` → `400 VALIDATION_ERROR`
- [ ] one real test enquiry through the form (owner-approved wording, e.g. "EP47 smoke test") → reference shown; the line appears in `<root>\shared\data\leads.jsonl`; logs show reference only, no enquiry text
- [ ] `pm2 logs pda-surprise --lines 20` → `remoteAddress` is a public IP (§8.5)

**A&I (private)**
- [ ] `/login` and `/memory-gate` load; DevTools Network shows **no** `main-track.mp3` request there
- [ ] `/workspace` and `/us` without the gate → redirected to `/memory-gate`
- [ ] correct date at the gate → `/workspace` → exactly one track loads; it starts only after a click/tap; `/us` continues the same track (no second instance, no restart)
- [ ] `GET /audio/main-track.mp3` → `200 audio/mpeg`, `Accept-Ranges: bytes`; with `-H "Range: bytes=0-1"` → `206`
- [ ] one memory video plays and seeks (range requests)
- [ ] A&I is not linked from any corporate navigation

**Old-tab recovery** (on the second and later deploys)
- [ ] a tab opened on the previous release, then a click to a not-yet-visited page after the switch → the page reloads once and shows the new version; no error panel

## 11. Rollback

Rollback never rebuilds, never reinstalls and never needs GitHub.

```powershell
$Root = 'D:\S2A_PROJECT\PDA_SURPRISE'
$env:PDA_LOG_DIR = "$Root\logs"
Get-Content "$Root\deploys.log" -Tail 5                      # 1. identify the previous good release
Get-ChildItem "$Root\releases" | Sort-Object Name -Descending | Select-Object -First 3
$Prev = "$Root\releases\<previous-stamp>"
Get-Content "$Prev\RELEASE.txt"                              # its commit and build time

pm2 delete pda-surprise                                      # 2+4. this project's process only
pm2 start "$Prev\ecosystem.config.cjs"
pm2 save
Set-Content "$Root\CURRENT_RELEASE.txt" $Prev
Add-Content "$Root\deploys.log" "$(Get-Date -Format o)  ROLLBACK  $Prev"

curl.exe -s http://127.0.0.1:1369/api/health                # 5. health
curl.exe -s https://solution.pdabliss.com/api/health         # 6. Cloudflare endpoint
```

3. **Env:** the previous release carries its own `backend\.env` and was built
   with its own `frontend\.env.production`, so its configuration comes back
   with it. Only if `shared\backend.env` itself was damaged:
   `Copy-Item "$Root\backups\<stamp>\backend.env" "$Root\shared\backend.env"`.
7. **A&I / private routes:** `/login` loads, `/workspace` redirects to the gate,
   the gate accepts the date, music plays after a gesture.

**Leads are never rolled back.** `shared\data\leads.jsonl` is append-only and
shared by every release; restoring a backup copy over it would delete every
enquiry received since. Only restore it if the file itself is corrupted, and
merge rather than overwrite.

**First deploy:** if there was no previous `pda-surprise` release, rollback =
`pm2 delete pda-surprise; pm2 save`, and point the tunnel hostname back to what
it served before (recorded in the §8 pre-check).

**Release retention:** keep the live release and the two before it. Delete an
older one only by its exact folder name after a quiet week:
`Remove-Item -Recurse "$Root\releases\<old-stamp>"` — never the path in
`CURRENT_RELEASE.txt`.

## 12. Logs

```powershell
pm2 logs pda-surprise --lines 100          # live tail
Get-Content "$Root\logs\pda-surprise-error.log" -Tail 50
pm2 flush pda-surprise                     # this app only — never bare `pm2 flush`
```

- JSON lines (pino), timestamped by PM2. Each request logs method, URL, host,
  remote address/port, status and duration with a `reqId`; every response
  echoes it as `x-request-id`.
- **Redacted in every environment:** request bodies (so contact form content
  never reaches the log), `authorization`, `cookie`, `set-cookie` headers.
  A captured lead logs only `reference`, `contactType`, `serviceId`.
- 5xx responses in production say only "Something went wrong on our side"; the
  real error is in the log under the same request id. No stack traces are sent
  to browsers.
- A&I routes are static files; nothing about the private experience is logged
  beyond the request line.

## 13. Behaviour reference

### 13.1 Static and SPA serving

| Request | Response |
|---|---|
| existing file | the file, correct MIME, `Accept-Ranges: bytes` |
| missing file (any `/assets/*`, or a last segment with an extension, e.g. `/sitemap.xml` when none was built) | `404` JSON — never the HTML shell (EP45) |
| page route (`/services`, `/en/work/<slug>`, `/us`, unknown page) | `200` `index.html`; the SPA renders the page or its styled 404 |
| `/api/<unknown>` | `404` JSON |
| POST to a page route | `405` |
| path with `\` or `//` tricks | `403` from the static server |

MIME verified in EP46: JS `application/javascript`, CSS `text/css`, WebP
`image/webp`, PNG `image/png`, SVG `image/svg+xml`, MP4 `video/mp4`, MP3
`audio/mpeg`, sitemap `application/xml`, robots `text/plain`, manifest
`application/manifest+json`. MP4/MP3 answer `Range` with `206`.

### 13.2 Security headers (HTML responses)

`Content-Security-Policy` (self + Google Fonts, `frame-ancestors 'none'`,
`object-src 'none'`, `connect-src 'self'`), `Strict-Transport-Security:
max-age=31536000; includeSubDomains`, `X-Content-Type-Options: nosniff`,
`X-Frame-Options: SAMEORIGIN` (CSP `frame-ancestors` is stricter and wins),
`Referrer-Policy: strict-origin-when-cross-origin`, plus helmet's
Cross-Origin-Opener-Policy and related defaults. No `Permissions-Policy` yet
(post-v1). CORS applies to `/api` only and denies unknown origins; there is no
wildcard.

### 13.3 Caching

| Asset | `Cache-Control` |
|---|---|
| `/assets/*-<hash>.js|css` | `public, max-age=31536000, immutable` |
| images, video, audio, fonts (unversioned) | `public, max-age=86400` |
| `index.html`, `/`, page routes, `robots.txt`, `sitemap.xml`, `site.webmanifest` | `no-cache` |

Hashed names + `no-cache` HTML mean a deploy reaches visitors on their next
navigation; a tab left open across a deploy reloads itself once when its old
chunk 404s (EP45). No service worker, no CDN rules needed.

### 13.4 Contact enquiries — what actually happens

1. The browser POSTs JSON to `/api/contact` (guided, quick or legacy payloads).
2. Validation (zod) → `400` with field errors; invalid JSON → `400`.
3. Honeypot `website` filled → `202` fake success, nothing stored.
4. Valid → one JSON line appended to `LEAD_STORE_PATH`, `201` with a
   reference such as `PDA-XXXXXXXX-XXXX`.
5. Rate limit: 5 per client IP per 10 minutes → `429 RATE_LIMITED`.

**No email, LINE or CRM notification is sent.** A mail-ready formatter exists
(`contactNotification.ts`) but nothing delivers it. Enquiries are read by
opening `leads.jsonl` on the server. Someone must be assigned to do that (§15).

### 13.5 External dependencies

| Dependency | Kind | If unavailable |
|---|---|---|
| Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) | optional | `display=swap` + system font stacks; pages render fully (verified with fonts blocked in EP45) |
| LINE (`line.me/R/ti/p/@593oiwec`), `mailto:`, `tel:` | links only | nothing breaks |
| Cloudflare | required | site unreachable (origin stays private by design) |

No other runtime network calls. No analytics.

## 14. Common failures

| Symptom | Check | Fix |
|---|---|---|
| **Cloudflare 502 / 1033** | `pm2 describe pda-surprise`; `curl.exe http://127.0.0.1:1369/api/health`; `cloudflared tunnel list` | process offline → error log; tunnel service points elsewhere → correct the route to `http://127.0.0.1:1369`; cloudflared service stopped → start that Windows service |
| **PM2 status `errored` / restart loop** | `Get-Content $Root\logs\pda-surprise-error.log -Tail 50` | "Refusing to start in production" → fix `shared\backend.env`, copy into the release, `pm2 delete` + `pm2 start`; "no build was found" → the release was not built |
| **`EADDRINUSE` 1369** | the Get-NetTCPConnection line in §9 | another process holds the port (maybe an old `pdabliss-*` app). Do not kill it without the owner (§15) |
| **"Invalid environment configuration"** | error log names the variable | correct `shared\backend.env`, recopy, restart this process |
| **`sitemap.xml` 404** | `Test-Path $Rel\frontend\dist\sitemap.xml`; `Get-Content $Rel\frontend\.env.production` | origin was not set for the build → set it, rebuild (new release) |
| **build fails: "is not a public https origin"** | the printed value | fix `VITE_PUBLIC_ORIGIN`: https, public hostname, no path |
| **`/audio/main-track.mp3` 404** | `Test-Path $Rel\frontend\public\audio\main-track.mp3` and `...\dist\audio\...` | copy the track (§9 E) and **rebuild**; the A&I experience runs silently meanwhile |
| **assets 404 after deploy** | is the old release still being served? | old tabs recover by themselves; if fresh visits 404, PM2 runs the wrong folder → `pm2 describe` cwd |
| **refresh on `/services` gives 404** | `SERVE_FRONTEND` | must be `true`; unknown pages should still be `200` + styled 404 |
| **contact returns 429 for everyone** | `remoteAddress` in the log | `127.0.0.1` means client IP is lost — see §8.5 |
| **contact returns 500** | error log by request id | usually `LEAD_STORE_PATH` not writable → fix folder permissions |
| **canonical / OG show the wrong host** | `frontend\.env.production` in that release | fix, rebuild as a new release |

## 15. Launch blockers and owner decisions

### Launch blockers — all must be `[x]` before EP47 switches traffic

- [ ] `https://solution.pdabliss.com` written to `shared\backend.env` (`PUBLIC_ORIGIN`) and `shared\frontend.env.production` (`VITE_PUBLIC_ORIGIN`) — hostname decided in EP46.6
- [ ] **Server Node ≥ 22** (`node -v`); if lower, owner decides how to upgrade the shared runtime
- [ ] **Port 1369 and the existing `pdabliss-*` processes:** owner decides whether `pda-surprise` replaces them and when the old ones are retired; 1369 free or a different `PORT` agreed
- [ ] Cloudflare tunnel identified; `solution.pdabliss.com` → `http://127.0.0.1:1369` agreed
- [ ] Owner track copied to `shared\audio\main-track.mp3`
- [ ] Owner has named who reads `shared\data\leads.jsonl` and how often (no email notification in v1)
- [ ] Payroll "supports Thai social security and tax" highlight (Thai source, `i18n/solutions.ts`) confirmed or removed — it contradicts the EP38 correction
- [ ] EN/ZH legal pages reviewed, **or** owner explicitly accepts publishing them unreviewed
- [ ] Server can clone the private repo (or a bundle is prepared)
- [ ] EP46.5 committed on `main`; `npm run release:check` passes in the new release
- [ ] no open P0/P1 defects

### Must be verified during EP47 (not decisions)

- client IP behind the tunnel (§8.5) · `pm2 save` persisted (§9 H) ·
  `pm2-logrotate` present or not (§7) · old-tab recovery (§10) · new favicon
  and share card (§10)

### Non-blocking content review (before the v1.0 freeze, EP48)

Capability highlights that describe what could be built rather than delivered
work — **multi-company, digital signatures, offline mode, barcode tracking** —
and **NAS backup/security scope, app-store publishing, "working software every
2 weeks", "regular system reviews", Google APIs evidence, response-time
standard, EN/ZH address wording**. None is changed by EP46; the owner confirms
or corrects each.

### Post-v1

International phone format (`tel:+66…`), email/LINE notification for new
enquiries, admin view for leads, real access control for A&I media,
`Permissions-Policy` header, `pm2-logrotate`, react-router 7 upgrade (two
moderate advisories; the open-redirect one is not reachable here — the static
server rejects `\`/`//` paths with 403 — and the other needs SSR),
a vector (SVG) master of the PDA BLISS SOLUTION logo — today's assets are
derived from the approved 1254px raster, which is sharp at every size the site
uses but cannot grow beyond it.
