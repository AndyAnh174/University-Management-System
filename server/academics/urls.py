from django.urls import path, include
from rest_framework.routers import DefaultRouter
from academics.views import FacultyViewSet, MajorViewSet, ClassViewSet

router = DefaultRouter()
router.register(r'faculties', FacultyViewSet, basename='faculty')
router.register(r'majors', MajorViewSet, basename='major')
router.register(r'classes', ClassViewSet, basename='class')

urlpatterns = [
    path('', include(router.urls)),
]
