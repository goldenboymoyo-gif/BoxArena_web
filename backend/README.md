# Pugnera Backend

A Django + DRF backend for the Pugnera boxing platform: accounts/roles,
payments, subscriptions, tickets, and multi-source live-stream
aggregation. This document explains what's built, the security reasoning
behind the sensitive parts, what was verified in this environment, and —
just as important — what is **not** done yet and genuinely can't be
finished without your accounts/credentials.

## What's implemented

- **accounts** — custom `User` model with a server-controlled `role`
  (FAN/BOXER/COACH/PROMOTER/MEDIA/MODERATOR/EDITOR/FINANCE/ADMIN/SUPERADMIN),
  separate `BoxerProfile`/`FanProfile`, JWT auth (SimpleJWT) with refresh
  rotation + blacklist, per-device session tracking, logout / logout-all,
  email verification, password reset, profile image upload with real
  image-content validation, account deletion (soft, preserves financial
  records), brute-force lockout via django-axes.
- **payments** — provider-agnostic core: `PaymentProviderConfig`,
  `PaymentMethod`, `PaymentIntent`, `PaymentTransaction`, `Refund`,
  `WebhookEvent`. Server-calculated pricing only. Idempotent, signature-verified
  webhook processing. Refunds are FINANCE/ADMIN-gated. Only a **mock**
  provider adapter is registered — see "Payments: what's not done" below.
- **orders / tickets / subscriptions** — orders pin a server-calculated
  price; tickets are HMAC-signed (unforgeable, duplicate-scan-proof);
  subscriptions sync from verified payment events, never from a client flag.
- **streams** — pluggable `StreamSourceAdapter` architecture for legitimate
  free boxing broadcasts (federations, promoters, official YouTube channels),
  event deduplication across sources, LIVE/UPCOMING/COMPLETED classification
  driven by clock time, and an honest empty state. No adapter is connected
  to a live external API yet — see below.
- **chat / live** — authenticated WebSocket chat (JWT-in-query-string,
  rejected if invalid), server-side rate limiting, message length limits,
  block/report, moderator-only message hiding, mod-badge derived from
  server-side role (not client-supplied).
- **audit** — append-only `AuditLog`, written from every sensitive action
  across accounts/payments/tickets/moderation/streams.
- **fighters / boxing / events / fights / videos / news / notifications /
  moderation / search / analytics** — real relational models matching the
  spec's data model, with editorial/staff-only write paths for anything
  that represents a real-world fact (fight results, boxer verification,
  organization verification).

## Security decisions (threat → protection → test)

**Frontend is untrusted (spec §35).** Every price, role, verification
flag, and ownership check is recomputed/verified server-side:
`RegisterSerializer.validate_role` rejects a client sending `role=ADMIN`
(`apps/accounts/tests.py::test_cannot_self_register_as_admin`);
`create_payment_intent_for_order` reads `order.total_amount`, never a
client-supplied amount (`test_intent_amount_comes_from_order_not_client`);
`MeView` only ever operates on `request.user`, never an id from the URL
(`test_me_endpoint_cannot_be_redirected_to_another_user`).

**Payment webhooks are the highest-value attack surface (spec §9).**
`apps.payments.services.process_webhook` verifies the provider signature
first and rejects on failure before touching any data
(`test_invalid_signature_is_rejected`, `test_missing_signature_is_rejected`);
enforces idempotency via a unique `(provider, event_id)` constraint so a
retried delivery is a no-op, not a double charge/entitlement
(`test_duplicate_webhook_does_not_double_process`); and cross-checks the
webhook's amount/currency against what the server itself calculated at
intent-creation time, rejecting any mismatch
(`test_tampered_amount_is_rejected`, `test_tampered_currency_is_rejected`).

**Refunds are authorization-gated (spec §14).** `RefundRequestView`
requires `FINANCE`/`ADMIN`/`SUPERADMIN`; an ordinary user gets 403 against
their own transaction (`test_ordinary_user_cannot_self_refund`).

**Tickets can't be forged (spec §13).** Each ticket's QR payload is
`ticket_id.HMAC(ticket_id:event_id:owner_id)` signed with the server's key;
`scan_ticket` runs inside `select_for_update()` so two simultaneous scans
of the same code can't both succeed.

**Chat can't be used to impersonate a moderator (spec §26).** The `is_mod`
flag sent to other clients is computed from `user.role` at broadcast time
in `LiveChatConsumer.receive_json` — there is no field a client can set to
claim it.

**Secrets never touch source control or logs.** All credentials are
`django-environ` variables (`.env.example` documents every one, with no
real values); `apps/core/logging_filters.RedactSensitiveDataFilter` and
`apps/audit/services._scrub` strip password/token/card/secret-shaped keys
before anything is logged or audited; `production.py` refuses to boot if
`DJANGO_SECRET_KEY`, `JWT_SIGNING_KEY`, `DJANGO_ALLOWED_HOSTS`, or
`CORS_ALLOWED_ORIGINS` are missing, or if a non-mock payment provider is
active without a secret key configured.

