from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import ProfileUpdateView, RegisterUserView, UserListCreateView

urlpatterns = [
    path("users/", UserListCreateView.as_view(), name="user-list"),
    path("register/", RegisterUserView.as_view(), name="register"),
    path("profile/update/", ProfileUpdateView.as_view(), name="profile-update"),
    
]
