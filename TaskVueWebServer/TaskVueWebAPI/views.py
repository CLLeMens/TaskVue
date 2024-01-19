import json
from rest_framework.views import APIView
from .models import UserSettings, UserGoals, ProcessFlow
from rest_framework import status
from rest_framework.response import Response
from .utils import UserSettingsSerializer, UserGoalsSerializer
import datetime
from isoweek import Week
from threading import Thread
from TaskVueProcessing.track import ObjectDetector
import os
import calendar


# Define a class-based view to handle getting the theme
class GetThemeView(APIView):
    # Define the GET method for this view
    def get(self, request):
        try:
            # Try to get the user settings from the database
            user_settings = UserSettings.objects.get()
            # Extract the theme from the user settings
            theme = user_settings.theme
            # Return a response with the theme and a 200 OK status
            return Response({'theme': theme}, status=status.HTTP_200_OK)
        except UserSettings.DoesNotExist:
            # If the user settings do not exist, return a response with the default theme ('system') and a 200 OK status
            return Response({'theme': 'system'}, status=status.HTTP_200_OK)

# Define a class-based view to get home information
class GetHomeInformationView(APIView):
    # Define the GET method for this view
    def get(self, request):
        # Initialize empty lists for settings and goals
        settings = []
        goals = []

        try:
            # Try to get the user settings from the database
            user_settings = UserSettings.objects.get()

            # Extract the individual settings from the user settings
            fatigue = user_settings.track_fatigue
            other_people = user_settings.track_other_people
            smartphone = user_settings.track_smartphone
            distractions = user_settings.track_distraction

            # Append the settings to the settings list
            settings.append({'fatigue': fatigue, 'smartphone': smartphone, 'distractions': distractions, 'other_people': other_people})

        except UserSettings.DoesNotExist:
            # If the user settings do not exist, append None values to the settings list
            settings.append({'fatigue': None, 'smartphone': None, 'distractions': None, 'other_people': None})

        try:
            # Try to get the user goals from the database
            user_goals = UserGoals.objects.get()

            # Get the current day of the week
            today = datetime.datetime.now().strftime("%A")

            # Extract the individual goals for the current day from the user goals
            workload = getattr(user_goals, f'{today.lower()}_workload')
            breaks = getattr(user_goals, f'{today.lower()}_breaks')
            distractions = getattr(user_goals, f'{today.lower()}_distractions')

            # Set the default values to 0 if the variables are None, else round the values to 2 decimal places
            workload = 0 if workload is None else round(workload, 2)
            breaks = 0 if breaks is None else round(breaks, 2)
            distractions = 0 if distractions is None else round(distractions, 2)

            # Append the goals to the goals list
            goals.append({'workload': workload, 'breaks': breaks, 'distractions': distractions})

        except UserGoals.DoesNotExist:
            # If the user goals do not exist, append None values to the goals list
            goals.append({'workload': None, 'breaks': None, 'distractions': None})

        # Return a response with the settings and goals and a 200 OK status
        return Response({'settings': settings, 'goals': goals}, status=status.HTTP_200_OK)


# Define a class-based view to handle process flow
class ProcessFlowView(APIView):
    # Define the GET method for this view
    def get(self, request):
        # Get today's date
        today_date = datetime.date.today()
        try:
            # Try to get the process flow for today's date from the database
            process_flow = ProcessFlow.objects.get(date=today_date).get_data()
            # Replace single quotes with double quotes in the process flow data
            corrected_process_flow = process_flow.replace("'", '"')
            # Load the process flow data as JSON
            process_flow_data = json.loads(corrected_process_flow)
            # Return a response with the process flow data and a 200 OK status
            return Response(process_flow_data, status=status.HTTP_200_OK)
        except ProcessFlow.DoesNotExist:
            # If the process flow does not exist, return a response with an empty dictionary and a 200 OK status
            return Response({}, status=status.HTTP_200_OK)

    # Define the POST method for this view
    def post(self, request):
        # Get today's date
        today_date = datetime.date.today()
        # Get the process flow data from the request data
        process_flow_data = request.data
        # Update or create a process flow for today's date with the process flow data
        process_flow, created = ProcessFlow.objects.update_or_create(
            date=today_date,
            defaults={'process_flow': process_flow_data}
        )
        # Return a response with a success message and a 200 OK status
        return Response({'message': 'success'}, status=status.HTTP_200_OK)


