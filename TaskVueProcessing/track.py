import datetime
import json
import cv2
from ultralytics import YOLO
import dlib


class StateTimer:
    def __init__(self):
        self.start_time = None
        self.cumulative_time = datetime.timedelta(0)
        self.consecutive_time = datetime.timedelta(0)

    def start(self, current_time):
        if self.start_time is None:
            self.start_time = current_time

    def update(self, current_time):
        if self.start_time:
            self.consecutive_time = current_time - self.start_time

    def update_cumulative(self, current_time):
        if self.start_time:
            self.cumulative_time += current_time - self.start_time
            self.start_time = current_time

    def stop(self, current_time):
        if self.start_time:
            self.cumulative_time += current_time - self.start_time
            self.reset_consecutive()

    def reset_consecutive(self):
        self.consecutive_time = datetime.timedelta(0)
        self.start_time = None

    def get_cumulative_time(self):
        return self.cumulative_time.total_seconds()

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
            self.detect_phones = detect_phones
            self.detect_persons = detect_persons
            self.face_detector = dlib.get_frontal_face_detector()
            self.last_detection_time = None
            self.group = []
            self.file = None
            self._initialized = True
            self.model = YOLO('yolov8s.pt')
            self.drowsy_model = YOLO('best.pt')

            self.timers = {
                'phone': StateTimer(),
                'drowsy': StateTimer(),
                'multiple_persons': StateTimer(),
                'look_away': StateTimer()
            }

    def update_timers(self, current_states, current_time):
        for state, timer in self.timers.items():
            if state in current_states:
                timer.start(current_time)
                timer.update(current_time)
            else:
                timer.stop(current_time)

    def check_timers(self, current_time):
        for state, timer in self.timers.items():
            print(state, timer.get_consecutive_time())
            if timer.get_consecutive_time() > 10:
                print(f"{state} state has been active for more than 10 seconds consecutively.")
                timer.stop(current_time)

    def cleanup(self):
        """Clean up the JSON file by removing the last comma."""
        with open("detected_objects.json", "r") as file:
            content = file.read()
        last_comma_index = content.rfind(',')
        if last_comma_index != -1:
            content = content[:last_comma_index] + content[last_comma_index + 1:]
        with open('detected_objects.json', 'w') as file:
            file.write(content)

    def phone_detection(self, detection_boxes):
        """Detect phones and log events."""
        return "cell phone" in detection_boxes

    def _write_group_to_file(self, current_time):
        """Write detection group to file."""
        group_duration = (datetime.datetime.fromisoformat(self.group[-1]['timestamp']) -
                          datetime.datetime.fromisoformat(self.group[0]['timestamp'])).total_seconds()
        group_event = {'group': self.group, 'duration': group_duration}
        json_output = json.dumps(group_event, indent=4)
        self.file.write(json_output + ",\n")
        self.group = [{'event': 'Cell phone detected', 'timestamp': str(current_time)}]

    def person_detection(self, detection_boxes):
        """Detect persons in the frame."""
        return "person" in detection_boxes

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
                if (self.process_drowsy_detections(drowsy_results, roi)) == "drowsy":
                    current_states.append('drowsy')

            if num_persons > 1:
                current_states.append('multiple_persons')

            current_time = datetime.datetime.now()
            self.update_timers(current_states, current_time)
            self.check_timers(current_time)

            print(self.timers['phone'].get_cumulative_time())
            print(self.timers['drowsy'].get_cumulative_time())

    def process_drowsy_detections(self, results, frame):
        """Process drowsy detections."""
        boxes, confidences = [], []

        for result in results:
            if len(result.boxes.cpu().numpy()) == 0:
                print("Look Away detected")
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
                print("Drowsy detected")
                return "drowsy"

            if state == 'Look_Forward':
                print("Look Away detected")

    def run_detection_loop(self):
        """Run the main detection loop."""
        cap = cv2.VideoCapture(0)
        with open("detected_objects.json", "w+") as self.file:
            self.file.write("[\n")
            while cap.isOpened():
                success, frame = cap.read()
                if success:
                    results = self.model(frame, verbose=False)
                    self.compute_detections(results, frame)
                    annotated_frame = results[0].plot()
                    cv2.imshow("YOLOv8 Inference", annotated_frame)
                    if cv2.waitKey(1) & 0xFF == ord("q"):
                        break
                else:
                    break

            self._finalize_file()
        self.cleanup()
        cap.release()
        cv2.destroyAllWindows()

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


# Usage
detector = ObjectDetector.get_instance(detect_phones=True, detect_persons=True)
detector.run_detection_loop()
