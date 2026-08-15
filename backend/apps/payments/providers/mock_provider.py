"""
MockProviderAdapter — sandbox-only stand-in for a real PCI-compliant
processor.

THIS ADAPTER MUST NEVER BE USED IN A REAL-MONEY ENVIRONMENT. It exists so
the rest of the payment pipeline (PaymentIntent creation, webhook
signature verification, idempotency, entitlement granting, refunds) can be
built, exercised, and tested end-to-end today, without either (a) hardcoding
Pugnera to a specific processor before its Zimbabwe availability has been
verified, or (b) leaving the payment core completely unbuilt/untested.

Swapping in a real provider means: implement PaymentProviderAdapter against
their verified docs, register it in settings.PAYMENT_PROVIDERS, and flip
ACTIVE_PAYMENT_PROVIDER. apps.payments.services and the webhook view do not
change.
"""
import hashlib
import hmac
import json
import uuid

from django.conf import settings

from .base import (
    NormalizedWebhookEvent,
    PaymentProviderAdapter,
    ProviderIntentResult,
    ProviderRefundResult,
)


def _secret() -> bytes:
    secret = getattr(settings, "MOCK_PROVIDER_WEBHOOK_SECRET", None) or "mock-dev-secret-do-not-use-in-prod"
    return secret.encode()


def sign_payload(payload: dict) -> str:
    """DEPRECATED for request construction: kept only so existing callers
    that already serialize with sort_keys=True still verify. Prefer
    build_signed_request(), which guarantees the signature matches the
    exact bytes transmitted — see the note there for why that matters."""
    body = json.dumps(payload, sort_keys=True).encode()
    return hmac.new(_secret(), body, hashlib.sha256).hexdigest()


def build_signed_request(payload: dict) -> tuple[bytes, str]:
    """Serializes `payload` exactly once and signs those exact bytes, so
    the caller cannot accidentally sign a different byte sequence than the
    one actually transmitted (that mismatch — e.g. dict key order differing
    between the signed copy and the POSTed body — would make every
    signature check fail even though both sides "agree" on the payload).
    Tests and any mock-webhook simulator should use this rather than
    hand-rolling json.dumps + sign_payload separately.
    """
    body = json.dumps(payload, sort_keys=True).encode()
    signature = hmac.new(_secret(), body, hashlib.sha256).hexdigest()
    return body, signature


class MockProviderAdapter(PaymentProviderAdapter):
    key = "mock"

    def create_intent(self, *, amount, currency, order_reference, customer_id, idempotency_key):
        provider_intent_id = f"mock_intent_{uuid.uuid4().hex}"
        return ProviderIntentResult(
            provider_intent_id=provider_intent_id,
            status="REQUIRES_PAYMENT",
            client_payload={"client_secret": f"mock_secret_{uuid.uuid4().hex}"},
            provider_reference={"order_reference": order_reference, "customer_id": customer_id},
        )

    def verify_webhook_signature(self, *, raw_body: bytes, headers: dict) -> bool:
        signature = headers.get("X-Mock-Signature", "")
        if not signature:
            return False
        expected = hmac.new(_secret(), raw_body, hashlib.sha256).hexdigest()
        # constant-time comparison — never use `==` on secrets/signatures
        return hmac.compare_digest(signature, expected)

    def parse_webhook_event(self, *, raw_body: bytes, headers: dict) -> NormalizedWebhookEvent:
        payload = json.loads(raw_body.decode())
        return NormalizedWebhookEvent(
            event_id=payload["event_id"],
            event_type=payload["event_type"],
            provider_transaction_id=payload["provider_transaction_id"],
            status=payload["status"],
            amount=str(payload["amount"]),
            currency=payload["currency"],
            order_reference=payload.get("order_reference", ""),
            payload=payload,
        )

    def create_refund(self, *, provider_transaction_id, amount, reason):
        return ProviderRefundResult(
            provider_refund_id=f"mock_refund_{uuid.uuid4().hex}",
            status="SUCCEEDED",
            provider_response={"provider_transaction_id": provider_transaction_id, "reason": reason},
        )
