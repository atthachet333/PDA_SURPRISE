/**
 * ABSOLUTE URLS — the one place an origin and a path are joined (EP44).
 *
 * Pure (no `import.meta`, no DOM) so the app, the sitemap script, the Vite
 * config and node tests all share exactly this code. Canonical, Open Graph,
 * hreflang, JSON-LD, sitemap and robots URLs are built here and nowhere else.
 *
 * THE ORIGIN IS NEVER INVENTED
 *   `VITE_PUBLIC_ORIGIN` is the only source. When it is missing — or unsafe —
 *   the origin is '' and every consumer degrades to relative URLs or omits the
 *   tag entirely. A canonical pointing at localhost, a LAN address or a
 *   malformed host is worse than no canonical, so those are rejected here.
 */

const PRIVATE_HOST = [
  /^localhost$/i,
  /\.localhost$/i,
  /\.(local|internal|lan|home|corp|localdomain|invalid)$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^0\.0\.0\.0$/,
  /^\[?::1\]?$/,
  /^\[?f[cd][0-9a-f]{2}:/i,
  /^\[?fe80:/i
];

/**
 * A production origin, or '' when the value cannot safely be published.
 * Accepts `https://host[:port]` with an optional trailing slash, nothing else.
 */
export function sanitizeOrigin(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const value = raw.trim().replace(/\/+$/, '');
  if (!value) return '';
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return '';
  }
  if (url.protocol !== 'https:') return '';
  if (url.username || url.password || url.search || url.hash) return '';
  if (url.pathname !== '/' && url.pathname !== '') return '';
  const host = url.hostname;
  if (!host.includes('.') || PRIVATE_HOST.some((pattern) => pattern.test(host))) return '';
  return url.origin;
}

/** A root-relative path with no duplicate or trailing slashes (except '/'). */
export function normalizePath(path: string): string {
  const [pathname = '/', ...rest] = path.split('#');
  const clean = `/${pathname}`.replace(/\/{2,}/g, '/').replace(/(.)\/+$/, '$1');
  return rest.length ? `${clean}#${rest.join('#')}` : clean;
}

/** `origin + path`, or the path alone when there is no safe origin. */
export function joinUrl(origin: string, path: string): string {
  const safe = sanitizeOrigin(origin);
  const clean = normalizePath(path);
  return safe ? `${safe}${clean === '/' ? '/' : clean}` : clean;
}
