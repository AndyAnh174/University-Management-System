from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginView,
    RegisterView,
    MeView,
    ChangePasswordView,
    LogoutView,
)

urlpatterns = [
    # Auth endpoints
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth-refresh'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='auth-change-password'),
    
    # User endpoints
    path('auth/me/', MeView.as_view(), name='auth-me'),
]
