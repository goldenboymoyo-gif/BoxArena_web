from django.urls import path

from . import views

urlpatterns = [
    path("mine/", views.MyTicketsView.as_view(), name="my-tickets"),
    path("<uuid:id>/qr/", views.TicketQrCodeView.as_view(), name="ticket-qr"),
    path("scan/", views.ScanTicketView.as_view(), name="scan-ticket"),
]
