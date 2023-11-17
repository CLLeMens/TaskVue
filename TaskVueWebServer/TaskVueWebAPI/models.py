from django.db import models
import json


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
    track_key_mouse = models.BooleanField(default=False)
    tracking_grade = models.FloatField(default=0.7)


class UserGoals(models.Model):
    monday_workload = models.FloatField(null=True)
    tuesday_workload = models.FloatField(null=True)
    wednesday_workload = models.FloatField(null=True)
    thursday_workload = models.FloatField(null=True)
    friday_workload = models.FloatField(null=True)
    saturday_workload = models.FloatField(null=True)
    sunday_workload = models.FloatField(null=True)

    monday_breaks = models.FloatField(null=True)
    tuesday_breaks = models.FloatField(null=True)
    wednesday_breaks = models.FloatField(null=True)
    thursday_breaks = models.FloatField(null=True)
    friday_breaks = models.FloatField(null=True)
    saturday_breaks = models.FloatField(null=True)
    sunday_breaks = models.FloatField(null=True)

    monday_distractions = models.FloatField(null=True)
    tuesday_distractions = models.FloatField(null=True)
    wednesday_distractions = models.FloatField(null=True)
    thursday_distractions = models.FloatField(null=True)
    friday_distractions = models.FloatField(null=True)
    saturday_distractions = models.FloatField(null=True)
    sunday_distractions = models.FloatField(null=True)


class ProcessFlow(models.Model):
    date = models.DateField()
    process_flow = models.TextField()

    def set_data(self, data):
        self.process_flow = json.dumps(data)

    def get_data(self):
        return self.process_flow