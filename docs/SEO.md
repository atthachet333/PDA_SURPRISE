# SEO, social and metadata (EP44)

> **EP44 — SEO + social + metadata finalization.** This file is the record of
> how PDA BLISS describes itself to search engines and link previews. Code:
> `frontend/src/lib/{url,seo,head,structuredData,sitemap}.ts`,
> `frontend/src/hooks/usePageMeta.ts`. Tests: `frontend/tests/seo.test.mjs`.

## The one setting: `VITE_PUBLIC_ORIGIN`

Set it in `frontend/.env.production` once the production hostname is chosen,
e.g. `VITE_PUBLIC_ORIGIN=https://www.example.co.th`, then rebuild.

- It is the **only** source of the public origin. Nothing in the repository
  names a production domain.
- `lib/url.ts` accepts only a public `https://host[:port]` — no path, query,
  credentials, localhost, `*.local`/`*.internal` or private/LAN IP. Anything
  else is treated as unset, and the sitemap step fails the build loudly.
- **Unset (today):** canonicals are relative; hreflang, `og:url`, `og:image`,
  JSON-LD urls, WebSite schema, breadcrumbs and the sitemap are simply not
  emitted. Nothing breaks and nothing is invented.
- **Set:** everything above is emitted with absolute URLs built by one helper,
  `joinUrl` (trailing slashes trimmed, no double slashes, locale path kept).

## Public route inventory

`indexablePaths` in `lib/seo.ts` is the only list offered to search engines —
derived, not typed out:

| Kind | Routes |
| --- | --- |
| Pages | `/` `/services` `/solutions` `/work` `/about` `/contact` `/insights` |
| Case studies | `/work/<slug>` for every record in `data/caseStudies.ts` (7 today) |
| Insights | `/insights/<slug>` only when an article is **published** (none today — drafts redirect) |
| Legal | `/privacy` `/cookie-policy` `/terms` |

Each exists in Thai (unprefixed), English (`/en`) and Chinese (`/zh`). Never
listed: `/login`, `/memory-gate`, `/workspace`, `/us`, `/dev`, the 404.

## Per route (computed by `buildHead`, applied by `usePageMeta`)

| | Public page | Private route / 404 |
| --- | --- | --- |
| `<title>` / description | localized, unique per page | generic `PDA BLISS` / 404 text |
| robots | `index, follow` | `noindex, nofollow` |
| canonical | the active locale's own route | **none** (never Home) |
| hreflang | `th`, `en`, `zh-Hans`, `x-default` (Thai) — with origin | none |
| `og:url`, `og:image`, `twitter:image` | with origin | image only |
| BreadcrumbList | section pages; Home → Work → case study | none |
| `<html lang>` | `th` / `en` / `zh-Hans`, updated on navigation | unchanged (Thai) |

Every tag is set, created or removed per route and restored on exit, so client
navigation never leaves a second canonical or stale alternates behind.

## Structured data

- **Organization** (every corporate page): name, legal names, email, E.164
  phone, the one registered Thai address (identical in every locale), verified
  Mon–Sat 08:30–17:30 hours, LINE as `sameAs`; `url`/`@id` with origin. All read
  from `data/company.ts` — the tests fail if they diverge.
- **WebSite** (with origin): name, url, `inLanguage` th/en/zh-Hans, publisher.
  No `SearchAction` — the site has no search.
- **BreadcrumbList** as above. **No** Service/Product/CreativeWork schema:
  services live on one catalogue page with anchors, not standalone URLs.
- Deliberately absent (unverified): founding date, founder, employees, ratings,
  awards, credentials, price range, logo, working languages.

## Share image and icons

- `public/brand/og-default.png` — 1200×630, ~110 KB, dark brand card with
  Latin text so it serves all three locales and both light/dark chat surfaces.
  Source: `frontend/scripts/brand/og-default.svg`.
- `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png` (maskable) from
  `scripts/brand/icon.svg`; `favicon.svg` unchanged.
- One `theme-color` tag, set to the page ground per resolved theme
  (`#F4F7F3` light, `#0E1311` dark) by the pre-paint bootstrap and
  `applyTheme`. A&I still overrides that same element on `/us`.

## Sitemap and robots

Written after `vite build` by `scripts/generate-sitemap.mjs` from
`lib/sitemap.ts`:

- `sitemap.xml` — every inventory route × 3 locales, each with the same four
  alternates. **No `lastmod`** (no reliable per-page date exists; the build day
  would be false) and no `priority`. Not written without an origin.
- `robots.txt` — allows `/`, disallows the private roots, adds
  `Sitemap:` only with an origin. `public/robots.txt` is the same file for the
  no-origin case (tested).

## Honest limitations

- This is a **client-rendered** Vite SPA. Crawlers that do not run
  JavaScript, and most chat link-preview bots, see only `index.html`: the Thai
  home title/description and (with an origin) the share image — for every URL.
  Per-route titles, English/Chinese metadata, canonicals, hreflang and JSON-LD
  exist only after JavaScript runs. Google renders JavaScript; many others do
  not. EP44 does not add SSR or prerendering.
- `robots.txt` is a request, not access control. Private routes also send
  `noindex, nofollow`; neither protects anything.

## Owner review required

Not used anywhere in metadata until confirmed: Payroll social-security/tax
support, multi-company, digital signatures, offline mode, barcode tracking,
NAS backup/security scope, app-store publishing, "working software every 2
weeks", regular system reviews, Google APIs evidence, EN/ZH legal wording,
EN/ZH address wording, a response-time standard, the company's working
languages, a final logo for `Organization.logo`, and whether `/insights`
should stay indexable while every article is still unpublished.
