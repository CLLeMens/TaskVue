import datetime
import json
from itertools import chain

import cv2
from ultralytics import YOLO
import dlib

class ObjectDetector:
    _instance = None

    def __new__(cls, *args, **kwargs):
        """Ensure the class is a singleton."""
        if not cls._instance:
            cls._instance = super(ObjectDetector, cls).__new__(cls)
        return cls._instance

    def __init__(self, detect_phones=True, detect_persons=True, detect_drowsiness=True):
        """Initialize the detector with given settings."""

        if not hasattr(self, '_initialized'):  # Avoid reinitialization
            self.detect_phones = detect_phones
            self.detect_persons = detect_persons
            self.detect_drowsiness = detect_drowsiness
            self.face_detector = dlib.get_frontal_face_detector()
            self.predictor = dlib.shape_predictor("shape_predictor_68_face_landmarks.dat")
            self.last_detection_time = None
            self.group = []
            self.file = None
            self._initialized = True
            self.model = YOLO('yolov8s.pt')
            self.drowsy_model = YOLO('best.pt')
            self.start_consecutive_drowsy_time = None
            self.cumulative_drowsy_time = datetime.timedelta(0)


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
        if "cell phone" in detection_boxes:
            current_time = datetime.datetime.now()
            if self.last_detection_time is not None:
                delta = current_time - self.last_detection_time
                if delta.total_seconds() < 1.5:
                    event = {'event': 'Cell phone detected', 'timestamp': str(current_time)}
                    self.group.append(event)
                else:
                    self._write_group_to_file(current_time)
            else:
                self.group = [{'event': 'Cell phone detected', 'timestamp': str(current_time)}]
            self.last_detection_time = current_time

    def drowsy_detection(self, detection_boxes):
        current_time = datetime.datetime.now()

        if "drowsy" in detection_boxes:
            if self.start_consecutive_drowsy_time is None:
                # Drowsiness just started
                self.start_consecutive_drowsy_time = current_time

            # Calculate consecutive drowsy time
            consecutive_drowsy_time = current_time - self.start_consecutive_drowsy_time
        else:
            if self.start_consecutive_drowsy_time is not None:
                # Drowsiness just ended, update cumulative time
                self.cumulative_drowsy_time += current_time - self.start_consecutive_drowsy_time
                self.start_consecutive_drowsy_time = None  # Reset the start time

            consecutive_drowsy_time = datetime.timedelta(0)  # Reset consecutive drowsy time

        print(f"Consecutive Drowsiness Time: {consecutive_drowsy_time.total_seconds()} seconds")
        print(f"Cumulative Drowsiness Time: {self.cumulative_drowsy_time.total_seconds()} seconds")
    def _write_group_to_file(self, current_time):
        """Write detection group to file."""
        group_duration = (datetime.datetime.fromisoformat(self.group[-1]['timestamp']) -
                          datetime.datetime.fromisoformat(self.group[0]['timestamp'])).total_seconds()
        group_event = {'group': self.group, 'duration': group_duration}
        json_output = json.dumps(group_event, indent=4)
        self.file.write(json_output + ",\n")
        self.group = [{'event': 'Cell phone detected', 'timestamp': str(current_time)}]

    def person_detection(self, detection_boxes, frame):
        """Detect persons in the frame."""
        return "person" in detection_boxes



    def compute_detections(self, results_yolo, results_drowsy, frame):
        num_persons, max_area, main_person_box = 0, 0, None
        results = chain(results_yolo, results_drowsy)
        for result in results:
            boxes = result.boxes.cpu().numpy()
            for box in boxes:
                r = box.xyxy[0].astype(int)
                cv2.rectangle(frame, r[:2], r[2:], (255, 255, 255), 2)
                detection_box_name = result.names[int(box.cls[0])]

                if self.detect_phones:
                    self.phone_detection(detection_box_name)
                if self.detect_persons:
                    person_detected = self.person_detection(detection_box_name, frame)
                    if person_detected:
                        num_persons += 1
                        area = (r[2] - r[0]) * (r[3] - r[1])
                        if area > max_area:
                            max_area = area
                            main_person_box = r
                if self.detect_drowsiness:
                    print("bruh")
                    self.drowsy_detection(detection_box_name)

            if main_person_box is not None:
                x1, y1, x2, y2 = main_person_box
                roi = frame[y1:y2, x1:x2]

                drowsy_results = self.drowsy_model(roi)
                self.process_drowsy_detections(drowsy_results, roi, main_person_box)

            print("Number of Persons: ", num_persons)

    def process_drowsy_detections(self, results, frame, main_person_box):
        """Process drowsy detections."""
        boxes, confidences = [], []
        for result in results:
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


    def run_detection_loop(self):
        """Run the main detection loop."""
        cap = cv2.VideoCapture(0)
        with open("detected_objects.json", "w+") as self.file:
            self.file.write("[\n")
            while cap.isOpened():
                success, frame = cap.read()
                if success:
                    results = self.model(frame)
                    results_drowsy = self.drowsy_model(frame)
                    self.compute_detections(results, results_drowsy, frame)
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