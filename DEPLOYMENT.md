# Deployment — PDA BLISS / PDA Surprise

Production runbook for the Windows server behind Cloudflare Tunnel.

> **Two things must happen before the first deploy.** Both are owner decisions,
> not code:
>
> 1. **Choose the production hostname** and set it in two places (below).
> 2. **Copy the private music file** onto the server. It is gitignored, so
>    `git pull` will never bring it.

---

## 1. Architecture

One Node process serves everything:

```
Internet → Cloudflare (HTTPS) → cloudflared tunnel → 127.0.0.1:1369
                                                          │
                                              Fastify ────┼── /api/*  → JSON API
                                                          └── /*      → frontend/dist
```

**Why one process.** The site and the API share an origin, so the browser never
makes a cross-origin request: no CORS in production, no second public port, and
one thing for the tunnel to point at. The frontend is a static build served by
Fastify — there is no nginx and no Vite server in production.

Port **1368 is development only** (Vite dev server, proxying `/api` to 1369).
In production nothing listens on 1368.

---

## 2. Prerequisites

| Requirement | Value |
|---|---|
| Node.js | ≥ 20.11.0 (`node -v`) |
| npm | ships with Node 20 |
| PM2 | `npm i -g pm2` |
| cloudflared | already installed on this server |
| Port | 1369, loopback only |

---

## 3. First-time setup

```powershell
cd C:\apps\PDA_SURPRISE
git clone <repo-url> .
npm ci
```

### 3a. Backend environment

```powershell
Copy-Item backend\.env.example backend\.env
notepad backend\.env
```

Set at minimum:

```ini
NODE_ENV=production
PORT=1369
SERVE_FRONTEND=true
TRUST_PROXY_HOPS=1
PUBLIC_ORIGIN=https://YOUR-DOMAIN-HERE
```

`backend\.env` is gitignored and must never be committed.

> The server **refuses to start** in production if the configuration is unsafe —
> for example a wildcard `CORS_ORIGIN`, a non-HTTPS `PUBLIC_ORIGIN`, or a
> cross-origin setup still pointing only at localhost. A process that will not
> boot is easier to diagnose than one that boots insecurely.

### 3b. Frontend build environment

```powershell
notepad frontend\.env.production
```

```ini
VITE_PUBLIC_ORIGIN=https://YOUR-DOMAIN-HERE
```

This is the **only** place the hostname reaches the browser bundle. It drives
canonical tags, `og:url` and `sitemap.xml`. Until it is set the build still
succeeds — canonical/OG URLs are simply relative and no sitemap is generated
(the build prints a warning saying exactly that).

`frontend\.env.production` is gitignored. It contains no secret; `VITE_*` values
are embedded in the public bundle by design.

### 3c. Private music file — required, and `git pull` will not do it

`frontend/public/audio/main-track.mp3` is **gitignored on purpose**: it is a
copyrighted recording and must not enter the repository. It therefore does not
exist on a freshly cloned server.

Copy it from a machine that has it, **before building**:

```powershell
# from your local machine
scp frontend\public\audio\main-track.mp3 user@server:C:\apps\PDA_SURPRISE\frontend\public\audio\

# or over RDP / a file share, into exactly:
#   C:\apps\PDA_SURPRISE\frontend\public\audio\main-track.mp3
```

Verify before building — Vite copies `public/` into `dist/` at build time, so
the file must be in place first:

```powershell
if (Test-Path frontend\public\audio\main-track.mp3) {
  "OK  $((Get-Item frontend\public\audio\main-track.mp3).Length) bytes"
} else {
  "MISSING - the story will run silently"
}
```

**If it is missing, nothing breaks.** The experience runs in full with no music:
the control shows an unavailable state, there is no spinner and no error. That
is a supported state, not a failure — but it is not the intended one.

---

## 4. Build

```powershell
cd C:\apps\PDA_SURPRISE
npm run build
```

This typechecks the frontend, compiles the backend to `backend\dist`, builds the
frontend to `frontend\dist`, and generates `sitemap.xml` when
`VITE_PUBLIC_ORIGIN` is set.

Verify the music made it into the build:

```powershell
if (Test-Path frontend\dist\audio\main-track.mp3) { "audio in build OK" } else { "audio NOT in build" }
```

---

## 5. Start under PM2

```powershell
pm2 start ecosystem.config.cjs
pm2 save
pm2 logs pda-surprise --lines 50
```

