from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from users.permissions import IsAdmin
from .models import Faculty, Major, Class
from .serializers import (
    FacultySerializer,
    FacultyCreateUpdateSerializer,
    FacultyMinimalSerializer,
    MajorSerializer,
    MajorCreateUpdateSerializer,
    MajorMinimalSerializer,
    ClassSerializer,
    ClassCreateUpdateSerializer,
    ClassMinimalSerializer,
)


class FacultyViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Faculty management - Admin only
    
    Endpoints:
    - GET /api/v1/faculties/ - List all faculties (with pagination, search, filter)
    - GET /api/v1/faculties/{id}/ - Get faculty detail
    - POST /api/v1/faculties/ - Create new faculty
    - PATCH /api/v1/faculties/{id}/ - Update faculty (partial)
    - DELETE /api/v1/faculties/{id}/ - Delete faculty (blocked if has majors)
    """
    queryset = Faculty.objects.all()
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['code', 'name']
    ordering_fields = ['code', 'name', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return FacultyCreateUpdateSerializer
        if self.action == 'dropdown':
            return FacultyMinimalSerializer
        return FacultySerializer
    
    @swagger_auto_schema(
        operation_description="Get list of all faculties with pagination, search and filter",
        manual_parameters=[
            openapi.Parameter(
                'search', openapi.IN_QUERY,
                description="Search by code or name",
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'is_active', openapi.IN_QUERY,
                description="Filter by active status",
                type=openapi.TYPE_BOOLEAN
            ),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Get faculty detail by ID",
        responses={
            200: FacultySerializer,
            404: "Faculty not found"
        }
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Create a new faculty",
        request_body=FacultyCreateUpdateSerializer,
        responses={
            201: FacultySerializer,
            400: "Validation error"
        }
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        faculty = serializer.save()
        
        # Return full faculty data
        output_serializer = FacultySerializer(faculty)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    
    @swagger_auto_schema(
        operation_description="Update faculty (partial update)",
        request_body=FacultyCreateUpdateSerializer,
        responses={
            200: FacultySerializer,
            400: "Validation error",
            404: "Faculty not found"
        }
    )
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        faculty = serializer.save()
        
        output_serializer = FacultySerializer(faculty)
        return Response(output_serializer.data)
    
    @swagger_auto_schema(
        operation_description="Delete faculty (blocked if has related majors)",
        responses={
            204: "Deleted successfully",
            400: "Cannot delete - has related majors",
            404: "Faculty not found"
        }
    )
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Check if has related majors
        majors_count = instance.majors.count()
        if majors_count > 0:
            return Response(
                {
                    'detail': f"Không thể xóa khoa '{instance.name}' vì còn {majors_count} ngành liên quan. "
                              f"Vui lòng xóa các ngành trước hoặc đặt is_active=false."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @swagger_auto_schema(
        operation_description="Get minimal faculty list for dropdowns",
        responses={200: FacultyMinimalSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def dropdown(self, request):
        """Get active faculties for dropdown selection"""
        queryset = Faculty.objects.filter(is_active=True).order_by('name')
        serializer = FacultyMinimalSerializer(queryset, many=True)
        return Response(serializer.data)


class MajorViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Major management - Admin only
    
    Endpoints:
    - GET /api/v1/majors/ - List all majors (with filter by faculty_id, pagination, search)
    - GET /api/v1/majors/{id}/ - Get major detail
    - POST /api/v1/majors/ - Create new major (requires faculty_id)
    - PATCH /api/v1/majors/{id}/ - Update major (partial)
    - DELETE /api/v1/majors/{id}/ - Delete major (blocked if has classes)
    """
    queryset = Major.objects.select_related('faculty').all()
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'faculty', 'faculty__code']
    search_fields = ['code', 'name']
    ordering_fields = ['code', 'name', 'faculty__name', 'created_at']
    ordering = ['faculty__name', 'name']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return MajorCreateUpdateSerializer
        if self.action == 'dropdown':
            return MajorMinimalSerializer
        return MajorSerializer
    
    @swagger_auto_schema(
        operation_description="Get list of all majors with pagination, search and filter",
        manual_parameters=[
            openapi.Parameter(
                'search', openapi.IN_QUERY,
                description="Search by code or name",
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'faculty', openapi.IN_QUERY,
                description="Filter by faculty ID",
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'is_active', openapi.IN_QUERY,
                description="Filter by active status",
                type=openapi.TYPE_BOOLEAN
            ),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Get major detail by ID",
        responses={
            200: MajorSerializer,
            404: "Major not found"
        }
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Create a new major (requires faculty_id)",
        request_body=MajorCreateUpdateSerializer,
        responses={
            201: MajorSerializer,
            400: "Validation error"
        }
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        major = serializer.save()
        
        output_serializer = MajorSerializer(major)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    
    @swagger_auto_schema(
        operation_description="Update major (partial update)",
        request_body=MajorCreateUpdateSerializer,
        responses={
            200: MajorSerializer,
            400: "Validation error",
            404: "Major not found"
        }
    )
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        major = serializer.save()
        
        output_serializer = MajorSerializer(major)
        return Response(output_serializer.data)
    
    @swagger_auto_schema(
        operation_description="Delete major (blocked if has related classes)",
        responses={
            204: "Deleted successfully",
            400: "Cannot delete - has related classes",
            404: "Major not found"
        }
    )
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Check if has related classes
        classes_count = instance.classes.count()
        if classes_count > 0:
            return Response(
                {
                    'detail': f"Không thể xóa ngành '{instance.name}' vì còn {classes_count} lớp liên quan. "
                              f"Vui lòng xóa các lớp trước hoặc đặt is_active=false."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @swagger_auto_schema(
        operation_description="Get minimal major list for dropdowns (optionally filter by faculty)",
        manual_parameters=[
            openapi.Parameter(
                'faculty', openapi.IN_QUERY,
                description="Filter by faculty ID for dependent dropdown",
                type=openapi.TYPE_INTEGER
            ),
        ],
        responses={200: MajorMinimalSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def dropdown(self, request):
        """Get active majors for dropdown selection, optionally filtered by faculty"""
        queryset = Major.objects.filter(is_active=True).select_related('faculty')
        
        # Filter by faculty if provided
        faculty_id = request.query_params.get('faculty')
        if faculty_id:
            queryset = queryset.filter(faculty_id=faculty_id)
        
        queryset = queryset.order_by('faculty__name', 'name')
        serializer = MajorMinimalSerializer(queryset, many=True)
        return Response(serializer.data)


class ClassViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Class management - Admin only
    
    Endpoints:
    - GET /api/v1/classes/ - List all classes (with filter by major_id, academic_year, search)
    - GET /api/v1/classes/{id}/ - Get class detail
    - POST /api/v1/classes/ - Create new class (requires major_id, academic_year)
    - PATCH /api/v1/classes/{id}/ - Update class (partial)
    - DELETE /api/v1/classes/{id}/ - Delete class (future: block if has students)
    """
    queryset = Class.objects.select_related('major', 'major__faculty').all()
    permission_classes = [IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active', 'major', 'major__faculty', 'academic_year']
    search_fields = ['code', 'name']
    ordering_fields = ['code', 'name', 'academic_year', 'major__name', 'created_at']
    ordering = ['-academic_year', 'major__name', 'name']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ClassCreateUpdateSerializer
        if self.action == 'dropdown':
            return ClassMinimalSerializer
        return ClassSerializer
    
    @swagger_auto_schema(
        operation_description="Get list of all classes with pagination, search and filter",
        manual_parameters=[
            openapi.Parameter(
                'search', openapi.IN_QUERY,
                description="Search by code or name",
                type=openapi.TYPE_STRING
            ),
            openapi.Parameter(
                'major', openapi.IN_QUERY,
                description="Filter by major ID",
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'major__faculty', openapi.IN_QUERY,
                description="Filter by faculty ID",
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'academic_year', openapi.IN_QUERY,
                description="Filter by academic year (e.g., 2021, 2022)",
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'is_active', openapi.IN_QUERY,
                description="Filter by active status",
                type=openapi.TYPE_BOOLEAN
            ),
        ]
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Get class detail by ID",
        responses={
            200: ClassSerializer,
            404: "Class not found"
        }
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
    
    @swagger_auto_schema(
        operation_description="Create a new class (requires major_id and academic_year)",
        request_body=ClassCreateUpdateSerializer,
        responses={
            201: ClassSerializer,
            400: "Validation error"
        }
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        class_obj = serializer.save()
        
        output_serializer = ClassSerializer(class_obj)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    
    @swagger_auto_schema(
        operation_description="Update class (partial update)",
        request_body=ClassCreateUpdateSerializer,
        responses={
            200: ClassSerializer,
            400: "Validation error",
            404: "Class not found"
        }
    )
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        class_obj = serializer.save()
        
        output_serializer = ClassSerializer(class_obj)
        return Response(output_serializer.data)
    
    @swagger_auto_schema(
        operation_description="Delete class (future: will be blocked if has students/teachers assigned)",
        responses={
            204: "Deleted successfully",
            400: "Cannot delete - has related data",
            404: "Class not found"
        }
    )
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # TODO: Add check for students/teachers when those models are implemented
        # For now, just allow deletion
        
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @swagger_auto_schema(
        operation_description="Get minimal class list for dropdowns (optionally filter by major and/or academic_year)",
        manual_parameters=[
            openapi.Parameter(
                'major', openapi.IN_QUERY,
                description="Filter by major ID for dependent dropdown",
                type=openapi.TYPE_INTEGER
            ),
            openapi.Parameter(
                'academic_year', openapi.IN_QUERY,
                description="Filter by academic year",
                type=openapi.TYPE_INTEGER
            ),
        ],
        responses={200: ClassMinimalSerializer(many=True)}
    )
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def dropdown(self, request):
        """Get active classes for dropdown selection, optionally filtered by major/academic_year"""
        queryset = Class.objects.filter(is_active=True).select_related('major')
        
        # Filter by major if provided
        major_id = request.query_params.get('major')
        if major_id:
            queryset = queryset.filter(major_id=major_id)
        
        # Filter by academic_year if provided
        academic_year = request.query_params.get('academic_year')
        if academic_year:
            queryset = queryset.filter(academic_year=academic_year)
        
        queryset = queryset.order_by('-academic_year', 'major__name', 'name')
        serializer = ClassMinimalSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @swagger_auto_schema(
        operation_description="Get list of available academic years",
        responses={200: "List of academic years"}
    )
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def academic_years(self, request):
        """Get distinct academic years for filter dropdown"""
        years = Class.objects.values_list('academic_year', flat=True).distinct().order_by('-academic_year')
        return Response(list(years))
