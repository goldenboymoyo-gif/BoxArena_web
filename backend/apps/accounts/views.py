from django.contrib.auth import authenticate
from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from apps.audit.services import record_audit_event
from apps.core.validators import safe_storage_key, validate_image_upload

from . import services
from .models import AccountDeletionRequest, DeviceSession
from .serializers import (
    AccountDeletionRequestSerializer,
    ChangePasswordSerializer,
    DeviceSessionSerializer,
    MeSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UpdateMeSerializer,
)


def _client_ip(request):
    return request.META.get("REMOTE_ADDR")


class RegisterView(generics.CreateAPIView):
    """Public registration. Choosing role=ADMIN/MODERATOR/etc. is rejected
    by RegisterSerializer.validate_role — only FAN/BOXER may self-register
    (spec §1, §14). No JWT is issued here: the account must verify its
    email before it can log in (spec §16)."""

    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer
    throttle_scope = "register"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        services.issue_email_verification(user)
        record_audit_event(
            action="account.registered", actor=user, object_type="user", object_id=user.id,
            ip_address=_client_ip(request), metadata={"role": user.role},
        )
        return Response(
            {"detail": "Account created. Check your email to verify your address before logging in."},
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token")
        if not token or not services.consume_email_verification(token):
            return Response({"detail": "Invalid or expired verification link."}, status=400)
        return Response({"detail": "Email verified. You can now log in."})


class ResendVerificationView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "register"

    def post(self, request):
        from .models import User

        email = request.data.get("email", "")
        # Always return the same response regardless of whether the email
        # exists, so this endpoint can't be used to enumerate accounts.
        try:
            user = User.objects.get(email__iexact=email, is_email_verified=False)
            services.issue_email_verification(user)
        except User.DoesNotExist:
            pass
        return Response({"detail": "If that account exists and is unverified, a new link has been sent."})


class LoginView(APIView):
    """Custom login instead of SimpleJWT's stock TokenObtainPairView so we
    can enforce email verification and create a DeviceSession row per
    login (spec §4, §11). django-axes (see AUTHENTICATION_BACKENDS) handles
    brute-force lockout transparently via `authenticate()`.
    """

    permission_classes = [AllowAny]
    throttle_scope = "login"

    def post(self, request):
        email = request.data.get("email", "")
        password = request.data.get("password", "")
        user = authenticate(request, username=email, password=password)
        if user is None:
            # Deliberately generic — never reveal whether the email exists
            # or whether it was the password that was wrong.
            return Response({"detail": "Invalid email or password."}, status=401)
        if not user.is_active:
            return Response({"detail": "This account is disabled."}, status=403)
        if not user.is_email_verified:
            return Response({"detail": "Please verify your email before logging in."}, status=403)

        refresh = services.issue_tokens_for_user(
            user,
            ip_address=_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT", ""),
            device_label=request.data.get("device_label", ""),
        )
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": MeSerializer(user).data,
            }
        )


class RefreshView(TokenRefreshView):
    """Wraps SimpleJWT's rotate-and-blacklist refresh so the DeviceSession
    row tracking this session is kept in sync with the new token's jti,
    rather than trusting the client to report it (spec §4, §11)."""

    def post(self, request, *args, **kwargs):
        old_refresh = request.data.get("refresh", "")
        old_jti = None
        try:
            old_jti = RefreshToken(old_refresh).payload.get("jti")
        except TokenError:
            pass

        response = super().post(request, *args, **kwargs)
        if response.status_code == 200 and old_jti:
            new_jti = None
            try:
                new_jti = RefreshToken(response.data.get("refresh")).payload.get("jti")
            except TokenError:
                pass
            if new_jti:
                DeviceSession.objects.filter(refresh_token_jti=old_jti).update(refresh_token_jti=new_jti)
        return response


