from django.contrib import admin
from django.test import Client, TestCase, override_settings
from django.urls import reverse
from django_otp.oath import totp as compute_totp
from django_otp.plugins.otp_totp.models import TOTPDevice

from apps.accounts.models import Role, User


def _make_staff(email="staff@example.com", *, is_superuser=False):
    user = User(
        email=email, first_name="Staff", last_name="User", role=Role.ADMIN,
        is_email_verified=True, is_staff=True, is_superuser=is_superuser,
    )
    user.set_password("Str0ng!Passw0rd")
    user.full_clean(exclude=["password"])
    user.save()
    return user


class AdminMFATests(TestCase):
    """spec §18: admin access must require MFA, and the enforcement can't
    be bypassed by having the right password alone."""

    @override_settings(ADMIN_MFA_REQUIRED=True)
    def test_staff_without_otp_device_is_denied_admin_even_with_correct_password(self):
        user = _make_staff()
        client = Client()
        response = client.post(
            reverse("admin:login"), {"username": user.email, "password": "Str0ng!Passw0rd"}, follow=True,
        )
        # Login form re-renders with an error rather than granting a session.
        self.assertContains(response, "Enter a valid authentication code", status_code=200)
        self.assertFalse(response.wsgi_request.user.is_authenticated and admin.site.has_permission(response.wsgi_request))

    @override_settings(ADMIN_MFA_REQUIRED=True)
    def test_staff_with_valid_otp_token_is_granted_admin(self):
        user = _make_staff()
        device = TOTPDevice.objects.create(user=user, name="test", confirmed=True)
        valid_token = compute_totp(device.bin_key, device.step, device.t0, device.digits)
        client = Client()
        response = client.post(
            reverse("admin:login"),
            {"username": user.email, "password": "Str0ng!Passw0rd", "otp_token": f"{valid_token:0{device.digits}d}"},
            follow=True,
        )
        self.assertTrue(response.wsgi_request.user.is_authenticated)
        self.assertTrue(admin.site.has_permission(response.wsgi_request))

    @override_settings(ADMIN_MFA_REQUIRED=False)
    def test_mfa_not_required_in_dev_mode(self):
        """Dev/local environments aren't forced into MFA (ADMIN_MFA_REQUIRED
        defaults False there) so local work isn't blocked — production.py
        hardcodes this True regardless of env, which is covered by the
        settings-file assertion below rather than a live request test."""
        user = _make_staff()
        client = Client()
        response = client.post(
            reverse("admin:login"), {"username": user.email, "password": "Str0ng!Passw0rd"}, follow=True,
        )
        self.assertTrue(response.wsgi_request.user.is_authenticated)
        self.assertTrue(admin.site.has_permission(response.wsgi_request))

    def test_production_settings_force_admin_mfa_on(self):
        import importlib
        import os

        os.environ.setdefault("DJANGO_SECRET_KEY", "x" * 50)
        os.environ.setdefault("JWT_SIGNING_KEY", "x" * 50)
        os.environ.setdefault("DJANGO_ALLOWED_HOSTS", "example.com")
        os.environ.setdefault("CORS_ALLOWED_ORIGINS", "https://example.com")
        production = importlib.import_module("pugnera.settings.production")
        self.assertTrue(production.ADMIN_MFA_REQUIRED)


class NonStaffUserTests(TestCase):
    @override_settings(ADMIN_MFA_REQUIRED=True)
    def test_non_staff_user_still_rejected_regardless_of_mfa(self):
        user = User(email="fan@example.com", first_name="F", last_name="A", role=Role.FAN, is_email_verified=True)
        user.set_password("Str0ng!Passw0rd")
        user.full_clean(exclude=["password"])
        user.save()
        client = Client()
        response = client.post(
            reverse("admin:login"), {"username": user.email, "password": "Str0ng!Passw0rd"}, follow=True,
        )
        self.assertFalse(admin.site.has_permission(response.wsgi_request))
