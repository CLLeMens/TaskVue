# Project Name

TaskVue

## Description

TaskVue is a powerful project management tool designed to revolutionize the way you organize and track your tasks. With its intuitive interface and advanced features, TaskVue empowers you to stay focused, productive, and in control of your projects.

But TaskVue doesn't stop there. It goes beyond traditional project management tools by incorporating cutting-edge technology. Leveraging the power of Object Detection via webcam, TaskVue can detect drowsiness and distractions in real-time. This innovative feature ensures that you maintain optimal productivity by alerting you when you need to take a break or refocus your attention.

Whether you're a freelancer, a team leader, or a busy professional, TaskVue is your ultimate companion for efficient task management. Say goodbye to missed deadlines, scattered thoughts, and unproductive days. Experience the power of TaskVue and unlock your true potential.

## Installation

### Special dependencies for Windows Clients

1. Follow these Steps to install Redis on Windows (for Websockets) https://redis.io/docs/install/install-redis/install-redis-on-windows/

To install and set up TaskVue, follow these steps:

1. Clone the repository: `git clone https://github.com/your-username/TaskVue.git`
2. Navigate to the project directory: `cd TaskVue`
3. Install the backend dependencies: `pip install -r requirements.txt`
4. Navigate to the frontend directory: `cd TaskVueWebClient`
5. Install the frontend dependencies: `npm install`
6. Start the backend server with Daphne:
    - Navigate to the backend directory: `cd TaskVueWebServer`
    - Run Daphne: `daphne -p 8000 TaskVueWebServer.asgi:application`
7. Start the frontend development server:
    - Navigate to the frontend directory: `cd TaskVueWebClient`
    - Run the development server: `npm start-dev`
8. Start managing your tasks!

## Usage

To use TaskVue, follow these steps:

1. Start the backend server with Daphne:
    - Navigate to the backend directory: `cd TaskVueWebServer`
    - Run Daphne: `daphne -p 8000 TaskVueWebServer.asgi:application`
2. Start the frontend development server:
    - Navigate to the frontend directory: `cd TaskVueWebClient`
    - Run the development server: `npm start-dev`
3. Create an account or log in if you already have one
4. Start managing your tasks!

## Contributing

We welcome contributions from the community! To contribute to TaskVue, please follow these guidelines:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m 'Add your feature description'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## License

TaskVue is distributed under the MIT License. See the [LICENSE](./LICENSE) file for more information.

## Contact

For any inquiries or questions, please contact us at taskvue@example.com.
