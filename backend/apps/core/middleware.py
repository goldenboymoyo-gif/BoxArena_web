import uuid


class RequestIdMiddleware:
    """Attach a correlation id to every request for audit-log / Sentry
    cross-referencing without exposing internal details to the client."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        response = self.get_response(request)
        response["X-Request-ID"] = request.request_id
        return response


class SecurityHeadersMiddleware:
    """Adds headers not fully covered by Django's built-in security
    middleware (PUGNERA spec §16). CSP is deliberately strict; loosen only
    for specific paths that need it (e.g. Django admin) with care.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response.setdefault(
            "Content-Security-Policy",
            "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; "
            "object-src 'none'",
        )
        response.setdefault("X-Content-Type-Options", "nosniff")
        response.setdefault("Referrer-Policy", "same-origin")
        response.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        return response
