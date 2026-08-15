from django.urls import path

from . import views
from .webhooks import ProviderWebhookView

urlpatterns = [
    path("intents/", views.CreatePaymentIntentView.as_view(), name="create-payment-intent"),
    path("refunds/", views.RefundRequestView.as_view(), name="request-refund"),
    path("webhooks/<slug:provider_key>/", ProviderWebhookView.as_view(), name="payment-webhook"),
]
