from django.urls import path
from . import views


urlpatterns = [
    path('get-theme/', views.GetThemeView.as_view(), name='get-theme'),
    path('user-settings/', views.UserSettingsView.as_view(), name='user-settings'),
    path('user-goals/', views.UserGoalsView.as_view(), name='user-goals'),
]