"""
API Tests for Faculty CRUD endpoints.

Tests:
- Happy path: list, create, retrieve, update, delete
- Edge cases: duplicate code, delete with relations
- Permission: non-admin gets 403
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status

from users.models import User
from academics.models import Faculty, Major


class FacultyAPITestCase(TestCase):
    """Test cases for Faculty API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        self.client = APIClient()
        
        # Create admin user
        self.admin = User.objects.create_user(
            username='admin_test',
            email='admin@test.com',
            password='AdminPass123!',
            role='ADMIN'
        )
        
        # Create regular user (teacher)
        self.teacher = User.objects.create_user(
            username='teacher_test',
            email='teacher@test.com',
            password='TeacherPass123!',
            role='TEACHER'
        )
        
        # Create test faculty
        self.faculty = Faculty.objects.create(
            code='CNTT',
            name='Khoa Công nghệ thông tin',
            description='Test description',
            is_active=True
        )
        
        self.list_url = reverse('faculty-list')
        self.detail_url = reverse('faculty-detail', kwargs={'pk': self.faculty.pk})
        self.dropdown_url = reverse('faculty-dropdown')
    
    def _auth_as_admin(self):
        """Authenticate as admin"""
        self.client.force_authenticate(user=self.admin)
    
    def _auth_as_teacher(self):
        """Authenticate as teacher"""
        self.client.force_authenticate(user=self.teacher)
    
    # ==================== Happy Path Tests ====================
    
    def test_list_faculties_as_admin(self):
        """Admin can list all faculties"""
        self._auth_as_admin()
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['code'], 'CNTT')
    
    def test_create_faculty_as_admin(self):
        """Admin can create a new faculty"""
        self._auth_as_admin()
        data = {
            'code': 'KT',
            'name': 'Khoa Kinh tế',
            'description': 'Mô tả khoa kinh tế'
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['code'], 'KT')  # Should be uppercase
        self.assertEqual(Faculty.objects.count(), 2)
    
    def test_create_faculty_code_uppercase(self):
        """Faculty code should be auto-uppercased"""
        self._auth_as_admin()
        data = {
            'code': 'abc',  # lowercase
            'name': 'Test Faculty'
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['code'], 'ABC')  # Should be uppercase
    
    def test_retrieve_faculty_as_admin(self):
        """Admin can retrieve faculty detail"""
        self._auth_as_admin()
        response = self.client.get(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['code'], 'CNTT')
        self.assertIn('majors_count', response.data)
    
    def test_update_faculty_as_admin(self):
        """Admin can update faculty"""
        self._auth_as_admin()
        data = {'name': 'Khoa CNTT Updated'}
        response = self.client.patch(self.detail_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Khoa CNTT Updated')
    
    def test_delete_faculty_as_admin(self):
        """Admin can delete faculty without relations"""
        self._auth_as_admin()
        response = self.client.delete(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Faculty.objects.count(), 0)
    
    def test_dropdown_returns_active_only(self):
        """Dropdown endpoint returns only active faculties"""
        self._auth_as_admin()
        
        # Create inactive faculty
        Faculty.objects.create(code='INACTIVE', name='Inactive', is_active=False)
        
        response = self.client.get(self.dropdown_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Only active one
    
    # ==================== Search/Filter Tests ====================
    
    def test_search_faculties(self):
        """Can search faculties by name or code"""
        self._auth_as_admin()
        Faculty.objects.create(code='KT', name='Khoa Kinh tế')
        
        response = self.client.get(f"{self.list_url}?search=CNTT")
        self.assertEqual(len(response.data['results']), 1)
        
        response = self.client.get(f"{self.list_url}?search=Kinh")
        self.assertEqual(len(response.data['results']), 1)
    
    def test_filter_by_is_active(self):
        """Can filter faculties by is_active"""
        self._auth_as_admin()
        Faculty.objects.create(code='INACTIVE', name='Inactive', is_active=False)
        
        response = self.client.get(f"{self.list_url}?is_active=true")
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['code'], 'CNTT')
    
    # ==================== Edge Case Tests ====================
    
    def test_create_duplicate_code_fails(self):
        """Cannot create faculty with duplicate code"""
        self._auth_as_admin()
        data = {
            'code': 'CNTT',  # Already exists
            'name': 'Another Faculty'
        }
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data['error']['code'], 'DUPLICATE_CODE')
    
    def test_delete_faculty_with_majors_fails(self):
        """Cannot delete faculty that has majors"""
        self._auth_as_admin()
        
        # Create a major linked to faculty
        Major.objects.create(
            faculty=self.faculty,
            code='KTPM',
            name='Kỹ thuật phần mềm'
        )
        
        response = self.client.delete(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('ngành liên quan', response.data['detail'])
    
    def test_create_with_missing_required_fields(self):
        """Validation error when required fields missing"""
        self._auth_as_admin()
        data = {'code': 'XX'}  # Missing name
        
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_create_with_code_too_short(self):
        """Validation error when code is too short"""
        self._auth_as_admin()
        data = {'code': 'A', 'name': 'Test Faculty'}  # min_length=2
        
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    # ==================== Permission Tests ====================
    
    def test_list_as_non_admin_fails(self):
        """Non-admin cannot list faculties"""
        self._auth_as_teacher()
        response = self.client.get(self.list_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_create_as_non_admin_fails(self):
        """Non-admin cannot create faculty"""
        self._auth_as_teacher()
        data = {'code': 'NEW', 'name': 'New Faculty'}
        response = self.client.post(self.list_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_update_as_non_admin_fails(self):
        """Non-admin cannot update faculty"""
        self._auth_as_teacher()
        response = self.client.patch(self.detail_url, {'name': 'Hacked'}, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_delete_as_non_admin_fails(self):
        """Non-admin cannot delete faculty"""
        self._auth_as_teacher()
        response = self.client.delete(self.detail_url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_dropdown_as_non_admin_allowed(self):
        """Non-admin CAN access dropdown (only IsAuthenticated)"""
        self._auth_as_teacher()
        response = self.client.get(self.dropdown_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_unauthenticated_fails(self):
        """Unauthenticated user cannot access any endpoint"""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
