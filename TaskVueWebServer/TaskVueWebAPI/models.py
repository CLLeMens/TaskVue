from django.db import models

# Create your models here.
class UserSettings(models.Model):
    notifications = models.BooleanField(default=True)
    theme = models.CharField(max_length=20, default='system')
    stand_up_reminder = models.BooleanField(default=False)
    break_reminder = models.BooleanField(default=False)
    productivity_reminder = models.BooleanField(default=False)
    positive_feedback_reminder = models.BooleanField(default=False)
    track_fatigue = models.BooleanField(default=False)
    track_other_people = models.BooleanField(default=False)
    track_smartphone = models.BooleanField(default=False)
    tracking_grade = models.FloatField(default=0.7)