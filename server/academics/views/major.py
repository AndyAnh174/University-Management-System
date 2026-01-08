from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from users.permissions import IsAdmin
from core.mixins import AuditLogMixin
from academics.models import Major
from academics.serializers import (
    MajorSerializer,
    MajorCreateUpdateSerializer,
    MajorMinimalSerializer,
)


class MajorViewSet(AuditLogMixin, viewsets.ModelViewSet):
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
        
        faculty_id = request.query_params.get('faculty')
        if faculty_id:
            queryset = queryset.filter(faculty_id=faculty_id)
        
        queryset = queryset.order_by('faculty__name', 'name')
        serializer = MajorMinimalSerializer(queryset, many=True)
        return Response(serializer.data)
