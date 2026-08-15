/**
 * Best-effort SSRF guard for admin-supplied source URLs (websiteUrl /
 * apiEndpoint). The generic JSON adapter (src/server/live/sources/generic.ts)
 * calls `fetch()` on whatever apiEndpoint a source configures — with the
 * /api/admin/sources auth gate in place this is no longer reachable by an
 * anonymous attacker, but it's still worth rejecting obviously-internal
 * targets at input time as defense in depth (protects against a leaked
 * admin token, or an admin pasting the wrong URL).
 *
 * This is a static/literal check only — it does NOT resolve DNS, so a
 * hostname that *resolves* to an internal address (DNS rebinding) is not
 * caught here. A production deployment that wants full SSRF protection
 * should additionally validate the resolved IP at fetch time or route
 * these requests through an egress proxy with an allowlist.
 */

const PRIVATE_HOSTNAMES = new Set(["localhost", "0.0.0.0", "::1", "[::1]"]);

function isPrivateIPv4(hostname: string): boolean {
  const match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;
  const [a, b] = [Number(match[1]), Number(match[2])];
  if (a === 127) return true; // loopback
  if (a === 10) return true; // RFC1918
  if (a === 172 && b >= 16 && b <= 31) return true; // RFC1918
  if (a === 192 && b === 168) return true; // RFC1918
  if (a === 169 && b === 254) return true; // link-local incl. cloud metadata (169.254.169.254)
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

function isPrivateIPv6(hostname: string): boolean {
  const h = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  return h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80");
}

export function isSafePublicUrl(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;

  const hostname = parsed.hostname.toLowerCase();
  if (PRIVATE_HOSTNAMES.has(hostname)) return false;
  if (hostname.endsWith(".local") || hostname.endsWith(".internal")) return false;
  if (isPrivateIPv4(hostname)) return false;
  if (isPrivateIPv6(hostname)) return false;

  return true;
}
