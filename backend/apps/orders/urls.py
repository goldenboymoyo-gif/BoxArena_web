from django.urls import path

from . import views

urlpatterns = [
    path("", views.MyOrdersView.as_view(), name="my-orders"),
    path("<uuid:id>/", views.MyOrderDetailView.as_view(), name="my-order-detail"),
]
