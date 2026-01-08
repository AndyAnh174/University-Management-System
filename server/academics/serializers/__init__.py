# Serializers package for academics app
from .faculty import (
    FacultySerializer,
    FacultyCreateUpdateSerializer,
    FacultyMinimalSerializer,
)
from .major import (
    MajorSerializer,
    MajorCreateUpdateSerializer,
    MajorMinimalSerializer,
)
from .class_serializer import (
    ClassSerializer,
    ClassCreateUpdateSerializer,
    ClassMinimalSerializer,
)

__all__ = [
    # Faculty
    'FacultySerializer',
    'FacultyCreateUpdateSerializer',
    'FacultyMinimalSerializer',
    # Major
    'MajorSerializer',
    'MajorCreateUpdateSerializer',
    'MajorMinimalSerializer',
    # Class
    'ClassSerializer',
    'ClassCreateUpdateSerializer',
    'ClassMinimalSerializer',
]
