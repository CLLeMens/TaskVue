"""
WSGI config for TaskVueWebServer project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

# Set the default Django settings module for the 'wsgi' command-line utility to 'TaskVueWebServer.settings'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TaskVueWebServer.settings')

# Get the WSGI (Web Server Gateway Interface) application object from Django
application = get_wsgi_application()
