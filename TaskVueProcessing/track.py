import datetime
import json
import cv2
from ultralytics import YOLO


class ObjectDetector:
    def __init__(self, detect_phones=True, detect_persons=True):
        self.detect_phones = detect_phones
        self.detect_persons = detect_persons
        self.last_detection_time = None
        self.group = []
        self.file = None

    def cleanup(self):
        with open("detected_objects.json", "r") as file:
            content = file.read()
        last_comma_index = content.rfind(',')
        if last_comma_index != -1:
            content = content[:last_comma_index] + content[last_comma_index + 1:]
        with open('detected_objects.json', 'w') as file:
            file.write(content)

    def phone_detection(self, detection_boxes):
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

    def _write_group_to_file(self, current_time):
        group_duration = (datetime.datetime.fromisoformat(
            self.group[-1]['timestamp']) - datetime.datetime.fromisoformat(
            self.group[0]['timestamp'])).total_seconds()
        group_event = {'group': self.group, 'duration': group_duration}
        json_output = json.dumps(group_event, indent=4)
        self.file.write(json_output + ",\n")
        self.group = [{'event': 'Cell phone detected', 'timestamp': str(current_time)}]

    def person_detection(self, detection_boxes):
        if "person" in detection_boxes:
            print("person detected")

    def compute_detections(self, results, frame):
        for result in results:
            boxes = result.boxes.cpu().numpy()
            for box in boxes:
                r = box.xyxy[0].astype(int)
                cv2.rectangle(frame, r[:2], r[2:], (255, 255, 255), 2)
                detection_boxes = result.names[int(box.cls[0])]

                if self.detect_phones:
                    self.phone_detection(detection_boxes)
                if self.detect_persons:
                    self.person_detection(detection_boxes)

    def run_detection_loop(self):
        model = YOLO('yolov8m.pt')
        cap = cv2.VideoCapture(0)
        with open("detected_objects.json", "w+") as self.file:
            self.file.write("[\n")
            while cap.isOpened():
                success, frame = cap.read()
                if success:
                    results = model(frame)
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
        if self.group:
            self._write_group_to_file(datetime.datetime.now())
        self.file.write("]\n")


# Usage
detector = ObjectDetector(detect_phones=True, detect_persons=True)
detector.run_detection_loop()