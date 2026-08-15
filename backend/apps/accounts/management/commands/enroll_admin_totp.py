"""
Bootstraps a TOTP device for a staff user (spec §18: admin MFA).

Run this from a trusted shell (server console / `docker compose exec`) —
never expose device enrollment over an HTTP endpoint, since that would let
whoever can reach the endpoint add their own MFA device to someone else's
account. This has to be a superuser-operated, out-of-band step, which is
exactly why it's a management command rather than an admin view: the
regular admin views are themselves gated by MFA once ADMIN_MFA_REQUIRED is
on, so the *first* device for the *first* admin can't be created through
the admin UI at all — this command is the deliberate escape hatch.
"""
from django_otp.plugins.otp_totp.models import TOTPDevice

from django.core.management.base import BaseCommand, CommandError

from apps.accounts.models import User
from apps.audit.services import record_audit_event


class Command(BaseCommand):
    help = "Create (or replace) a confirmed TOTP device for a staff user, printing the provisioning URI to scan."

    def add_arguments(self, parser):
        parser.add_argument("email", type=str)

    def handle(self, *args, **options):
        email = options["email"]
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist as exc:
            raise CommandError(f"No user with email {email!r}.") from exc

        if not user.is_staff:
            raise CommandError(
                f"{email} is not a staff user. Grant is_staff via `manage.py shell` or the database "
                "before enrolling an MFA device for admin access."
            )

        # Replace any existing device rather than accumulating stale ones —
        # this command is meant for (re-)bootstrapping, not adding
        # additional devices for a user who already has one.
        TOTPDevice.objects.filter(user=user, name="admin-bootstrap").delete()
        device = TOTPDevice.objects.create(user=user, name="admin-bootstrap", confirmed=True)

        record_audit_event(
            action="account.admin_totp_enrolled", actor_label="console", object_type="user", object_id=user.id,
        )

        self.stdout.write(self.style.SUCCESS(f"TOTP device created for {email}."))
        self.stdout.write("Add it to an authenticator app using this provisioning URI:")
        self.stdout.write(device.config_url)
