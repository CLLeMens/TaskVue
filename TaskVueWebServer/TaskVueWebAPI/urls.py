from django.urls import path
from . import views


urlpatterns = [
    path('get-theme/', views.GetThemeView.as_view(), name='get-theme'),
    path('get-home-data/', views.GetHomeInformationView.as_view(), name='get-home-data'),

    path('process-flow/', views.ProcessFlowView.as_view(), name='process-flow'),
    path('process-flow-week/', views.ProcessFlowWeekView.as_view(), name='process-flow-week'),

    path('user-settings/', views.UserSettingsView.as_view(), name='user-settings'),
    path('user-goals/', views.UserGoalsView.as_view(), name='user-goals'),
    path('timer/', views.TimerView.as_view(), name='timer'),
]