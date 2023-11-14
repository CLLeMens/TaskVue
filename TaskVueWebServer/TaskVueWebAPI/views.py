from django.shortcuts import render
from rest_framework.views import APIView
from .models import UserSettings
from rest_framework import status
from rest_framework.response import Response
from .utils import UserSettingsSerializer


# Create your views here.
class UserSettingsView(APIView):
    def get(self, request):
        try:
            user_settings = UserSettings.objects.get()
            serializer = UserSettingsSerializer(user_settings)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserSettings.DoesNotExist:
            # send empty UserSettings:
            data = {
                'notifications': True,
                'theme': 'system',
                'stand_up_reminder': False,
                'break_reminder': False,
                'productivity_reminder': False,
                'positive_feedback_reminder': False,
                'track_fatigue': False,
                'track_other_people': False,
                'track_smartphone': False,
                'tracking_grade': 0.7

            }
            return Response(data, status=status.HTTP_200_OK)

    def post(self, request):

        # get all the information
        notifications = request.data.get('isNotificationsOn')
        theme = request.data.get('appTheme')
        stand_up_reminder = request.data.get('isStandUpReminderOn')
        break_reminder = request.data.get('isBreakReminderOn')
        productivity_reminder = request.data.get('isStayProductiveReminderOn')
        positive_feedback_reminder = request.data.get('isPositiveFeedbackOn')
        track_fatigue = request.data.get('isTrackFatigueOn')
        track_other_people = request.data.get('isTrackOtherPeopleOn')
        track_smartphone = request.data.get('isTrackSmartphoneOn')
        tracking_grade = request.data.get('trackingGrade')

        # try to get the settings
        try:
            settings = UserSettings.objects.get()
        except UserSettings.DoesNotExist:
            # if the settings do not exist, create them
            settings = UserSettings()

        # set the data
        settings.notifications = notifications
        settings.theme = theme
        settings.stand_up_reminder = stand_up_reminder
        settings.break_reminder = break_reminder
        settings.productivity_reminder = productivity_reminder
        settings.positive_feedback_reminder = positive_feedback_reminder
        settings.track_fatigue = track_fatigue
        settings.track_other_people = track_other_people
        settings.track_smartphone = track_smartphone
        settings.tracking_grade = tracking_grade

        # save the data
        settings.save()

        # return success
        return Response(status=status.HTTP_200_OK)