import os

from django.core.asgi import get_asgi_application
from django.urls import path
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from channels.routing import ProtocolTypeRouter, URLRouter, ChannelNameRouter
from TaskVueWebServer.consumer import TaskVueConsumer


# Set the default Django settings module for the 'asgi' command-line utility to 'TaskVueWebServer.settings'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TaskVueWebServer.settings')

# Get the ASGI (Asynchronous Server Gateway Interface) application object from Django
django_asgi_app = get_asgi_application()

# Define the application to be a protocol type router
application = ProtocolTypeRouter({
    # For 'http' type connections, just use the Django ASGI application
    'http': django_asgi_app,
    # For 'websocket' type connections, use a stack of middleware
    'websocket': AllowedHostsOriginValidator(
        # Use the authentication middleware stack
        AuthMiddlewareStack(
            # Use a URL router
            URLRouter(
                # The only route is 'timer/', which is handled by the TaskVueConsumer ASGI application
                [
                    path('timer/', TaskVueConsumer.as_asgi()),
                ]
            )
        )
    ),
})