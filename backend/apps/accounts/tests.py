from django.core import mail
from django.urls import reverse
from rest_framework.test import APITestCase

from .models import EmailVerificationToken, Role, User


def _register(client, **overrides):
    payload = {
        "email": "fan@example.com",
        "password": "Str0ng!Passw0rd",
        "first_name": "Jordan",
        "last_name": "Diaz",
        "country": "ZW",
        "city": "Harare",
        "role": "FAN",
    }
    payload.update(overrides)
    return client.post(reverse("register"), payload, format="multipart")


class RegistrationTests(APITestCase):
    def test_fan_can_register(self):
        response = _register(self.client)
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email="fan@example.com")
        self.assertEqual(user.role, Role.FAN)
        self.assertFalse(user.is_email_verified)
        self.assertTrue(hasattr(user, "fan_profile"))

    def test_boxer_registration_requires_boxer_profile(self):
        response = _register(
            self.client, email="boxer@example.com", role="BOXER",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("boxer_profile", response.data)

    def test_boxer_can_register_with_profile(self):
        response = self.client.post(
            reverse("register"),
            {
                "email": "boxer@example.com",
                "password": "Str0ng!Passw0rd",
                "first_name": "Terence",
                "last_name": "Crawford",
                "country": "US",
                "city": "Omaha",
                "role": "BOXER",
                "boxer_profile": {"weight_class": "Welterweight", "stance": "ORTHODOX"},
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email="boxer@example.com")
        self.assertTrue(hasattr(user, "boxer_profile"))
        self.assertEqual(user.boxer_profile.verification_status, "UNVERIFIED")

    def test_cannot_self_register_as_admin(self):
        """Frontend/API client sending role=ADMIN must never be honored (spec §14)."""
        response = _register(self.client, email="wannabe-admin@example.com", role="ADMIN")
        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.filter(email="wannabe-admin@example.com").exists())

    def test_registration_sends_verification_email_not_a_token(self):
        _register(self.client)
        self.assertEqual(len(mail.outbox), 1)
        user = User.objects.get(email="fan@example.com")
        self.assertTrue(EmailVerificationToken.objects.filter(user=user).exists())


class LoginTests(APITestCase):
    def setUp(self):
        _register(self.client)
        self.user = User.objects.get(email="fan@example.com")

    def test_cannot_login_before_verifying_email(self):
        response = self.client.post(
            reverse("login"), {"email": "fan@example.com", "password": "Str0ng!Passw0rd"}
        )
        self.assertEqual(response.status_code, 403)

    def test_login_after_verification_issues_tokens(self):
        token = EmailVerificationToken.objects.get(user=self.user)
        self.client.post(reverse("verify-email"), {"token": str(token.id)})

        response = self.client.post(
            reverse("login"), {"email": "fan@example.com", "password": "Str0ng!Passw0rd"}
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        # Never leak the password hash back to the client.
        self.assertNotIn("password", response.data["user"])

    def test_wrong_password_returns_generic_error(self):
        response = self.client.post(reverse("login"), {"email": "fan@example.com", "password": "wrong"})
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data["detail"], "Invalid email or password.")


class MeOwnershipTests(APITestCase):
    """Spec §8: a user must never be able to modify another user's profile
    by manipulating an id — MeView only ever operates on request.user."""

    def setUp(self):
        _register(self.client, email="user-a@example.com")
        _register(self.client, email="user-b@example.com")
        for email in ("user-a@example.com", "user-b@example.com"):
            user = User.objects.get(email=email)
            user.is_email_verified = True
            user.save(update_fields=["is_email_verified"])
        login_a = self.client.post(reverse("login"), {"email": "user-a@example.com", "password": "Str0ng!Passw0rd"})
        self.token_a = login_a.data["access"]

    def test_me_endpoint_cannot_be_redirected_to_another_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token_a}")
        response = self.client.get(reverse("me"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], "user-a@example.com")

        patch_response = self.client.patch(reverse("me"), {"city": "Bulawayo"})
        self.assertEqual(patch_response.status_code, 200)
        self.assertEqual(User.objects.get(email="user-b@example.com").city, "Harare")

    def test_unauthenticated_request_is_rejected(self):
        self.client.credentials()
        response = self.client.get(reverse("me"))
        self.assertEqual(response.status_code, 401)


class LogoutTests(APITestCase):
    def setUp(self):
        _register(self.client)
        user = User.objects.get(email="fan@example.com")
        user.is_email_verified = True
        user.save(update_fields=["is_email_verified"])
        login = self.client.post(reverse("login"), {"email": "fan@example.com", "password": "Str0ng!Passw0rd"})
        self.access = login.data["access"]
        self.refresh = login.data["refresh"]

    def test_logout_revokes_refresh_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.access}")
        response = self.client.post(reverse("logout"), {"refresh": self.refresh})
        self.assertEqual(response.status_code, 200)

        refresh_response = self.client.post(reverse("token-refresh"), {"refresh": self.refresh})
        self.assertEqual(refresh_response.status_code, 401)


class MyBoxerProfileTests(APITestCase):
    """Previously a boxer had no way to edit gym/bio/social/highlight
    fields after registration at all. Ownership follows the same pattern
    as MeView: only request.user.boxer_profile, never an id from the
    request (spec §8)."""

    def setUp(self):
        self.client.post(
            reverse("register"),
            {
                "email": "boxer@example.com", "password": "Str0ng!Passw0rd",
                "first_name": "Terence", "last_name": "Crawford",
                "country": "US", "city": "Omaha", "role": "BOXER",
                "boxer_profile": {"weight_class": "Welterweight", "stance": "ORTHODOX"},
            },
            format="json",
        )
        self.user = User.objects.get(email="boxer@example.com")
        self.user.is_email_verified = True
        self.user.save(update_fields=["is_email_verified"])
        self.client.force_authenticate(self.user)

    def test_boxer_can_set_own_highlight_video_url(self):
        response = self.client.patch(
            reverse("my-boxer-profile"),
            {"highlight_video_url": "https://youtube.com/watch?v=abc", "biography": "Undefeated."},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["highlight_video_url"], "https://youtube.com/watch?v=abc")
        self.user.boxer_profile.refresh_from_db()
        self.assertEqual(self.user.boxer_profile.biography, "Undefeated.")

    def test_fan_without_boxer_profile_gets_404_not_error(self):
        _register(self.client, email="fan-only@example.com")
        fan_user = User.objects.get(email="fan-only@example.com")
        fan_user.is_email_verified = True
        fan_user.save(update_fields=["is_email_verified"])
        self.client.force_authenticate(fan_user)
        response = self.client.patch(reverse("my-boxer-profile"), {"biography": "x"}, format="json")
        self.assertEqual(response.status_code, 404)

    def test_unauthenticated_request_is_rejected(self):
        self.client.force_authenticate(user=None)
        response = self.client.patch(reverse("my-boxer-profile"), {"biography": "x"}, format="json")
        self.assertEqual(response.status_code, 401)
