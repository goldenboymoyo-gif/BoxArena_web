import os

import django
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pugnera.settings.production")
django.setup()

from apps.live.middleware import JWTAuthMiddleware  # noqa: E402
from apps.live.routing import websocket_urlpatterns  # noqa: E402

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": JWTAuthMiddleware(URLRouter(websocket_urlpatterns)),
    }
)
