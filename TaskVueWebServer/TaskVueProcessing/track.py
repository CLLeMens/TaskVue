import datetime
import json
import time
from collections import defaultdict

import cv2
from ultralytics import YOLO
import dlib
import os
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# from TaskVueWebServer.TaskVueProcessing.json_helper import JsonFileWriter

base_dir = os.path.dirname(os.path.abspath(__file__))


class JsonFileWriter:
    def __init__(self):
        self.filename = "track" + ".json"
        self.create_file()
        self.last_date = None

    def create_file(self):
        if not os.path.exists(self.filename):
            with open(self.filename, 'w') as file:
                json.dump({}, file)

    def write(self, key, value, start_time, stop_time, use_last_date=False):
        if use_last_date and self.last_date:
            date = self.last_date
        else:
            date = datetime.datetime.now().date().isoformat()
            self.last_date = date

        data = self.read_json()

        if date in data:
            if key in data[date]:
                if data[date][key][-1]["Start time"] == start_time:
                    data[date][key][-1]["Stop time"] = stop_time
                    data[date][key][-1]["Current cumulative time"] = value
                else:
                    data[date][key].append({
                        "Start time": start_time,
                        "Stop time": stop_time,
                        "Current cumulative time": value
                    })
            else:
                data[date][key] = [{
                    "Start time": start_time,
                    "Stop time": stop_time,
                    "Current cumulative time": value
                }]
        else:
            data[date] = {
                key: [{
                    "Start time": start_time,
                    "Stop time": stop_time,
                    "Current cumulative time": value
                }]
            }

        with open(self.filename, 'w') as file:
            json.dump(data, file, indent=4)

    def read_json(self):
        try:
            with open(self.filename, 'r') as file:
                return json.load(file)
        except (FileNotFoundError, ValueError):
            print("No json entries found, skipping...")
            return {}

    def calculate_cumulative_values(self):
        data = self.read_json()
        cumulative_values = defaultdict(float)

        for timestamp in data:
            for key, value in data[timestamp].items():
                cumulative_values[key] += value

        return dict(cumulative_values)


class StateTimer:
    def __init__(self):
        self.start_time = None
        self.last_update_time = None
        self.local_start_time = None
        self.cumulative_time = datetime.timedelta(0)
        self.consecutive_time = datetime.timedelta(0)
        self.has_exceeded_threshold = False

    def start(self, current_time):
        if self.start_time is None:
            self.start_time = current_time
            self.last_update_time = current_time

    # vor update last update time als start time setzen

    # todo: create file if not present
    def update_cumulative(self, current_time):
        if self.start_time:
            self.consecutive_time = current_time - self.start_time
            if self.consecutive_time.total_seconds() > 10:
                self.has_exceeded_threshold = True

            if self.has_exceeded_threshold:
                elapsed_time_since_last_update = current_time - self.last_update_time
                self.cumulative_time += elapsed_time_since_last_update
                self.last_update_time = current_time

    def stop(self, current_time):
        if self.start_time and self.has_exceeded_threshold:
            elapsed_time_since_last_update = current_time - self.last_update_time
            self.cumulative_time += elapsed_time_since_last_update

        self.consecutive_time = datetime.timedelta(0)
        self.start_time = None
        self.last_update_time = None
        self.has_exceeded_threshold = False

    def get_cumulative_time(self):
        return self.cumulative_time.total_seconds()

    def setLocalStartTime(self, current_time):
        self.local_start_time = current_time

    def get_consecutive_time(self):
        return self.consecutive_time.total_seconds()


