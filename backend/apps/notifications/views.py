from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class MyNotificationsView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        # Scoped to request.user only (spec §8 principle applied here too).
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")


class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        from django.utils import timezone

        updated = Notification.objects.filter(id=id, user=request.user, read_at__isnull=True)
        if not updated.exists():
            return Response({"detail": "Notification not found."}, status=404)
        updated.update(read_at=timezone.now())
        return Response({"detail": "Marked as read."})
