from django.utils import timezone
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny

from .models import Event
from .serializers import EventSerializer


class UpcomingEventListView(ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = EventSerializer

    def get_queryset(self):
        # Never show a past event as upcoming (both spec docs are explicit
        # about this).
        return Event.objects.filter(date__gte=timezone.now().date()).exclude(status="CANCELED").order_by("date")


class EventDetailView(RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = EventSerializer
    queryset = Event.objects.all()
    lookup_field = "id"
