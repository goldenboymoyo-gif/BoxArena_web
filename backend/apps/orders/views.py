from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated

from .models import Order
from .serializers import OrderSerializer


class MyOrdersView(ListAPIView):
    """Scoped to request.user only — a user can never list or fetch another
    user's orders by manipulating an id (spec §8)."""

    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by("-created_at")


class MyOrderDetailView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    lookup_field = "id"

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)
