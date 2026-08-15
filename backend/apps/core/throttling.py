from rest_framework.throttling import ScopedRateThrottle, SimpleRateThrottle


class ScopedRedisRateThrottle(ScopedRateThrottle):
    """Redis-backed (via CACHES["default"]) scoped throttle. Views opt in
    with `throttle_scope = "login" | "register" | "payment-create" | ...`
    matching REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"].
    """


class WebhookIPThrottle(SimpleRateThrottle):
    """Extra ceiling on inbound webhook volume, independent of provider
    signature validity, to blunt request-flooding against the webhook
    endpoint (see PUGNERA spec §9, §28)."""

    scope = "webhook"

    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": ident}