# Define a function to calculate work and break time from data
def calculate_work_and_break_time(data):
    # Initialize work time and break time to 0
    work_time = 0
    break_time = 0
    # Initialize last time and last process to None
    last_time = None
    last_process = None

    # Loop over each entry in the data
    for entry in data:
        # Convert the time in the entry to a datetime object
        current_time = datetime.datetime.strptime(entry['time'], '%H:%M:%S').time()
        # If last time is not None, calculate the time difference
        if last_time is not None:
            time_diff = datetime.datetime.combine(datetime.date.today(), current_time) - datetime.datetime.combine(
                datetime.date.today(), last_time)
            # Convert the time difference to seconds
            seconds = time_diff.total_seconds()

            # If the last process was 'start' and the current process is 'pause' or 'stop', add the seconds to work time
            if last_process == 'start' and entry['process'] in ['pause', 'stop']:
                work_time += seconds
            # If the last process was 'pause' or 'stop' and the current process is 'start', add the seconds to break time
            elif last_process in ['pause', 'stop'] and entry['process'] == 'start':
                break_time += seconds

        # Set the last time and last process to the current time and process
        last_time = current_time
        last_process = entry['process']

    # Convert work time and break time from seconds to hours and round to 2 decimal places
    work_time_hours = round(work_time / 3600, 2)
    break_time_hours = round(break_time / 3600, 2)
    # Return a dictionary with the work time and break time
    return {'work': work_time_hours, 'break': break_time_hours}


# Define a class-based view to handle process flow for a week
class ProcessFlowWeekView(APIView):
    # Define the GET method for this view
    def get(self, request):
        # Get the date from the request parameters, default to an empty string
        year_week = request.GET.get('date', '')
        # Split the year and week from the date
        year, week = map(int, year_week.split('-'))
        # Get the date for the Monday of the specified week
        monday = Week(year, week).monday()

        # Initialize an empty list for the process flows
        process_flows_list = []

        # Loop over each day of the week
        for i in range(7):
            # Get the date for the current day
            day = monday + datetime.timedelta(days=i)
            # Get the process flows for the current day
            process_flows = ProcessFlow.objects.filter(date=day)

            # If there are any process flows for the current day
            if process_flows.exists():
                # Loop over each process flow
                for process_flow in process_flows:
                    # Get the data for the process flow
                    process_flow_data = process_flow.get_data()
                    # Replace single quotes with double quotes in the process flow data
                    corrected_process_flow = process_flow_data.replace("'", '"')
                    # Load the process flow data as JSON
                    process_flow_data = json.loads(corrected_process_flow)

                    # Calculate the work and break times from the process flow data
                    work_break_data = calculate_work_and_break_time(process_flow_data)
                    # Append the work and break times to the process flows list
                    process_flows_list.append(work_break_data)
            else:
                # If there are no process flows for the current day, append 0 for work and break times to the process flows list
                process_flows_list.append({'work': 0, 'break': 0})

        # Return a response with the process flows list and a 200 OK status
        return Response(process_flows_list, status=status.HTTP_200_OK)


# Define a class-based view to handle tracking data for a week
class TrackWeekView(APIView):
    # Define the GET method for this view
    def get(self, request):
        # Get the date from the request parameters, default to an empty string
        year_week = request.GET.get('date', '')
        # Split the year and week from the date
        year, week = map(int, year_week.split('-'))
        print(year, week)
        # Get the date for the Monday of the specified week
        monday = Week(year, week).monday()
        print(monday)
        # Initialize an empty list for the tracking data
        track_data_list = []

        try:
            # Get the base directory of the current file
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            # Get the path to the tracking data file
            file_path = os.path.join(base_dir, 'track.json')

            # Open the tracking data file
            with open(file_path, 'r') as file:
                # Load the tracking data as JSON
                data = json.load(file)

            # Loop over each day of the week
            for i in range(7):
                # Get the date for the current day
                day = monday + datetime.timedelta(days=i)
                # Convert the date to a string
                day_str = day.strftime("%Y-%m-%d")

                # Get the tracking data for the current day, default to an empty dictionary
                day_data = data.get(day_str, {})

                # If the tracking data for the current day is empty, set it to an empty list
                if day_data == {} or not day_data:
                    day_data = []
                # Append the tracking data for the current day to the tracking data list
                track_data_list.append(day_data)

        except FileNotFoundError:
            # If the tracking data file is not found, return a response with an error message and a 404 Not Found status
            return Response({'error': 'track.json not found'}, status=status.HTTP_404_NOT_FOUND)
        # Return a response with the tracking data list
        return Response(track_data_list)


