from django.shortcuts import render
from rest_framework.views import APIView
from .models import UserSettings, UserGoals
from rest_framework import status
from rest_framework.response import Response
from .utils import UserSettingsSerializer, UserGoalsSerializer


class GetThemeView(APIView):
    def get(self, request):
        try:
            user_settings = UserSettings.objects.get()
            theme = user_settings.theme
            return Response({'theme': theme}, status=status.HTTP_200_OK)
        except UserSettings.DoesNotExist:
            return Response({'theme': 'system'}, status=status.HTTP_200_OK)


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

        message = 'updated settings'

        # set the data
        settings.notifications = notifications
        settings.stand_up_reminder = stand_up_reminder
        settings.break_reminder = break_reminder
        settings.productivity_reminder = productivity_reminder
        settings.positive_feedback_reminder = positive_feedback_reminder
        settings.track_fatigue = track_fatigue
        settings.track_other_people = track_other_people
        settings.track_smartphone = track_smartphone
        settings.tracking_grade = tracking_grade

        # check if settings.theme is equal to theme
        if settings.theme != theme:
            message = 'new theme'
            settings.theme = theme

        # save the data
        settings.save()

        # return success
        return Response({'message': message}, status=status.HTTP_200_OK)


class UserGoalsView(APIView):
    def get(self, request):
        try:
            user_goals = UserGoals.objects.get()

            serializer = UserGoalsSerializer(user_goals)

            data = [
                {
                    'key': '1',
                    'day': 'Monday',
                    'workload': serializer.data['monday_workload'],
                    'breakTime': serializer.data['monday_breaks'],
                    'distractions': serializer.data['monday_distractions']
                },
                {
                    'key': '2',
                    'day': 'Tuesday',
                    'workload': serializer.data['tuesday_workload'],
                    'breakTime': serializer.data['tuesday_breaks'],
                    'distractions': serializer.data['tuesday_distractions']
                },
                {
                    'key': '3',
                    'day': 'Wednesday',
                    'workload': serializer.data['wednesday_workload'],
                    'breakTime': serializer.data['wednesday_breaks'],
                    'distractions': serializer.data['wednesday_distractions']
                },
                {
                    'key': '4',
                    'day': 'Thursday',
                    'workload': serializer.data['thursday_workload'],
                    'breakTime': serializer.data['thursday_breaks'],
                    'distractions': serializer.data['thursday_distractions']
                },
                {
                    'key': '5',
                    'day': 'Friday',
                    'workload': serializer.data['friday_workload'],
                    'breakTime': serializer.data['friday_breaks'],
                    'distractions': serializer.data['friday_distractions']
                },
                {
                    'key': '6',
                    'day': 'Saturday',
                    'workload': serializer.data['saturday_workload'],
                    'breakTime': serializer.data['saturday_breaks'],
                    'distractions': serializer.data['saturday_distractions']
                },
                {
                    'key': '7',
                    'day': 'Sunday',
                    'workload': serializer.data['sunday_workload'],
                    'breakTime': serializer.data['sunday_breaks'],
                    'distractions': serializer.data['sunday_distractions']
                },
            ]

            return Response(data, status=status.HTTP_200_OK)
        except UserGoals.DoesNotExist:
            # send empty Usergoals:
            data = [
                {
                    'key': '1',
                    'day': 'Monday',
                    'workload': None,
                    'breakTime': None,
                    'distractions': None
                },
                {
                    'key': '2',
                    'day': 'Tuesday',
                    'workload': None,
                    'breakTime': None,
                    'distractions': None
                },
                {
                    'key': '3',
                    'day': 'Wednesday',
                    'workload': None,
                    'breakTime': None,
                    'distractions': None
                },
                {
                    'key': '4',
                    'day': 'Thursday',
                    'workload': None,
                    'breakTime': None,
                    'distractions': None
                },
                {
                    'key': '5',
                    'day': 'Friday',
                    'workload': None,
                    'breakTime': None,
                    'distractions': None
                },
                {
                    'key': '6',
                    'day': 'Saturday',
                    'workload': None,
                    'breakTime': None,
                    'distractions': None
                },
                {
                    'key': '7',
                    'day': 'Sunday',
                    'workload': None,
                    'breakTime': None,
                    'distractions': None
                },
            ]

            return Response(data, status=status.HTTP_200_OK)

    def post(self, request):

        # check if requests.data has 7 elements
        if len(request.data) != 7:
            return Response({'message': 'invalid data'}, status=status.HTTP_400_BAD_REQUEST)

        # with setting the parameters, check if realy [0] is monday, by checking the 'day' key. Do it for every day:
        # monday
        if (request.data[0]['day'] != 'Monday' or
                request.data[1]['day'] != 'Tuesday' or
                request.data[2]['day'] != 'Wednesday' or
                request.data[3]['day'] != 'Thursday' or
                request.data[4]['day'] != 'Friday' or
                request.data[5]['day'] != 'Saturday' or
                request.data[6]['day'] != 'Sunday'):

            return Response({'message': 'invalid data'}, status=status.HTTP_400_BAD_REQUEST)

        # try to get the goals
        try:
            goals = UserGoals.objects.get()
        except UserGoals.DoesNotExist:
            # if the goals do not exist, create them
            goals = UserGoals()

        # set the data
        goals.monday_workload = request.data[0]['workload']
        goals.tuesday_workload = request.data[1]['workload']
        goals.wednesday_workload = request.data[2]['workload']
        goals.thursday_workload = request.data[3]['workload']
        goals.friday_workload = request.data[4]['workload']
        goals.saturday_workload = request.data[5]['workload']
        goals.sunday_workload = request.data[6]['workload']

        goals.monday_breaks = request.data[0]['breakTime']
        goals.tuesday_breaks = request.data[1]['breakTime']
        goals.wednesday_breaks = request.data[2]['breakTime']
        goals.thursday_breaks = request.data[3]['breakTime']
        goals.friday_breaks = request.data[4]['breakTime']
        goals.saturday_breaks = request.data[5]['breakTime']
        goals.sunday_breaks = request.data[6]['breakTime']

        goals.monday_distractions = request.data[0]['distractions']
        goals.tuesday_distractions = request.data[1]['distractions']
        goals.wednesday_distractions = request.data[2]['distractions']
        goals.thursday_distractions = request.data[3]['distractions']
        goals.friday_distractions = request.data[4]['distractions']
        goals.saturday_distractions = request.data[5]['distractions']
        goals.sunday_distractions = request.data[6]['distractions']

        # save the data
        goals.save()

        # return success
        return Response({}, status=status.HTTP_200_OK)
