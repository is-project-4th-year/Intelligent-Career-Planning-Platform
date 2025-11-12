from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to users with role='Admin'.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and getattr(request.user, "role", None) == "Admin"
        )
