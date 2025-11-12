from django.urls import path
from .views_admin import (
    AdminUserListView,
    AdminUpdateUserRoleView,
    AdminToggleUserStatusView,
    AdminDashboardStatsView,
)

urlpatterns = [
    path("users/", AdminUserListView.as_view(), name="admin-users"),
    path("users/<int:user_id>/role/", AdminUpdateUserRoleView.as_view(), name="admin-update-user-role"),
    path("users/<int:user_id>/status/", AdminToggleUserStatusView.as_view(), name="admin-toggle-user-status"),
    path("stats/", AdminDashboardStatsView.as_view(), name="admin-dashboard-stats"),
]
