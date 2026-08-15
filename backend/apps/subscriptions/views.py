from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.payments import services as payment_services
from apps.payments.serializers import PaymentIntentSerializer

from . import services
from .models import Plan, Subscription
from .serializers import PlanSerializer, StartSubscriptionSerializer, SubscriptionSerializer


class PlanListView(ListAPIView):
    """Public plan catalog — e.g. the $10/mo (or $100/yr) PREMIUM plan fans
    subscribe to for free live-stream access, and boxers subscribe to for
    boosted directory placement. Same plans serve both roles; what premium
    unlocks differs by the subscriber's role, not by plan (see
    apps.streams.serializers and apps.fighters.services)."""

    permission_classes = [AllowAny]
    serializer_class = PlanSerializer
    queryset = Plan.objects.filter(is_active=True).order_by("tier", "billing_interval")


class StartSubscriptionView(APIView):
    """Begins a subscription purchase: creates a not-yet-entitling
    Subscription row (INCOMPLETE) plus a payment intent for it. Mirrors the
    ticket-purchase flow — actual premium access is only granted once
    apps.payments.services confirms a verified webhook (spec §11-12)."""

    permission_classes = [IsAuthenticated]
    throttle_scope = "payment-create"

    def post(self, request):
        serializer = StartSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            plan = Plan.objects.get(id=serializer.validated_data["plan_id"], is_active=True)
        except Plan.DoesNotExist:
            return Response({"detail": "Plan not found."}, status=404)

        try:
            subscription = services.start_subscription(request.user, plan)
            intent, client_payload = payment_services.create_payment_intent_for_subscription(
                user=request.user, subscription=subscription,
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=400)
        except payment_services.PaymentError as exc:
            return Response({"detail": str(exc)}, status=400)

        return Response(
            {
                "subscription": SubscriptionSerializer(subscription).data,
                "intent": PaymentIntentSerializer(intent).data,
                **client_payload,
            },
            status=201,
        )


class MySubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Scoped to request.user only (spec §8).
        sub = Subscription.objects.filter(user=request.user).order_by("-created_at").first()
        if sub is None:
            return Response(None)
        return Response(SubscriptionSerializer(sub).data)


class CancelMySubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        try:
            sub = Subscription.objects.get(id=id, user=request.user)
        except Subscription.DoesNotExist:
            return Response({"detail": "Subscription not found."}, status=404)
        sub = services.cancel_subscription(sub, requested_by=request.user)
        return Response(SubscriptionSerializer(sub).data)
