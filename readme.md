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
0. (Optional/Recommended: Setup & activate a python venv)
1. Clone the repository
2. Navigate to the project directory: `cd TaskVue`
3. Install the backend dependencies: `pip install -r requirements.txt`
4. Navigate to the frontend directory: `cd TaskVueWebClient`
5. Install the frontend dependencies: `npm install`
6. Start the backend server with Daphne:
    - Navigate to the backend directory: `cd TaskVueWebServer`
    - Run Daphne: `daphne -p 8000 TaskVueWebServer.asgi:application`
7. Start the frontend development server:
    - Navigate to the frontend directory: `cd TaskVueWebClient`
    - Run the development server: `npm run start-dev`
8. Start managing your tasks!

## Usage

To use TaskVue, follow these steps:

1. Start the backend server with Daphne:
    - Navigate to the backend directory: `cd TaskVueWebServer`
    - Run Daphne: `daphne -p 8000 TaskVueWebServer.asgi:application`
2. Start the frontend development server:
    - Navigate to the frontend directory: `cd TaskVueWebClient`
    - Run the development server: `npm run start-dev`
3. Start managing your tasks!

## FAQs

- "My program wont track me after MacOS requested camera access for the app" -> Every app has to restart after initially granting permissions, ours is sadly no exception.

- "My program takes a long while to send notifications" -> Set the tracking grade higher in the settings, it changes the notification threshold.

- "It takes a long time until the first countdown begins" -> The Object Detection Model is most likely being downloaded in the background, once downloaded the startup should be way quicker
