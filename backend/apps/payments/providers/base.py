"""
Provider adapter interface (spec §33).

Pugnera's core (services.py, webhooks.py) only ever talks to this
interface — never to a specific processor's SDK directly. Adding a new
country/processor means writing one adapter class and registering it in
settings.PAYMENT_PROVIDERS; nothing else in the codebase changes.

Do not implement a real adapter (Paynow, Stripe, Flutterwave, etc.) here
until that provider's current Zimbabwe availability, PCI posture, webhook
signing scheme, and refund/chargeback API have been verified against their
live documentation (spec §33, §39). Until then, MockProviderAdapter is the
only registered adapter and must never be used with real money.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class ProviderIntentResult:
    provider_intent_id: str
    status: str
    client_payload: dict = field(default_factory=dict)  # e.g. client_secret, redirect_url
    provider_reference: dict = field(default_factory=dict)


@dataclass
class ProviderRefundResult:
    provider_refund_id: str
    status: str
    provider_response: dict = field(default_factory=dict)


@dataclass
class NormalizedWebhookEvent:
    event_id: str
    event_type: str
    provider_transaction_id: str
    status: str
    amount: str  # decimal-as-string, compared against our own record — never trusted alone
    currency: str
    order_reference: str
    payload: dict


class PaymentProviderAdapter(ABC):
    """One implementation per payment processor."""

    key: str

    @abstractmethod
    def create_intent(self, *, amount, currency: str, order_reference: str, customer_id: str, idempotency_key: str) -> ProviderIntentResult:
        ...

    @abstractmethod
    def verify_webhook_signature(self, *, raw_body: bytes, headers: dict) -> bool:
        """Must return False on any malformed/missing/invalid signature.
        Callers must reject the request outright when this is False —
        never fall back to processing an unverified payload (spec §9)."""
        ...

    @abstractmethod
    def parse_webhook_event(self, *, raw_body: bytes, headers: dict) -> NormalizedWebhookEvent:
        ...

    @abstractmethod
    def create_refund(self, *, provider_transaction_id: str, amount, reason: str) -> ProviderRefundResult:
        ...
