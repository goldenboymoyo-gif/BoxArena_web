from django.urls import path

from . import views

urlpatterns = [
    path("", views.MyNotificationsView.as_view(), name="my-notifications"),
    path("<uuid:id>/read/", views.MarkNotificationReadView.as_view(), name="mark-notification-read"),
]
