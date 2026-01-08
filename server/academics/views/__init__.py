# Views package for academics app
from .faculty import FacultyViewSet
from .major import MajorViewSet
from .class_view import ClassViewSet

__all__ = [
    'FacultyViewSet',
    'MajorViewSet', 
    'ClassViewSet',
]
