/**
 * The single gate for any external project URL on the corporate site.
 *
 * A live link is a promise that a stranger can open it safely. So a URL is
 * rejected unless it is plain public https: no localhost or private network
 * address, no internal-only hostname, no embedded credentials, no token-like
 * query parameters and no admin or login path.
 */

const PRIVATE_HOST = [
  /^localhost$/i,
  /\.local$/i,
  /\.internal$/i,
  /\.lan$/i,
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^0\./,
  /^\[?::1\]?$/,
  /^\[?f[cd][0-9a-f]{2}:/i
];

const SECRET_PARAM = /^(token|access_token|key|api_key|apikey|secret|auth|sig|signature|password|pass|pwd|session|code)$/i;
const PRIVATE_PATH = /^\/(admin|wp-admin|login|signin|dashboard|cpanel|phpmyadmin)(\/|$)/i;

export function isSafePublicUrl(value: string | undefined): value is string {
  if (!value) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:') return false;
  if (url.username || url.password) return false;
  if (!url.hostname.includes('.') || PRIVATE_HOST.some((pattern) => pattern.test(url.hostname))) return false;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname)) return false;
  if ([...url.searchParams.keys()].some((key) => SECRET_PARAM.test(key))) return false;
  if (PRIVATE_PATH.test(url.pathname)) return false;
  return true;
}

/** Hostname shown next to a live link, so a visitor sees where they are going. */
export function displayHost(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, '');
  } catch {
    return value;
  }
}