class ObjectDetector:
    _instance = None

    def __new__(cls, *args, **kwargs):
        """Ensure the class is a singleton."""
        if not cls._instance:
            cls._instance = super(ObjectDetector, cls).__new__(cls)
        return cls._instance

    def __init__(self, detect_phones=True, detect_persons=True):
        """Initialize the detector with given settings."""
        if not hasattr(self, '_initialized'):  # Avoid reinitialization
            self.json_helper = JsonFileWriter()
            self.running = False
            self.detect_phones = detect_phones
            self.detect_persons = detect_persons
            self.face_detector = dlib.get_frontal_face_detector()
            self.first_detection_time = None
            self.group = []
            self.file = None
            self._initialized = True
            self.model = YOLO(os.path.join(base_dir, 'yolov8s.pt'))
            self.drowsy_model = YOLO(os.path.join(base_dir, 'best.pt'))
            self.timers = {
                'phone': StateTimer(),
                'drowsy': StateTimer(),
                'multiple_persons': StateTimer(),
                'look_away': StateTimer(),
                'no_persons': StateTimer()
            }

    def update_timers(self, current_states, current_time):
        for state, timer in self.timers.items():
            if state in current_states:
                timer.start(current_time)
                timer.update_cumulative(current_time)
            else:
                timer.stop(current_time)

    def check_timers(self):
        channel_layer = get_channel_layer()
        for state, timer in self.timers.items():
            if timer.get_consecutive_time() > 10:
                if timer.local_start_time is None:
                    timer.setLocalStartTime(datetime.datetime.now())
                message = f"{state}"
                self.json_helper.write(state, self.timers[message].get_cumulative_time(),
                                       start_time=timer.local_start_time.strftime("%H:%M:%S"),
                                       stop_time=datetime.datetime.now().strftime("%H:%M:%S"))
                print(message)
                print("Sending message to frontend")
                # Senden der Nachricht an den WebSocket
                async_to_sync(channel_layer.group_send)(
                    "taskvue_group",  # Gruppenname, den Sie verwenden möchten
                    {
                        "type": "send_message_to_frontend",
                        "message": message
                    }
                )
            else:
                if timer.local_start_time is not None:
                    timer.setLocalStartTime(None)
                    print("Reset StartTime for: " + state)

    def cleanup(self):
        """Clean up the JSON file by removing the last comma."""
        with open(os.path.join(base_dir, "detected_objects.json"), "r") as file:
            content = file.read()
        last_comma_index = content.rfind(',')
        if last_comma_index != -1:
            content = content[:last_comma_index] + content[last_comma_index + 1:]
        with open(os.path.join(base_dir, "detected_objects.json"), 'w') as file:
            file.write(content)

    def phone_detection(self, detection_boxes):
        """Detect phones and log events."""
        return "cell phone" in detection_boxes

    def person_detection(self, detection_boxes):
        """Detect persons in the frame."""
        return "person" in detection_boxes

    def _write_group_to_file(self, current_time):
        """Write detection group to file."""
        group_duration = (datetime.datetime.fromisoformat(self.group[-1]['timestamp']) -
                          datetime.datetime.fromisoformat(self.group[0]['timestamp'])).total_seconds()
        group_event = {'group': self.group, 'duration': group_duration}
        json_output = json.dumps(group_event, indent=4)
        self.file.write(json_output + ",\n")
        self.group = [{'event': 'Cell phone detected', 'timestamp': str(current_time)}]

    def compute_detections(self, results, frame):
        current_states = []
        num_persons, max_area, main_person_box = 0, 0, None

        for result in results:
            boxes = result.boxes.cpu().numpy()
            for box in boxes:
                r = box.xyxy[0].astype(int)
                cv2.rectangle(frame, r[:2], r[2:], (255, 255, 255), 2)
                detection_box_name = result.names[int(box.cls[0])]

                if self.detect_phones:

                    if self.phone_detection(detection_box_name):
                        current_states.append('phone')

                if self.detect_persons:
                    person_detected = self.person_detection(detection_box_name)
                    if person_detected:
                        num_persons += 1
                        area = (r[2] - r[0]) * (r[3] - r[1])
                        if area > max_area:
                            max_area = area
                            main_person_box = r

            if main_person_box is not None:
                x1, y1, x2, y2 = main_person_box
                roi = frame[y1:y2, x1:x2]

                drowsy_results = self.drowsy_model(roi, verbose=False)
                self.process_drowsy_detections(drowsy_results, roi, current_states)

            if num_persons == 0:
                current_states.append('no_persons')

            if num_persons > 1:
                current_states.append('multiple_persons')

            current_time = datetime.datetime.now()
            self.update_timers(current_states, current_time)
            self.check_timers()
            print(self.timers['phone'].get_cumulative_time())

    def process_drowsy_detections(self, results, frame, current_states):
        """Process drowsy detections."""
        boxes, confidences = [], []

        for result in results:
            if len(result.boxes.cpu().numpy()) == 0:
                print("No face detected")
                current_states.append('look_away')

            for box in result.boxes.cpu().numpy():
                r = box.xyxy[0].astype(int)
                boxes.append(r)
                confidences.append(box.conf.item())

        indices = cv2.dnn.NMSBoxes(boxes, confidences, score_threshold=0.5, nms_threshold=0.4)
        indices = [indices] if isinstance(indices, int) else indices

        for i in indices:
            r = boxes[i]
            state = result.names[int(box.cls[0])]
            confidence = confidences[i]
            text = f"{state} {confidence:.2f}"
            cv2.putText(frame, text, (r[0], r[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            cv2.rectangle(frame, r[:2], r[2:], (0, 0, 255), 2)

            if state == "drowsy":
                current_states.append('drowsy')

            if state == 'Look_Forward':
                current_states.append('look_away')

    def run_detection_loop(self):
        """Run the main detection loop."""
        self.running = True
        cap = cv2.VideoCapture(0)
        with open("detected_objects.json", "w+") as self.file:
            self.file.write("[\n")
            while self.running and cap.isOpened():
                success, frame = cap.read()
                if success:
                    results = self.model(frame, verbose=False)
                    self.compute_detections(results, frame)
                    if cv2.waitKey(1) & 0xFF == ord("q"):
                        break
                else:
                    break

            self._finalize_file()
        self.cleanup()
        cap.release()
        cv2.destroyAllWindows()

    def stop_detection(self):
        """Stop the detection loop."""
        self.running = False

    def _finalize_file(self):
        """Finalize and close the file."""
        if self.group:
            self._write_group_to_file(datetime.datetime.now())
        self.file.write("]\n")

    @classmethod
    def get_instance(cls, *args, **kwargs):
        """Get an instance of the class."""
        if not cls._instance:
            cls._instance = ObjectDetector(*args, **kwargs)
        return cls._instance
