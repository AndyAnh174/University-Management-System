from rest_framework import serializers
from academics.models import Major, Faculty
from .faculty import FacultyMinimalSerializer


class MajorSerializer(serializers.ModelSerializer):
    """Serializer for Major - used for list/detail views"""
    faculty = FacultyMinimalSerializer(read_only=True)
    faculty_id = serializers.IntegerField(write_only=True)
    classes_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Major
        fields = [
            'id', 'code', 'name', 'description',
            'faculty', 'faculty_id',
            'is_active', 'classes_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'faculty', 'created_at', 'updated_at', 'classes_count']
    
    def get_classes_count(self, obj):
        return obj.classes.count()


class MajorCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for Major create/update with validation"""
    code = serializers.CharField(
        max_length=20,
        min_length=2,
        help_text="Mã ngành (2-20 ký tự, tự động uppercase)"
    )
    name = serializers.CharField(
        max_length=200,
        min_length=3,
        help_text="Tên ngành (3-200 ký tự)"
    )
    faculty_id = serializers.IntegerField(help_text="ID của khoa")
    
    class Meta:
        model = Major
        fields = ['code', 'name', 'description', 'faculty_id', 'is_active']
    
    def validate_code(self, value):
        code = value.strip().upper()
        
        instance = getattr(self, 'instance', None)
        queryset = Major.objects.filter(code=code)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                f"Mã ngành '{code}' đã tồn tại. Vui lòng chọn mã khác."
            )
        
        return code
    
    def validate_name(self, value):
        return value.strip()
    
    def validate_faculty_id(self, value):
        try:
            faculty = Faculty.objects.get(pk=value)
            if not faculty.is_active:
                raise serializers.ValidationError(
                    "Khoa đã ngừng hoạt động. Vui lòng chọn khoa khác."
                )
            return value
        except Faculty.DoesNotExist:
            raise serializers.ValidationError(
                f"Không tìm thấy khoa với ID {value}."
            )
    
    def create(self, validated_data):
        faculty_id = validated_data.pop('faculty_id')
        validated_data['faculty'] = Faculty.objects.get(pk=faculty_id)
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if 'faculty_id' in validated_data:
            faculty_id = validated_data.pop('faculty_id')
            validated_data['faculty'] = Faculty.objects.get(pk=faculty_id)
        return super().update(instance, validated_data)


class MajorMinimalSerializer(serializers.ModelSerializer):
    """Minimal serializer for dropdowns/references"""
    faculty_code = serializers.CharField(source='faculty.code', read_only=True)
    
    class Meta:
        model = Major
        fields = ['id', 'code', 'name', 'faculty_code']
