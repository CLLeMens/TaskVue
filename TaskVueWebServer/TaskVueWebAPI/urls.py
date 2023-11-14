from django.urls import path
from . import views


urlpatterns = [
    path('user-settings/', views.UserSettingsView.as_view(), name='user-settings'),
]