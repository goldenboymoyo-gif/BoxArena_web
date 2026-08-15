"""
Server-side authorization primitives.

Threat model: the frontend is untrusted (see PUGNERA spec §35). A client can
send any role, id, or "is_owner" flag it likes. Every sensitive view must
compose one of these permission classes rather than trusting request data.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class HasRole(BasePermission):
    """Factory-style role check: HasRole(["ADMIN", "FINANCE"])."""

    def __init__(self, allowed_roles):
        self.allowed_roles = set(allowed_roles)

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.role in self.allowed_roles or user.is_superuser)
        )


def role_required(*roles):
    class _RoleRequired(HasRole):
        def __init__(self):
            super().__init__(roles)

    return _RoleRequired


class IsOwner(BasePermission):
    """Object-level check: the object must expose a `.user_id` (or
    `.owner_id`) matching request.user.id. Prevents the classic
    /api/users/123/profile -> /api/users/124/profile IDOR attack.
    """

    owner_field = "user_id"

    def has_object_permission(self, request, view, obj):
        owner_id = getattr(obj, self.owner_field, None) or getattr(obj, "owner_id", None)
        return bool(request.user and request.user.is_authenticated and owner_id == request.user.id)


class IsOwnerOrStaffReadOnly(IsOwner):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS and getattr(request.user, "is_staff", False):
            return True
        return super().has_object_permission(request, view, obj)


class IsFinanceOrAdmin(HasRole):
    def __init__(self):
        super().__init__(["FINANCE", "ADMIN", "SUPERADMIN"])


class IsAdminOrSuperAdmin(HasRole):
    def __init__(self):
        super().__init__(["ADMIN", "SUPERADMIN"])


class IsModeratorOrAbove(HasRole):
    def __init__(self):
        super().__init__(["MODERATOR", "ADMIN", "SUPERADMIN"])
