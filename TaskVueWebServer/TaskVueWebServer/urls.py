from django.contrib import admin
from django.urls import path
from django.urls import path, include

# Define the URL patterns for this Django application
urlpatterns = [
    # For the path 'admin/', use the admin site's URLs
    path('admin/', admin.site.urls),
    # For paths starting with 'taskvue-api/', include the URLs from the TaskVueWebAPI application
    path('taskvue-api/', include('TaskVueWebAPI.urls')),
]
