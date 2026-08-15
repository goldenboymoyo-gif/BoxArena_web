from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task
def send_verification_email(user_email: str, token: str):
    # NEVER log the token value itself (spec §4, §29) — only that an email
    # was dispatched.
    verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    send_mail(
        subject="Verify your Pugnera account",
        message=f"Welcome to Pugnera. Verify your email: {verify_url}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
    )


@shared_task
def send_password_reset_email(user_email: str, token: str):
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    send_mail(
        subject="Reset your Pugnera password",
        message=(
            "We received a request to reset your Pugnera password. "
            f"If this was you, continue here: {reset_url}\n\n"
            "This link expires shortly and can only be used once. "
            "If you didn't request this, you can ignore this email."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user_email],
    )


@shared_task
def process_account_deletion(deletion_request_id: str):
    from apps.accounts.services import execute_account_deletion

    execute_account_deletion(deletion_request_id)