# Create your views here.
# Define a class-based view to handle user settings
class UserSettingsView(APIView):
    # Define the GET method for this view
    def get(self, request):
        try:
            # Try to get the user settings from the database
            user_settings = UserSettings.objects.get()
            # Serialize the user settings
            serializer = UserSettingsSerializer(user_settings)
            # Return a response with the serialized user settings and a 200 OK status
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserSettings.DoesNotExist:
            # If the user settings do not exist, return a response with empty user settings and a 200 OK status
            data = {
                'name': None,
                'notifications': True,
                'theme': 'system',
                'track_fatigue': False,
                'track_other_people': False,
                'track_smartphone': False,
                'track_distractions': False,
                'tracking_grade': 0.7
            }
            return Response(data, status=status.HTTP_200_OK)

    # Define the POST method for this view
    def post(self, request):
        # Get the user settings from the request data
        name = request.data.get('name')
        notifications = request.data.get('isNotificationsOn')
        theme = request.data.get('appTheme')
        track_fatigue = request.data.get('isTrackFatigueOn')
        track_other_people = request.data.get('isTrackOtherPeopleOn')
        track_smartphone = request.data.get('isTrackSmartphoneOn')
        track_distractions = request.data.get('isDistracted')
        tracking_grade = request.data.get('trackingGrade')

        try:
            # Try to get the user settings from the database
            settings = UserSettings.objects.get()
        except UserSettings.DoesNotExist:
            # If the user settings do not exist, create new user settings
            settings = UserSettings()

        # Initialize the message to 'updated settings'
        message = 'updated settings'

        # Set the user settings from the request data
        settings.name = name
        settings.notifications = notifications
        settings.track_fatigue = track_fatigue
        settings.track_other_people = track_other_people
        settings.track_smartphone = track_smartphone
        settings.track_distraction = track_distractions
        settings.tracking_grade = tracking_grade

        # If the theme has changed, update the message to 'new theme'
        if settings.theme != theme:
            message = 'new theme'
            settings.theme = theme

        # Save the user settings to the database
        settings.save()

        # Return a response with the message and a 200 OK status
        return Response({'message': message}, status=status.HTTP_200_OK)


