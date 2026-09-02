from rest_framework.permissions import BasePermission

class IsDepartment(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'department'

class IsStartup(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'startup'

class IsEvaluator(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'evaluator'

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'
