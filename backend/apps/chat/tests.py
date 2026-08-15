from django.test import TestCase

from apps.accounts.models import FanProfile, Role, User

from . import services
from .models import MAX_MESSAGE_LENGTH


def _user(email):
    user = User(email=email, first_name="Test", last_name="User", role=Role.FAN, is_email_verified=True)
    user.set_password("Str0ng!Passw0rd")
    user.full_clean(exclude=["password"])
    user.save()
    FanProfile.objects.create(user=user)
    return user


class ChatServiceTests(TestCase):
    def setUp(self):
        self.user = _user("chatter@example.com")

    def test_message_over_length_limit_rejected(self):
        with self.assertRaises(services.ChatError):
            services.send_message(user=self.user, room="event-1", text="x" * (MAX_MESSAGE_LENGTH + 1))

    def test_empty_message_rejected(self):
        with self.assertRaises(services.ChatError):
            services.send_message(user=self.user, room="event-1", text="   ")

    def test_rate_limit_blocks_rapid_messages(self):
        services.send_message(user=self.user, room="event-1", text="first message")
        with self.assertRaises(services.ChatError):
            services.send_message(user=self.user, room="event-1", text="second message immediately after")

    def test_blocking_hides_future_messages_from_blocked_ids(self):
        other = _user("annoying@example.com")
        services.block_user(blocker=self.user, blocked_id=other.id)
        self.assertIn(other.id, services.blocked_user_ids(self.user))
