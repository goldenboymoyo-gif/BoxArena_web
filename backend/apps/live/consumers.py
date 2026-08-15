"""
Live chat consumer. Thin transport: identity comes from
JWTAuthMiddleware-populated scope["user"]; message validation, rate
limiting, and persistence all happen in apps.chat.services so the rules
are testable without a socket (spec §26).
"""
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

MODERATOR_ROLES = {"MODERATOR", "ADMIN", "SUPERADMIN"}


class LiveChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        if user is None or not user.is_authenticated:
            # Unauthenticated connections are rejected outright, never
            # allowed to lurk/read as anonymous (spec §26).
            await self.close(code=4001)
            return

        self.room_name = self.scope["url_route"]["kwargs"]["room"]
        self.group_name = f"chat_{self.room_name}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        text = content.get("text", "")
        user = self.scope["user"]

        message = await self._persist_message(user, text)
        if message is None:
            await self.send_json({"type": "error", "detail": self._last_error})
            return

        # Mod badge is derived from the authenticated user's server-side
        # role, never from anything the client sent — prevents mod
        # impersonation (spec §26).
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.message",
                "id": str(message.id),
                "author": user.full_name,
                "author_id": str(user.id),
                "is_mod": user.role in MODERATOR_ROLES,
                "text": message.text,
                "created_at": message.created_at.isoformat(),
            },
        )

    async def chat_message(self, event):
        await self.send_json(
            {
                "type": "message",
                "id": event["id"],
                "author": event["author"],
                "author_id": event["author_id"],
                "is_mod": event["is_mod"],
                "text": event["text"],
                "created_at": event["created_at"],
            }
        )

    @database_sync_to_async
    def _persist_message(self, user, text):
        from apps.chat.services import ChatError, send_message

        try:
            return send_message(user=user, room=self.room_name, text=text)
        except ChatError as exc:
            self._last_error = str(exc)
            return None
