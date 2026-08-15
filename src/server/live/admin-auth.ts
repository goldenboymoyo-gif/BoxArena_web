import type { NextRequest } from "next/server";

/**
 * Gate for /api/admin/* routes.
 *
 * These routes can create/edit/delete stream sources and force a refresh,
 * which (via the generic JSON adapter) makes the server fetch a
 * caller-supplied URL — that's real capability, not read-only, so it must
 * never be reachable by an anonymous visitor. There's no user/session
 * system in this Next.js app (that lives in the Django backend under
 * backend/apps/accounts + backend/apps/streams, which enforces this via
 * IsAdminOrSuperAdmin), so until these routes are migrated to call that
 * backend, they're protected by a single shared secret set as
 * ADMIN_API_TOKEN.
 *
 * Deliberately fails CLOSED: if ADMIN_API_TOKEN isn't configured, every
 * request is rejected rather than silently allowed through (that silent
 * allow is exactly the bug this replaces — these routes previously had no
 * check at all).
 */
export function requireAdmin(request: NextRequest): Response | null {
  const expected = process.env.ADMIN_API_TOKEN;
  if (!expected) {
    return Response.json(
      { error: "Admin API is not configured. Set ADMIN_API_TOKEN to enable it." },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : request.headers.get("x-admin-token");

  if (!provided || !timingSafeEqual(provided, expected)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null; // null = "allowed, continue"
}

function timingSafeEqual(a: string, b: string): boolean {
  // Plain `a === b` is subject to a timing side-channel that leaks how
  // many leading bytes matched — irrelevant for most app code, but this
  // guards the one shared secret standing between an anonymous request
  // and write access, so it's worth doing properly.
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  if (bufA.length !== bufB.length) return false;
  let diff = 0;
  for (let i = 0; i < bufA.length; i++) {
    diff |= bufA[i] ^ bufB[i];
  }
  return diff === 0;
}
