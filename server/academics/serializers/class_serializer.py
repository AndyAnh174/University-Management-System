from rest_framework import serializers
from academics.models import Class, Major
from .faculty import FacultyMinimalSerializer
from .major import MajorMinimalSerializer


class ClassSerializer(serializers.ModelSerializer):
    """Serializer for Class - used for list/detail views"""
    major = MajorMinimalSerializer(read_only=True)
    major_id = serializers.IntegerField(write_only=True)
    faculty = FacultyMinimalSerializer(source='major.faculty', read_only=True)
    
    class Meta:
        model = Class
        fields = [
            'id', 'code', 'name', 'description',
            'major', 'major_id', 'faculty',
            'academic_year', 'max_students',
            'is_active',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'major', 'faculty', 'created_at', 'updated_at']


class ClassCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for Class create/update with validation"""
    code = serializers.CharField(
        max_length=20,
        min_length=2,
        help_text="Mã lớp (2-20 ký tự, tự động uppercase)"
    )
    name = serializers.CharField(
        max_length=200,
        min_length=3,
        help_text="Tên lớp (3-200 ký tự)"
    )
    major_id = serializers.IntegerField(help_text="ID của ngành")
    academic_year = serializers.IntegerField(
        min_value=2000,
        max_value=2100,
        help_text="Năm học/khóa (2000-2100)"
    )
    max_students = serializers.IntegerField(
        min_value=1,
        max_value=500,
        default=50,
        help_text="Số sinh viên tối đa (1-500)"
    )
    
    class Meta:
        model = Class
        fields = [
            'code', 'name', 'description', 
            'major_id', 'academic_year', 'max_students',
            'is_active'
        ]
    
    def validate_code(self, value):
        code = value.strip().upper()
        
        instance = getattr(self, 'instance', None)
        queryset = Class.objects.filter(code=code)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                f"Mã lớp '{code}' đã tồn tại. Vui lòng chọn mã khác."
            )
        
        return code
    
    def validate_name(self, value):
        return value.strip()
    
    def validate_major_id(self, value):
        try:
            major = Major.objects.get(pk=value)
            if not major.is_active:
                raise serializers.ValidationError(
                    "Ngành đã ngừng tuyển sinh. Vui lòng chọn ngành khác."
                )
            return value
        except Major.DoesNotExist:
            raise serializers.ValidationError(
                f"Không tìm thấy ngành với ID {value}."
            )
    
    def create(self, validated_data):
        major_id = validated_data.pop('major_id')
        validated_data['major'] = Major.objects.get(pk=major_id)
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        if 'major_id' in validated_data:
            major_id = validated_data.pop('major_id')
            validated_data['major'] = Major.objects.get(pk=major_id)
        return super().update(instance, validated_data)


class ClassMinimalSerializer(serializers.ModelSerializer):
    """Minimal serializer for dropdowns/references"""
    major_code = serializers.CharField(source='major.code', read_only=True)
    
    class Meta:
        model = Class
        fields = ['id', 'code', 'name', 'academic_year', 'major_code']
