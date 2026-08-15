from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from apps.core.permissions import IsAdminOrSuperAdmin

from . import services
from .models import LiveEvent, LiveEventStatus, StreamSource
from .serializers import LiveEventSerializer, StreamSourceAdminSerializer


class LiveFeedView(APIView):
    """Public. Returns the prioritized VERIFIED+LIVE+FREE > ... feed, or an
    honest empty list — never fabricated events (spec §12-13)."""

    permission_classes = [AllowAny]

    def get(self, request):
        events = services.get_live_feed()
        return Response(LiveEventSerializer(events, many=True).data)


class UpcomingEventsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # Never show a past event under "upcoming" (spec §11 in both specs).
        from django.utils import timezone

        events = LiveEvent.objects.filter(
            is_verified=True, status=LiveEventStatus.UPCOMING, start_time__gte=timezone.now()
        ).order_by("start_time")
        return Response(LiveEventSerializer(events, many=True).data)


class CompletedEventsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        events = LiveEvent.objects.filter(is_verified=True, status=LiveEventStatus.COMPLETED).order_by("-start_time")
        return Response(LiveEventSerializer(events, many=True).data)


class StreamSourceAdminViewSet(ModelViewSet):
    """Admin-only source management (spec §14): enable/disable/verify a
    source without ever touching frontend code."""

    permission_classes = [IsAuthenticated, IsAdminOrSuperAdmin]
    serializer_class = StreamSourceAdminSerializer
    queryset = StreamSource.objects.all().order_by("name")

    def perform_update(self, serializer):
        previous = self.get_object()
        instance = serializer.save()
        if previous.enabled != instance.enabled:
            services.set_source_enabled(instance, enabled=instance.enabled, actor=self.request.user)
        if previous.verified != instance.verified:
            services.set_source_verified(instance, verified=instance.verified, actor=self.request.user)
