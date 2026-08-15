from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsFinanceOrAdmin

from . import services
from .models import PaymentTransaction
from .serializers import (
    CreatePaymentIntentSerializer,
    PaymentIntentSerializer,
    RefundRequestSerializer,
    RefundSerializer,
)


class CreatePaymentIntentView(APIView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "payment-create"

    def post(self, request):
        serializer = CreatePaymentIntentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from apps.orders.models import Order

        try:
            order = Order.objects.get(id=serializer.validated_data["order_id"])
        except Order.DoesNotExist:
            return Response({"detail": "Order not found."}, status=404)

        try:
            intent, client_payload = services.create_payment_intent_for_order(user=request.user, order=order)
        except PermissionError:
            return Response({"detail": "Order not found."}, status=404)  # don't confirm existence to non-owners
        except services.PaymentError as exc:
            return Response({"detail": str(exc)}, status=400)

        return Response({"intent": PaymentIntentSerializer(intent).data, **client_payload}, status=201)


class RefundRequestView(APIView):
    """Refunds are restricted to FINANCE/ADMIN/SUPERADMIN — an ordinary
    user cannot call this against their own transaction (spec §14)."""

    permission_classes = [IsAuthenticated, IsFinanceOrAdmin]
    throttle_scope = "refund-request"

    def post(self, request):
        serializer = RefundRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            txn = PaymentTransaction.objects.get(id=serializer.validated_data["transaction_id"])
        except PaymentTransaction.DoesNotExist:
            return Response({"detail": "Transaction not found."}, status=404)

        refund = services.request_refund(
            transaction_obj=txn,
            amount=serializer.validated_data["amount"],
            reason=serializer.validated_data["reason"],
            requested_by=request.user,
        )
        refund = services.approve_refund(refund=refund, approved_by=request.user)
        return Response(RefundSerializer(refund).data, status=201)
