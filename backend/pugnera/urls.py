from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/payments/", include("apps.payments.urls")),
    path("api/v1/orders/", include("apps.orders.urls")),
    path("api/v1/tickets/", include("apps.tickets.urls")),
    path("api/v1/subscriptions/", include("apps.subscriptions.urls")),
    path("api/v1/streams/", include("apps.streams.urls")),
    path("api/v1/fighters/", include("apps.fighters.urls")),
    path("api/v1/events/", include("apps.events.urls")),
    path("api/v1/notifications/", include("apps.notifications.urls")),
    path("api/v1/search/", include("apps.search.urls")),
]
