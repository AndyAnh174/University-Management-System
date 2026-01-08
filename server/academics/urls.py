from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FacultyViewSet, MajorViewSet

router = DefaultRouter()
router.register(r'faculties', FacultyViewSet, basename='faculty')
router.register(r'majors', MajorViewSet, basename='major')

urlpatterns = [
    path('', include(router.urls)),
]
