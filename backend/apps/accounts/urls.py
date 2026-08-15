from django.urls import path

from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("verify-email/", views.VerifyEmailView.as_view(), name="verify-email"),
    path("resend-verification/", views.ResendVerificationView.as_view(), name="resend-verification"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("token/refresh/", views.RefreshView.as_view(), name="token-refresh"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("logout-all/", views.LogoutAllView.as_view(), name="logout-all"),
    path("sessions/", views.SessionListView.as_view(), name="sessions"),
    path("me/", views.MeView.as_view(), name="me"),
    path("me/profile-image/", views.ProfileImageUploadView.as_view(), name="profile-image"),
    path("change-password/", views.ChangePasswordView.as_view(), name="change-password"),
    path("password-reset/", views.PasswordResetRequestView.as_view(), name="password-reset"),
    path("password-reset/confirm/", views.PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("delete-account/", views.AccountDeletionRequestView.as_view(), name="delete-account"),
]
