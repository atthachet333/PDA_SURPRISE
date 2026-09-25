/**
 * PDA BLISS SOLUTION — the public site brand (EP46.6).
 *
 * TWO NAMES, NEVER MIXED
 *   `SITE_BRAND`  PDA BLISS SOLUTION: the website / product sub-brand. Header,
 *                 footer lockup, page titles, og:site_name, WebSite schema,
 *                 manifest.
 *   `company.legalName` (data/company.ts) PDA BLISS COMPANY LIMITED /
 *                 บริษัท พีดีเอ บลิส จำกัด: the registered entity. Legal pages,
 *                 copyright, contact, the Organization schema. There is no
 *                 "PDA BLISS SOLUTION COMPANY LIMITED" — never write one.
 *
 * Assets are generated from the owner-approved lockup by
 * tools/brand/build_solution_brand.py. `-dark` files are the purpose-made
 * variant for dark grounds (ivory letterforms, lifted green) — never a white
 * box behind the light logo.
 */
export const SITE_BRAND = 'PDA BLISS SOLUTION';

/** The sub-brand line, for places that set it in text rather than the image. */
export const SITE_BRAND_PARTS = { parent: 'PDA BLISS', line: 'SOLUTION' } as const;

const DIR = '/brand/solution/pda-bliss-solution';

export type BrandTone = 'light' | 'dark';

export const brandAssets = {
  /** Stacked lockup: monogram over PDA BLISS / SOLUTION. 600px wide. */
  logo: { light: `${DIR}-logo.webp`, dark: `${DIR}-logo-dark.webp`, width: 600, height: 559 },
  /** Large monogram, for the hero watermark. */
  mark: { light: `${DIR}-mark.webp`, dark: `${DIR}-mark-dark.webp`, width: 529, height: 560 },
  /** Small monogram (~40px on screen) for header, footer and dock. */
  markSmall: { light: `${DIR}-mark-sm.webp`, dark: `${DIR}-mark-sm-dark.webp`, width: 166, height: 176 },
  /** PDA BLISS / — SOLUTION — line, set beside the mark in the header. */
  wordmark: { light: `${DIR}-wordmark.webp`, dark: `${DIR}-wordmark-dark.webp`, width: 560, height: 124 }
} as const;

/** Browser / home-screen icons in public/ (standard names at the root). */
export const brandIcons = {
  ico: '/favicon.ico',
  png16: '/favicon-16x16.png',
  png32: '/favicon-32x32.png',
  apple: '/apple-touch-icon.png',
  android192: '/android-chrome-192x192.png',
  android512: '/android-chrome-512x512.png',
  maskable512: '/maskable-512x512.png'
} as const;
