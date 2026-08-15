"""
Admin login form with an OTP step folded in (spec §18: admin MFA).

We extend Django's own AdminAuthenticationForm rather than building a
separate second-step view, so the existing /admin/login/ URL, redirect
handling, and "next" parameter all keep working unmodified — only the
form (and its template, see templates/admin/login.html) change.
"""
from django.conf import settings
from django_otp import match_token
from django.contrib.admin.forms import AdminAuthenticationForm
from django.core.exceptions import ValidationError
from django.forms import CharField
from django.utils.translation import gettext_lazy as _


class AdminOTPAuthenticationForm(AdminAuthenticationForm):
    otp_token = CharField(
        label=_("Authentication code"), required=False, max_length=12,
        help_text=_("6-digit code from your authenticator app."),
    )

    def clean(self):
        cleaned_data = super().clean()  # validates username/password, sets self.user_cache

        if not getattr(settings, "ADMIN_MFA_REQUIRED", False):
            return cleaned_data
        user = self.user_cache
        if user is None or not user.is_staff:
            return cleaned_data  # let the parent form's own error stand

        token = cleaned_data.get("otp_token", "")
        device = match_token(user, token) if token else None
        if device is None:
            raise ValidationError(
                _(
                    "Enter a valid authentication code. If you don't have a "
                    "device enrolled yet, ask an existing admin to run "
                    "`manage.py enroll_admin_totp <email>` for your account."
                ),
                code="invalid_otp",
            )
        # At this point in the form lifecycle, django.contrib.auth.login()
        # hasn't run yet (LoginView calls it after form_valid()), so
        # request.user is still anonymous and django_otp.login(request,
        # device) would silently no-op (it requires device.user_id ==
        # request.user.pk). Instead we stash the device on the user object;
        # django_otp's own user_logged_in signal receiver
        # (_handle_auth_login) picks up `user.otp_device` and persists it
        # to the session at the correct point, right after real login.
        user.otp_device = device
        return cleaned_data
