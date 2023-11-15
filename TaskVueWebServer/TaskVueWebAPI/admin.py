from django.contrib import admin
from .models import UserSettings, UserGoals

# Register your models here.
admin.site.register(UserSettings)
admin.site.register(UserGoals)