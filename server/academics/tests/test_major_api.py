"""
API Tests for Major CRUD endpoints.

Tests:
- Happy path: list, create, retrieve, update, delete
- Edge cases: duplicate code, invalid faculty_id, delete with relations
- Permission: non-admin gets 403
- Filter: by faculty
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from users.models import User
from academics.models import Faculty, Major, Class


class MajorAPITestCase(TestCase):
    """Test cases for Major API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create users
        self.admin = User.objects.create_user(
            username='admin_test',
            email='admin@test.com',
            password='AdminPass123!',
            role='ADMIN'
        )
        self.teacher = User.objects.create_user(
            username='teacher_test',
            email='teacher@test.com',
            password='TeacherPass123!',
            role='TEACHER'
        )
        
        # Create test faculty
        self.faculty = Faculty.objects.create(
            code='CNTT',
            name='Khoa Công nghệ thông tin'
        )
        self.faculty2 = Faculty.objects.create(
            code='KT',
            name='Khoa Kinh tế'
        )
        
        # Create test major
        self.major = Major.objects.create(
            faculty=self.faculty,
            code='KTPM',
            name='Kỹ thuật phần mềm',
            description='Mô tả ngành KTPM'
        )
        
        self.list_url = reverse('major-list')
        self.detail_url = reverse('major-detail', kwargs={'pk': self.major.pk})
        self.dropdown_url = reverse('major-dropdown')
    
    def _auth_as_admin(self):
        self.client.force_authenticate(user=self.admin)
    
    def _auth_as_teacher(self):
        self.client.force_authenticate(user=self.teacher)
    
    # ==================== Happy Path Tests ====================
    
    def test_list_majors_as_admin(self):
        """Admin can list all majors"""
        self._auth_as_admin()
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['code'], 'KTPM')
        # Check nested faculty
        self.assertEqual(response.data['results'][0]['faculty']['code'], 'CNTT')
    
    def test_create_major_as_admin(self):
        """Admin can create a new major"""
        self._auth_as_admin()
        data = {
            'code': 'HTTT',
            'name': 'Hệ thống thông tin',
            'faculty_id': self.faculty.pk
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['code'], 'HTTT')
        self.assertEqual(Major.objects.count(), 2)
    
    def test_retrieve_major_as_admin(self):
        """Admin can retrieve major detail"""
        self._auth_as_admin()
        response = self.client.get(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['code'], 'KTPM')
        self.assertIn('classes_count', response.data)
        self.assertIn('faculty', response.data)
    
    def test_update_major_as_admin(self):
        """Admin can update major"""
        self._auth_as_admin()
        data = {'name': 'KTPM Updated'}
        response = self.client.patch(self.detail_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'KTPM Updated')
    
    def test_update_major_change_faculty(self):
        """Admin can change major's faculty"""
        self._auth_as_admin()
        data = {'faculty_id': self.faculty2.pk}
        response = self.client.patch(self.detail_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['faculty']['code'], 'KT')
    
    def test_delete_major_as_admin(self):
        """Admin can delete major without relations"""
        self._auth_as_admin()
        response = self.client.delete(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Major.objects.count(), 0)
    
    # ==================== Filter Tests ====================
    
    def test_filter_by_faculty(self):
        """Can filter majors by faculty ID"""
        self._auth_as_admin()
        
        # Create major in different faculty
        Major.objects.create(
            faculty=self.faculty2,
            code='TCNH',
            name='Tài chính ngân hàng'
        )
        
        response = self.client.get(f"{self.list_url}?faculty={self.faculty.pk}")
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['code'], 'KTPM')
    
    def test_dropdown_filter_by_faculty(self):
        """Dropdown can filter by faculty"""
        self._auth_as_admin()
        
        Major.objects.create(
            faculty=self.faculty2,
            code='TCNH',
            name='Tài chính ngân hàng'
        )
        
        response = self.client.get(f"{self.dropdown_url}?faculty={self.faculty.pk}")
        self.assertEqual(len(response.data), 1)
    
    # ==================== Edge Case Tests ====================
    
    def test_create_duplicate_code_fails(self):
        """Cannot create major with duplicate code"""
        self._auth_as_admin()
        data = {
            'code': 'KTPM',  # Already exists
            'name': 'Another Major',
            'faculty_id': self.faculty.pk
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
    
    def test_create_with_invalid_faculty_fails(self):
        """Cannot create major with non-existent faculty"""
        self._auth_as_admin()
        data = {
            'code': 'NEW',
            'name': 'New Major',
            'faculty_id': 9999  # Non-existent
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_with_inactive_faculty_fails(self):
        """Cannot create major with inactive faculty"""
        self._auth_as_admin()
        
        # Make faculty inactive
        inactive_faculty = Faculty.objects.create(
            code='INACTIVE',
            name='Inactive Faculty',
            is_active=False
        )
        
        data = {
            'code': 'NEW',
            'name': 'New Major',
            'faculty_id': inactive_faculty.pk
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_delete_major_with_classes_fails(self):
        """Cannot delete major that has classes"""
        self._auth_as_admin()
        
        # Create a class linked to major
        Class.objects.create(
            major=self.major,
            code='KTPM2021',
            name='KTPM K21',
            academic_year=2021
        )
        
        response = self.client.delete(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('lớp liên quan', response.data['detail'])
    
    # ==================== Permission Tests ====================
    
    def test_list_as_non_admin_fails(self):
        """Non-admin cannot list majors"""
        self._auth_as_teacher()
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_create_as_non_admin_fails(self):
        """Non-admin cannot create major"""
        self._auth_as_teacher()
        data = {'code': 'NEW', 'name': 'New', 'faculty_id': self.faculty.pk}
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_dropdown_as_non_admin_allowed(self):
        """Non-admin CAN access dropdown"""
        self._auth_as_teacher()
        response = self.client.get(self.dropdown_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
