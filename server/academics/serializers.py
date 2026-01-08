from rest_framework import serializers
from .models import Faculty, Major, Class


class FacultySerializer(serializers.ModelSerializer):
    """
    Serializer for Faculty - used for list/detail views
    """
    majors_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Faculty
        fields = [
            'id', 'code', 'name', 'description', 
            'is_active', 'majors_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'majors_count']
    
    def get_majors_count(self, obj):
        return obj.majors.count()


class FacultyCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for Faculty create/update with validation
    """
    code = serializers.CharField(
        max_length=20,
        min_length=2,
        help_text="Mã khoa (2-20 ký tự, tự động uppercase)"
    )
    name = serializers.CharField(
        max_length=200,
        min_length=3,
        help_text="Tên khoa (3-200 ký tự)"
    )
    
    class Meta:
        model = Faculty
        fields = ['code', 'name', 'description', 'is_active']
    
    def validate_code(self, value):
        """Validate and normalize code: uppercase, trim"""
        code = value.strip().upper()
        
        # Check unique (exclude current instance on update)
        instance = getattr(self, 'instance', None)
        queryset = Faculty.objects.filter(code=code)
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                f"Mã khoa '{code}' đã tồn tại. Vui lòng chọn mã khác."
            )
        
        return code
    
    def validate_name(self, value):
        """Trim name"""
        return value.strip()


class FacultyMinimalSerializer(serializers.ModelSerializer):
    """
    Minimal serializer for dropdowns/references
    """
    class Meta:
        model = Faculty
        fields = ['id', 'code', 'name']


# ==================== Major Serializers ====================

class MajorSerializer(serializers.ModelSerializer):
    """
    Serializer for Major - used for list/detail views
    """
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
    """
    Serializer for Major create/update with validation
    """
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
    faculty_id = serializers.IntegerField(
        help_text="ID của khoa"
    )
    
    class Meta:
        model = Major
        fields = ['code', 'name', 'description', 'faculty_id', 'is_active']
    
    def validate_code(self, value):
        """Validate and normalize code: uppercase, trim"""
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
        """Trim name"""
        return value.strip()
    
    def validate_faculty_id(self, value):
        """Validate faculty exists and is active"""
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
    """
    Minimal serializer for dropdowns/references
    """
    faculty_code = serializers.CharField(source='faculty.code', read_only=True)
    
    class Meta:
        model = Major
        fields = ['id', 'code', 'name', 'faculty_code']


# ==================== Class Serializers ====================

class ClassSerializer(serializers.ModelSerializer):
    """
    Serializer for Class - used for list/detail views
    """
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
    """
    Serializer for Class create/update with validation
    """
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
    major_id = serializers.IntegerField(
        help_text="ID của ngành"
    )
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
        """Validate and normalize code: uppercase, trim"""
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
        """Trim name"""
        return value.strip()
    
    def validate_major_id(self, value):
        """Validate major exists and is active"""
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
    """
    Minimal serializer for dropdowns/references
    """
    major_code = serializers.CharField(source='major.code', read_only=True)
    
    class Meta:
        model = Class
        fields = ['id', 'code', 'name', 'academic_year', 'major_code']
