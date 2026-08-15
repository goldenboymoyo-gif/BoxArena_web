from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("admin/sources", views.StreamSourceAdminViewSet, basename="stream-source-admin")

urlpatterns = [
    path("live/", views.LiveFeedView.as_view(), name="live-feed"),
    path("upcoming/", views.UpcomingEventsView.as_view(), name="upcoming-events"),
    path("completed/", views.CompletedEventsView.as_view(), name="completed-events"),
] + router.urls
