from django.contrib import admin
from .models import UserSettings, UserGoals, ProcessFlow

# Register your models here.
admin.site.register(UserSettings)
admin.site.register(UserGoals)
admin.site.register(ProcessFlow)