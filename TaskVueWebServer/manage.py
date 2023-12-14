#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

from TaskVueWebServer.TaskVueProcessing.track import ObjectDetector


def main():
    current_directory = os.path.dirname(os.path.abspath(__file__))
    parent_directory = os.path.dirname(current_directory)
    sys.path.append(parent_directory)
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TaskVueWebServer.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
    objectDetector = ObjectDetector.get_instance()

if __name__ == '__main__':
    main()
