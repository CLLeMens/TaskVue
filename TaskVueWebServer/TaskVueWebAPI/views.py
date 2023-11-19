import json
from rest_framework.views import APIView
from .models import UserSettings, UserGoals, ProcessFlow
from rest_framework import status
from rest_framework.response import Response
from .utils import UserSettingsSerializer, UserGoalsSerializer
import datetime
from isoweek import Week


class GetThemeView(APIView):
    def get(self, request):
        try:
            user_settings = UserSettings.objects.get()
            theme = user_settings.theme
            return Response({'theme': theme}, status=status.HTTP_200_OK)
        except UserSettings.DoesNotExist:
            return Response({'theme': 'system'}, status=status.HTTP_200_OK)


class GetHomeInformationView(APIView):
    def get(self, request):
        settings = []
        goals = []
        try:
            user_settings = UserSettings.objects.get()
            fatigue = user_settings.track_fatigue
            other_people = user_settings.track_other_people
            smartphone = user_settings.track_smartphone
            key_mouse = user_settings.track_key_mouse

            distraction = other_people or smartphone

            settings.append({'fatigue': fatigue, 'distraction': distraction, 'key_mouse': key_mouse})


        except UserSettings.DoesNotExist:
            settings.append({'fatigue': None, 'distraction': None, 'key_mouse': None})
        try:
            user_goals = UserGoals.objects.get()
            today = datetime.datetime.now().strftime("%A")
            workload = getattr(user_goals, f'{today.lower()}_workload')
            breaks = getattr(user_goals, f'{today.lower()}_breaks')
            distractions = getattr(user_goals, f'{today.lower()}_distractions')

            # Setzen Sie Standardwerte, falls die Variablen None sind
            workload = 0 if workload is None else round(workload, 2)
            breaks = 0 if breaks is None else round(breaks, 2)
            distractions = 0 if distractions is None else round(distractions, 2)

            # Fügen Sie die gerundeten Werte dem goals-Array hinzu
            goals.append({'workload': workload, 'breaks': breaks, 'distractions': distractions})

        except UserGoals.DoesNotExist:
            goals.append({'workload': None, 'breaks': None, 'distractions': None})
        return Response({'settings': settings, 'goals': goals}, status=status.HTTP_200_OK)


class ProcessFlowView(APIView):
    def get(self, request):
        # todays date
        today_date = datetime.date.today()

        try:
            process_flow = ProcessFlow.objects.get(date=today_date).get_data()
            corrected_process_flow = process_flow.replace("'", '"')
            process_flow_data = json.loads(corrected_process_flow)

            return Response(process_flow_data, status=status.HTTP_200_OK)
        except ProcessFlow.DoesNotExist:
            return Response({}, status=status.HTTP_200_OK)

    def post(self, request):

        # todays date
        today_date = datetime.date.today()

        process_flow_data = request.data

        process_flow, created = ProcessFlow.objects.update_or_create(
            date=today_date,
            defaults={'process_flow': process_flow_data}
        )

        return Response({'message': 'success'}, status=status.HTTP_200_OK)


def calculate_work_and_break_time(data):
    work_time = 0
    break_time = 0
    last_time = None
    last_process = None

    for entry in data:
        current_time = datetime.datetime.strptime(entry['time'], '%H:%M:%S').time()
        if last_time is not None:
            time_diff = datetime.datetime.combine(datetime.date.today(), current_time) - datetime.datetime.combine(
                datetime.date.today(), last_time)
            seconds = time_diff.total_seconds()

            # Arbeitszeit zwischen 'start' und 'pause' oder 'stop'
            if last_process == 'start' and entry['process'] in ['pause', 'stop']:
                work_time += seconds
            # Pausenzeit zwischen 'pause' oder 'stop' und 'start'
            elif last_process in ['pause', 'stop'] and entry['process'] == 'start':
                break_time += seconds

        last_time = current_time
        last_process = entry['process']

    work_time_hours = round(work_time / 3600, 2)  # Umrechnung in Stunden
    break_time_hours = round(break_time / 3600, 2)  # Umrechnung in Stunden
    return {'work': work_time_hours, 'break': break_time_hours}


class ProcessFlowWeekView(APIView):
    def get(self, request):
        year_week = request.GET.get('date', '')  # Standardwert ist ein leerer String
        year, week = map(int, year_week.split('-'))

        monday = Week(year, week).monday()


        process_flows_list = []

        for i in range(7):
            day = monday + datetime.timedelta(days=i)
            process_flows = ProcessFlow.objects.filter(date=day)

            if process_flows.exists():
                for process_flow in process_flows:
                    process_flow_data = process_flow.get_data()
                    corrected_process_flow = process_flow_data.replace("'", '"')
                    process_flow_data = json.loads(corrected_process_flow)

                    # Berechnen Sie Arbeits- und Pausenzeiten
                    work_break_data = calculate_work_and_break_time(process_flow_data)
                    process_flows_list.append(work_break_data)
            else:
                process_flows_list.append({'work': 0, 'break': 0})
        print(process_flows_list)
        return Response(process_flows_list, status=status.HTTP_200_OK)


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
                'name': None,
                'notifications': True,
                'theme': 'system',
                'stand_up_reminder': False,
                'break_reminder': False,
                'productivity_reminder': False,
                'positive_feedback_reminder': False,
                'track_fatigue': False,
                'track_other_people': False,
                'track_smartphone': False,
                'track_key_mouse': False,
                'tracking_grade': 0.7

            }
            return Response(data, status=status.HTTP_200_OK)

    def post(self, request):

        # get all the information
        name = request.data.get('name')
        notifications = request.data.get('isNotificationsOn')
        theme = request.data.get('appTheme')
        stand_up_reminder = request.data.get('isStandUpReminderOn')
        break_reminder = request.data.get('isBreakReminderOn')
        productivity_reminder = request.data.get('isStayProductiveReminderOn')
        positive_feedback_reminder = request.data.get('isPositiveFeedbackOn')
        track_fatigue = request.data.get('isTrackFatigueOn')
        track_other_people = request.data.get('isTrackOtherPeopleOn')
        track_smartphone = request.data.get('isTrackSmartphoneOn')
        track_key_mouse = request.data.get('isTrackKeyMouseOn')
        tracking_grade = request.data.get('trackingGrade')

        # try to get the settings
        try:
            settings = UserSettings.objects.get()
        except UserSettings.DoesNotExist:
            # if the settings do not exist, create them
            settings = UserSettings()

        message = 'updated settings'

        # set the data
        settings.name = name
        settings.notifications = notifications
        settings.stand_up_reminder = stand_up_reminder
        settings.break_reminder = break_reminder
        settings.productivity_reminder = productivity_reminder
        settings.positive_feedback_reminder = positive_feedback_reminder
        settings.track_fatigue = track_fatigue
        settings.track_other_people = track_other_people
        settings.track_smartphone = track_smartphone
        settings.track_key_mouse = track_key_mouse
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
