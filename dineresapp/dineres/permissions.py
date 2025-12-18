from rest_framework.permissions import BasePermission

from dineres.models import User

class IsChef(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True

        if request.user.is_authenticated and request.user.user_role == User.Role.CHEF:
            return True

        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True

        if request.user.is_authenticated and request.user.user_role == User.Role.CHEF:
            return True

        return False
