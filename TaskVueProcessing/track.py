from ultralytics import YOLO

model = YOLO('yolov8s.pt')

results = model.track(source=0,show=True)