from django.test import TestCase

from apps.accounts.models import DeviceSession, Role, User

from .services import take_action


def _user(email):
    user = User(email=email, first_name="T", last_name="U", role=Role.FAN, is_email_verified=True)
    user.set_password("Str0ng!Passw0rd")
    user.full_clean(exclude=["password"])
    user.save()
    return user


class ModerationBanTests(TestCase):
    def test_ban_deactivates_user_and_revokes_sessions(self):
        target = _user("target@example.com")
        moderator = _user("mod@example.com")
        DeviceSession.objects.create(user=target, refresh_token_jti="jti-1")

        take_action(target_user=target, moderator=moderator, action_type="BAN", reason="spam")

        target.refresh_from_db()
        self.assertFalse(target.is_active)
        self.assertFalse(DeviceSession.objects.filter(user=target, revoked_at__isnull=True).exists())

    def test_warn_does_not_deactivate_or_revoke(self):
        target = _user("target2@example.com")
        moderator = _user("mod2@example.com")
        DeviceSession.objects.create(user=target, refresh_token_jti="jti-2")

        take_action(target_user=target, moderator=moderator, action_type="WARN", reason="first offense")

        target.refresh_from_db()
        self.assertTrue(target.is_active)
        self.assertTrue(DeviceSession.objects.filter(user=target, revoked_at__isnull=True).exists())
