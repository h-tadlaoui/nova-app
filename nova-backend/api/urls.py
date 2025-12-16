"""
URL configuration for API app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    UserViewSet, RegisterView, ItemViewSet,
    MatchViewSet, NotificationViewSet, ContactRequestViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'items', ItemViewSet, basename='item')
router.register(r'matches', MatchViewSet, basename='match')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'contact-requests', ContactRequestViewSet, basename='contact-request')

urlpatterns = [
    # Authentication endpoints
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view({'post': 'register'}), name='register'),
    path('auth/me/', UserViewSet.as_view({'get': 'me', 'put': 'me', 'patch': 'me'}), name='user-me'),
    
    # Router URLs
    path('', include(router.urls)),
]
