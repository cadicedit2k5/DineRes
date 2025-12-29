from rest_framework.permissions import BasePermission

from dineres.models import User

class IsVerifiedChef(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return True

        if request.user.is_authenticated and request.user.user_role == User.Role.CHEF\
                and request.user.is_verified:
            return True

        return False

    def has_object_permission(self, request, view, obj):
        if request.user.is_superuser:
            return True

        if request.user.is_authenticated and request.user.user_role == User.Role.CHEF\
                and request.user.is_verified:
            return True

        return False

class IsUserOwner(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'user'):
            return request.user == obj.user

        if hasattr(obj, 'customer'):
            return request.user == obj.customer