## What was actually verified in this environment

This sandbox has no Postgres/Redis and no package-manager root access, so
verification used a throwaway `pugnera.settings.sandbox_test` (SQLite +
local-memory cache/channel layer — **never** use this module outside this
one-off check; `dev.py`/`production.py` are the real environments and both
require actual Postgres/Redis). With that substitution:

- `pip install -r requirements/dev.txt` — clean install, no version conflicts
  (one incorrect pin, `django-axes==6.5.3`, was fixed to `6.5.2`, the latest
  real release).
- `python manage.py check` — 0 issues.
- `python manage.py makemigrations` — generated cleanly for all 20 apps,
  no missing-dependency or field errors.
- `python manage.py migrate` — applied cleanly, including third-party
  migrations (axes, token_blacklist, otp_totp, celery_beat/results).
- `pytest` — **34/34 tests passing**, covering registration/role-escalation
  attempts, login/email-verification/logout/session-ownership, webhook
  signature/idempotency/tampering, refund authorization, event
  deduplication, and the live-feed empty-state/priority rules.
- `ruff check` and `bandit -ll` — clean.

Two real bugs were caught and fixed by actually running this, not just
writing it: a mock-webhook signing helper that signed different bytes than
it transmitted (every "valid" webhook test failed until fixed), and a
JSON log formatter that crashed on UUID fields. Both are fixed in the
current code.

## What's NOT done — and can't be, from inside this session

Being direct about this because the spec explicitly asked not to claim
something works if it wasn't tested:

- **No real payment provider is integrated.** `apps/payments/providers/mock_provider.py`
  is a sandbox stand-in so the payment *pipeline* (intents, webhooks,
  idempotency, refunds) could be built and tested end-to-end. Per spec §33,
  a real adapter (e.g. a Zimbabwe-capable provider for EcoCash/local cards,
  plus an international Visa/Mastercard/Apple Pay/Google Pay provider)
  should only be implemented after confirming that provider's *current*
  Zimbabwe availability, PCI posture, webhook signing scheme, and
  refund/chargeback API against their live docs — none of which I can
  verify without you choosing a candidate provider and giving me their
  current documentation/sandbox access.
- **No live infrastructure exists.** There's no real Postgres, Redis,
  object storage bucket (S3/R2), Cloudflare zone, Sentry project, or SMTP
  provider behind any of this — `docker-compose.yml` and the `.env.example`
  describe the shape of what's needed, but provisioning and securing those
  accounts is something only you can do.
- **No admin MFA is enforced yet.** `django-otp` is installed and in
  `INSTALLED_APPS`/`MIDDLEWARE`, but wiring it to *require* TOTP for staff
  login (rather than just being available) is a small follow-up, not done here.
- **Streams adapters aren't connected to a real API.** `YouTubeSourceAdapter`,
  `FederationSourceAdapter`, and `PromoterSourceAdapter` all raise
  `NotImplementedError` by design — each requires confirming a specific
  federation/promoter's actual official channel or endpoint first, which I
  can't fabricate. `StreamSource.enabled` should stay `False` until that's
  done (the empty-state test confirms nothing is invented in the meantime).
- **No load testing, penetration testing, or dependency vulnerability scan
  ran against a live deployment** — only static checks (`ruff`, `bandit`)
  against source. `pip-audit` is in `requirements/dev.txt` but I did not
  run it here since it needs network access this sandbox doesn't reliably have.
- **No production deploy has happened.** Nothing here has touched a real
  domain, real DNS, or real user data.

## Running it locally

```bash
cd backend
cp .env.example .env          # fill in a real DJANGO_SECRET_KEY / JWT_SIGNING_KEY
docker compose up --build     # postgres + redis + web + celery worker/beat
docker compose exec web python manage.py migrate
docker compose exec web python manage.py createsuperuser
```

Run tests the same way this session did (no Docker required, SQLite/locmem
substitution):

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements/dev.txt
DJANGO_SETTINGS_MODULE=pugnera.settings.sandbox_test python manage.py migrate
DJANGO_SETTINGS_MODULE=pugnera.settings.sandbox_test python -m pytest apps/ -v
```

## Before this is production-ready

Everything in the spec's §37 checklist that depends on infrastructure you
control is still outstanding: real HTTPS/Cloudflare, real Postgres/Redis
with least-privilege credentials, tested backup restoration, a live
payment provider whose Zimbabwe availability and current terms you've
verified, admin MFA actually enforced, and a dependency vulnerability scan
run with network access. The code is structured so none of that requires
touching application logic — only configuration and one real payment
adapter class.
