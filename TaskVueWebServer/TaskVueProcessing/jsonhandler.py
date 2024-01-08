class JsonFileWriter:
    def __init__(self):
        self.filename = "track" + ".json"
        self.create_file()
        self.last_date = None


    def create_file(self):
        if not os.path.exists(self.filename):
            with open(self.filename, 'w') as file:
                json.dump({}, file)

    def write(self, key, value, use_last_date=False):
        if use_last_date and self.last_date:
            date = self.last_date
        else:
            date = datetime.datetime.now().date().isoformat()
            self.last_date = date

        data = self.read_json()

        if date in data:
            data[date][key] = value
        else:
            data[date] = {key: value}

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
