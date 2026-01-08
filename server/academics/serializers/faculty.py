from rest_framework import serializers
from academics.models import Faculty


class FacultySerializer(serializers.ModelSerializer):
    """Serializer for Faculty - used for list/detail views"""
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
    """Serializer for Faculty create/update with validation"""
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
    """Minimal serializer for dropdowns/references"""
    class Meta:
        model = Faculty
        fields = ['id', 'code', 'name']
