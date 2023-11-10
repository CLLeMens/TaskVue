import datetime
import json

import cv2
from ultralytics import YOLO

def cleanup():
    with open("detected_objects.json", "r") as file:
        content = file.read()
    last_comma_index = content.rfind(',')
    if last_comma_index != -1:
        content = content[:last_comma_index] + content[last_comma_index + 1:]
    with open('detected_objects.json', 'w') as file:
            file.write(content)

# Load the YOLOv8 model
model = YOLO('yolov8n.pt')

# Open the video file
cap = cv2.VideoCapture(0)

# Open a file to write the detected objects
with open("detected_objects.json", "w+") as file: #hier vllt a+ nehmen? (https://stackoverflow.com/questions/1466000/difference-between-modes-a-a-w-w-and-r-in-built-in-open-function)
    file.write("[\n")
    # Loop through the video frames
    while cap.isOpened():
        # Read a frame from the video
        success, frame = cap.read()

        if success:
            # Run YOLOv8 inference on the frame
            results = model(frame)

            for result in results:  # iterate results
                boxes = result.boxes.cpu().numpy()  # get boxes on cpu in numpy
                for box in boxes:  # iterate boxes
                    r = box.xyxy[0].astype(int)  # get corner points as int
                    #print(r)  # print boxes
                    cv2.rectangle(frame, r[:2], r[2:], (255, 255, 255), 2)  # draw boxes on img
                    if "cell phone" in result.names[int(box.cls[0])]:
                        event = {
                            'event': 'Cell phone detected',
                            'timestamp': str(datetime.datetime.now())
                        }
                        # Convert the output to JSON format
                        json_output = json.dumps(event, indent=4)
                        file.write(json_output + ",\n")
            # Visualize the results on the frame
            annotated_frame = results[0].plot()

            # Display the annotated frame
            cv2.imshow("YOLOv8 Inference", annotated_frame)

            # Break the loop if 'q' is pressed
            if cv2.waitKey(1) & 0xFF == ord("q"):
                trailingcomma=file.read()
                file.write("]\n")
                break
        else:
            # Break the loop if the end of the video is reached
            file.write("]\n")
            break

# Release the video capture object and close the display window
cleanup()
cap.release()
cv2.destroyAllWindows()
