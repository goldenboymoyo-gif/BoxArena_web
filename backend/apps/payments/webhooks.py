from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.throttling import WebhookIPThrottle

from . import services


class ProviderWebhookView(APIView):
    """Public by necessity (the provider calls this, not a logged-in user)
    — authorization comes entirely from signature verification inside
    services.process_webhook, not from DRF permission classes (spec §9)."""

    permission_classes = [AllowAny]
    throttle_classes = [WebhookIPThrottle]
    authentication_classes = []  # no user session; auth is the provider signature

    def post(self, request, provider_key: str):
        raw_body = request.body
        try:
            webhook_row, result = services.process_webhook(
                provider_key=provider_key, raw_body=raw_body, headers=request.headers
            )
        except services.WebhookVerificationError:
            return Response({"detail": "Invalid signature."}, status=400)
        except services.WebhookValidationError as exc:
            return Response({"detail": str(exc)}, status=400)

        return Response({"result": result}, status=200)
