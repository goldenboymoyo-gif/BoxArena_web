from django.urls import re_path

from .consumers import LiveChatConsumer

websocket_urlpatterns = [
    re_path(r"^ws/live/(?P<room>[\w-]+)/$", LiveChatConsumer.as_asgi()),
]
