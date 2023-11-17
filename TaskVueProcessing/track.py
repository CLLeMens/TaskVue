import datetime
import json
import cv2
from ultralytics import YOLO

###########################Detection Vars#####################################
detectPhones = True
detectPersons = True
###########################Detection Vars#####################################

def setDetectPhones(value):
    global detectPhones
    detectPhones = value

def setDetectPersons(value):
    global detectPersons
    detectPersons = value

def cleanup():
    with open("detected_objects.json", "r") as file:
        content = file.read()
    last_comma_index = content.rfind(',')
    if last_comma_index != -1:
        content = content[:last_comma_index] + content[last_comma_index + 1:]
    with open('detected_objects.json', 'w') as file:
        file.write(content)


def phoneDetection(detectionBoxes):
    global group_duration, group_event, json_output, group, last_detection_time
    if "cell phone" in detectionBoxes:
        current_time = datetime.datetime.now()
        if last_detection_time is not None:
            delta = current_time - last_detection_time
            if delta.total_seconds() < 1.5:
                event = {
                    'event': 'Cell phone detected',
                    'timestamp': str(current_time)
                }
                group.append(event)
            else:
                group_duration = (datetime.datetime.fromisoformat(
                    group[-1]['timestamp']) - datetime.datetime.fromisoformat(
                    group[0]['timestamp'])).total_seconds()
                group_event = {
                    'group': group,
                    'duration': group_duration
                }
                # Convert the group to JSON format and write it to the file
                json_output = json.dumps(group_event, indent=4)
                file.write(json_output + ",\n")
                # Start a new group
                group = [{
                    'event': 'Cell phone detected',
                    'timestamp': str(current_time)
                }]
        else:
            group = [{
                'event': 'Cell phone detected',
                'timestamp': str(current_time)
            }]
        last_detection_time = current_time


def compute_detections(results):
    global boxes, group_duration, group_event, json_output, group, last_detection_time
    for result in results:  # iterate results
        boxes = result.boxes.cpu().numpy()  # get boxes on cpu in numpy
        for box in boxes:  # iterate boxes
            r = box.xyxy[0].astype(int)  # get corner points as int
            cv2.rectangle(frame, r[:2], r[2:], (255, 255, 255), 2)  # draw boxes on img
            detectionBoxes = result.names[int(box.cls[0])]

            if detectPhones:
                phoneDetection(detectionBoxes)
            if detectPersons:
                personDetection(detectionBoxes)


def personDetection(detectionBoxes):
    if "person" in detectionBoxes:
        # add websocket event here
        print("person detected")


def yolo_detection_loop():
    global last_detection_time, group, file, frame, group_duration, group_event, json_output
    # Load the YOLOv8 model
    model = YOLO('yolov8m.pt')
    # Open the video file
    cap = cv2.VideoCapture(0)
    # Initialize the last detection time and the group
    last_detection_time = None
    group = []
    # Open a file to write the detected objects
    with open("detected_objects.json",
              "w+") as file:  # hier vllt a+ nehmen? (https://stackoverflow.com/questions/1466000/difference-between-modes-a-a-w-w-and-r-in-built-in-open-function)
        file.write("[\n")
        # Loop through the video frames
        while cap.isOpened():
            # Read a frame from the video
            success, frame = cap.read()

            if success:
                # Run YOLOv8 inference on the frame
                results = model(frame)

                compute_detections(results)
                # Visualize the results on the frame
                annotated_frame = results[0].plot()

                # Display the annotated frame
                cv2.imshow("YOLOv8 Inference", annotated_frame)

                # Break the loop if 'q' is pressed
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    if group:
                        group_duration = (datetime.datetime.fromisoformat(
                            group[-1]['timestamp']) - datetime.datetime.fromisoformat(
                            group[0]['timestamp'])).total_seconds()
                        group_event = {
                            'group': group,
                            'duration': group_duration
                        }
                        json_output = json.dumps(group_event, indent=4)
                        file.write(json_output + ",\n")
                    file.write("]\n")
                    break
            else:
                # Break the loop if the end of the video is reached
                if group:
                    group_duration = (datetime.datetime.fromisoformat(
                        group[-1]['timestamp']) - datetime.datetime.fromisoformat(
                        group[0]['timestamp'])).total_seconds()
                    group_event = {
                        'group': group,
                        'duration': group_duration
                    }
                    json_output = json.dumps(group_event, indent=4)
                    file.write(json_output + ",\n")
                file.write("]\n")
                break
    # Release the video capture object and close the display window
    cleanup()
    cap.release()
    cv2.destroyAllWindows()


yolo_detection_loop()
