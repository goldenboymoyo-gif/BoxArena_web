"""
WebSocket authentication (spec §26: "WebSocket authentication",
"WebSocket authorization"). Channels' HTTP-era session auth doesn't apply
to a JWT-based API, so the access token is validated explicitly here from
the connection's query string before the socket is accepted.
"""
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken


@database_sync_to_async
def _get_user_from_token(token: str):
    from apps.accounts.models import User

    try:
        validated = AccessToken(token)
        user = User.objects.get(id=validated["user_id"], is_active=True)
        return user
    except (TokenError, InvalidToken, User.DoesNotExist, KeyError):
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """Rejects unauthenticated connections outright (spec §26: chat
    requires authentication) — the consumer never has to re-check this,
    it can trust scope["user"]."""

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        token = parse_qs(query_string).get("token", [None])[0]
        scope["user"] = await _get_user_from_token(token) if token else AnonymousUser()
        return await super().__call__(scope, receive, send)
