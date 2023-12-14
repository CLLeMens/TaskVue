import json
import os
from datetime import datetime
from collections import defaultdict


class JsonFileWriter:
    def __init__(self):
        self.filename = datetime.now().strftime("%Y-%m-%d") + ".json"
        self.create_file()
        self.last_timestamp = None

    def create_file(self):
        if not os.path.exists(self.filename):
            with open(self.filename, 'w') as file:
                json.dump({}, file)

    def write(self, key, value, use_last_timestamp=False):
        if use_last_timestamp and self.last_timestamp:
            timestamp = self.last_timestamp
        else:
            timestamp = datetime.now().isoformat()
            self.last_timestamp = timestamp

        data = self.read_json()

        if timestamp in data:
            data[timestamp][key] = value
        else:
            data[timestamp] = {key: value}

        with open(self.filename, 'w') as file:
            json.dump(data, file, indent=4)

    def read_json(self):
        with open(self.filename, 'r') as file:
            return json.load(file)

    def calculate_cumulative_values(self):
        data = self.read_json()
        cumulative_values = defaultdict(float)

        for timestamp in data:
            for key, value in data[timestamp].items():
                cumulative_values[key] += value

        return dict(cumulative_values)


# Example Usage
#json_writer = JsonFileWriter()
#json_writer.write("key1", 1.2)
#json_writer.write("key2", 2.3)
#json_writer.write("key1", 0.7, use_last_timestamp=True)

#cumulative = json_writer.calculate_cumulative_values()
#print(cumulative)