class LogoutView(APIView):
    """Revokes the specific refresh token/session — not just a
    client-side token delete (spec §10)."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "refresh token is required."}, status=400)
        try:
            token = RefreshToken(refresh_token)
            jti = token.payload.get("jti")
            token.blacklist()
        except TokenError:
            return Response({"detail": "Invalid token."}, status=400)
        services.revoke_session_by_jti(jti)
        record_audit_event(action="account.logout", actor=request.user, object_type="user", object_id=request.user.id)
        return Response({"detail": "Logged out."})


class LogoutAllView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        services.revoke_all_sessions(request.user)
        record_audit_event(
            action="account.logout_all", actor=request.user, object_type="user", object_id=request.user.id
        )
        return Response({"detail": "Logged out of all devices."})


class SessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = DeviceSession.objects.filter(user=request.user).order_by("-last_seen_at")
        data = [
            {
                "id": s.id,
                "device_label": s.device_label,
                "ip_address": s.ip_address,
                "user_agent": s.user_agent,
                "last_seen_at": s.last_seen_at,
                "is_active": s.is_active,
            }
            for s in sessions
        ]
        return Response(DeviceSessionSerializer(data, many=True).data)

    def delete(self, request):
        session_id = request.data.get("id")
        # Ownership enforced by filtering on user=request.user — a user can
        # never revoke another user's session by guessing an id (spec §8).
        updated = DeviceSession.objects.filter(id=session_id, user=request.user, revoked_at__isnull=True)
        if not updated.exists():
            return Response({"detail": "Session not found."}, status=404)
        from django.utils import timezone

        updated.update(revoked_at=timezone.now())
        return Response({"detail": "Session revoked."})


class MeView(APIView):
    """A user may only ever read/edit their own record — request.user is
    the sole source of identity, never an id supplied in the URL or body
    (spec §8)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(MeSerializer(request.user).data)

    def patch(self, request):
        serializer = UpdateMeSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        record_audit_event(
            action="account.profile_updated", actor=request.user, object_type="user", object_id=request.user.id
        )
        return Response(MeSerializer(request.user).data)


class ProfileImageUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        file_obj = request.FILES.get("image")
        if not file_obj:
            return Response({"detail": "image file is required."}, status=400)
        try:
            extension = validate_image_upload(file_obj)
        except Exception as exc:  # noqa: BLE001
            return Response({"detail": str(exc)}, status=400)

        key = safe_storage_key(f"profile-images/{request.user.id}", extension)
        from django.core.files.storage import default_storage

        default_storage.save(key, file_obj)

        profile = getattr(request.user, "boxer_profile", None) or getattr(request.user, "fan_profile", None)
        if profile is None:
            return Response({"detail": "No profile found for this account."}, status=400)
        profile.profile_image_key = key
        profile.save(update_fields=["profile_image_key"])
        record_audit_event(
            action="account.profile_image_updated", actor=request.user, object_type="user", object_id=request.user.id
        )
        return Response({"profile_image_key": key})

    def delete(self, request):
        profile = getattr(request.user, "boxer_profile", None) or getattr(request.user, "fan_profile", None)
        if profile is None:
            return Response({"detail": "No profile found for this account."}, status=400)
        profile.profile_image_key = ""
        profile.save(update_fields=["profile_image_key"])
        return Response({"detail": "Profile image removed."})


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data["current_password"]):
            return Response({"detail": "Current password is incorrect."}, status=400)
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        services.revoke_all_sessions(user)
        record_audit_event(action="account.password_changed", actor=user, object_type="user", object_id=user.id)
        return Response({"detail": "Password changed. Please log in again."})


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "password-reset"

    def post(self, request):
        from .models import User

        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(email__iexact=serializer.validated_data["email"])
            services.issue_password_reset(user)
        except User.DoesNotExist:
            pass
        # Same response either way — do not reveal whether the email exists.
        return Response({"detail": "If that email exists, a reset link has been sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "password-reset"

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ok = services.consume_password_reset(
            serializer.validated_data["token"], serializer.validated_data["new_password"]
        )
        if not ok:
            return Response({"detail": "Invalid or expired reset link."}, status=400)
        return Response({"detail": "Password reset. Please log in."})


class AccountDeletionRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AccountDeletionRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not request.user.check_password(serializer.validated_data["password"]):
            return Response({"detail": "Password confirmation is incorrect."}, status=400)

        deletion_request = AccountDeletionRequest.objects.create(
            user=request.user, reason=serializer.validated_data.get("reason", "")
        )
        from .tasks import process_account_deletion

        process_account_deletion.delay(str(deletion_request.id))
        record_audit_event(
            action="account.deletion_requested", actor=request.user, object_type="user", object_id=request.user.id
        )
        return Response({"detail": "Account deletion requested."}, status=202)
