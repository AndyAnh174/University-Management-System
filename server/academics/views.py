from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from users.permissions import IsAdmin
from .models import Faculty
from .serializers import (
    FacultySerializer,
    FacultyCreateUpdateSerializer,
    FacultyMinimalSerializer,
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
