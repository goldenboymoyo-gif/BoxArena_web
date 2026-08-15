from django.urls import path

from . import views

urlpatterns = [
    path("mine/", views.MySubscriptionView.as_view(), name="my-subscription"),
    path("<uuid:id>/cancel/", views.CancelMySubscriptionView.as_view(), name="cancel-subscription"),
]
