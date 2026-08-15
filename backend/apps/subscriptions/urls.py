from django.urls import path

from . import views

urlpatterns = [
    path("plans/", views.PlanListView.as_view(), name="plan-list"),
    path("subscribe/", views.StartSubscriptionView.as_view(), name="start-subscription"),
    path("mine/", views.MySubscriptionView.as_view(), name="my-subscription"),
    path("<uuid:id>/cancel/", views.CancelMySubscriptionView.as_view(), name="cancel-subscription"),
]
