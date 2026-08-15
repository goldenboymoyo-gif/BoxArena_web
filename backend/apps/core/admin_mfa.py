"""
Enforces MFA on the Django admin (spec §18: "Implement... MFA for
administrators. Never expose unnecessary administrative endpoints.").

Rather than requiring every app's admin.py to opt in individually (easy to
forget, and a single missed registration would be a full auth bypass),
this patches the single shared `admin.site` instance once, at app-ready
time, so *every* ModelAdmin registered anywhere in the project inherits
the same requirement automatically.

django_otp's OTPMiddleware (see MIDDLEWARE in settings/base.py) runs after
AuthenticationMiddleware and attaches a working `request.user.is_verified()`
method for every request — that's what we check here. A staff user without
a confirmed OTP device, or who hasn't completed OTP verification for this
session, is treated as not logged in to admin at all (not "logged in but
restricted") — this matches Django's own has_permission contract, so
existing per-model / per-user Django permissions still apply on top.
"""
from django.conf import settings
from django.contrib import admin

from .forms import AdminOTPAuthenticationForm

# Django's AdminSite.login() uses `self.login_form or AdminAuthenticationForm`
# — this is the documented extension point for adding fields/logic to the
# admin login form without replacing the whole login view.
admin.site.login_form = AdminOTPAuthenticationForm
admin.site.login_template = "admin/login.html"


def _has_permission(self, request):
    user = request.user
    if not (user.is_active and user.is_staff):
        return False
    if not getattr(settings, "ADMIN_MFA_REQUIRED", False):
        return True
    # django_otp adds this method to the user object during request
    # processing; if OTPMiddleware isn't installed for some reason, fail
    # closed rather than silently skipping the MFA check.
    is_verified = getattr(user, "is_verified", None)
    return bool(is_verified and is_verified())


# Bind directly onto the process-wide singleton so every `@admin.register`
# call across every app (which all target this same instance) picks it up.
admin.site.has_permission = _has_permission.__get__(admin.site, admin.site.__class__)
