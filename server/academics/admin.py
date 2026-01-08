from django.contrib import admin
from .models import Faculty, Major, Class


@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'is_active', 'created_at']
    list_filter = ['is_active']
    search_fields = ['code', 'name']
    ordering = ['name']


@admin.register(Major)
class MajorAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'faculty', 'is_active', 'created_at']
    list_filter = ['is_active', 'faculty']
    search_fields = ['code', 'name']
    ordering = ['faculty', 'name']


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'major', 'academic_year', 'max_students', 'is_active']
    list_filter = ['is_active', 'academic_year', 'major__faculty']
    search_fields = ['code', 'name']
    ordering = ['-academic_year', 'major', 'name']