# Define a class-based view to handle user goals
class UserGoalsView(APIView):
    # Define the GET method for this view
    def get(self, request):
        try:
            # Try to get the user goals from the database
            user_goals = UserGoals.objects.get()

            # Serialize the user goals
            serializer = UserGoalsSerializer(user_goals)

            # Prepare the data for the response, including the serialized user goals for each day of the week

            data = [
                # Each dictionary in the list represents the user goals for a specific day of the week
                # The 'key' is a unique identifier for the day, 'day' is the name of the day,
                # 'workload' is the workload goal for the day, 'breakTime' is the break time goal for the day,
                # and 'distractions' is the distractions goal for the day
                # This structure is repeated for each day of the week
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
            # The following dictionaries represent the days of the week from Monday to Sunday.
            # All goals are set to None as there is no data.
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

        # Validate that the 'day' key in the request data matches the expected day for each day of the week
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

        # Set the workload goals for each day of the week from the request data
        goals.monday_workload = request.data[0]['workload']
        goals.tuesday_workload = request.data[1]['workload']
        goals.wednesday_workload = request.data[2]['workload']
        goals.thursday_workload = request.data[3]['workload']
        goals.friday_workload = request.data[4]['workload']
        goals.saturday_workload = request.data[5]['workload']
        goals.sunday_workload = request.data[6]['workload']

        # Set the break time goals for each day of the week from the request data
        goals.monday_breaks = request.data[0]['breakTime']
        goals.tuesday_breaks = request.data[1]['breakTime']
        goals.wednesday_breaks = request.data[2]['breakTime']
        goals.thursday_breaks = request.data[3]['breakTime']
        goals.friday_breaks = request.data[4]['breakTime']
        goals.saturday_breaks = request.data[5]['breakTime']
        goals.sunday_breaks = request.data[6]['breakTime']

        # Set the distractions goals for each day of the week from the request data
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


# Global variables for the object detector and its thread
global_detector = None
global_detector_thread = None

# Define a class for the timer view, which inherits from the APIView class
class TimerView(APIView):

    # Define the get method for the view
    def get(self, request):
        # Access the global variables
        global global_detector
        global global_detector_thread

        # Get the 'method' parameter from the request, defaulting to an empty string if it's not provided
        method = request.GET.get('method', '')

        # If the method is 'start'
        if method == 'start':
            print('START')
            # If the global detector is not initialized, initialize it
            if not global_detector:
                global_detector = ObjectDetector.get_instance(detect_phones=True, detect_persons=True)
            # If the global detector thread is not running, start it
            if not global_detector_thread or not global_detector_thread.is_alive():
                global_detector_thread = Thread(target=global_detector.run_detection_loop)
                global_detector_thread.start()

        # If the method is 'stop'
        elif method == 'stop':
            print('STOP')
            # If the global detector is initialized, stop it
            if global_detector:
                global_detector.stop_detection()
            # If the global detector thread is running, stop it
            if global_detector_thread and global_detector_thread.is_alive():
                global_detector_thread.join()

        # Return a response with an empty body and a 200 OK status
        return Response({}, status=status.HTTP_200_OK)


class TrackJSONView(APIView):
    def get(self, request):
        try:
            # Determine the base directory, which is assumed to be the parent directory of this file's directory
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            # Construct the full path to the track.json file, which is assumed to be in the base directory
            file_path = os.path.join(base_dir, 'track.json')

            # Open the track.json file in read mode
            with open(file_path, 'r') as file:
                # Load the JSON data from the file
                data = json.load(file)

            # Get the current date in the format 'YYYY-MM-DD'
            today = datetime.datetime.now().strftime('%Y-%m-%d')
            # Get the data for today from the loaded data, defaulting to an empty dictionary if there's no data for today
            today_data = data.get(today, {})

            # Return a response with the data for today
            return Response(today_data)
        except FileNotFoundError:
            # If the track.json file was not found, return a response with an error message and a 404 Not Found status
            return Response({'error': 'track.json not found'}, status=status.HTTP_404_NOT_FOUND)
        except json.JSONDecodeError:
            # If the JSON data in the track.json file was invalid, return a response with an error message and a 400 Bad Request status
            return Response({'error': 'Invalid JSON in track.json'}, status=status.HTTP_400_BAD_REQUEST)


def calculate_performance_score(actual_work, target_work, actual_break, target_break, actual_distraction,
                                max_distraction, weight_work=0.5, weight_break=0.2, weight_distraction=0.3):

    # If any of the target values are None, set them to 0
    if target_work is None:
        target_work = 0
    if target_break is None:
        target_break = 0
    if max_distraction is None:
        max_distraction = 0

    # Calculate the work ratio
    # If the target work is 0 and the actual work is greater than 0, set the work ratio to 1
    # Otherwise, calculate the work ratio as the actual work divided by the target work, capped at 1
    if target_work == 0 and actual_work > 0:
        work_ratio = 1
    else:
        work_ratio = min(actual_work / target_work, 1)

    # Calculate the break ratio
    # If the target break is 0 and the actual break is greater than 0, set the break ratio to 0
    # Otherwise, calculate the break ratio as the actual break divided by the target break, capped at 1
    if target_break == 0 and actual_break > 0:
        break_ratio = 0
    else:
        break_ratio = min(actual_break / target_break, 1)

    # Calculate the distraction ratio
    # If the actual distraction is not 0, calculate the distraction ratio as the maximum distraction divided by the actual distraction, capped at 1
    # Otherwise, set the distraction ratio to 1
    distraction_ratio = min(1, max_distraction / actual_distraction) if actual_distraction != 0 else 1

    # Calculate the overall performance score as the weighted sum of the work ratio, break ratio, and distraction ratio
    score = (weight_work * work_ratio) + (weight_break * break_ratio) + (weight_distraction * distraction_ratio)

    # Return the calculated performance score
    return score


def calculate_total_distraction_time(track_data):
    # Initialize a variable to hold the total distraction time in seconds
    total_seconds = 0

    # Iterate over each category in the tracking data
    for category in track_data.values():
        # Iterate over each event in the category
        for event in category:
            # Parse the start time of the event into a datetime object
            start_time = datetime.datetime.strptime(event['Start time'], '%H:%M:%S')
            # Parse the stop time of the event into a datetime object
            stop_time = datetime.datetime.strptime(event['Stop time'], '%H:%M:%S')

            # Calculate the duration of the event in seconds and add it to the total distraction time
            duration = (stop_time - start_time).total_seconds()
            total_seconds += duration

    # Convert the total distraction time to hours
    total_hours = total_seconds / 3600

    # Return the total distraction time in hours
    return total_hours

class MonthScoreView(APIView):
    def get(self, request):
        # Get the 'date' parameter from the request, defaulting to an empty string if it's not provided
        year_month = request.GET.get('date', '')
        # Split the 'date' parameter into year and month, and convert them to integers
        year, month = map(int, year_month.split('-'))

        # Try to get the user goals from the database
        try:
            user_goals = UserGoals.objects.get()
        except UserGoals.DoesNotExist:
            # If the user goals do not exist, return a response with an error message and a 404 Not Found status
            return Response({'error': 'user goals not found'}, status=status.HTTP_404_NOT_FOUND)

        # Determine the number of days in the month
        num_days = calendar.monthrange(year, month)[1]

        # Generate a list of all days in the month
        days_of_month = [datetime.date(year, month, day) for day in range(1, num_days + 1)]

        # Initialize an empty list to hold the scores for each day of the month
        scores = []

        # get track data
        try:
            # Determine the base directory, which is assumed to be the parent directory of this file's directory
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            # Construct the full path to the track.json file, which is assumed to be in the base directory
            file_path = os.path.join(base_dir, 'track.json')
            # Open the track.json file in read mode
            with open(file_path, 'r') as file:
                data = json.load(file)


        except FileNotFoundError:
            # If the track.json file was not found, return a response with an error message and a 404 Not Found status
            return Response({'error': 'track.json not found'}, status=status.HTTP_404_NOT_FOUND)


        # Iterate over each day in the month
        for date in days_of_month:

            # get process flow for the day
            try:
                process_flow = ProcessFlow.objects.get(date=date).get_data()
                corrected_process_flow = process_flow.replace("'", '"')
                process_flow_data = json.loads(corrected_process_flow)

            except ProcessFlow.DoesNotExist:
                process_flow_data = []

            date_str = date.strftime("%Y-%m-%d")
            track_data = data.get(date_str)

            if process_flow_data != []:
                # Calculate the work and break time from the process flow data


                work_break = calculate_work_and_break_time(process_flow_data)

                # Separate the work and break time
                actual_work = work_break['work']
                actual_break = work_break['break']
                # Calculate the total distraction time from the tracking data, or set it to 0 if there's no tracking data
                if track_data:
                    actual_distractions = calculate_total_distraction_time(track_data)
                else:
                    actual_distractions = 0

                # Get the weekday of the date
                weekday = date.strftime("%A").lower()

                # Get the goals for the day from the user goals
                target_work = getattr(user_goals, f'{weekday}_workload')
                target_break = getattr(user_goals, f'{weekday}_breaks')
                target_distraction = getattr(user_goals, f'{weekday}_distractions')

                # Calculate the performance score for the day
                score = calculate_performance_score(actual_work, target_work, actual_break, target_break,
                                                    actual_distractions, target_distraction)
                # Add the score to the list of scores
                scores.append(score)

            else:
                # If there's no process flow data for the day, add -1 to the list of scores
                scores.append(-1)
        # Return a response with the list of scores and a 200 OK status
        return Response(scores, status=status.HTTP_200_OK)