`pm2 save` records the process list so the server's existing PM2 startup
mechanism restores it after a reboot. **Do not** run `pm2 startup` from this
runbook — the machine's global autostart is already configured and is not this
repository's business.

---

## 6. Cloudflare Tunnel

Point the tunnel's public hostname at the single local origin:

```
service: http://127.0.0.1:1369
```

No `/api` rule is needed — the API is served from the same origin under `/api/*`.

Do not publish port 1369 directly to the internet; the tunnel is the only way in.
HTTPS and HSTS are terminated by Cloudflare.

---

## 7. Health check and smoke test

```powershell
# liveness
curl.exe http://127.0.0.1:1369/api/health

# homepage
curl.exe -s -o NUL -w "%{http_code}`n" http://127.0.0.1:1369/

# deep link must return the SPA, not 404
curl.exe -s -o NUL -w "%{http_code}`n" http://127.0.0.1:1369/solutions

# contact validation (expect 400)
curl.exe -s -X POST http://127.0.0.1:1369/api/contact -H "Content-Type: application/json" -d "{}"
```

Full checklist after any deploy:

- `/`, `/solutions`, `/work`, `/insights`, `/about`, `/contact`
- `/privacy`, `/cookie-policy`, `/terms`
- a nonsense URL → styled 404 (not a server error)
- **refresh** each of the above — deep links must not 404
- cookie banner appears on a fresh browser profile, and persists a choice
- `/login` → continue → `/memory-gate` → correct date → `/workspace` → `/us`
- music starts when the project is opened; one track only
- `/dev/anniversary-preview` → **404** (absent from production builds)
- `?memory-gate-bypass=1` → **ignored** (development only)

---

## 8. Updating an existing deployment

```powershell
cd C:\apps\PDA_SURPRISE
git pull
npm ci
# main-track.mp3 survives a pull (it is ignored), but confirm it anyway:
if (-not (Test-Path frontend\public\audio\main-track.mp3)) { "WARNING: audio missing" }
npm run build
pm2 restart pda-surprise
curl.exe http://127.0.0.1:1369/api/health
```

---

## 9. Rollback

```powershell
cd C:\apps\PDA_SURPRISE
git log --oneline -10          # pick the last known-good commit
git checkout <commit-sha>
npm ci
npm run build
pm2 restart pda-surprise
```

To return to the tip afterwards: `git checkout main`.

Nothing here deletes anything. `backend\.env`, `backend\data\leads.jsonl` and
the private audio are all gitignored, so they survive every checkout — which is
also why a rollback never loses captured leads.

---

## 10. Caching

Handled by the server; no CDN rules required.

| Asset | Header | Why |
|---|---|---|
| `/assets/*-<hash>.js\|css` | `max-age=31536000, immutable` | filename changes when content does |
| images, fonts, `.mp3` | `max-age=86400` | unversioned, changes rarely |
| `index.html`, `robots.txt`, `sitemap.xml` | `no-cache` | must revalidate or a deploy never reaches visitors |

**No service worker is registered, and none should be added before the
anniversary.** A stale cached bundle would keep serving an old version of the
experience with no reliable way to force an update.

---

## 11. Logs

```powershell
pm2 logs pda-surprise
pm2 flush pda-surprise          # clear
```

Written to `backend\logs\`. Request logs contain method, path, status, duration
and a request id. Request **bodies are redacted**, so contact-form submissions
never appear in the log stream — they are stored deliberately in
`backend\data\leads.jsonl` instead.

Every response carries `x-request-id`; quoting it from a report finds the exact
log line.

---

## 12. Still required from the owner

| Item | Where | Blocking? |
|---|---|---|
| Production hostname | `backend\.env` → `PUBLIC_ORIGIN`, `frontend\.env.production` → `VITE_PUBLIC_ORIGIN` | **Yes** for canonical URLs + sitemap |
| `main-track.mp3` on the server | `frontend\public\audio\` | No — silent fallback works |
| Real PDA BLISS logo | `frontend\public\brand\` (currently a placeholder `favicon.svg`) | No |
| Social share image | none exists; `og:image` is deliberately not declared | No |
| Verified metrics / case studies | `frontend\src\data\company.ts`, `work.ts` | No — gated behind flags |
| A&I photographs | `frontend\public\images\memories\` (21 slots) | No — placeholders render |
