from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Permission check for Admin users only
    """
    message = "Only admin users can perform this action."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'ADMIN'
        )


class IsAdminOrTeacher(permissions.BasePermission):
    """
    Permission check for Admin or Teacher users
    """
    message = "Only admin or teacher users can perform this action."
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['ADMIN', 'TEACHER']
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission check for object owner or Admin
    """
    def has_object_permission(self, request, view, obj):
        # Admin can access any object
        if request.user.role == 'ADMIN':
            return True
        # Owner can access their own object
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user
