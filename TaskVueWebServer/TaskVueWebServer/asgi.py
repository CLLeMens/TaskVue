import os

from django.core.asgi import get_asgi_application
from django.urls import path

from TaskVueWebServer.TaskVueWebServer.consumer import TaskVueConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TaskVueWebServer.settings')

django_asgi_app = get_asgi_application()

from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator
from channels.routing import ProtocolTypeRouter, URLRouter, ChannelNameRouter

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                [
                    path('timer/', TaskVueConsumer.as_asgi()),
                ]
            )
        )
    ),
})
