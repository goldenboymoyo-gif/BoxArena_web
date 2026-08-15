from django.urls import path

from . import views

urlpatterns = [
    path("", views.UpcomingEventListView.as_view(), name="event-list"),
    path("<uuid:id>/", views.EventDetailView.as_view(), name="event-detail"),
]
