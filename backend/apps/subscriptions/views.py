from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from . import services
from .models import Subscription
from .serializers import SubscriptionSerializer


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
